import { ProjectStatus } from "@prisma/client";

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

type StudentProjectApplication = {
  status: ApplicationStatus;
  initiatedBy: Initiator;
};

type StudentDiscoveryProjectRaw = {
  id: string;
  title: string;
  description?: string;
  standardizedBrief?: string | null;
  expectedOutput: string;
  requiredSkills: string[];
  duration: string;
  budget?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: ProjectStatus;
  embedding: number[];
  sme: {
    companyName: string;
    avatarUrl?: string | null;
    industry?: string;
    description?: string;
  } | null;
  applications: StudentProjectApplication[];
};

export function deriveStudentProjectInteractionState(input: {
  hasStudentProfile: boolean;
  projectStatus: ProjectStatus;
  application: StudentProjectApplication | null;
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
  raw: StudentDiscoveryProjectRaw,
  options: { hasStudentProfile: boolean; matchScore: number },
) {
  const application = raw.applications[0] ?? null;

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

export function presentStudentProjectDetail(
  raw: StudentDiscoveryProjectRaw,
  options: { hasStudentProfile: boolean; matchScore: number },
) {
  const summary = presentStudentProjectSummary(raw, options);

  return {
    ...summary,
    description: raw.description ?? "",
    standardizedBrief: raw.standardizedBrief ?? null,
    budget: raw.budget ?? null,
    difficulty: raw.difficulty ?? "MEDIUM",
    companyIndustry: raw.sme?.industry ?? "",
    companyDescription: raw.sme?.description ?? "",
  };
}
