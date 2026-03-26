"use client";

import { StudentProjectInteractionState } from "@/modules/project";
import { Badge } from "@/modules/shared/ui";

const LABELS: Record<StudentProjectInteractionState, string> = {
  READY_TO_APPLY: "Có thể ứng tuyển",
  PROFILE_REQUIRED: "Cần hồ sơ hoàn chỉnh",
  PENDING: "Đang chờ phản hồi",
  INVITED: "SME đã mời bạn",
  ACCEPTED: "Đã được nhận",
  REJECTED: "Không được chọn",
  PROJECT_CLOSED: "Không còn mở tuyển",
};

const CLASS_NAMES: Record<StudentProjectInteractionState, string> = {
  READY_TO_APPLY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROFILE_REQUIRED: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-sky-50 text-sky-700 border-sky-200",
  INVITED: "bg-violet-50 text-violet-700 border-violet-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  PROJECT_CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

export function ApplicationStatusBadge({
  state,
  className = "",
}: {
  state: StudentProjectInteractionState;
  className?: string;
}) {
  return (
    <Badge className={`rounded-full border text-xs font-medium ${CLASS_NAMES[state]} ${className}`.trim()} variant="outline">
      {LABELS[state]}
    </Badge>
  );
}
