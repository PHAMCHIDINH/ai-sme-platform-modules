import { Inngest } from "inngest";

const INNGEST_APP_ID = "ai-sme-platform";

export const inngest = new Inngest({
  id: INNGEST_APP_ID,
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export function isInngestEnabled() {
  return Boolean(process.env.INNGEST_EVENT_KEY?.trim());
}
