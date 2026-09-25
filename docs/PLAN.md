# Kế hoạch nâng cấp U Đê Mê (+30%)

Trạng thái (2026-09-25): **đã code xong toàn bộ** đợt 0 đến 3 và backlog (D5, D7, B2, D2, D3, A3, A4, A5, C1). Mới commit ở máy cục bộ, **chưa push và chưa deploy**. Xem mục 8 để biết chỗ thực hiện khác kế hoạch.

## 1. Phạm vi đã chốt

**Không dùng AI** ở giai đoạn này. Chỉ làm CRUD, tính năng bổ trợ hoặc module độc lập. Riêng dữ liệu hồ sơ người dùng được thiết kế để sau này dùng vector so khớp người dùng với khoá học.

**Tiền bạc là phần của chủ dự án:** không làm hoàn tiền, thanh toán cho giảng viên, giới thiệu có thưởng, tặng khoá học, gói thuê bao, doanh thu giảng viên, mã giảm giá do giảng viên tạo.

| Trạng thái | Mã | Tính năng |
|---|---|---|
| **Làm** | W0 | Dọn dữ liệu giả ở trang chi tiết khoá học và footer, bài học thử (B4) |
| **Làm** | OB | Hồ sơ học tập khi tạo tài khoản (mới) |
| **Làm** | D4 | Cài đặt hệ thống, **rút gọn**: chỉ link mạng xã hội + cờ bảo trì hiện layout bảo trì toàn site |
| **Làm** | EM | Kênh email: admin gửi cho khách hàng, giảng viên gửi cần duyệt `isApproved`, **người dùng có thể từ chối nhận thư** (mới; gộp B3 thông báo khoá học) |
| **Làm** | A6, B1, B5 (rút gọn), D1 | Đánh giá nâng cao, bài tập nộp và chấm, xuất CSV học viên, ticket + FAQ |
| Backlog (**giữ lại**) | D2, D3, D5, D7, B2, A3, A4, A5, C1 | Giữ trong kế hoạch, làm sau đợt 3 |
| **Đã bỏ** | A1, A2, A7, B6, B7, B8, C2, C3, C4, D6, cụm E | Không đề xuất lại |

Lưu ý: trang `InstructorStudentsPage` đã có sẵn (danh sách học viên, tìm kiếm, lọc khoá, thanh tiến độ), nên B5 chỉ còn phần xuất CSV và chi tiết tiến độ.

## 2. Số liệu nền và đích

Hiện tại: **50 bảng, 33 module, 216 route, 46 trang FE**, khoảng 45.000 dòng code. Đích +30%: khoảng **+15 bảng, +65 route, +14 trang**.

| Đợt | Nội dung | Bảng / route / trang | Cộng dồn | Ước lượng công |
|---|---|---|---|---|
| 0 | Dọn mock + bài học thử | 0 / 2 / 0 | 0 / 2 / 0 | 1–1,5 ngày |
| 1 | OB + D4 | 5 / 13 / 5 | 5 / 15 / 5 | 4,5 ngày |
| 2 | EM | 2 / 17 / 4 | 7 / 32 / 9 | 5 ngày |
| 3 | A6 + B1 + B5 + D1 | 8 / 31 / 6 | **15 / 63 / 15** | 9–10 ngày |

Cộng dồn sau đợt 3 ≈ +30% bảng, +29% route, +33% trang, đúng mục tiêu. Số ngày là ước lượng cho một người làm và tự kiểm thử.

Thứ tự hợp lý: OB đi sớm để dữ liệu người dùng bắt đầu tích luỹ. D4 đi trước EM. Trang tĩnh Chính sách bảo mật đi cùng OB, trước khi thu thập dữ liệu cá nhân.

---

## 3. Đợt 0: Dọn dữ liệu giả

