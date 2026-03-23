# Chat Brief Hybrid Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a hybrid chat-brief pipeline that prevents premature completion, improves extraction quality, adds browser-local draft restore, and keeps `/api/ai/chat-brief` backward-compatible.

**Architecture:** Keep AI as extractor, but move completion logic to deterministic modules (`slot-coverage`, `question-planner`, `completion-guard`). The API returns enriched metadata (`coverage`, `nextSlot`, `isReadyToSubmit`) and UI uses it to drive progress + local draft persistence. Implement strictly with @superpowers/test-driven-development and verify final claims with @superpowers/verification-before-completion.

**Tech Stack:** Next.js App Router, TypeScript, React Hook Form, React Query, Vitest

---

## File Structure Lock-In

### New files
- `src/modules/ai/services/chat-brief/slot-coverage.ts`
- `src/modules/ai/services/chat-brief/slot-coverage.test.ts`
- `src/modules/ai/services/chat-brief/question-planner.ts`
- `src/modules/ai/services/chat-brief/question-planner.test.ts`
- `src/modules/ai/services/chat-brief/completion-guard.ts`
- `src/modules/ai/services/chat-brief/completion-guard.test.ts`
- `src/app/(dashboard)/sme/projects/new/chat-draft-storage.ts`
- `src/app/(dashboard)/sme/projects/new/chat-draft-storage.test.ts`

### Modified files
- `src/modules/ai/services/chat-brief/types.ts`
- `src/modules/ai/services/chat-brief/response-normalizer.ts`
- `src/modules/ai/services/chat-brief/index.ts`
- `src/modules/ai/services/chat-brief/chat-brief.test.ts`
- `src/app/api/ai/chat-brief/route.ts`
- `src/app/(dashboard)/sme/projects/new/page.tsx`

---

### Task 0: Baseline and Safety Check

**Files:**
- Verify only (no code changes)

- [ ] **Step 1: Snapshot current chat-brief test baseline**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts src/modules/ai/services/chat-brief/prefill.test.ts
```
Expected: existing tests pass, creating pre-change reference.

- [ ] **Step 2: Snapshot current endpoint contract usage in UI**
Run:
```bash
rg -n "data\.message|data\.suggestions|data\.parsedData|chat-brief" src/app/'(dashboard)'/sme/projects/new/page.tsx src/app/api/ai/chat-brief/route.ts
```
Expected: exact usage points for backward-compatibility checks.

- [ ] **Step 3: Commit empty checkpoint**
Run:
```bash
git commit --allow-empty -m "chore: checkpoint before chat-brief hybrid optimization"
```

---

### Task 1: Add Core Slot/Coverage Types and Scorer

**Files:**
- Create: `src/modules/ai/services/chat-brief/slot-coverage.ts`
- Create: `src/modules/ai/services/chat-brief/slot-coverage.test.ts`
- Modify: `src/modules/ai/services/chat-brief/types.ts`
- Test: `src/modules/ai/services/chat-brief/slot-coverage.test.ts`

- [ ] **Step 1: Write failing coverage tests for required 4 slots**
Create `slot-coverage.test.ts` with cases:
```ts
it("marks all slots missing for empty parsedData", () => {
  expect(scoreCoverage(EMPTY_PARSED_DATA, [])).toEqual({
    businessContext: "missing",
    deliverableScope: "missing",
    requiredSkills: "missing",
    timelineBudget: "missing",
  });
});

it("marks timelineBudget partial when only duration exists", () => {
  const parsed = { ...EMPTY_PARSED_DATA, duration: "2-3 tuần" };
  expect(scoreCoverage(parsed, [])).toMatchObject({ timelineBudget: "partial" });
});

it("marks all complete when enough evidence is present", () => {
  const parsed = {
    ...EMPTY_PARSED_DATA,
    description: "Nhu cầu SME: bán lẻ mỹ phẩm cho nữ 22-30",
    expectedOutput: "Bộ content fanpage 12 bài/tháng",
    requiredSkills: "Content Marketing",
    duration: "4 tuần",
    budget: "3-5 triệu",
  };
  expect(isCoverageComplete(scoreCoverage(parsed, []))).toBe(true);
});
```

- [ ] **Step 2: Run scorer tests to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/slot-coverage.test.ts
```
Expected: FAIL due missing module/types.

- [ ] **Step 3: Add slot types to `types.ts`**
Add:
```ts
export type SlotKey = "businessContext" | "deliverableScope" | "requiredSkills" | "timelineBudget";
export type SlotState = "missing" | "partial" | "complete";
export type CoverageReport = Record<SlotKey, SlotState>;
```

