# Các tính năng đã thêm trong đợt nâng cấp (+30%)

Tài liệu này giải thích từng tính năng: **vì sao có**, **ai dùng**, **dùng ở đâu**. Địa chỉ dưới dạng `/duong-dan` là đường dẫn trên website. Số liệu: từ 50 lên 77 bảng, từ 216 lên 341 route, từ 46 lên 79 trang.

Vai trò: **Học viên** (CLIENT), **Giảng viên** (INSTRUCTOR), **Admin**. Tính năng nào chỉ dành cho vai trò nào đều ghi rõ.

---

## 1. Nền tảng: gửi mail bằng hàng đợi

**Vì sao có:** gửi mail trực tiếp trong lúc xử lý yêu cầu làm chậm web, và nếu nhà cung cấp lỗi thì mất thư. Hàng đợi (BullMQ + Redis) nhận lệnh gửi, trả lời người dùng ngay, rồi gửi ngầm, tự thử lại khi lỗi.

**Cách hoạt động:**
- Mail giao dịch (OTP đăng nhập, xác nhận đơn hàng, cảnh báo đăng nhập mới) được ưu tiên cao nhất.
- Có hạn mức mỗi ngày (mặc định 100 mail, giữ riêng 40 cho OTP và đơn hàng) vì gói Resend miễn phí. Hết hạn mức thì mail chiến dịch được hoãn sang ngày sau, OTP vẫn đi ngay.
- Gửi trùng được chặn bằng khoá `Idempotency-Key` (một đơn hàng chỉ một mail xác nhận).
- Cấu hình: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_DAILY_CAP`, `MAIL_TRANSACTIONAL_RESERVE` trong `prod.env`.

---

## 2. Dọn dữ liệu giả và bài học thử (đợt 0)

**Vì sao có:** trang chi tiết khoá học và footer có số liệu bịa (đánh giá, học viên, địa chỉ công ty khác, form đăng ký nhận tin không làm gì). Người dùng thật sẽ thấy và mất tin.

- **Trang chi tiết khoá học** (`/courses/:id`): hiển thị số liệu thật (số học viên, phân bố sao, tiểu sử giảng viên, ngôn ngữ, thẻ kỹ năng).
- **Bài học thử miễn phí:** giảng viên tick "Cho học thử miễn phí" ở bài học trong trang nội dung khoá (`/instructor/courses/:id/content`). Ai cũng xem được, kể cả chưa mua, qua nút xem thử ở trang khoá học.
- **Footer:** thông tin liên hệ lấy từ biến build `VITE_CONTACT_EMAIL/PHONE/ADDRESS`. Không điền thì ẩn, không hiện dữ liệu mẫu.
- **Hero trang chủ:** đã bỏ các con số bịa ("15.000 học viên", "4.9/5"...), nay hiện số liệu thật.
- Đã bỏ form "đăng ký nhận tin" ở trang chủ vì nó không gửi đi đâu.

---

## 3. Hồ sơ học tập khi tạo tài khoản (Onboarding)

**Vì sao có:** để hiểu người học muốn gì (mục tiêu, trình độ, thời gian, chủ đề quan tâm) và gợi ý khoá phù hợp. Dữ liệu được thiết kế để sau này dùng vector so khớp người dùng với khoá học. Hiện chưa dùng AI.

- Sau khi đăng nhập, một cửa sổ hướng dẫn hiện ra. Mọi câu hỏi đều tuỳ chọn, bấm "Bỏ qua" được, sẽ nhắc lại tối đa vài lần rồi thôi.
- Có thể sửa lại bất cứ lúc nào ở `/account/settings` mục **Hồ sơ học tập**.
- Trang chủ có khối **"Gợi ý cho bạn"** dựa trên chủ đề và trình độ đã chọn.
- **Admin quản lý thẻ kỹ năng** dùng chung cho người dùng và khoá học ở `/admin/tags`. Giảng viên gắn thẻ cho khoá của mình ở trang sửa khoá (`/instructor/courses/:id/edit`).

---

## 4. Cài đặt hệ thống và chế độ bảo trì

**Vì sao có:** admin cần đổi link mạng xã hội và tạm đóng web khi nâng cấp mà không phải sửa code.

- Admin vào `/admin/settings`:
  - Nhập link Facebook, Instagram, Twitter, YouTube, LinkedIn, TikTok, Zalo. Chỉ những link đã điền mới hiện ở footer.
  - Bật **chế độ bảo trì** kèm thông báo và thời gian dự kiến mở lại. Người dùng thường thấy một màn hình bảo trì toàn site. Admin vẫn vào bình thường và thấy dải cảnh báo đỏ.

---

## 5. Kênh email: admin và giảng viên gửi thông báo

**Vì sao có:** admin cần gửi thông tin cho khách hàng; giảng viên cần thông báo cho học viên của mình. Nhưng gửi bừa dễ bị đánh dấu spam, nên có kiểm soát.

**Ai dùng ở đâu:**
- Admin: `/admin/email-campaigns`. Giảng viên: `/instructor/announcements` (menu "Thông báo email").

**Quy trình:**
1. Soạn thư (markdown đơn giản: `#`, `**đậm**`, danh sách, liên kết https), chọn **đối tượng**: tất cả người dùng, học viên một khoá, người quan tâm một chủ đề, hoặc danh sách người cụ thể. Giảng viên chỉ chọn được học viên của chính mình.
2. Xem trước số người nhận, **gửi thử cho chính mình**.
3. **Giảng viên phải gửi duyệt.** Admin duyệt hoặc từ chối (kèm lý do). Sửa nội dung sau khi được duyệt thì mất duyệt. Admin gửi thẳng không cần duyệt. Giảng viên tối đa 3 chiến dịch mỗi tuần.
4. Bấm gửi. Hệ thống gửi dần theo hạn mức ngày, có thể hủy giữa chừng.