### Trang chi tiết khoá học (`CourseDetailPage.tsx`)
- [ ] Bỏ dòng "Cấp chứng chỉ hoàn thành" (:690, vì A1 đã bỏ).
- [ ] Bỏ dòng "Hoàn tiền trong 30 ngày" (:680) cho đến khi chủ dự án có chính sách hoàn tiền.
- [ ] "Học trên Mobile và TV" (:689) đổi thành "Học trên mọi thiết bị".
- [ ] "3 bài viết chuyên sâu", "15 bài tập Coding" (:686-687): backend trả `stats: { videoLessons, textLessons, quizzes, materials }` thật, FE hiển thị và ẩn dòng nào bằng 0.
- [ ] Thêm cột `Course.language` (mặc định `vi`) + ô chọn ở trang soạn khoá + hiển thị thay cho chữ "Tiếng Việt" cứng (:299).
- [ ] Backend `getCourseById`: `category` trả thêm `id`; `instructor.bio` lấy từ `InstructorProfile.bio`; trả `ratingDistribution` thật (`groupBy`) thay cho phần FE tự tính trên 5 đánh giá; bỏ `reviews[]` thừa.
- [ ] **Bài học thử (B4):** thêm `Lesson.isPreview Boolean @default(false)`, giảng viên bật/tắt ở trang nội dung khoá, route `GET /lessons/:id/preview` (công khai, chỉ trả media khi `isPreview`), FE hiện nhãn "Học thử", bấm vào mở trình phát.
- [ ] Phát `introVideo` thật ở khung "Xem giới thiệu" (YouTube embed hoặc video R2).
- [ ] Nút "Mua ngay" (:639): thêm vào giỏ rồi chuyển sang `/checkout`. Chỉ dùng lại luồng có sẵn, không đụng logic thanh toán.
- [ ] "Chia sẻ khoá học": Web Share API, dự phòng sao chép link.
- [ ] Bấm bài trong danh sách nội dung: bài thử thì mở trình phát, bài khoá thì hiện biểu tượng khoá và thông báo.
- [ ] "(N đánh giá)" cuộn tới phần đánh giá. Huy hiệu wishlist sửa `'9999+'` thành `'99+'`.
- [ ] Nhãn khoá liên quan "Bán chạy/Nổi bật/Mới": hiện là suy đoán với ngưỡng cứng 100 học viên, giữ nhưng ghi chú rõ đó là quy ước.

### Footer (`FooterSection.tsx`, hiện ở mọi trang)
- [ ] Câu "hơn 5000+ khóa học" không đúng sự thật, đổi sang số thật từ API hoặc bỏ số.
- [ ] Email `support@learnhub.edu.vn`, SĐT `1900 123 456`, địa chỉ "Q. Cầu Giấy, Hà Nội" là dữ liệu mẫu. **Cần giá trị thật của chính đơn vị vận hành** (địa chỉ của công ty khác, ví dụ Bosch, sẽ khiến khách hiểu sai về nơi đặt trụ sở nên **không dùng**). Dòng nào chưa có giá trị thật thì ẩn. Lấy từ biến môi trường FE, không cần bảng.
- [ ] Các link `/about`, `/careers`, `/blog`, `/partners`, `/press`, `/help` **không có route nào** (rơi vào trang 404). Ẩn đến khi có trang thật (blog và help ở backlog/đợt 3). `/terms` và `/privacy` sẽ có ở đợt 1.
- [ ] Link "Điều khoản/Bảo mật/Cookies" ở dải dưới đều là `#`: trỏ về `/terms`, `/privacy`, bỏ "Cookies".
- [ ] Link danh mục dùng slug (`?category=programming`) trong khi backend dùng id: lấy danh mục thật từ API và để `CoursesPage` đọc `categoryId` từ URL.
- [ ] 5 biểu tượng mạng xã hội đều `href="#"`: nối với D4 ở đợt 1.

### Ảnh dự phòng
- [ ] `via.placeholder.com` (11 chỗ ở 9 file) không kết nối được nữa. Tạo component `ImageWithFallback` dùng ảnh SVG nội bộ và thay ở tất cả các chỗ.

**Nghiệm thu:** duyệt tay trang chi tiết với khoá có và không có bài thử, khoá không có đánh giá, giảng viên chưa có tiểu sử. Không còn ảnh vỡ, không còn link chết ở footer.

---

## 4. Đợt 1A: Hồ sơ học tập khi tạo tài khoản (OB)

### Nguyên tắc
- Form đăng ký giữ nguyên (email, tên, SĐT, mật khẩu, OTP). Thêm **màn hướng dẫn 3–4 bước sau lần đăng nhập đầu**, để người đăng ký bằng Google cũng được hỏi. Người dùng cũ cũng thấy ở lần đăng nhập kế tiếp.
- Cho **bỏ qua**, nhắc lại tối đa 3 lần (đếm `onboardingSkippedCount`).
- **Tối thiểu hoá dữ liệu:** không hỏi ngày sinh, địa chỉ, thu nhập.
- Người dùng và khoá học dùng **chung một bảng thẻ (`Tag`)**, để sau này tạo embedding hoặc so khớp bằng luật đều được.
- Chưa tạo cột vector. Khi cần: đổi image Postgres sang `pgvector/pgvector:pg16` (cùng phiên bản 16, dữ liệu giữ nguyên), `CREATE EXTENSION vector`, thêm cột `embedding`. Việc tạo embedding gọi dịch vụ bên ngoài, không chạy trên VPS.
- Đồng ý cá nhân hoá (`allowPersonalization`) là một ô riêng, **mặc định không tick**. Không có ô tick nhận thư ở lúc đăng ký: mặc định người dùng nhận thư thông báo và **tự tắt được** (xem đợt 2).

