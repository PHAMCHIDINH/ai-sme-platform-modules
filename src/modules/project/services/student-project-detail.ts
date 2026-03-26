import { presentStudentProjectSummary, type StudentDiscoveryProjectRaw, type StudentProjectInteractionState } from "./student-discovery";

export type StudentProjectDetailRaw = StudentDiscoveryProjectRaw & {
  description: string;
  standardizedBrief: string | null;
  budget: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  deadline: Date | null;
  createdAt: Date;
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
  const summary = presentStudentProjectSummary(raw, options);

  return {
    ...summary,
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