**Bảo vệ người nhận và uy tín gửi thư:**
- Mỗi thư có liên kết **"ngừng nhận thư"** (một chạm, không cần đăng nhập, link có chữ ký chống giả mạo). Người dùng cũng tự bật/tắt trong cài đặt tài khoản.
- Ai đã ngừng nhận thì không nhận chiến dịch nữa (OTP và mail đơn hàng vẫn gửi bình thường). Trang `/unsubscribe` xử lý liên kết này.
- Địa chỉ bị **bounce vĩnh viễn** hoặc **báo spam** tự vào danh sách chặn qua webhook Resend (`POST /api/webhooks/resend`, đã cấu hình `RESEND_WEBHOOK_SECRET`).
- Chân thư có địa chỉ của bạn (`MAIL_COMPANY_ADDRESS`), người trả lời gửi về `MAIL_REPLY_TO`.

---

## 6. Đánh giá nâng cao

**Vì sao có:** đánh giá là thứ học viên xem trước khi mua; cần đáng tin và dễ đọc.

- Nút **"Hữu ích"** cho từng đánh giá (mỗi người một lần).
- Sắp xếp và lọc đánh giá theo số sao, mới nhất, hữu ích nhất ở trang chi tiết khoá học.
- **Sửa lỗi bảo mật:** danh sách đánh giá công khai trước đây trả email người đánh giá. Đã bỏ.

---

## 7. Bài tập (nộp và chấm)

**Vì sao có:** khoá học cần thực hành và phản hồi, không chỉ xem video.

- Giảng viên: `/instructor/courses/:id/assignments` để tạo bài tập cho khoá (đề viết bằng markdown, hạn nộp, điểm tối đa, cho phép nộp muộn hay không, gắn với một bài học, đăng hoặc để nháp). Xem bài nộp và **chấm điểm kèm nhận xét** ở `/instructor/assignments/:id/submissions`.
- Học viên: xem bài tập của mình ở `/my-assignments`, nộp và xem điểm ở `/assignments/:id`.
- Có thông báo (chuông và email) khi có bài nộp mới và khi được chấm.

