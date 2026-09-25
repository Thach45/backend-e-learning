<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Thach45/backend-e-learning">
    <img src="./public/assets/image.png" alt="U Đê Mê Logo" width="80" height="80">
  </a>

  <h3 align="center">U Đê Mê - Nền tảng học tập trực tuyến</h3>

  <p align="center">
    Nền tảng học trực tuyến toàn diện, hiệu năng cao và trải nghiệm tối ưu
    <br />
    <a href="https://github.com/Thach45/backend-e-learning"><strong>Khám phá tài liệu »</strong></a>
    <br />
    <br />
    <a href="https://e-learning-hubpro.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/Thach45/backend-e-learning/issues">Báo lỗi</a>
    ·
    <a href="https://github.com/Thach45/backend-e-learning/issues">Yêu cầu tính năng</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Mục lục (Table of Contents)</summary>
  <ol>
    <li>
      <a href="#about-the-project">Về dự án (About The Project)</a>
      <ul>
        <li><a href="#built-with">Được xây dựng bằng (Built With)</a></li>
      </ul>
    </li>
    <li>
      <a href="#features">Các chức năng chính (Features)</a>
    </li>
    <li>
      <a href="#getting-started">Bắt đầu (Getting Started)</a>
      <ul>
        <li><a href="#prerequisites">Yêu cầu hệ thống (Prerequisites)</a></li>
        <li><a href="#installation">Cài đặt (Installation)</a></li>
      </ul>
    </li>
    <li><a href="#folder-structure">Cấu trúc dự án (Folder Structure)</a></li>
    <li><a href="#roadmap">Định hướng (Roadmap)</a></li>
    <li><a href="#contributing">Đóng góp (Contributing)</a></li>
    <li><a href="#contact">Liên hệ (Contact)</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

**U Đê Mê** ra đời với mong muốn giải quyết bài toán về một nền tảng học trực tuyến (E-Learning) tinh gọn, hiện đại và không gây xao nhãng cho người học. 

Trong bối cảnh các nền tảng học tập thường quá phức tạp hoặc giật lag khi xem video chất lượng cao, **U Đê Mê** tập trung vào trải nghiệm cốt lõi:
- **Tối ưu hóa sự tập trung:** Giao diện được thiết kế tối giản, sạch sẽ (lấy cảm hứng từ Notion), giúp người học đắm chìm vào nội dung bài giảng.
- **Trải nghiệm mượt mà:** Khắc phục triệt để vấn đề giật lag nhờ công nghệ truyền phát video (streaming) hiệu năng cao.
- **Kết nối dễ dàng:** Tạo ra một không gian "all-in-one" (tất cả trong một) nơi học viên có thể trao đổi kiến thức trong cộng đồng, còn giảng viên có đầy đủ bộ công cụ mạnh mẽ để quản lý và phân phối khóa học.

Dự án không chỉ là một ứng dụng học tập thông thường, mà còn là một môi trường giáo dục số tối ưu — nơi kiến thức được truyền tải một cách nhanh chóng và hiệu quả nhất!

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

### Built With

Dự án là sự kết hợp của các công nghệ hiện đại nhất (Full-stack):

**Frontend:**
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript.ts]][TypeScript-url]
* [![Vite][Vite.js]][Vite-url]
* [![TailwindCSS][Tailwind.css]][Tailwind-url]
* [![ReactQuery][ReactQuery.com]][ReactQuery-url]

**Backend:**
* [![NestJS][NestJS.com]][NestJS-url]
* [![Prisma][Prisma.io]][Prisma-url]
* [![Redis][Redis.io]][Redis-url]
* **Celery, AWS S3, Cloudinary**

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- FEATURES -->
## Features

Hệ thống cung cấp trải nghiệm học tập toàn diện với các phân hệ chính:

- **Hệ thống Học tập (Learning Section):** Hỗ trợ phát video khoá học tốc độ cao (HLS) qua Vidstack, ghi nhận tiến trình học tập thời gian thực.
- **Dành cho Học viên (Student):** 
  - Đăng ký/Đăng nhập, Quản lý tài khoản.
  - Xem danh sách khoá học, chi tiết khoá học.
  - Giỏ hàng (Cart) và Thanh toán (Checkout/Payment).
  - Quản lý khoá học đã mua (My Courses) và Lịch sử đơn hàng (My Orders).
  - Tham gia thảo luận trong Cộng đồng (Community).
