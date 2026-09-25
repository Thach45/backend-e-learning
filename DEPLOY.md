# Triển khai lên VPS bằng Docker

Toàn bộ hệ thống chạy từ **một** `docker-compose.yml` ở thư mục gốc.

```
Internet ──▶ nginx của VPS (80/443, HTTPS/certbot) ──▶ 127.0.0.1:8081
                                                          │
                                        ┌─────────────────┴──────────────────┐
                                        │ frontend (nginx trong container)   │
                                        │   /            → giao diện React   │
                                        │   /api, /socket.io ──▶ backend     │
                                        └─────────────────┬──────────────────┘
                                                          ▼
              backend (NestJS + BullMQ) ──▶ postgres    redis ◀── video-worker (Celery)
                         └──────────────▶ video-api (FastAPI) ─────────┘
```

| Service | Vai trò | Mở ra ngoài? |
|---|---|---|
| `frontend` | Giao diện + cổng nội bộ (chia `/api`, `/socket.io` cho backend) | **chỉ `127.0.0.1:8081`** |
| `backend` | NestJS API + hàng đợi BullMQ (hủy đơn quá hạn) | không |
| `migrate` | Chạy 1 lần lúc khởi động: `prisma db push` | không |
| `video-api` / `video-worker` | FastAPI nhận việc / Celery xử lý video | không |
| `postgres` | Database | không |
| `redis` | BullMQ, cache quyền, broker Celery (có mật khẩu, lưu đĩa, `noeviction`) | không |

HTTPS **không** nằm trong compose: VPS đã có nginx giữ cổng 80/443, nên dùng chính nginx đó (xem bước 3).

## 0. Lưu ý khi VPS dùng chung với hệ thống khác
- Máy nhỏ (khoảng 2 vCPU, 2 GB RAM) mà còn chạy dịch vụ khác thì stack này chỉ nên publish **một** cổng trên `127.0.0.1` (mặc định 8081, đổi bằng `HTTP_PORT`); không publish 3000/5432/6379 nên không trùng cổng với dịch vụ có sẵn.
- Compose đặt giới hạn RAM cho từng container (`mem_limit`) và giới hạn dung lượng log, để nếu thiếu RAM thì chỉ container của stack này bị dừng, không kéo sập dịch vụ khác. Nếu `video-worker` (768 MB) bị OOM khi xử lý video, nên nâng VPS lên 4 GB RAM.
- **Đừng build image ngay trên VPS nhỏ**: `npm ci`, `tsc`, `vite build` ngốn RAM và làm dịch vụ khác chậm rõ rệt. Hãy build ở máy bạn rồi đẩy image lên (xem mục *Build ở máy bạn*).
- Không chạy `docker system prune` / `docker builder prune` trên VPS dùng chung: cache và image có thể của dịch vụ khác.

## 1. Chuẩn bị
1. Tạo bản ghi DNS **A** cho tên miền mới (ví dụ `learn.example.com`) trỏ về IP VPS.
2. Firewall của nhà cung cấp VPS chỉ mở 80, 443, 22. **Không** mở 5432/6379/8081.

