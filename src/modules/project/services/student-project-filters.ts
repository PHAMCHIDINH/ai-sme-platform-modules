import type { StudentDiscoveryProjectRaw } from "./student-discovery";

export type StudentProjectSortOrder = "relevance" | "newest" | "oldest";
type StudentProjectDifficulty = "EASY" | "MEDIUM" | "HARD";
export type StudentProjectFilterParams = {
  q?: string | string[];
  difficulty?: string | string[];
  sort?: string | string[];
};

export type StudentProjectFilters = {
  q: string | null;
  difficulty: StudentProjectDifficulty | null;
  sort: StudentProjectSortOrder;
};

export type StudentDiscoveryProjectWithMatchScore = StudentDiscoveryProjectRaw & {
  matchScore: number;
};

const DIFFICULTIES = new Set<StudentProjectDifficulty>(["EASY", "MEDIUM", "HARD"]);
const SORT_ORDERS = new Set<StudentProjectSortOrder>(["relevance", "newest", "oldest"]);

function normalizeText(value: string | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized ? normalized : null;
}

function normalizeTextParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).find((item): item is string => Boolean(item)) ?? null;
  }

  return normalizeText(value);
}

function normalizeEnumParam<T extends string>(value: string | string[] | undefined, allowed: Set<T>): T | null {
  const values = Array.isArray(value) ? value : [value];
  for (const candidate of values) {
    const normalized = normalizeText(candidate);
    if (!normalized) continue;
    const uppercased = normalized.toUpperCase() as T;
    const lowercased = normalized.toLowerCase() as T;
    if (allowed.has(uppercased)) return uppercased;
    if (allowed.has(lowercased)) return lowercased;
  }

  return null;
}

export function normalizeStudentProjectFilters(searchParams: StudentProjectFilterParams): StudentProjectFilters {
  const q = normalizeTextParam(searchParams.q);

  const difficulty = normalizeEnumParam<StudentProjectDifficulty>(searchParams.difficulty, DIFFICULTIES);

  const sort = normalizeEnumParam<StudentProjectSortOrder>(searchParams.sort, SORT_ORDERS) ?? "relevance";

  return { q, difficulty, sort };
}

function normalizeSearchableValue(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function matchesSearch(project: StudentDiscoveryProjectWithMatchScore, query: string) {
  const searchTerms = [
    project.title,
    project.description,
    project.standardizedBrief,
    project.expectedOutput,
    project.duration,
    project.budget,
    project.sme.companyName,
    project.sme.industry,
    project.sme.description,
    ...project.requiredSkills,
  ].map(normalizeSearchableValue);

  return searchTerms.some((term) => term.includes(query));
}

function compareByRelevance(a: StudentDiscoveryProjectWithMatchScore, b: StudentDiscoveryProjectWithMatchScore) {
  if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
  if (b.createdAt.getTime() !== a.createdAt.getTime()) return b.createdAt.getTime() - a.createdAt.getTime();
  const titleComparison = a.title.localeCompare(b.title);
  if (titleComparison !== 0) return titleComparison;
  return a.id.localeCompare(b.id);
}

function compareByNewest(a: StudentDiscoveryProjectWithMatchScore, b: StudentDiscoveryProjectWithMatchScore) {
  if (b.createdAt.getTime() !== a.createdAt.getTime()) return b.createdAt.getTime() - a.createdAt.getTime();
  if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
  const titleComparison = a.title.localeCompare(b.title);
  if (titleComparison !== 0) return titleComparison;
  return a.id.localeCompare(b.id);
}

function compareByOldest(a: StudentDiscoveryProjectWithMatchScore, b: StudentDiscoveryProjectWithMatchScore) {
  if (a.createdAt.getTime() !== b.createdAt.getTime()) return a.createdAt.getTime() - b.createdAt.getTime();
  if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
  const titleComparison = a.title.localeCompare(b.title);
  if (titleComparison !== 0) return titleComparison;
  return a.id.localeCompare(b.id);
}

export function applyStudentProjectFilters(
  projects: StudentDiscoveryProjectWithMatchScore[],
  filters: StudentProjectFilters,
) {
  const query = filters.q?.toLowerCase();

  return projects
    .filter((project) => {
      if (filters.difficulty && project.difficulty !== filters.difficulty) return false;
      if (query && !matchesSearch(project, query)) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (filters.sort === "newest") return compareByNewest(a, b);
      if (filters.sort === "oldest") return compareByOldest(a, b);
      return compareByRelevance(a, b);
    });
}
