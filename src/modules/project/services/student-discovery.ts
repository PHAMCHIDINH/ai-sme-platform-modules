import { ProjectStatus } from "@prisma/client";

type ApplicationStatus = "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
type Initiator = "SME" | "STUDENT";

type StudentProjectApplication = {
  status: ApplicationStatus;
  initiatedBy: Initiator;
};

export type StudentDiscoveryProjectRaw = {
  id: string;
  title: string;
  description: string;
  standardizedBrief: string | null;
  expectedOutput: string;
  requiredSkills: string[];
  duration: string;
  budget: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: ProjectStatus;
  deadline: Date | null;
  createdAt: Date;
  embedding: number[];
  sme: {
    companyName: string;
    avatarUrl: string | null;
    industry: string;
    description: string;
  };
  applications: StudentProjectApplication[];
  _count: {
    applications: number;
  };
};

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
    companyName: raw.sme.companyName,
    companyAvatarUrl: raw.sme.avatarUrl ?? "",
    matchScore: options.matchScore,
    interactionState: deriveStudentProjectInteractionState({
      hasStudentProfile: options.hasStudentProfile,
      projectStatus: raw.status,
      application,
    }),
  };
}
