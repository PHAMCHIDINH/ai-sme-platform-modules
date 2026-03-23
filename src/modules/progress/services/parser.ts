import { Prisma } from "@prisma/client";

export type MilestoneItem = {
  id: string;
  title: string;
  createdAt: string;
};

export type ProgressUpdateItem = {
  id: string;
  content: string;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseMilestones(value: Prisma.JsonValue): MilestoneItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (typeof item.id !== "string" || typeof item.title !== "string" || typeof item.createdAt !== "string") {
      return [];
    }

    return [
      {
        id: item.id,
        title: item.title,
        createdAt: item.createdAt,
      },
    ];
  });
}

export function parseProgressUpdates(value: Prisma.JsonValue): ProgressUpdateItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (typeof item.id !== "string" || typeof item.content !== "string" || typeof item.createdAt !== "string") {
      return [];
    }

    return [
      {
        id: item.id,
        content: item.content,
        createdAt: item.createdAt,
      },
    ];
  });
}

export function parseRating(value: FormDataEntryValue | null): number | null {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }
  return rating;
}