### Schema (Prisma)
```prisma
enum LearningGoal { CAREER_CHANGE UPSKILL_CURRENT_JOB SCHOOL_EXAM HOBBY START_BUSINESS OTHER }
enum Occupation { STUDENT EMPLOYEE FREELANCER BUSINESS_OWNER UNEMPLOYED OTHER }
enum TagType { SKILL TOPIC TOOL }
enum InterestSource { ONBOARDING MANUAL BEHAVIOR }

model UserLearningProfile {
  id                     String        @id @default(uuid())
  userId                 String        @unique
  user                   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal                   LearningGoal?
  goalNote               String?       @db.VarChar(300) // văn bản tự do: nguyên liệu tốt cho embedding
  currentLevel           CourseLevel?  // cùng enum với Course.level để so trực tiếp
  occupation             Occupation?
  industry               String?
  yearsOfExperience      Int?
  weeklyHours            Int?
  preferredLanguage      String        @default("vi")
  allowPersonalization   Boolean       @default(false)
  onboardingCompletedAt  DateTime?
  onboardingSkippedCount Int           @default(0)
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt
}

model Tag {
  id         String   @id @default(uuid())
  name       String   @unique
  slug       String   @unique
  type       TagType
  categoryId String?
  isActive   Boolean  @default(true)
  courses    CourseTag[]
  users      UserInterest[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model CourseTag {
  courseId String
  tagId    String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([courseId, tagId])
}

model UserInterest {
  userId    String
  tagId     String
  weight    Float          @default(1)
  source    InterestSource @default(ONBOARDING)
  createdAt DateTime       @default(now())
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  tag       Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([userId, tagId])
}
```
Khoá học đã có sẵn dữ liệu văn bản tốt cho embedding: `CourseDetail.objectives`, `requirements`, `targetAudience`, `description`, cộng với `Category`, `level`, và `Course.language` (thêm ở đợt 0).

### API (khoảng 10 route)
| Route | Ai | Ghi chú |
|---|---|---|
| `GET /profile/learning` | người dùng | hồ sơ của tôi + trạng thái onboarding |
| `PUT /profile/learning` | người dùng | tạo hoặc cập nhật, kèm danh sách thẻ quan tâm (tối đa 10) |
| `POST /profile/learning/skip` | người dùng | tăng `onboardingSkippedCount` |
| `GET /tags` | công khai | lọc `q`, `type`, `categoryId` |
| `POST/PUT/DELETE /tags` | admin | quản lý thẻ (3 route) |
| `PUT /courses/:id/tags` | giảng viên của khoá / admin | tối đa 8 thẻ |
| `GET /recommendations/for-me` | người dùng | *tuỳ chọn*, xếp theo luật: số thẻ trùng, cùng trình độ, cùng danh mục. Chỉ dùng khi `allowPersonalization` |

### Giao diện (khoảng 3 trang) và trang tĩnh
- `OnboardingWizard`: mục tiêu, trình độ, chọn thẻ quan tâm, nghề nghiệp + giờ học mỗi tuần + ô đồng ý cá nhân hoá.
- Tab "Hồ sơ học tập" trong Cài đặt tài khoản (sửa lại sau).
- Trang admin `/admin/tags`, ô chọn thẻ ở trang soạn khoá học.
- Trang tĩnh `/privacy` và `/terms` lấy từ hai bản nháp đã soạn: [frontend/src/content/legal/privacy-policy.md](../frontend/src/content/legal/privacy-policy.md) và [frontend/src/content/legal/terms-of-use.md](../frontend/src/content/legal/terms-of-use.md). Bản nháp bám đúng dữ liệu hệ thống thực sự thu thập; **cần chủ dự án điền thông tin đơn vị và rà pháp lý trước khi công bố.**
- Hàng "Dành cho bạn" trên trang chủ (tuỳ chọn, để dữ liệu có ích ngay).