- [ ] **Step 4: Implement minimal scorer in `slot-coverage.ts`**
Implement deterministic checks:
```ts
export function scoreCoverage(parsedData: ParsedData, userMessages: string[]): CoverageReport { /* minimal rule set */ }
export function isCoverageComplete(coverage: CoverageReport) { /* every slot === complete */ }
export function getNextSlot(coverage: CoverageReport): SlotKey | "completed" { /* ordered priority */ }
```

- [ ] **Step 5: Run scorer tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/slot-coverage.test.ts
```
Expected: PASS.

- [ ] **Step 6: Commit**
Run:
```bash
git add src/modules/ai/services/chat-brief/types.ts src/modules/ai/services/chat-brief/slot-coverage.ts src/modules/ai/services/chat-brief/slot-coverage.test.ts
git commit -m "feat(ai/chat-brief): add deterministic slot coverage scorer"
```

---

### Task 2: Add Deterministic Completion Guard

**Files:**
- Create: `src/modules/ai/services/chat-brief/completion-guard.ts`
- Create: `src/modules/ai/services/chat-brief/completion-guard.test.ts`
- Test: `src/modules/ai/services/chat-brief/completion-guard.test.ts`

- [ ] **Step 1: Write failing guard tests**
Create test cases:
```ts
it("blocks completion message when coverage is incomplete", () => {
  const guarded = guardCompletion({
    message: "Mình đã điền đủ thông tin, bạn đăng dự án nhé.",
    suggestions: [],
    coverage: { businessContext: "complete", deliverableScope: "complete", requiredSkills: "complete", timelineBudget: "partial" },
  });
  expect(guarded.isReadyToSubmit).toBe(false);
  expect(guarded.message).not.toContain("điền đủ");
});

it("allows completion message only when all slots complete", () => {
  const guarded = guardCompletion({
    message: "Mình đã điền đủ thông tin form bên cạnh.",
    suggestions: [],
    coverage: { businessContext: "complete", deliverableScope: "complete", requiredSkills: "complete", timelineBudget: "complete" },
  });
  expect(guarded.isReadyToSubmit).toBe(true);
});
```

- [ ] **Step 2: Run guard tests to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/completion-guard.test.ts
```
Expected: FAIL (module missing).

- [ ] **Step 3: Implement minimal `guardCompletion`**
Implement:
```ts
export function guardCompletion(input: GuardInput): GuardOutput {
  const isReadyToSubmit = isCoverageComplete(input.coverage);
  if (!isReadyToSubmit && looksLikeCompletion(input.message)) {
    return { ...input, isReadyToSubmit, message: "Mình cần chốt thêm vài ý để bài toán rõ và dễ tuyển đúng sinh viên." };
  }
  return { ...input, isReadyToSubmit };
}
```

- [ ] **Step 4: Run guard tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/completion-guard.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/modules/ai/services/chat-brief/completion-guard.ts src/modules/ai/services/chat-brief/completion-guard.test.ts
git commit -m "feat(ai/chat-brief): add deterministic completion guard"
```

---

### Task 3: Add Question Planner With Timeline/Budget Suggestions

**Files:**
- Create: `src/modules/ai/services/chat-brief/question-planner.ts`
- Create: `src/modules/ai/services/chat-brief/question-planner.test.ts`
- Test: `src/modules/ai/services/chat-brief/question-planner.test.ts`

- [ ] **Step 1: Write failing planner tests for slot-based prompting**
Add tests:
```ts
it("asks business context first when missing", () => {
  const plan = planNextQuestion({
    coverage: { businessContext: "missing", deliverableScope: "missing", requiredSkills: "missing", timelineBudget: "missing" },
    profileLabel: "dự án marketing số",
  });
  expect(plan.nextSlot).toBe("businessContext");
  expect(plan.message).toContain("mục tiêu");
});

it("returns timeline/budget quick-pick suggestions when timelineBudget incomplete", () => {
  const plan = planNextQuestion({
    coverage: { businessContext: "complete", deliverableScope: "complete", requiredSkills: "complete", timelineBudget: "partial" },
    profileLabel: "website bán hàng",
  });
  expect(plan.nextSlot).toBe("timelineBudget");
  expect(plan.suggestions.length).toBeGreaterThanOrEqual(3);
});
```

- [ ] **Step 2: Run planner tests to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/question-planner.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement minimal planner logic**
Implement ordered slot planner:
```ts
export function planNextQuestion(input: PlannerInput): PlannerOutput {
  // pick next incomplete slot
  // generate concise VN message
  // provide 3-4 suggestions (especially timeline/budget)
}
```

- [ ] **Step 4: Run planner tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/question-planner.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/modules/ai/services/chat-brief/question-planner.ts src/modules/ai/services/chat-brief/question-planner.test.ts
git commit -m "feat(ai/chat-brief): add deterministic question planner"
```

