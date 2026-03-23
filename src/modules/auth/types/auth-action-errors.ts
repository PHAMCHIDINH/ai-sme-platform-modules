export const AUTH_ACTION_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Thông tin đăng nhập không hợp lệ.",
  LOGIN_FAILED: "Có lỗi xảy ra khi đăng nhập.",
  REGISTER_INVALID_INPUT: "Dữ liệu đăng ký không hợp lệ.",
  EMAIL_EXISTS: "Email này đã được sử dụng.",
  REGISTER_FAILED: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.",
} as const;

export type AuthActionErrorCode = keyof typeof AUTH_ACTION_ERROR_MESSAGES;

export function authActionErrorMessage(code: AuthActionErrorCode) {
  return AUTH_ACTION_ERROR_MESSAGES[code];
}
