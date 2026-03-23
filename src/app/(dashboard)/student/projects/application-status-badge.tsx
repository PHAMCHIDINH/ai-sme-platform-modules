"use client";

import { StudentProjectInteractionState } from "@/modules/project";
import { Badge } from "@/modules/shared/ui";

const LABELS: Record<StudentProjectInteractionState, string> = {
  READY_TO_APPLY: "Có thể ứng tuyển",
  PROFILE_REQUIRED: "Cần cập nhật hồ sơ",
  PENDING: "Đang chờ SME phản hồi",
  INVITED: "Đã được SME mời",
  ACCEPTED: "Đã được nhận",
  REJECTED: "Đã bị từ chối",
  PROJECT_CLOSED: "Dự án không còn mở",
};

const CLASS_NAMES: Record<StudentProjectInteractionState, string> = {
  READY_TO_APPLY: "bg-lime-200",
  PROFILE_REQUIRED: "bg-yellow-200",
  PENDING: "bg-cyan-200",
  INVITED: "bg-orange-200",
  ACCEPTED: "bg-emerald-200",
  REJECTED: "bg-red-200",
  PROJECT_CLOSED: "bg-gray-200",
};

export function ApplicationStatusBadge({
  state,
  className = "",
}: {
  state: StudentProjectInteractionState;
  className?: string;
}) {
  return (
    <Badge className={`${CLASS_NAMES[state]} ${className}`.trim()} variant="outline">
      {LABELS[state]}
    </Badge>
  );
}