---

### Task 4: Integrate Scorer/Planner/Guard Into Normalization Pipeline

**Files:**
- Modify: `src/modules/ai/services/chat-brief/response-normalizer.ts`
- Modify: `src/modules/ai/services/chat-brief/index.ts`
- Modify: `src/modules/ai/services/chat-brief/types.ts`
- Modify: `src/modules/ai/services/chat-brief/chat-brief.test.ts`
- Test: `src/modules/ai/services/chat-brief/chat-brief.test.ts`

- [ ] **Step 1: Write failing integration tests (no premature completion)**
Extend tests:
```ts
it("does not set ready state when timelineBudget is incomplete", () => {
  const messages = [{ role: "user", content: "Làm content fanpage cho shop mỹ phẩm" }];
  const result = normalizeResponse({}, messages);
  expect(result.isReadyToSubmit).toBe(false);
  expect(result.nextSlot).not.toBe("completed");
});

it("sets ready state only when all required groups are complete", () => {
  const payload = {
    parsedData: {
      title: "Content fanpage mỹ phẩm",
      description: "Nhu cầu SME: tăng chuyển đổi nhóm khách nữ 22-30",
      expectedOutput: "12 bài fanpage/tháng",
      requiredSkills: "Content Marketing",
      duration: "4 tuần",
      budget: "3-5 triệu",
    },
  };
  const result = normalizeResponse(payload, [{ role: "user", content: "..." }]);
  expect(result.isReadyToSubmit).toBe(true);
  expect(result.nextSlot).toBe("completed");
});
```

- [ ] **Step 2: Run integration test to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts
```
Expected: FAIL due missing response fields/logic.

- [ ] **Step 3: Implement minimal pipeline wiring**
In `response-normalizer.ts`:
- compute coverage via `scoreCoverage`
- determine `nextSlot` via `getNextSlot`
- generate prompt/suggestions via `planNextQuestion`
- enforce final message via `guardCompletion`

In `index.ts`:
- export updated response type and normalizer result shape.

- [ ] **Step 4: Run integration tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts src/modules/ai/services/chat-brief/slot-coverage.test.ts src/modules/ai/services/chat-brief/question-planner.test.ts src/modules/ai/services/chat-brief/completion-guard.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/modules/ai/services/chat-brief/types.ts src/modules/ai/services/chat-brief/response-normalizer.ts src/modules/ai/services/chat-brief/index.ts src/modules/ai/services/chat-brief/chat-brief.test.ts
git commit -m "feat(ai/chat-brief): integrate coverage planner and completion guard"
```

---

### Task 5: Extend API Response Contract (Backward-Compatible)

**Files:**
- Modify: `src/app/api/ai/chat-brief/route.ts`
- Test: `src/modules/ai/services/chat-brief/chat-brief.test.ts` (contract-level assertions)

- [ ] **Step 1: Write failing contract assertion for new fields**
Add assertions in tests to check shape includes:
```ts
expect(result).toHaveProperty("coverage");
expect(result).toHaveProperty("nextSlot");
expect(result).toHaveProperty("isReadyToSubmit");
```

- [ ] **Step 2: Run tests to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts
```
Expected: FAIL if response shape not yet propagated.

- [ ] **Step 3: Update API route to return enriched response**
Ensure both online and offline paths return:
- `message`
- `suggestions`
- `parsedData`
- `coverage`
- `nextSlot`
- `isReadyToSubmit`

- [ ] **Step 4: Run targeted tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts src/modules/ai/services/chat-brief/prefill.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/app/api/ai/chat-brief/route.ts src/modules/ai/services/chat-brief/chat-brief.test.ts
git commit -m "feat(api): return chat-brief coverage and readiness metadata"
```

---

### Task 6: Add Browser-Local Draft Storage Utilities

**Files:**
- Create: `src/app/(dashboard)/sme/projects/new/chat-draft-storage.ts`
- Create: `src/app/(dashboard)/sme/projects/new/chat-draft-storage.test.ts`
- Test: `src/app/(dashboard)/sme/projects/new/chat-draft-storage.test.ts`

