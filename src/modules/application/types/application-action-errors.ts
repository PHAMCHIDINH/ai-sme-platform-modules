export const APPLICATION_ACTION_ERROR_MESSAGES = {
  UNAUTHORIZED: "Bạn không có quyền thực hiện thao tác này.",
  STUDENT_PROFILE_NOT_FOUND: "Không tìm thấy hồ sơ sinh viên.",
  PROJECT_NOT_FOUND: "Dự án không tồn tại.",
  PROJECT_CLOSED: "Dự án đã đóng ứng tuyển.",
  ALREADY_APPLIED: "Bạn đã ứng tuyển dự án này rồi.",
  ALREADY_ACCEPTED: "Bạn đã được chấp nhận vào dự án này.",
  APPLICATION_ALREADY_REJECTED: "Hồ sơ ứng tuyển trước đó của bạn đã bị từ chối.",
  PROJECT_NOT_OWNED: "Bạn không sở hữu dự án này.",
  PROJECT_STATUS_LOCKED: "Dự án đã chốt ứng viên, không thể thay đổi trạng thái hồ sơ.",
  APPLICATION_NOT_FOUND: "Ứng viên chưa nộp hồ sơ cho dự án này.",
  CANDIDATE_ALREADY_ACCEPTED: "Ứng viên này đã được chấp nhận trước đó.",
  CANDIDATE_ALREADY_REJECTED: "Ứng viên này đã bị từ chối trước đó.",
  PROJECT_NOT_FOUND_OR_FORBIDDEN: "Dự án không tồn tại hoặc bạn không có quyền.",
  PROJECT_NOT_RECRUITING: "Dự án không còn tuyển người.",
  ALREADY_HAS_INTERACTION: "Đã có tương tác (đã mời / đã ứng tuyển) với sinh viên này.",
  INVITATION_NOT_FOUND: "Không tìm thấy lời mời hợp lệ.",
  PROJECT_ALREADY_ASSIGNED: "Dự án đã đóng hoặc đã có người nhận.",
  CONFLICT: "Yêu cầu của bạn bị xung đột với trạng thái hiện tại.",
  INTERNAL_ERROR: "Có lỗi xảy ra. Vui lòng thử lại.",
} as const;

export type ApplicationActionErrorCode = keyof typeof APPLICATION_ACTION_ERROR_MESSAGES;

export function applicationActionErrorMessage(code: ApplicationActionErrorCode) {
  return APPLICATION_ACTION_ERROR_MESSAGES[code];
}
