# Online Learning Platform

Nền tảng học trực tuyến kết hợp **khóa học có cấu trúc**, **mua bán khóa**, **kho tài liệu cộng đồng** và **ba nhóm người dùng**: khách, học viên, giảng viên, quản trị. Repo gồm backend (`e-learning-nest`), giao diện web LearnHub (`frontend`) và dịch vụ xử lý video (`video-worker`).

Hướng dẫn cài đặt cho developer: [e-learning-nest/README.md](./e-learning-nest/README.md) và [frontend/README.md](./frontend/README.md).

---

## Khách (chưa đăng nhập)

Có thể **khám phá** nền tảng mà không cần tài khoản:

- **Duyệt khóa học** đã được xuất bản: lọc theo danh mục, xem tiêu đề, giá, giảng viên, mức độ, khóa nổi bật (nếu được gắn cờ).
- **Xem trang chi tiết khóa** (thông tin mô tả, mục tiêu, đối tượng, yêu cầu — tùy giảng viên đã nhập).
- **Xem danh mục khóa học** để điều hướng theo chủ đề.
- **Kho tài liệu cộng đồng**: xem danh sách tài liệu, tài liệu đang “hot”, người đóng góp nhiều; xem chi tiết một tài liệu (mô tả, tag, danh mục).
- **Đăng ký tài khoản** (email, OTP), **đăng nhập**, **quên mật khẩu**, hoặc **đăng nhập bằng Google**.

---

## Học viên (đã đăng nhập)

### Khám phá và quản lý danh sách cá nhân

- **Wishlist**: lưu khóa học để xem lại sau; bỏ khỏi wishlist khi không cần.
- **Giỏ khóa học**: thêm khóa có phí vào giỏ (nhiều khóa trong một lần thanh toán), chỉnh giỏ trước khi thanh toán.

### Tham gia khóa học

- **Khóa miễn phí hoặc không qua giỏ**: có thể **ghi danh trực tiếp** vào khóa đã được xuất bản (nếu chưa ghi danh).
- **Khóa trả phí**: tạo **đơn hàng** từ giỏ → nhận **mã QR / kênh thanh toán** → sau khi thanh toán được xác nhận, hệ thống **tự mở quyền học** các khóa trong đơn.
- **Đơn hàng của tôi**: xem lịch sử đơn, chi tiết đơn, kiểm tra trạng thái thanh toán.

### Trong lúc học

- **Khóa đã ghi danh**: xem **cấu trúc nội dung** (chương / phần / bài).
- **Vào từng bài học**: xem nội dung bài (video hoặc nội dung text tùy giảng viên cấu hình), thời lượng nếu có.
- **Bình luận theo bài học**: đặt câu hỏi, trao đổi với học viên khác hoặc giảng viên (tùy quy định hiển thị trên giao diện).
- **Đánh giá khóa học**: viết review sau khi đã trải nghiệm; xem đánh giá của người khác trên khóa đó.
- **Đánh dấu hoàn thành khóa**: khi học xong, có thể đánh dấu khóa đã hoàn thành (phục vụ chứng chỉ / thống kê cá nhân tùy triển khai UI).
- **Thống kê học tập** (ví dụ): số khóa đã ghi danh, đã hoàn thành, quy đổi “giờ học” ước lượng từ tổng thời lượng bài giảng của các khóa đã tham gia.

### Tài liệu cộng đồng

- **Đăng tài liệu**: chia sẻ file hoặc link (PDF, tài liệu ôn tập, slide…) kèm mô tả, danh mục, tag.
- **Sửa / xóa** tài liệu do chính mình đăng.
- **Like / bỏ like** tài liệu; **ghi nhận tải xuống** để thống kê và xếp hạng phổ biến.
- **Danh sách “tài liệu của tôi”** và **tài liệu đã thích**.

---

## Giảng viên

### Soạn và quản lý khóa học

- **Tạo khóa mới**: tiêu đề, giá / giá khuyến mãi, ảnh đại diện, video giới thiệu (nếu có), danh mục, cấp độ, trạng thái nháp.
- **Trang giới thiệu khóa chi tiết**: mô tả dài, lợi ích, đối tượng, kiến thức nền, mục tiêu học tập, khóa liên quan.
- **Cấu trúc nội dung**: tạo **phần / chương** (cây nội dung), **sắp xếp thứ tự** hiển thị cho học viên.
- **Bài học trong mỗi phần**: thêm bài với tiêu đề, nội dung text, video (YouTube, Drive, upload trực tiếp… tùy cấu hình), tài liệu đính kèm bài (nếu có).
- **Cập nhật / ẩn / xóa** nội dung và bài học trong phạm vi khóa của mình.