- **Dành cho Giảng viên (Instructor):** 
  - Phân hệ riêng để quản lý khoá học, upload video, thống kê doanh thu và tương tác với học viên.
- **Dành cho Quản trị viên (Admin):** 
  - Trang quản trị kiểm soát toàn bộ hệ thống (người dùng, khoá học, giao dịch, thống kê báo cáo).
- **Phân quyền (Permissions):** Giao diện tự động thay đổi tuỳ theo vai trò (Role) của người dùng hiện tại (Admin, Instructor, Student), được Backend kiểm soát bảo mật chặt chẽ.

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Dưới đây là hướng dẫn để bạn có thể cài đặt và chạy thử dự án ở môi trường local.

### Prerequisites

* Node.js (phiên bản 18+ khuyến nghị)
* npm hoặc yarn
* Redis Server (cho backend)
* PostgreSQL (cho Prisma database)

### Installation

1. Clone kho lưu trữ
   ```sh
   git clone https://github.com/Thach45/backend-e-learning.git
   ```

2. Cài đặt Backend
   ```sh
   cd e-learning-nest
   npm install
   # Copy file .env
   cp .env.example .env
   # Setup database
   npm run db:push
   npm run db:seed
   # Chạy server
   npm run start:dev
   ```

3. Cài đặt Frontend
   ```sh
   cd ../frontend
   npm install
   # Cấu hình file .env
   # VITE_API_BASE_URL=http://localhost:3000/api
   npm run dev
   ```
   Ứng dụng Frontend sẽ chạy tại `http://localhost:5173`

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- FOLDER STRUCTURE -->
## Folder Structure

Cấu trúc dự án bao gồm 2 phân hệ chính:

```
online-learning-platform/
├── e-learning-nest/   # Backend API Server
│   ├── src/           # Mã nguồn NestJS
│   ├── prisma/        # Schema Database
│   ├── initialScript/ # Seed data
│   └── ...
└── frontend/          # Client React Application
    ├── src/
    │   ├── api/       # Tích hợp REST APIs
    │   ├── components/# Các thành phần giao diện dùng chung
    │   ├── pages/     # Các trang chính của ứng dụng
    │   └── ...
```

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Tích hợp hệ thống Design Notion cho giao diện
- [x] Xây dựng luồng học tập với Vidstack (HLS) và tích hợp Backend
- [ ] Thêm tính năng đa ngôn ngữ (Multi-language)
- [ ] Tối ưu SEO và Performance

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Bất kỳ đóng góp nào của bạn cũng được đánh giá cao và giúp cho cộng đồng mã nguồn mở trở thành một nơi tuyệt vời hơn.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- CONTACT -->
## Contact

Hoang Thach - hoangthach.dev@gmail.com

Backend Link: [https://github.com/Thach45/backend-e-learning](https://github.com/Thach45/backend-e-learning)

<p align="right">(<a href="#readme-top">quay lại đầu trang</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/Thach45/backend-e-learning.svg?style=for-the-badge
[contributors-url]: https://github.com/Thach45/backend-e-learning/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Thach45/backend-e-learning.svg?style=for-the-badge
[forks-url]: https://github.com/Thach45/backend-e-learning/network/members
[stars-shield]: https://img.shields.io/github/stars/Thach45/backend-e-learning.svg?style=for-the-badge
[stars-url]: https://github.com/Thach45/backend-e-learning/stargazers
[issues-shield]: https://img.shields.io/github/issues/Thach45/backend-e-learning.svg?style=for-the-badge
[issues-url]: https://github.com/Thach45/backend-e-learning/issues
[license-shield]: https://img.shields.io/github/license/Thach45/backend-e-learning.svg?style=for-the-badge
[license-url]: https://github.com/Thach45/backend-e-learning/blob/main/LICENSE
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript.ts]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[ReactQuery.com]: https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white
[ReactQuery-url]: https://tanstack.com/query/v5
[NestJS.com]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[NestJS-url]: https://nestjs.com/
[Prisma.io]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[Redis.io]: https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white
[Redis-url]: https://redis.io/
