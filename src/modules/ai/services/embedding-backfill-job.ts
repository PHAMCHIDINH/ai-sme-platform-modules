import { inngest } from "@/modules/shared";
import {
  EMBEDDING_BACKFILL_EVENT,
  backfillProjectEmbeddings,
  backfillStudentEmbeddings,
  normalizeBackfillLimit,
} from "./embedding-backfill";

export const embeddingBackfillJob = inngest.createFunction(
  {
    id: "embedding-backfill-job",
    retries: 1,
    triggers: [{ event: EMBEDDING_BACKFILL_EVENT }],
  },
  async ({ event, step }) => {
    const limit = normalizeBackfillLimit((event.data as { limit?: number } | undefined)?.limit);

    const studentUpdated = await step.run("backfill-student-embeddings", async () => {
      return backfillStudentEmbeddings(limit);
    });

    const projectUpdated = await step.run("backfill-project-embeddings", async () => {
      return backfillProjectEmbeddings(limit);
    });

    return {
      limit,
      studentUpdated,
      projectUpdated,
    };
  },
);