---

## 8. Quản lý học viên cho giảng viên

**Vì sao có:** giảng viên cần biết học viên học đến đâu và lưu lại danh sách.

- `/instructor/students`: danh sách học viên, tìm kiếm, lọc theo khoá.
- Nút **"Chi tiết"** mở tiến độ từng bài của một học viên. Nút **"Xuất CSV"** tải danh sách (tránh lỗi công thức Excel, có ghi nhật ký vì là dữ liệu cá nhân).
- Nút **"Nhắn tin"** mở cuộc trò chuyện với học viên đó (xem mục 19).
- **Sửa lỗi:** tiến độ trước đây luôn hiện 0% hoặc nhảy lên 100% sau một bài. Đã sửa cách tính.

---

## 9. Hỗ trợ: ticket và câu hỏi thường gặp

**Vì sao có:** người dùng cần một chỗ hỏi khi gặp sự cố (thanh toán, tài khoản), và admin cần theo dõi việc xử lý.

- **Trung tâm trợ giúp** `/help`: câu hỏi thường gặp có tìm kiếm. Ai cũng xem được.
- **Gửi ticket:** `/support/tickets/new`. Xem và trả lời tại `/support/tickets`. Có nhóm vấn đề, trạng thái, đóng ticket.
- **Admin:** `/admin/support` xem mọi ticket, gán người phụ trách, đổi trạng thái (mở, đang xử lý, đã giải quyết, đóng), trả lời. Người dùng được báo qua chuông và email khi có phản hồi. `/admin/faq` quản lý danh mục và câu hỏi (thứ tự, ẩn/hiện).

---

## 10. Giám sát hệ thống (`/admin/system`, chỉ admin)

**Vì sao có:** khi mail hoặc hàng đợi hỏng, admin cần biết và xử lý mà không phải vào server.

- Thẻ **Dịch vụ**: cơ sở dữ liệu, Redis, kết nối Resend, webhook Resend (xanh là ổn).
- Thẻ **Hạn mức mail hôm nay**: đã gửi bao nhiêu trên tổng, còn bao nhiêu cho chiến dịch.
- **Hàng đợi:** số job chờ, đang chạy, hoãn, lỗi, xong của hàng đợi mail, chiến dịch, hết hạn đơn. Chọn hàng đợi, xem job lỗi, **thử lại** từng job hoặc tất cả, xoá job.
- Không hiện nội dung thư, OTP hay email đầy đủ (chỉ mã hoá một phần). Mọi thao tác được ghi nhật ký.

---

## 11. Nhập/xuất CSV cho danh mục (`/admin/categories`, chỉ admin)

**Vì sao có:** thêm hàng chục danh mục bằng tay rất lâu. Xuất người dùng và khoá học đã có sẵn ở trang thống kê nên không làm lại.

- **Xuất CSV**: tải toàn bộ danh mục.
- **Nhập CSV**: tải **file mẫu** (cột `tên`, `danh mục cha`), điền, chọn file, bấm **Chạy thử** để xem từng dòng sẽ tạo, đã có hay lỗi, rồi mới **Nhập thật**. Chỉ tạo mới, không sửa hay xoá danh mục có sẵn, tối đa 500 dòng, hai cấp.

---

## 12. Tài liệu đính kèm và phụ đề cho bài học

**Vì sao có:** học viên cần slide, mã nguồn kèm bài; video cần phụ đề để dễ theo dõi.

