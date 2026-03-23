# Mô tả từng page và chức năng

## 1) Danh sách page giao diện

| Route | Quyền truy cập | Mô tả page | Chức năng chính |
|---|---|---|---|
| `/` | Public (đã đăng nhập sẽ tự chuyển trang) | Landing page giới thiệu nền tảng AI Matching Platform. | Hiển thị giá trị cốt lõi, CTA `Tạo tài khoản`/`Đăng nhập`; tự `redirect` sang `/sme/dashboard` hoặc `/student/dashboard` nếu đã có session. |
| `/login` | Public | Trang đăng nhập bằng email/mật khẩu. | Gọi `signIn(credentials)`; hiển thị lỗi khi sai thông tin; sau đăng nhập đọc session và điều hướng theo role (`SME` hoặc `STUDENT`). |
| `/register` | Public | Trang đăng ký tài khoản mới. | Nhập `name/email/password/role`; submit qua server action `registerAction`; tạo user + profile mặc định theo role rồi chuyển tới login. |
| `/student/dashboard` | Student | Dashboard tổng quan của sinh viên. | Thống kê số dự án đang tham gia, số dự án hoàn thành, điểm đánh giá trung bình từ SME. |
| `/student/profile` | Student | Trang hồ sơ năng lực sinh viên. | Tải/lưu profile qua API; cập nhật trường học, kỹ năng, công nghệ, mô tả, link GitHub/Portfolio, availability, interests; hiển thị thành tích thực chiến. |
| `/student/projects` | Student | Trang dự án gợi ý cho sinh viên. | Lấy danh sách dự án đang mở và các dự án đã có tương tác của sinh viên, xếp hạng bằng AI similarity (`rankBySimilarity`), hiển thị match score và trạng thái ứng tuyển; cho phép đi tới trang chi tiết hoặc ứng tuyển trực tiếp khi hợp lệ. |
| `/student/projects/[id]` | Student | Trang chi tiết 1 dự án phía sinh viên. | Xem mô tả bài toán, brief chuẩn hóa, kỹ năng yêu cầu, ngân sách, thời lượng, độ khó, thông tin doanh nghiệp và trạng thái hiện tại trước khi quyết định ứng tuyển. |
| `/student/my-projects` | Student | Trang quản lý dự án đã được nhận. | Xem dự án accepted; thêm milestone; thêm cập nhật tiến độ; nộp link bàn giao (đổi status `SUBMITTED`); đánh giá SME khi dự án hoàn thành. |
| `/sme/dashboard` | SME | Dashboard tổng quan doanh nghiệp. | Thống kê tổng dự án, dự án đang mở, tổng hồ sơ ứng viên; điều hướng nhanh tới trang tạo dự án mới. |
| `/sme/projects` | SME | Danh sách dự án của SME. | Hiển thị trạng thái từng dự án, số ứng viên, deadline, độ khó; đi tới chi tiết dự án hoặc danh sách ứng viên. |
| `/sme/projects/new` | SME | Trang tạo dự án mới. | Form tạo project; chuẩn hóa brief bằng AI (`/api/ai/standardize-brief`); validate dữ liệu; submit tạo project qua `/api/projects`. |
| `/sme/projects/[id]` | SME | Trang chi tiết 1 dự án. | Xem mô tả + brief chuẩn hóa + thông tin dự án; xem ứng viên và tiến độ (milestone/update); mở link bàn giao; chấp nhận bàn giao để chuyển `COMPLETED`; đi tới trang đánh giá. |
| `/sme/projects/[id]/candidates` | SME | Trang ứng viên đề xuất cho dự án. | AI matching sinh viên theo embedding; SME chấp nhận/từ chối ứng viên; khi chấp nhận thì chuyển project `IN_PROGRESS` và tạo/cập nhật `projectProgress`. |
| `/sme/projects/[id]/evaluate` | SME | Trang đánh giá sinh viên sau dự án. | Khi dự án `COMPLETED`, SME gửi đánh giá nhiều tiêu chí + nhận xét; lưu lịch sử đánh giá đã gửi. |

## 2) Chức năng hệ thống ảnh hưởng trực tiếp đến các page

| Thành phần | Vai trò |
|---|---|
| `app/(dashboard)/layout.tsx` | Bọc toàn bộ trang dashboard, bắt buộc có session, hiển thị shell/sidebar theo role. |
| `middleware.ts` | Bảo vệ route `/sme/*` và `/student/*`: chưa login thì về `/login`; sai role thì chuyển sang dashboard đúng role. |
| `components/layout/sidebar.tsx` | Điều hướng menu theo role (`SME` và `STUDENT`) cho các page dashboard. |

## 3) API route đang phục vụ các page

| API route | Dùng bởi page | Chức năng |
|---|---|---|
| `POST /api/ai/standardize-brief` | `/sme/projects/new` | Chuẩn hóa mô tả bài toán bằng AI. |
| `POST /api/projects` | `/sme/projects/new` | Tạo project mới cho SME, đồng thời tạo embedding cho matching. |
| `GET /api/projects` | (có thể dùng cho dashboard/khác) | Trả danh sách project theo role: SME nhận project của mình, student nhận project `OPEN`. |
| `GET /api/student-profile` | `/student/profile` | Lấy hồ sơ sinh viên + thống kê thành tích + rating. |
| `POST /api/student-profile` | `/student/profile` | Lưu/cập nhật hồ sơ sinh viên và tạo embedding kỹ năng. |
| `POST /api/matching` | `/sme/projects/[id]/candidates` (logic matching) | Trả top ứng viên phù hợp theo embedding similarity; chỉ SME sở hữu project mới được gọi. |
| `POST /api/ai/generate-embedding` | Internal/utility | Tạo embedding từ text đầu vào. |
| `GET/POST /api/auth/[...nextauth]` | `/login`, toàn hệ thống auth | Endpoint auth của NextAuth (session/sign-in/sign-out/callback). |

## 4) Server actions theo từng page

| Page | Server action | Chức năng |
|---|---|---|
| `/register` | `registerAction` | Tạo user mới, hash mật khẩu, tạo profile mặc định theo role. |
| `/student/projects` | `applyProject` | Ứng tuyển dự án (upsert application, status `PENDING`). |
| `/student/my-projects` | `addMilestone` | Thêm milestone vào tiến độ dự án. |
| `/student/my-projects` | `addProgressUpdate` | Thêm cập nhật tiến độ ngắn. |
| `/student/my-projects` | `submitDeliverable` | Nộp link bàn giao và chuyển trạng thái `SUBMITTED`. |
| `/student/my-projects` | `submitSmeEvaluation` | Sinh viên đánh giá SME sau khi dự án completed. |
| `/sme/projects/[id]` | `markAsCompleted` | Chấp nhận bàn giao, chuyển project/progress sang `COMPLETED`. |
| `/sme/projects/[id]/candidates` | `updateCandidateStatus` | SME chấp nhận/từ chối ứng viên; khi accepted thì khởi tạo tiến độ dự án. |
| `/sme/projects/[id]/evaluate` | `submitEvaluation` | SME đánh giá sinh viên theo nhiều tiêu chí và nhận xét. |
