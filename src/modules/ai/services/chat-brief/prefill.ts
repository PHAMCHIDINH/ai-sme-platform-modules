import type { ProjectFormInput } from "@/modules/project";

type DirtyFields = Partial<Record<keyof ProjectFormInput, boolean | undefined>>;

type BuildProjectFormPrefillPatchParams = {
  parsedData: unknown;
  currentValues: ProjectFormInput;
  dirtyFields: DirtyFields;
};

const PROJECT_FORM_FIELDS: Array<keyof ProjectFormInput> = [
  "title",
  "description",
  "standardizedBrief",
  "expectedOutput",
  "requiredSkills",
  "difficulty",
  "duration",
  "budget",
];

const DIFFICULTY_SET = new Set<ProjectFormInput["difficulty"]>(["EASY", "MEDIUM", "HARD"]);

function normalizeFieldValue(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === "null") return "";
  return normalized;
}

export function buildProjectFormPrefillPatch(
  params: BuildProjectFormPrefillPatchParams,
): Partial<ProjectFormInput> {
  const parsedObject =
    typeof params.parsedData === "object" && params.parsedData !== null
      ? (params.parsedData as Record<string, unknown>)
      : {};

  const patch: Partial<ProjectFormInput> = {};

  for (const field of PROJECT_FORM_FIELDS) {
    if (params.dirtyFields[field]) {
      continue;
    }

    const normalized = normalizeFieldValue(parsedObject[field]);
    if (!normalized) {
      continue;
    }

    if (field === "difficulty") {
      if (DIFFICULTY_SET.has(normalized as ProjectFormInput["difficulty"])) {
        patch.difficulty = normalized as ProjectFormInput["difficulty"];
      }
      continue;
    }

    const currentValue = params.currentValues[field];
    if (typeof currentValue === "string" && currentValue.trim()) {
      continue;
    }

    patch[field] = normalized;
  }

  return patch;
}
