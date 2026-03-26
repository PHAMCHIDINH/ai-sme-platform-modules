import { serve } from "inngest/next";

import { embeddingBackfillJob } from "../../../modules/ai/services/embedding-backfill-job";
import { inngest } from "../../../modules/shared/services/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [embeddingBackfillJob],
});