## 2. Cấu hình và chạy
```bash
git clone <repo> && cd online-learning-platform
cp .env.example .env
nano .env                       # điền toàn bộ giá trị, đọc chú thích trong file
docker compose up -d --build
docker compose ps               # backend, frontend, video-api phải "healthy"
```
- Sinh chuỗi bí mật: `openssl rand -hex 32` (cho `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `API_KEY`, `INTERNAL_API_SECRET`, `SEPAY_WEBHOOK_API_KEY`, `REDIS_PASSWORD`, `POSTGRES_PASSWORD`).
- `PUBLIC_URL=https://learn.example.com`. Nếu 8081 đã bị chiếm, đổi `HTTP_PORT`.
- `.env` không bao giờ được commit (đã nằm trong `.gitignore`). Thiếu biến bắt buộc thì Compose dừng ngay và cho biết biến nào còn thiếu.

## 3. HTTPS bằng nginx của VPS
```bash
sudo cp deploy/nginx-host.conf.example /etc/nginx/sites-available/elearning
sudo nano /etc/nginx/sites-available/elearning     # đổi learn.example.com và cổng nếu cần
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d learn.example.com          # xin chứng chỉ, tự thêm phần HTTPS
```
Các file nginx có sẵn của VPS không bị đụng tới (chỉ thêm một file mới).

## 4. Khởi tạo dữ liệu (chỉ lần đầu)
```bash
# Đồng bộ quyền cho các route
docker compose exec backend npm run db:seed

# Tạo role và tài khoản admin (dùng SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env)
docker compose exec backend npx ts-node -T initialScript/seed.ts
```
- Ở production, `seed.ts` từ chối chạy nếu thiếu `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (tránh dùng mật khẩu mặc định). Đăng nhập xong hãy đổi mật khẩu và xóa `SEED_ADMIN_PASSWORD` khỏi `.env`.
- `db:seed` cấp lại quyền mặc định cho **mọi** route. Chỉ chạy lại khi thêm route mới, và sẽ hoàn tác các quyền bạn đã gỡ tay.

## 5. Cấu hình SePay webhook
Trên SePay: URL `https://<tên miền>/api/webhooks/sepay`, sự kiện **Tiền vào**, JSON, chứng thực **API Key** với giá trị đúng bằng `SEPAY_WEBHOOK_API_KEY` trong `.env`.

## Gửi email (Resend + hàng đợi)
Backend không gọi Resend trực tiếp trong request: mail được thêm vào hàng đợi BullMQ `mail` (Redis) rồi một worker gửi qua Resend.
- Retry tự động với backoff gấp đôi (3s, 6s, 12s...): OTP 4 lần, cảnh báo đăng nhập 5 lần, mail đơn hàng 8 lần. Lỗi vĩnh viễn (địa chỉ sai, domain chưa verify) thì không retry.
- `Idempotency-Key` của Resend + `jobId` theo đơn hàng: retry hoặc gọi trùng (webhook SePay và nút kiểm tra thanh toán) không gửi 2 mail.
- Giới hạn 2 mail/giây (theo rate limit mặc định của Resend). OTP quá hạn (`EXPIRE_OTP`) thì bỏ, không gửi.
- Cần `RESEND_API_KEY` (quyền Sending access) và `MAIL_FROM` thuộc domain đã Verified trên Resend.
- Xem log: `docker compose logs -f backend | grep -i "mail"`. Job lỗi hẳn được giữ 1 giờ trong Redis (queue `bull:mail:failed`).

## 6. Vận hành
```bash
docker compose logs -f <service>            # xem log
git pull && docker compose up -d --build     # cập nhật phiên bản mới
docker compose restart backend               # khởi động lại một service

# Sao lưu database
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup-$(date +%F).sql
# Khôi phục
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < backup.sql
```
Dữ liệu nằm trong volume `pgdata`, `redisdata` (giữ nguyên khi `up`/`down`). **`docker compose down -v` xóa sạch dữ liệu.**

## Build ở máy bạn (khi VPS thiếu RAM)
VPS là `x86_64`, Mac Apple Silicon là `arm64` nên phải build chéo nền tảng:
```bash
docker buildx build --platform linux/amd64 -t elearning-backend       --load ./e-learning-nest
docker buildx build --platform linux/amd64 -t elearning-frontend      --load ./frontend
docker buildx build --platform linux/amd64 -t elearning-video-worker  --load ./video-worker
docker save elearning-backend elearning-frontend elearning-video-worker | gzip | ssh -i <key.pem> ubuntu@<IP> 'gunzip | docker load'
# Trên VPS: chạy không build lại
docker compose up -d --no-build
```
Nếu build trên VPS, giảm áp lực RAM bằng `COMPOSE_PARALLEL_LIMIT=1 docker compose build`.

## Chuyển dữ liệu từ Neon (nếu muốn giữ dữ liệu cũ)
```bash
pg_dump "<DATABASE_URL của Neon>" --no-owner --no-acl -Fc -f neon.dump
docker compose cp neon.dump postgres:/tmp/neon.dump
docker compose exec postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists /tmp/neon.dump'
```

## Ghi chú
- Repo chưa có `prisma/migrations` nên schema được đồng bộ bằng `prisma db push`. Lệnh này từ chối thay đổi có nguy cơ mất dữ liệu; hãy sao lưu trước khi nâng cấp schema.
- Frontend gọi API cùng domain (`/api`) nên không cần CORS. Nếu tách API sang domain khác, đặt `VITE_API_BASE_URL` rồi build lại `frontend`.
- Backend tin các dải IP nội bộ (`trust proxy`) để lấy IP thật của khách qua 2 lớp nginx; nếu không, giới hạn tần suất sẽ tính chung mọi khách chưa đăng nhập vào một IP.
- Chỉ nên chạy **một** bản `backend`.
