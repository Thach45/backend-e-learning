# E-Learning API (NestJS)

Backend cho nền tảng học trực tuyến: REST API, PostgreSQL (Prisma), Redis, xác thực JWT, RBAC theo `Permission` (path + method), upload Cloudinary, thanh toán qua provider (mặc định Sepay), Socket.IO realtime.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run start:dev` | Dev có watch |
| `npm run build` / `npm run start:prod` | Build và chạy production |
| `npm run db:push` | `prisma generate` + `db push` |
| `npm run db:migrate` | Migrate dev |
| `npm run db:seed` | Seed permission (script `initialScript/create-permission.ts`) |
| `npm run import:drive-lessons` | Import lesson từ Drive (script riêng) |

## Cài đặt

```bash
npm install
npx prisma generate
```

Tạo database và áp dụng schema (`db:push` hoặc migrate), sau đó seed permission để `PermissionGuard` không chặn sai route.

```bash
npm run start:dev
```

Server lắng nghe `PORT` (mặc định `3000`). CORS: `FRONTEND_URL`.

## Biến môi trường (tham khảo)

Tạo file `.env` trong thư mục này. Các biến thường dùng trong code:

| Biến | Mục đích |
|------|-----------|
| `DATABASE_URL` | PostgreSQL (Prisma) |
| `REDIS_URL` | Redis |
| `FRONTEND_URL` | Origin cho CORS |
| `PORT` | Cổng HTTP |
| `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN` | JWT access |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN` | JWT refresh |
| `REFRESH_TOKEN_EXPIRES_IN` / `EXPIRE_OTP` | Chuỗi thời gian (vd. `7d`, `10m`) — xem `ms` |
| `API_KEY` | API key cho guard (so khớp header) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET_ID`, `GOOGLE_REDIRECT` | OAuth Google |
| `GOOGLE_CLIENT_REDIRECT` | Redirect frontend sau callback |
| `CLOUDINARY_*`, `CLOUDINARY_FOLDER_NAME` | Upload media |
| `PAYMENT_PROVIDER` | Ví dụ `sepay` |
| `SO_TAI_KHOAN`, `NGAN_HANG`, `SEPAY_API_KEY` | Sepay / QR |
| `URL_EMAIL` | Service gửi email (nếu có) |

Không commit file `.env` chứa secret.

## Kiến trúc bảo mật

- **`AuthenticationGuard`**: Bearer JWT hoặc API key (metadata `@Public()` để mở công khai).
- **`PermissionGuard`**: tra cứu quyền theo route; **ADMIN** bypass; kết quả cache Redis ngắn hạn.
- **Throttler**: giới hạn số request theo cửa sổ thời gian.

Sau khi thêm route mới, cần đồng bộ bản ghi `Permission` và gán cho role phù hợp.

## API (tiền tố)

Hầu hết controller dùng tiền tố `api/` (ví dụ `api/auth`, `api/courses`, `api/cart`). Realtime: Socket.IO **`/realtime`**, client có thể join room `user:{userId}` qua `handshake.auth`.

### Nhóm chức năng chính

- **Auth** (`api/auth`): register, OTP, login, refresh, logout, forgot password, Google, `me`.
- **Users admin** (`api/admin/users` …): CRUD user, trạng thái.
- **Roles / Permissions**: quản lý RBAC.
- **Categories**: public list + admin CRUD.
- **Courses**: public list published; instructor CRUD + request publish/delete; admin duyệt.
- **Course detail, content, lessons**: chủ yếu instructor; học viên lấy nội dung qua enrollment.
- **Enrollments**: học viên enroll/học; instructor/admin xem hoặc quản lý.
- **Reviews & comments**: theo khóa và theo lesson.
- **Wishlist**, **cart** (`api/cart`), **orders** + thanh toán.
- **Upload** (`api/upload`): Cloudinary.
- **Documents / document-categories / document-tags**: kho tài liệu cộng đồng + admin verify.
- **Dashboard**: `api/admin/dashboard`, `api/instructor` (stats, analytics, revenue chart, students).

Chi tiết path và method xem từng `*.controller.ts` trong `src/routes/`.

## Ghi chú nghiệp vụ (đọc code)

- **Enroll trực tiếp** (`POST .../enroll`) chỉ kiểm tra khóa `PUBLISHED` và trùng enrollment — không ràng buộc giá trong repository hiện tại; luồng trả phí dựa vào **đơn hàng + thanh toán** tạo enrollment.
- Sau khi thanh toán thành công, code tạo enrollment và set `completedAt` — kiểm tra lại nếu mong đợi “chưa hoàn thành” sau mua khóa.

## License

`UNLICENSED` (private) — xem `package.json`.