**Nghiệm thu:** đăng ký thường và Google đều thấy wizard, bỏ qua 3 lần thì không hiện nữa, sửa được từ Cài đặt, người dùng không tick đồng ý thì không có gợi ý cá nhân hoá.

---

## 5. Đợt 1B: D4 Cài đặt hệ thống (rút gọn)

Chỉ có hai nhóm: **link mạng xã hội** và **chế độ bảo trì**. Không có cờ tính năng, không có cấu hình mail.

### Schema
```prisma
model SiteSetting {
  id                 String    @id @default("singleton") // luôn đúng một dòng
  facebookUrl        String?
  instagramUrl       String?
  twitterUrl         String?
  youtubeUrl         String?
  linkedinUrl        String?
  tiktokUrl          String?
  zaloUrl            String?
  maintenanceEnabled Boolean   @default(false)
  maintenanceMessage String?   @db.VarChar(500)
  maintenanceUntil   DateTime? // dự kiến mở lại, chỉ để hiển thị
  updatedById        String?
  updatedAt          DateTime  @updatedAt
}
```
Link bắt buộc bắt đầu bằng `https://` (chặn `javascript:` và các scheme lạ, vì được render vào thẻ `<a href>`). Để trống thì FE ẩn biểu tượng đó.

### API (3 route)
- `GET /settings/public`: công khai, cache Redis 30 giây. Trả link mạng xã hội và `maintenance { enabled, message, until }`.
- `GET /admin/settings`, `PUT /admin/settings`: chỉ admin, ghi `AuditLog` mỗi lần đổi, đồng thời cập nhật ngay khoá cache Redis.

### Chế độ bảo trì
**Backend** — `MaintenanceGuard` (đặt sau guard xác thực): khi bảo trì đang bật, người không phải ADMIN nhận **503** kèm `{ code: "MAINTENANCE", message, until }` và header `Retry-After`. **Whitelist (luôn cho qua):**
- `/api/health`
- `/api/webhooks/*` (SePay: tiền vào không được phép bị chặn)
- `/api/webhook/*` (video worker báo kết quả xử lý, có secret nội bộ)
- `/api/settings/public`
- `/api/auth/*` (để admin đăng nhập và tắt bảo trì)

Job nền (BullMQ hết hạn đơn, gửi mail) không đi qua HTTP nên vẫn chạy. **Fail-open:** nếu đọc trạng thái bảo trì bị lỗi thì cho request đi tiếp, không tự khoá cả site.

**Frontend** — lớp `AppShell` bọc quanh toàn bộ `<Routes>` trong `App.tsx`:
- Lấy `settings/public` bằng react-query (làm mới mỗi 60 giây và khi quay lại tab).
- Bảo trì bật **và** người dùng không phải admin: thay toàn bộ layout bằng `MaintenanceLayout` (toàn màn hình: logo, thông báo, giờ dự kiến mở lại, nút "Thử lại", link mạng xã hội). Riêng `/auth/*` vẫn vào được để admin đăng nhập.
- Axios interceptor bắt 503 mã `MAINTENANCE` để chuyển sang layout bảo trì ngay, không cần chờ chu kỳ làm mới.
- Admin đang đăng nhập vẫn dùng bình thường, thấy dải cảnh báo đỏ "Đang bật chế độ bảo trì, người dùng thường không truy cập được" kèm nút tắt nhanh.
- Trang `/admin/settings`: thẻ "Mạng xã hội" (7 ô + xem trước) và thẻ "Bảo trì" (công tắc có hộp xác nhận, nội dung, giờ dự kiến).

**Giới hạn cần biết:** vì là SPA nên trang bảo trì trả HTTP 200 (chỉ các API trả 503), công cụ tìm kiếm có thể thấy nội dung bảo trì. Chấp nhận được cho bảo trì ngắn.

**Nghiệm thu:** bật bảo trì, người dùng thường thấy layout bảo trì ở mọi đường dẫn (trừ `/auth/*`), admin vẫn thao tác, webhook SePay và `/api/health` vẫn 200, tắt là mở lại ngay; footer hiện đúng các link đã nhập.

---

## 6. Đợt 2: Kênh email có duyệt (EM)

### Vai trò và quy tắc
| Ai | Gửi cho ai | Duyệt |
|---|---|---|
| **Admin** | Mọi người dùng, theo vai trò, theo học viên một khoá, theo thẻ quan tâm, hoặc danh sách cụ thể (tối đa 50) | Tự duyệt khi bấm gửi (`isApproved=true`) |
| **Giảng viên** | **Chỉ học viên đã ghi danh khoá của chính mình** | **Luôn cần admin duyệt**; tối đa `INSTRUCTOR_CAMPAIGNS_PER_WEEK` chiến dịch/tuần |

