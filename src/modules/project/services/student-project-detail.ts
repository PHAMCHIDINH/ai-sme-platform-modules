import { ProjectStatus } from "@prisma/client";
import { deriveStudentProjectInteractionState, type StudentProjectInteractionState } from "./student-discovery";

type ApplicationStatus = "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
type Initiator = "SME" | "STUDENT";

type StudentProjectApplication = {
  status: ApplicationStatus;
  initiatedBy: Initiator;
};

export type StudentProjectDetailRaw = {
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
  deadline: Date | null;
  createdAt: Date;
  embedding: number[];
  sme: {
    companyName: string;
    avatarUrl?: string | null;
    industry?: string;
    description?: string;
  } | null;
  applications: StudentProjectApplication[] | false;
  _count: {
    applications: number;
  };
};

export type StudentProjectDetail = {
  id: string;
  title: string;
  expectedOutput: string;
  requiredSkills: string[];
  duration: string;
  companyName: string;
  companyAvatarUrl: string;
  matchScore: number;
  interactionState: StudentProjectInteractionState;
  description: string;
  standardizedBrief: string | null;
  budget: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  companyIndustry: string;
  companyDescription: string;
  deadline: Date | null;
  createdAt: Date;
  applicationCount: number;
};

export function presentStudentProjectDetail(
  raw: StudentProjectDetailRaw,
  options: { hasStudentProfile: boolean; matchScore: number },
): StudentProjectDetail {
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
    description: raw.description ?? "",
    standardizedBrief: raw.standardizedBrief ?? null,
    budget: raw.budget ?? null,
    difficulty: raw.difficulty ?? "MEDIUM",
    companyIndustry: raw.sme?.industry ?? "",
    companyDescription: raw.sme?.description ?? "",
    deadline: raw.deadline,
    createdAt: raw.createdAt,
    applicationCount: raw._count.applications,
  };
}
