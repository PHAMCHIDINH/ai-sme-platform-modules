# Chat Brief Hybrid Optimization Design (`ai-sme-platform-modules`)

Date: 2026-03-21  
Status: Approved Draft for Planning  
Scope: Improve AI chat quality, extraction accuracy, UX flow, and response performance for SME project-brief assistant.

## 1. Context

Current chat behavior (`/api/ai/chat-brief` + `chat-brief` services + SME new project page) can conclude too early after minimal user input. This causes low-quality requirement clarification and premature "enough data" messaging.

Observed gap:
- Assistant may mark conversation as complete before collecting core business and delivery constraints.
- Completion logic is currently tied to a small subset of fields (`requiredSkills`, `expectedOutput`, `duration`) and does not enforce full requirement coverage.
- Draft state is not persisted on browser refresh.

## 2. Objectives

- Improve question quality and problem clarification depth.
- Increase accuracy and stability of form prefill (`title`, `expectedOutput`, `requiredSkills`, `duration`, `budget`, etc.).
- Improve chat UX by enforcing deterministic progress and reducing premature completion.
- Improve runtime resilience and perceived performance without changing endpoint path.

## 3. Non-Goals

- No redesign of the SME project creation screen visual style.
- No schema migration for persisted project entities in database.
- No server-side cross-device draft synchronization in this phase.
- No changes to `POST /api/projects` contract.

## 4. Required Information Coverage Model

The assistant must collect and validate 4 mandatory groups for every project category.

- `businessContext` (required)
- `deliverableScope` (required)
- `requiredSkills` (required)
- `timelineBudget` (required)

### 4.1 Group Definitions

`businessContext` must contain:
- Business objective/problem to solve
- Target customer/user segment
- Domain/industry context

`deliverableScope` must contain:
- Expected output artifact type
- Concrete scope quantity or boundary (for example: posts/week, screens, report set, module count, channels)

`requiredSkills` must contain:
- Priority skill/technology profile needed from student(s)

`timelineBudget` must contain:
- Timeline estimate
- Budget or benefit model

### 4.2 Completion Rule

Conversation can be marked ready only when all 4 groups are `complete`.

If timeline or budget is missing:
- Assistant must provide 3-4 quick-pick suggestions.
- Assistant must continue clarification until group state is complete.

## 5. Chosen Approach (Hybrid)

Chosen strategy: deterministic conversation state machine + AI extraction + deterministic completion guard.

### 5.1 Components

- `Extractor` (AI + fallback heuristics)
- `CoverageScorer` (deterministic slot status)
- `QuestionPlanner` (deterministic next-question and suggestions)
- `CompletionGuard` (hard block against premature completion)
- `PrefillPatcher` (existing, expanded integration)
- `LocalDraftStore` (browser-only persistence)

### 5.2 Why Hybrid

- More stable than prompt-only flow.
- Lower implementation risk than fully rigid non-AI parser.
- Preserves AI flexibility for language and paraphrasing while keeping control logic deterministic.

## 6. Target Data Contracts

## 6.1 New Core Types (`src/modules/ai/services/chat-brief/types.ts`)

- `SlotKey = "businessContext" | "deliverableScope" | "requiredSkills" | "timelineBudget"`
- `SlotState = "missing" | "partial" | "complete"`
- `CoverageReport = Record<SlotKey, SlotState>`
- `ChatPlannerResponse`
  - `message: string`
  - `suggestions: string[]`
  - `parsedData: ParsedData`
  - `coverage: CoverageReport`
  - `nextSlot: SlotKey | "completed"`
  - `isReadyToSubmit: boolean`

## 6.2 API Response (`POST /api/ai/chat-brief`)

Keep existing fields and add:
- `coverage`
- `nextSlot`
- `isReadyToSubmit`

Backward compatibility:
- Existing consumers reading only `message/suggestions/parsedData` continue to work.

## 7. Conversation Orchestration

State order (default path):
1. `businessContext`
2. `deliverableScope`
3. `requiredSkills`
4. `timelineBudget`
5. `completed`