### Xuất bản và vòng duyệt

- **Gửi yêu cầu xuất bản**: khi khóa đã sẵn sàng, giảng viên xin admin duyệt để khóa hiện trên kệ công khai.
- **Yêu cầu xóa khóa**: xin admin đồng ý gỡ khóa khỏi hệ thống (theo quy trình duyệt).

### Vận hành lớp học và uy tín

- **Xem danh sách học viên** theo từng khóa hoặc tổng hợp học viên của giảng viên.
- **Thêm học viên thủ công** (ví dụ học viên được cấp học bổng / nhóm nội bộ).
- **Gỡ học viên khỏi khóa** khi có lý do quản lý.
- **Đọc và phản hồi đánh giá**: xem review trên khóa của mình; chỉnh hoặc ẩn review không phù hợp (trong phạm vi quyền được giao).
- **Dashboard & phân tích**: số liệu tổng quan về khóa học, học viên, xu hướng; biểu đồ doanh thu theo khoảng thời gian (khi có giao dịch).

### Hỗ trợ nội dung đa phương tiện (nâng cao)

- **Upload ảnh / video / file** phục vụ thumbnail, bài giảng hoặc tài liệu (qua luồng upload của hệ thống).
- **Luồng xử lý video** (ví dụ dubbing / pipeline ngầm): có endpoint kích hoạt job và webhook khi xử lý xong — phụ thuộc cách team triển khai worker phía sau.

---

## Quản trị viên

### Người dùng và phân quyền

- **Quản lý tài khoản**: tạo, sửa, khóa / kích hoạt người dùng; chặn truy cập khi cần.
- **Vai trò và quyền**: định nghĩa role (admin, học viên, giảng viên…) và **gan quyền thao tác** theo từng chức năng trên API (ai được gọi endpoint nào).

### Danh mục và khóa học

- **Danh mục khóa học**: tạo, sửa để học viên lọc và giảng viên gắn khóa đúng chủ đề.
- **Duyệt xuất bản khóa**: chấp nhận hoặc từ chối để khóa lên sóng hoặc chỉnh lại.
- **Duyệt xóa khóa**: đồng ý hoặc từ chối yêu cầu gỡ khóa của giảng viên.
- **Xem toàn bộ khóa** (mọi trạng thái) và **chi tiết đầy đủ** phục vụ kiểm duyệt.

### Giao dịch và học tập

- **Đơn hàng**: xem tất cả đơn, chi tiết đơn, **cập nhật trạng thái** khi cần can thiệp thủ công (hoàn tiền, xử lý sai sót…).
- **Ghi danh**: tra cứu enrollment trên toàn hệ thống hoặc theo từng khóa để hỗ trợ học viên.

### Chất lượng nội dung và cộng đồng

- **Đánh giá khóa học**: xem toàn bộ review; chỉnh hoặc gỡ review vi phạm.
- **Bình luận bài học**: kiểm duyệt, sửa hoặc xóa comment không phù hợp.
- **Tài liệu cộng đồng**: duyệt **“uy tín / đã kiểm tra”** cho tài liệu; xóa tài liệu vi phạm.
- **Danh mục & tag tài liệu**: tạo và chỉnh danh mục, tag để kho tài liệu dễ tìm và nhất quán.

### Bức tranh tổng thể

- **Dashboard**: tổng quan người dùng, khóa, doanh thu, tài liệu; biểu đồ xu hướng doanh thu và người dùng theo thời gian để ra quyết định vận hành.

---

## Bản quyền

Theo từng thư mục con (`package.json`).

## Cấu trúc repository và triển khai

Repository `Thach45/backend-e-learning` chứa cả ba dịch vụ và giữ lịch sử Git của backend:

```text
e-learning-nest/  # NestJS API, Prisma và cấu hình backend
frontend/         # React + Vite
video-worker/     # FastAPI + Celery, xử lý video HLS
```

Khi triển khai từ repository này, đặt thư mục gốc (Root Directory) của từng dịch vụ tương ứng như trên. Các lệnh npm của backend chạy trong `e-learning-nest/`; frontend chạy trong `frontend/`. Worker dùng Dockerfile và Docker Compose trong `video-worker/`.

File `.env` được cấu hình riêng cho từng dịch vụ và không được commit. Tham khảo `video-worker/.env.example` cho worker.
