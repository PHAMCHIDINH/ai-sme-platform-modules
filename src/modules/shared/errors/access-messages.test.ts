import { describe, expect, it } from "vitest";
import { ACCESS_MESSAGES } from "@/modules/shared";

describe("access-messages", () => {
  it("provides standardized page messages", () => {
    expect(ACCESS_MESSAGES.UNAUTHORIZED_PAGE).toBe("Bạn không có quyền truy cập trang này.");
    expect(ACCESS_MESSAGES.FORBIDDEN_PAGE).toBe("Bạn không có quyền truy cập dữ liệu này.");
  });

  it("provides standardized api messages", () => {
    expect(ACCESS_MESSAGES.UNAUTHORIZED_API).toBe("Bạn chưa đăng nhập.");
    expect(ACCESS_MESSAGES.DB_UNAVAILABLE).toContain("Không thể kết nối cơ sở dữ liệu");
    expect(ACCESS_MESSAGES.DB_SCHEMA_OUTDATED).toContain("Cấu trúc cơ sở dữ liệu chưa đồng bộ");
  });
});