- Giảng viên: ở trang nội dung khoá, mỗi bài có nút **kẹp giấy** mở cửa sổ **Tài liệu và phụ đề**.
  - **Tài liệu:** tải PDF, Word, PowerPoint, Excel, ZIP (tối đa 50MB, 10 tệp mỗi bài).
  - **Phụ đề:** chọn file `.vtt` hoặc `.srt` (tự chuyển sang WebVTT), nhập mã ngôn ngữ (`vi`, `en`...) và tên hiển thị. Tối đa 8 ngôn ngữ mỗi bài, chọn một cái mặc định.
- Học viên thấy tài liệu ở tab tổng quan của trang học và bật phụ đề trên trình phát. Người xem bài học thử cũng thấy phụ đề.
- Phụ đề chỉ dùng cho video tải lên, không áp dụng cho YouTube hoặc Google Drive. Thẻ HTML trong phụ đề bị xoá để an toàn.

---

## 13. Blog và trang tĩnh (`/admin/posts`, chỉ admin)

**Vì sao có:** để viết bài hướng dẫn, tin tức, và tạo trang như "Về chúng tôi" mà không phải sửa code.

- Admin: **Viết mới**, chọn loại **Bài blog** hoặc **Trang tĩnh**, nhập tiêu đề, tóm tắt, ảnh bìa, nội dung markdown (có xem trước bên cạnh). **Lưu nháp** hoặc **Đăng**.
- Bài blog hiện ở `/blog` (có tìm kiếm, phân trang, đếm lượt xem) và `/blog/tên-bài`. Trang tĩnh ở `/p/tên-trang`, tick "Hiện liên kết ở chân trang" thì tự có trong footer.
- Đường dẫn tự sinh từ tiêu đề (bỏ dấu), tự thêm `-2` nếu trùng. Gỡ xuống rồi đăng lại không đổi ngày đăng đầu tiên.

---

## 14. Trang chủ cấu hình được (`/admin/home`, chỉ admin)

**Vì sao có:** đổi thông điệp, banner khuyến mãi, lời chứng thực mà không cần lập trình viên.

- **Tiêu đề và các khối:** đổi tiêu đề chính và mô tả ở đầu trang; bật/tắt khối Danh mục, Khoá học nổi bật, Lời chứng thực, Bài viết mới.
- **Banner:** thêm ảnh, tiêu đề, nút và liên kết (https hoặc đường dẫn nội bộ `/courses`). Đặt **thứ tự** và **lịch hiện** (bắt đầu, kết thúc). Tự chạy luân phiên nếu có nhiều banner.
- **Lời chứng thực:** thêm tên, vai trò, nội dung, số sao. Chỉ đăng nhận xét thật và đã được người nói đồng ý.
- Khối "Bài viết mới" tự lấy 3 bài blog mới nhất. Số liệu ở hero (học viên, khoá học, điểm đánh giá) là số thật, tự cập nhật.

---

## 15. Bộ sưu tập khoá học (`/collections`)

**Vì sao có:** người học muốn gom các khoá quan tâm thành danh sách riêng, hoặc chia sẻ một "combo" cho bạn bè.

- Ở trang khoá học, bấm biểu tượng **dấu trang** cạnh nút yêu thích để thêm vào một bộ sưu tập (hoặc tạo bộ mới ngay).
- `/collections`: xem, tạo, xoá bộ sưu tập (tối đa 20 bộ, mỗi bộ 100 khoá). Mặc định **riêng tư**.
- Bật **công khai** trong trang bộ sưu tập rồi **chép liên kết** để chia sẻ. Người khác xem được không cần đăng nhập. Khoá không còn công bố tự ẩn.

---

## 16. Hồ sơ học tập công khai (`/u/:userId`)

**Vì sao có:** cho người học khoe thành tích (khoá đã hoàn thành, huy hiệu) bằng một liên kết.

- Mặc định **tắt**. Bật ở `/account/settings` mục **Hồ sơ công khai**: nhập giới thiệu ngắn, mô tả, chọn hiện khoá đã hoàn thành và huy hiệu hay không. Trang hiện liên kết để chia sẻ.
- Chỉ hiện tên, ảnh đại diện và phần bạn chọn. **Không bao giờ hiện email hay số điện thoại.** Tắt lại là biến mất ngay.

