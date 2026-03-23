import { ProjectStatus } from "@prisma/client";

export function projectStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "OPEN":
      return "Đang mở";
    case "IN_PROGRESS":
      return "Đang tiến hành";
    case "SUBMITTED":
      return "Chờ nghiệm thu";
    case "COMPLETED":
      return "Hoàn thành";
    default:
      return "Nháp";
  }
}

export function projectStatusClassName(status: ProjectStatus) {
  if (status === "OPEN") return "border-indigo-500 text-indigo-600";
  if (status === "IN_PROGRESS") return "border-blue-500 text-blue-600";
  if (status === "SUBMITTED") return "border-amber-500 text-amber-600";
  if (status === "COMPLETED") return "border-green-500 text-green-600";
  return "border-gray-400 text-gray-500";
}
