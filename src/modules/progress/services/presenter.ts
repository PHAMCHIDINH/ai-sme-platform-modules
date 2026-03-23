import { ProgressStatus } from "@prisma/client";

export function progressStatusLabel(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "Hoàn thành";
    case "SUBMITTED":
      return "Đã bàn giao";
    case "IN_PROGRESS":
      return "Đang thực hiện";
    default:
      return "Chưa bắt đầu";
  }
}

export function progressStatusClassName(status: ProgressStatus) {
  if (status === "COMPLETED") {
    return "border-green-500 text-green-600";
  }
  if (status === "SUBMITTED") {
    return "border-amber-500 text-amber-600";
  }
  return "border-blue-500 text-blue-600";
}

export function progressStatusBarClassName(status: ProgressStatus) {
  if (status === "COMPLETED") {
    return "bg-green-500";
  }
  if (status === "SUBMITTED") {
    return "bg-amber-500";
  }
  return "bg-blue-500";
}
