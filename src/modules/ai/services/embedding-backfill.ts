import { generateEmbedding } from "./openai";
import { prisma } from "@/modules/shared";

const DEFAULT_BACKFILL_LIMIT = 50;
const MIN_BACKFILL_LIMIT = 1;
const MAX_BACKFILL_LIMIT = 200;

export const EMBEDDING_BACKFILL_EVENT = "ai/embedding.backfill.requested";

type StudentEmbeddingInput = {
  major: string;
  skills: string[];
  technologies: string[];
  interests: string[];
  description: string;
};

type ProjectEmbeddingInput = {
  title: string;
  description: string;
  standardizedBrief: string | null;
  expectedOutput: string;
  requiredSkills: string[];
  difficulty: string;
  duration: string;
};

function compactLines(values: Array<string | null | undefined>) {
  return values
    .map((value) => value?.trim() ?? "")
    .filter(Boolean)
    .join("\n");
}

export function normalizeBackfillLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_BACKFILL_LIMIT;
  }

  const safe = Math.trunc(limit as number);
  if (safe < MIN_BACKFILL_LIMIT) return MIN_BACKFILL_LIMIT;
  if (safe > MAX_BACKFILL_LIMIT) return MAX_BACKFILL_LIMIT;
  return safe;
}

export function buildStudentEmbeddingInput(input: StudentEmbeddingInput) {
  return compactLines([
    input.major,
    input.skills.join(", "),
    input.technologies.join(", "),
    input.interests.join(", "),
    input.description,
  ]);
}

export function buildProjectEmbeddingInput(input: ProjectEmbeddingInput) {
  return compactLines([
    input.title,
    input.description,
    input.standardizedBrief,
    input.expectedOutput,
    input.requiredSkills.join(", "),
    input.difficulty,
    input.duration,
  ]);
}

export async function backfillStudentEmbeddings(limit: number) {
  const students = await prisma.studentProfile.findMany({
    where: {
      embedding: {
        equals: [],
      },
    },
    take: limit,
    select: {
      id: true,
      major: true,
      skills: true,
      technologies: true,
      interests: true,
      description: true,
    },
  });

  let updated = 0;

  for (const student of students) {
    const input = buildStudentEmbeddingInput(student);
    const embedding = await generateEmbedding(input);

    if (embedding.length > 0) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { embedding },
      });
      updated += 1;
    }
  }

  return updated;
}

export async function backfillProjectEmbeddings(limit: number) {
  const projects = await prisma.project.findMany({
    where: {
      embedding: {
        equals: [],
      },
    },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      difficulty: true,
      duration: true,
    },
  });

  let updated = 0;

  for (const project of projects) {
    const input = buildProjectEmbeddingInput({
      ...project,
      difficulty: project.difficulty,
    });

    const embedding = await generateEmbedding(input);

    if (embedding.length > 0) {
      await prisma.project.update({
        where: { id: project.id },
        data: { embedding },
      });
      updated += 1;
    }
  }

  return updated;
}