Rules:
- Always prioritize earliest non-complete slot.
- `QuestionPlanner` chooses concise Vietnamese question and quick-pick chips for current slot.
- Completion message is emitted only by `CompletionGuard`.

## 8. Extraction and Normalization Rules

- Keep current alias-based parser and fallback synthesis.
- Strengthen extraction to detect explicit evidence for each mandatory group.
- `standardizedBrief` remains synthesized summary, never a completion criterion.
- If model output is invalid JSON or malformed, use fallback extractor and continue flow.

## 9. UX Changes (SME New Project Page)

File: `src/app/(dashboard)/sme/projects/new/page.tsx`

- Persist local draft in browser storage:
  - `messages`
  - `parsedData`
  - `coverage`
  - `updatedAt`
  - `schemaVersion`
- Rehydrate draft when page reloads.
- Add explicit progress indicator (for example `2/4 nhóm đã đủ`).
- Add clear "reset conversation" action.
- Disable success wording in UI when `isReadyToSubmit=false`.

Persistence scope:
- Browser-local only, same machine/profile.
- No server sync in this phase.

## 10. Error Handling and Resilience

- Classify API errors:
  - `invalid_input`
  - `ai_unavailable`
  - `unexpected`
- If LLM call fails/timeouts:
  - fallback to deterministic extraction and planner
  - preserve conversation continuity
- Never clear chat history on transient API failure.

## 11. Performance Strategy

- Trim outbound history window (bounded recent turns) for AI call.
- Keep prompt concise and output JSON-only.
- Retain deterministic planner to reduce dependence on long AI generations.
- Prevent double submit in client while request pending.

## 12. Implementation Scope by File

Add:
- `src/modules/ai/services/chat-brief/slot-coverage.ts`
- `src/modules/ai/services/chat-brief/question-planner.ts`
- `src/modules/ai/services/chat-brief/completion-guard.ts`

Modify:
- `src/modules/ai/services/chat-brief/types.ts`
- `src/modules/ai/services/chat-brief/response-normalizer.ts`
- `src/modules/ai/services/chat-brief/index.ts`
- `src/app/api/ai/chat-brief/route.ts`
- `src/app/(dashboard)/sme/projects/new/page.tsx`

## 13. Testing Strategy (TDD)

Unit tests:
- `slot-coverage.test.ts`
- `question-planner.test.ts`
- `completion-guard.test.ts`
- Extend `chat-brief.test.ts` for end-to-end normalization/planner flow.

Behavior tests must verify:
- No premature completion with only partial info.
- Missing timeline/budget produces suggestions and follow-up question.
- Completion only when all 4 groups complete.
- Local draft serialization and restore behavior.

## 14. Rollout Plan

- Phase A: backend deterministic guard + coverage/planner, keep current UI mostly unchanged.
- Phase B: local draft + progress UI + reset action.
- Phase C: tune extraction heuristics and suggestion catalog.
- Phase D: track quality metrics and iterate.

## 15. Success Metrics

Primary:
- Reduced premature-completion rate.
- Higher first-pass form correctness (fewer manual edits after chat).
- Reduced turns to reach valid completion.

Secondary:
- Stable response latency after history-window control.
- Lower fallback error impact rate.

## 16. Risks and Mitigations

- Risk: deterministic checks too strict for real user phrasing.
  - Mitigation: use `partial` state + targeted follow-up prompts.
- Risk: added logic increases maintenance burden.
  - Mitigation: isolate scorer/planner/guard modules with focused tests.
- Risk: local draft schema drift.
  - Mitigation: include `schemaVersion` and migration-safe parser.

## 17. Acceptance Criteria

- Assistant does not claim completion unless all 4 groups are complete.
- Every project category follows the same mandatory-group policy.
- Missing timeline or budget always triggers quick-pick suggestions.
- Refreshing browser restores current chat draft and extracted state locally.
- Existing endpoint path and project submission API remain compatible.
