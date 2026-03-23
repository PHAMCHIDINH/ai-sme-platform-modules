# Hướng Dẫn Deploy Kèm Mẫu Dữ Liệu (Seed Data)

Ứng dụng này đã được cấu hình sẵn một bộ dữ liệu mẫu khổng lồ bao gồm: Sinh viên, Doanh nghiệp SME, và các Dự án ở đầy đủ các trạng thái (OPEN, IN_PROGRESS, COMPLETED...). 

Dưới đây là cách để deploy ứng dụng lên các nền tảng phổ biến và tự động nạp dữ liệu mẫu này.

## 1. Deploy lên Vercel (Khuyên dùng)
Vercel là nền tảng tối ưu nhất cho Next.js.

- **Bước 1:** Đẩy code lên GitHub.
- **Bước 2:** Vào Vercel, chọn Import Project từ GitHub.
- **Bước 3:** Ở phần **Build and Output Settings**, ghi đè **Build Command** thành lệnh sau:
  ```bash
  npm run vercel-build
  ```
  *(Lệnh này sẽ tự động push schema DB, generate Prisma client, nạp dữ liệu mẫu bằng seed.ts, và cuối cùng là build app).*
- **Bước 4:** Ở phần **Environment Variables**, điền các biến môi trường cần thiết:
  - `DATABASE_URL` (URL của database Postgres, ví dụ lấy từ Supabase hoặc Neon.tech)
  - `AUTH_SECRET` (Mã bí mật cho NextAuth, sinh bằng lệnh `openssl rand -base64 32`)
  - `OPENAI_API_KEY` (Key của OpenAI nếu có)
- **Bước 5:** Bấm **Deploy**. 
Sau khi deploy xong, database của bạn sẽ có sẵn toàn bộ dữ liệu mẫu. Tài khoản mặc định các user là email của họ và password: `password123`.

## 2. Deploy bằng Docker (VPS / Baremetsal)
Nếu có máy chủ riêng (VPS) hoặc chạy ở máy tính cá nhân qua Docker.

- Cấu hình file `.env.docker` với các biến tương tự hoặc dùng mặc định.
- Chạy lệnh sau để khởi động container và tự tạo database cục bộ:
  ```bash
  npm run docker:up
  ```
- Sau khi container `app` và `db` đã chạy, nạp dữ liệu mẫu bằng cách chạy lệnh thủ công vào thẳng container:
  ```bash
  docker exec -it ai-sme-app npm run db:push
  docker exec -it ai-sme-app npm run db:seed
  ```
- Truy cập `http://localhost:3000` để trải nghiệm web với dữ liệu mẫu.

> **⚠️ LƯU Ý QUAN TRỌNG:** Lệnh seed (`npm run db:seed`) chứa hàm `deleteMany()`. Nó sẽ **XÓA SẠCH** dữ liệu cũ trước khi nạp dữ liệu mẫu. Chỉ nên dùng cho môi trường Demo / Portfolio. Không dùng cho môi trường Production thực tế có chứa dữ liệu thật.
