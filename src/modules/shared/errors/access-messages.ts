export const ACCESS_MESSAGES = {
  UNAUTHORIZED_API: "Bạn chưa đăng nhập.",
  UNAUTHORIZED_PAGE: "Bạn không có quyền truy cập trang này.",
  FORBIDDEN_PAGE: "Bạn không có quyền truy cập dữ liệu này.",
  DB_UNAVAILABLE: "Không thể kết nối cơ sở dữ liệu. Vui lòng kiểm tra cấu hình DATABASE_URL.",
  DB_SCHEMA_OUTDATED:
    "Cấu trúc cơ sở dữ liệu chưa đồng bộ. Vui lòng chạy migrate để cập nhật schema.",
} as const;