- **Cờ `isApproved`** (theo quy ước camelCase của dự án cho `is_approve`) cộng thêm `status`. Worker gửi **kiểm tra lại `isApproved` và `status` lần nữa** trước khi gửi (lớp an toàn thứ hai).
- **Sửa sau khi duyệt** (nội dung hoặc đối tượng) thì reset `isApproved=false` và về `DRAFT`, để không ai duyệt bản này rồi đổi thành bản khác.
- **Luồng:** `DRAFT` → nộp → `PENDING_APPROVAL` → admin duyệt (`APPROVED`) hoặc từ chối kèm lý do (`REJECTED`) → gửi ngay hoặc hẹn giờ (`SCHEDULED`) → `SENDING` → `SENT`; huỷ được (`CANCELLED`) khi chưa gửi xong.
- Báo admin trong app khi có yêu cầu chờ duyệt (`Notification`), báo giảng viên khi có kết quả.
- Có nút **gửi thử** cho chính người soạn trước khi nộp.
- Người nhận được xác định **lúc gửi**: chỉ tài khoản `ACTIVE`, **chưa từ chối nhận thư** (`emailCampaignOptOut=false`), loại trùng địa chỉ và địa chỉ nằm trong `EmailSuppression`. Không lưu snapshot danh sách người nhận.
- **Từ chối nhận thư (opt-out):** mọi mail của chiến dịch có link "Ngừng nhận thư này" ký bằng token (mỗi người một token), cộng header `List-Unsubscribe` và `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (bấm một lần trong Gmail/Apple Mail). Người dùng cũng bật/tắt được trong Cài đặt tài khoản, và bật lại được. **Mail giao dịch (OTP, đơn hàng, cảnh báo đăng nhập) không bị ảnh hưởng.** Admin có thể đánh dấu một chiến dịch là *thông báo dịch vụ* (`isServiceNotice`, ví dụ đổi điều khoản) để gửi cả người đã tắt; giảng viên không có quyền này.
- **HTML lọc ở server** bằng `sanitize-html` (cho phép `p, br, strong, em, u, ul, ol, li, h2, h3, blockquote, a` với `https/mailto`, `img` https). Chặn `script`, `iframe`, `form`, thuộc tính `style`. Hỗ trợ biến `{{name}}`, `{{courseTitle}}`.
- Mỗi mail của chiến dịch gửi qua **hàng đợi mail đã có**, với `idempotencyKey = campaign-<campaignId>-<userId>` (Resend giữ 24 giờ) nên retry không gửi trùng. Nội dung được render **riêng cho từng người** (tên, link ngừng nhận thư), nên `MailJobData` được mở rộng thêm trường `headers`.
- Nhận **webhook Resend** (chữ ký Svix) về bounce và complaint để tự thêm vào `EmailSuppression`, bảo vệ uy tín domain (domain đang dùng chung với dự án Arion).
- Gộp B3: "thông báo khoá học" chính là chiến dịch tới học viên của khoá, cộng thêm thông báo trong app (hiện ngay, còn email thì chờ duyệt).

### Schema
```prisma
enum CampaignStatus { DRAFT PENDING_APPROVAL APPROVED REJECTED SCHEDULED SENDING SENT CANCELLED }
enum SuppressionReason { BOUNCE COMPLAINT MANUAL }

// Thêm vào model User:
//   emailCampaignOptOut Boolean   @default(false)
//   emailOptOutAt       DateTime?

model EmailCampaign {
  id              String         @id @default(uuid())
  senderId        String
  sender          User           @relation(fields: [senderId], references: [id])
  subject         String         @db.VarChar(200)
  bodyHtml        String         // đã lọc
  audience        Json           // { type: ALL_USERS|ROLE|COURSE_ENROLLEES|INSTRUCTOR_STUDENTS|INTEREST_TAG|SPECIFIC_USERS, ... }
  status          CampaignStatus @default(DRAFT)
  isApproved      Boolean        @default(false)
  isServiceNotice Boolean        @default(false) // chỉ admin; bỏ qua opt-out
  approvedById    String?
  approvedAt      DateTime?
  rejectedReason  String?
  scheduledAt     DateTime?
  startedAt       DateTime?
  finishedAt      DateTime?
  totalRecipients Int            @default(0)
  sentCount       Int            @default(0)
  failedCount     Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  @@index([status])
  @@index([senderId])
}