---

## 17. Lộ trình học (`/paths`, quản lý ở `/admin/paths`)

**Vì sao có:** người mới không biết nên học khoá nào trước. Lộ trình là chuỗi khoá có thứ tự.

- Admin: tạo lộ trình (tên, mô tả, ảnh bìa), thêm tối đa 20 khoá, sắp xếp bằng mũi tên lên/xuống, ghi chú lý do cho từng bước, chọn **công khai** hoặc để nháp.
- Người học: `/paths` xem danh sách, `/paths/tên` xem các bước. Nếu đã đăng nhập thấy **thanh tiến độ** (đã hoàn thành bao nhiêu khoá) và bước hiện tại của mình.

---

## 18. Nhắn tin học viên và giảng viên (`/messages`)

**Vì sao có:** học viên có câu hỏi riêng cho giảng viên; giảng viên cần nhắc học viên.

- Biểu tượng **tin nhắn** trên thanh menu, kèm số tin chưa đọc. Chuông thông báo cũng báo khi có tin mới.
- **Chỉ nhắn được khi có quan hệ ghi danh:** học viên nhắn giảng viên của khoá mình đã ghi danh, giảng viên nhắn học viên của mình. Không nhắn được người lạ.
- Bắt đầu từ: trang hồ sơ giảng viên (nút **Nhắn tin**), trang **Học viên** của giảng viên, hoặc nút **Tin nhắn mới** trong `/messages`.
- Có nút **Chặn/Bỏ chặn** (chỉ người chặn mới bỏ chặn được). Giới hạn 20 tin trong 10 phút để chống spam. Admin cũng không đọc được thư của người khác.
- Tin mới cập nhật theo chu kỳ vài giây (không dùng WebSocket).

---

## 19. Sửa lỗi và cải thiện khác

- **Tìm kiếm khoá học:** bộ lọc (tìm kiếm, danh mục, cấp độ, sắp xếp, trang) nằm trên URL nên tải lại hay gửi link vẫn giữ nguyên. Gõ chữ xong bấm nút tìm hoặc Enter mới gửi yêu cầu. Thanh tìm kiếm ở header trước đây không làm gì, nay chuyển sang `/courses?search=...`.
- **Sắp xếp và lọc nhiều danh mục** do backend làm trên toàn bộ kết quả, nên phân trang khớp; "Phổ biến nhất" nay theo số học viên thật.
- **Quyền truy cập:** hệ thống quyền (`npm run db:seed`) tự dò route mới. Sau mỗi lần deploy có route mới phải chạy lại để giảng viên và học viên dùng được.
- **Trang pháp lý:** `/terms` và `/privacy` soạn theo cách hệ thống hoạt động, đã điền thông tin đơn vị vận hành.
- **Đăng nhập Google, thanh toán SePay:** phần cấu hình do chủ dự án tự làm. Thanh toán không thuộc phạm vi đợt này.

---

## 20. Vận hành

- **Deploy:** gõ `/deploy-learning`. Build ở máy Mac, đẩy lên VPS, sao lưu DB, chạy migrate an toàn (từ chối thay đổi có nguy cơ mất dữ liệu), tự kiểm tra sức khoẻ, hỏng thì tự rollback. Bí mật nằm ở `~/.claude/skills/deploy-learning/prod.env`. Có tuỳ chọn `--only frontend`, `--env-only`, `--status`, `--rollback`.
- **Không build trên VPS** (chỉ 1,9GB RAM dùng chung với `ai-interview`).
- **Nhật ký kiểm toán:** nhiều thao tác nhạy cảm (duyệt chiến dịch, sửa cài đặt, xuất dữ liệu, thao tác hàng đợi, đăng bài...) được ghi ở `/admin/audit-logs`.
