import { ProjectStatus } from "@prisma/client";
import type { StudentProjectDetailRaw } from "./student-project-detail";

type ApplicationStatus = "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
type Initiator = "SME" | "STUDENT";

export type StudentProjectInteractionState =
  | "READY_TO_APPLY"
  | "PROFILE_REQUIRED"
  | "PENDING"
  | "INVITED"
  | "ACCEPTED"
  | "REJECTED"
  | "PROJECT_CLOSED";

export function deriveStudentProjectInteractionState(input: {
  hasStudentProfile: boolean;
  projectStatus: ProjectStatus;
  application: {
    status: ApplicationStatus;
    initiatedBy: Initiator;
  } | null;
}): StudentProjectInteractionState {
  if (!input.hasStudentProfile) {
    return "PROFILE_REQUIRED";
  }

  if (!input.application) {
    return input.projectStatus === "OPEN" ? "READY_TO_APPLY" : "PROJECT_CLOSED";
  }

  return input.application.status;
}

export function presentStudentProjectSummary(
  raw: StudentProjectDetailRaw,
  options: { hasStudentProfile: boolean; matchScore: number },
) {
  const application = Array.isArray(raw.applications) ? raw.applications[0] ?? null : null;

  return {
    id: raw.id,
    title: raw.title,
    expectedOutput: raw.expectedOutput,
    requiredSkills: raw.requiredSkills,
    duration: raw.duration,
    companyName: raw.sme?.companyName ?? "Doanh nghiệp SME",
    companyAvatarUrl: raw.sme?.avatarUrl ?? "",
    matchScore: options.matchScore,
    interactionState: deriveStudentProjectInteractionState({
      hasStudentProfile: options.hasStudentProfile,
      projectStatus: raw.status ?? "OPEN",
      application,
    }),
  };
}