model EmailSuppression {
  id        String            @id @default(uuid())
  email     String            @unique
  reason    SuppressionReason
  createdAt DateTime          @default(now())
}
```
Tiến độ theo dõi bằng bộ đếm `sentCount/failedCount` (worker tăng nguyên tử sau mỗi mail); khi `sentCount + failedCount = totalRecipients` thì chuyển `SENT`. Mail lỗi hẳn được BullMQ giữ 1 giờ để điều tra.

### API (khoảng 17 route)
`POST /email-campaigns` (tạo nháp), `GET /email-campaigns` (của tôi; admin thấy tất cả, có lọc trạng thái), `GET /:id`, `PUT /:id`, `DELETE /:id` (chỉ nháp, bị từ chối hoặc đã huỷ), `POST /:id/preview-audience` (đếm người nhận), `POST /:id/test-send`, `POST /:id/submit`, `POST /:id/approve` (admin), `POST /:id/reject` (admin, có lý do), `POST /:id/send` (ngay hoặc hẹn giờ), `POST /:id/cancel`, `POST /webhooks/resend` (công khai, kiểm chữ ký).

Từ chối nhận thư (4 route): `GET /email/unsubscribe?token=` (công khai, hiện trang xác nhận), `POST /email/unsubscribe` (công khai, dùng cho một-chạm và nút xác nhận, kiểm token), `GET /email/preferences` và `PUT /email/preferences` (người dùng đăng nhập, bật/tắt nhận thư).

### Giao diện (4 trang)
- Admin: `/admin/email-campaigns` (danh sách, lọc, duyệt hoặc từ chối, số liệu) và trình soạn thảo.
- Giảng viên: `/instructor/announcements` (soạn, lịch sử, nhãn trạng thái chờ duyệt).
- Công khai: `/unsubscribe` (xác nhận ngừng nhận thư, có nút "Đăng ký nhận lại") và công tắc "Nhận thư thông báo" trong Cài đặt tài khoản.
- Ô soạn thảo văn bản giàu định dạng (chọn thư viện gọn nhẹ, quyết định lúc làm).

### Hạn mức gửi và cấu hình (đặt trong `.env`, không phải D4)
- `MAIL_DAILY_CAP` (mặc định **100**, theo gói miễn phí của Resend), `MAIL_TRANSACTIONAL_RESERVE` (mặc định **40**, dành cho OTP và mail đơn hàng), `INSTRUCTOR_CAMPAIGNS_PER_WEEK` (mặc định 3), `MAIL_REPLY_TO` (hộp thư hỗ trợ), `RESEND_WEBHOOK_SECRET`.
- Bộ đếm mail đã gửi trong ngày ở Redis (tính cả mail giao dịch). Job của chiến dịch chỉ chạy khi `đã gửi < cap − reserve`, nếu hết thì hoãn sang ngày sau. **OTP không bao giờ bị chiến dịch chiếm hạn mức.** Cần xác nhận với Resend thời điểm reset hạn mức theo ngày (mặc định coi là UTC).
- Theo hiểu biết của mình, gói miễn phí là 100 mail/ngày, 3.000 mail/tháng và **dùng chung với dự án Arion**, cần kiểm tra lại trên Resend. Chiến dịch 300 người sẽ mất khoảng 5 ngày ở mức này. **Nên nâng lên gói trả phí trước lần gửi hàng loạt đầu tiên.**

### Rủi ro còn lại
Đã có cách từ chối nhận thư nên rủi ro giảm nhiều. Còn lại:
1. Người nhận vẫn có thể bấm "báo spam" thay vì ngừng nhận, và điều đó ảnh hưởng uy tín domain dùng chung với Arion. Webhook complaint tự chặn địa chỉ đó, và nên chỉ gửi **thông báo** (khoá học, vận hành) thay vì quảng cáo.
2. Mô hình mặc định là đang nhận, người dùng tự tắt (opt-out). Theo mình hiểu, quy định về thư quảng cáo tại Việt Nam (Nghị định 91/2020/NĐ-CP) còn liên quan đến việc người nhận đồng ý trước. **Cần kiểm tra lại về pháp lý** nếu sau này gửi nội dung quảng cáo.

**Nghiệm thu:** giảng viên không thể gửi nếu chưa được duyệt hoặc gửi ngoài học viên của mình; sửa nội dung sau khi duyệt thì mất duyệt; gửi trùng không tạo mail thứ hai; hết hạn mức thì hoãn, OTP vẫn đi ngay; HTML độc hại bị lọc; người đã ngừng nhận thư không nhận chiến dịch (trừ thông báo dịch vụ của admin) nhưng vẫn nhận OTP và mail đơn hàng; link ngừng nhận thư giả hoặc hết hạn bị từ chối.

---

## 7. Đợt 3

### A6: Đánh giá nâng cao (1 bảng / 3 route)
- `ReviewHelpful (reviewId, userId, @@id)`: `POST` và `DELETE /reviews/:id/helpful`, thay cho số `helpful: 0` giả.
- Mở rộng `GET /reviews?courseId&sort=newest|helpful&rating=&hasComment=`. FE thêm bộ lọc, sắp xếp và nút "Hữu ích".

### B1: Bài tập nộp và chấm (3 bảng / 12 route / 3 trang)
- `Assignment` (khoá/bài học, tiêu đề, mô tả, hạn nộp, điểm tối đa, cho nộp trễ), `Submission` (nội dung văn bản, file R2, trạng thái `SUBMITTED|GRADED|RETURNED`, điểm, nhận xét, người chấm, thời điểm), `unique(assignmentId, userId)` và cho nộp lại đến khi được chấm.
- Giảng viên: CRUD bài tập, danh sách bài nộp, chấm điểm, trả lại yêu cầu sửa. Học viên: xem đề, nộp bài, xem kết quả, danh sách bài tập của tôi. Xin URL upload file có kiểm loại và dung lượng.
- Thông báo trong app và mail giao dịch (qua hàng đợi) khi có bài nộp mới và khi có điểm.

### B5 (rút gọn): 0 bảng / 2 route
- `GET /instructor/students/export` (CSV, có lọc theo khoá) và ngăn kéo chi tiết tiến độ từng bài của một học viên. Trang danh sách và thanh tiến độ đã có sẵn.

### D1: Ticket và FAQ (4 bảng / 14 route / 3 trang)
- `SupportTicket` (chủ đề, nhóm, trạng thái `OPEN|IN_PROGRESS|RESOLVED|CLOSED`, ưu tiên, người phụ trách), `TicketMessage` (người gửi, nội dung, cờ nhân viên), `FaqCategory`, `Faq` (câu hỏi, câu trả lời đã lọc HTML, thứ tự, công khai).
- Học viên tạo, xem, trả lời, đóng ticket; admin xem tất cả, gán người, đổi trạng thái, trả lời (mail giao dịch qua hàng đợi khi nhân viên trả lời). FAQ công khai có tìm kiếm, admin quản lý và sắp xếp.
- Trang `/help` sẽ làm cho link "Trung tâm trợ giúp" ở footer hoạt động.

## 8. Backlog: đã làm xong

Số liệu thực tế sau khi làm hết: **77 bảng (từ 50), 341 route (từ 216), 79 trang FE (từ 46)**. Đã kiểm thử bằng 68 unit test và 11 bộ test tích hợp (khoảng 330 kiểm tra) chạy với Postgres/Redis của docker compose.

| Mã | Đã làm | Khác kế hoạch |
|---|---|---|
| D5 | `/admin/system`: số job theo hàng đợi (mail, chiến dịch, hết hạn đơn), xem/thử lại/xoá job lỗi, trạng thái DB, Redis, hạn mức mail trong ngày | Không lộ nội dung thư, OTP hay email đầy đủ; mọi thao tác được ghi nhật ký |
| D7 | Xuất và nhập danh mục CSV (`/admin/csv/categories/*`), nhập có chế độ chạy thử, chỉ tạo mới | Xuất người dùng/khoá học đã có sẵn ở admin-analytics nên không làm lại. **Báo cáo định kỳ qua mail đã bỏ** vì hạn mức 100 mail/ngày dùng chung với OTP và đơn hàng |
| B2 | Tài liệu đính kèm (tối đa 10/bài) và phụ đề WebVTT/SRT (tối đa 8 ngôn ngữ/bài) cho bài học | Phụ đề lưu thẳng trong DB, làm sạch thẻ HTML, phát bằng Blob URL nên không cần CORS. Chỉ áp dụng cho video tải lên, không áp dụng cho YouTube/Drive |
| D2 | Blog (`/blog`) và trang tĩnh (`/p/:slug`, có thể gắn vào footer), trình soạn có xem trước | Nội dung là markdown tối giản hiển thị bằng bộ render an toàn, không dùng HTML thô |
| D3 | Trang chủ cấu hình được: tiêu đề, banner có lịch hiện, lời chứng thực, bật/tắt khối, bài viết mới | Đã **xoá số liệu bịa** ở hero ("15.000 học viên", "4.9/5", "+2.5k tuần này", ảnh pravatar) và khối "4.000 công ty"; nay hero hiện số liệu thật từ DB |
| A3 | Bộ sưu tập khoá học (riêng tư mặc định, chia sẻ bằng liên kết) | Route công khai dùng `OptionalAccessTokenGuard` để nhận ra chủ sở hữu |
| A4 | Hồ sơ học tập công khai `/u/:userId`, **mặc định tắt**, chọn phần hiển thị | Không bao giờ lộ email/số điện thoại; tài khoản khoá hay đã xoá trả 404 |
| A5 | Lộ trình học do admin biên soạn, kèm tiến độ và "bước hiện tại" của người học | Chỉ admin tạo; không có tiền bạc |
| C1 | Nhắn tin học viên ↔ giảng viên (chỉ khi có quan hệ ghi danh), chặn, đếm chưa đọc, thông báo chuông | Chỉ 20 tin/10 phút mỗi người; admin cũng không đọc được thư của người khác; dùng polling, không WebSocket |

**Lệch so với các mục trên trong tài liệu này:** nội dung chiến dịch email dùng markdown tối giản (bộ render `render.util.ts`, escape mọi thứ) thay cho HTML + `sanitize-html` như mô tả ở mục EM, vì đơn giản và an toàn hơn. Số route của B5 và D1 cũng khác đôi chút so với ước lượng.

**Việc còn lại của chủ dự án:** push lên GitHub (repo đang công khai, cần xem lại trước khi đẩy), `/deploy-learning` (thêm `RESEND_WEBHOOK_SECRET`, `MAIL_REPLY_TO`, `MAIL_COMPANY_ADDRESS`, `VITE_CONTACT_*` vào `prod.env`), điền các chỗ `[[...]]` trong trang điều khoản/bảo mật, thông tin liên hệ thật ở footer, cấu hình Google OAuth và nút "Gửi thử" của SePay, xoay khoá Resend đã lộ trong chat.

## 9. Quy trình chung cho mỗi đợt
1. Nhánh riêng, commit nhỏ. Schema chỉ **thêm**, kiểm `prisma migrate diff` không có `DROP` rồi mới `prisma db push`. Backup DB trước (`/deploy-learning` tự làm khi deploy backend).
2. Route mới: chỉ thêm quyền cho route mới, **không cấp lại mặc định** cho toàn bộ route (tránh ghi đè quyền đã chỉnh tay).
3. Test: unit test cho logic phân quyền, duyệt, bảo trì; test tích hợp có Redis + Resend giả (như hàng đợi mail) cho các luồng gửi mail.
4. Deploy bằng `/deploy-learning` (build ở Mac, không build trên VPS). Có biến môi trường mới thì thêm vào `prod.env`, `.env.example`, `docker-compose.yml`, `DEPLOY.md`.
5. Smoke test sau deploy, cập nhật `DEPLOY.md` và tài liệu này.
6. **VPS chỉ 1,9 GB RAM dùng chung với hệ thống khác:** tránh thư viện nặng (không dùng trình duyệt headless để tạo PDF hay ảnh), theo dõi RAM và độ trễ API cũ khi deploy.

## 10. Quyết định đã chốt và việc còn lại
**Đã chốt (2026-09-25):**
1. Backlog **giữ lại**.
2. Onboarding cho bỏ qua, nhắc tối đa 3 lần.
3. Admin gửi mail không cần duyệt, chỉ giảng viên cần.
4. Nâng Resend lên gói trả phí trước lần gửi hàng loạt đầu.
5. Bỏ dòng "Hoàn tiền trong 30 ngày", thêm lại khi có chính sách.
6. Đồng ý cá nhân hoá mặc định không tick.
7. Người dùng **có thể từ chối nhận email** (đã thêm vào đợt 2).
8. Trang `/privacy` và `/terms`: dùng hai bản nháp trong `docs/legal/`.

**Còn chờ chủ dự án:**
- Thông tin liên hệ thật ở footer: email, SĐT, địa chỉ của chính đơn vị vận hành (không dùng địa chỉ của công ty khác).
- Điền thông tin đơn vị vận hành vào hai bản nháp chính sách (các mục `[[...]]`) và rà pháp lý trước khi công bố.
- Chính sách hoàn tiền (nếu có), để đưa vào Điều khoản.