- [ ] **Step 1: Write failing draft storage tests**
Create tests for:
```ts
it("serializes and restores draft with schemaVersion", () => {
  const draft = { schemaVersion: 1, messages: [], parsedData: null, coverage: null, updatedAt: Date.now() };
  saveChatDraft("user-1", draft);
  expect(loadChatDraft("user-1")?.schemaVersion).toBe(1);
});

it("returns null when payload is invalid JSON", () => {
  localStorage.setItem("vnsme.chatBriefDraft.v1.user-1", "{");
  expect(loadChatDraft("user-1")).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify RED**
Run:
```bash
npm test -- src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
```
Expected: FAIL (file missing).

- [ ] **Step 3: Implement storage helpers**
Implement functions:
```ts
export function draftStorageKey(userId: string): string;
export function saveChatDraft(userId: string, draft: ChatDraft): void;
export function loadChatDraft(userId: string): ChatDraft | null;
export function clearChatDraft(userId: string): void;
```

- [ ] **Step 4: Run tests to verify GREEN**
Run:
```bash
npm test -- src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.ts src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
git commit -m "feat(ui/chat): add browser-local draft persistence utilities"
```

---

### Task 7: Wire UI Progress, Rehydrate, and Reset Behavior

**Files:**
- Modify: `src/app/(dashboard)/sme/projects/new/page.tsx`
- Test: `src/app/(dashboard)/sme/projects/new/chat-draft-storage.test.ts` + existing chat-brief tests

- [ ] **Step 1: Write failing UI behavior tests or helper-level assertions**
If component tests are unavailable, add pure helper assertions in draft-storage test for migration and clear flows.

- [ ] **Step 2: Run tests to verify RED**
Run:
```bash
npm test -- src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
```
Expected: at least one failing behavior assertion for new UI logic.

- [ ] **Step 3: Implement UI wiring in `page.tsx`**
Implement:
- Restore draft on mount (same browser profile)
- Save after each successful assistant response and user send
- Render progress indicator `n/4 nhóm đã đủ`
- Render reset chat action (clear state + clear storage)
- Respect `isReadyToSubmit` from API for completion wording

- [ ] **Step 4: Run targeted tests to verify GREEN**
Run:
```bash
npm test -- src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts src/modules/ai/services/chat-brief/chat-brief.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/app/'(dashboard)'/sme/projects/new/page.tsx src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.ts src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
git commit -m "feat(ui/chat): add coverage progress and draft restore in new project flow"
```

---

### Task 8: Performance Guardrail (History Window + Request Hygiene)

**Files:**
- Modify: `src/app/(dashboard)/sme/projects/new/page.tsx`
- Modify: `src/app/api/ai/chat-brief/route.ts`
- Test: `src/modules/ai/services/chat-brief/chat-brief.test.ts`

- [ ] **Step 1: Write failing test for bounded message history adapter**
Add helper and tests ensuring only recent turns are sent (for example max 16).

- [ ] **Step 2: Run tests to verify RED**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts
```
Expected: FAIL before adapter implementation.

- [ ] **Step 3: Implement bounded-history helper and apply before fetch**
Example helper:
```ts
function toOutboundHistory(messages: Message[], maxTurns = 16) {
  return messages.slice(-maxTurns).map(({ role, content }) => ({ role, content }));
}
```
Also keep `chatMutation.isPending` guard for double-send.

- [ ] **Step 4: Run targeted tests to verify GREEN**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief/chat-brief.test.ts src/modules/ai/services/chat-brief/prefill.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add src/app/'(dashboard)'/sme/projects/new/page.tsx src/app/api/ai/chat-brief/route.ts src/modules/ai/services/chat-brief/chat-brief.test.ts
git commit -m "perf(chat-brief): bound outbound history and preserve deterministic flow"
```

---

### Task 9: Final Verification Gate

**Files:**
- Verify only

- [ ] **Step 1: Run all chat-focused tests**
Run:
```bash
npm test -- src/modules/ai/services/chat-brief src/app/'(dashboard)'/sme/projects/new/chat-draft-storage.test.ts
```
Expected: all pass.

- [ ] **Step 2: Run global quality gates**
Run:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
Expected: commands pass or failures documented with exact logs.

- [ ] **Step 3: Validate acceptance criteria manually**
Checklist:
- Incomplete slots never produce completion message.
- Missing timeline/budget returns quick-pick suggestions.
- Refresh restores local draft.
- API still returns legacy fields used by UI.

- [ ] **Step 4: Commit verification checkpoint**
Run:
```bash
git commit --allow-empty -m "chore: verification checkpoint for chat-brief hybrid rollout"
```

---

## Plan Review Notes

- If `vitest` environment is missing `localStorage`, add minimal test setup mock only for `chat-draft-storage.test.ts`.
- Keep refactors scoped to listed files; avoid unrelated cleanup while this plan is in progress.
- If any step requires broader architecture changes, stop and update spec before implementation.
