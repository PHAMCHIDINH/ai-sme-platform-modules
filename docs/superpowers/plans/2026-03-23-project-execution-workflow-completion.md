# Project Execution Workflow Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện workflow thực thi dự án có thể dùng thực tế với revision nhiều vòng, event timeline, notification nền tảng, và risk/deadline visibility.

**Architecture:** Mở rộng domain `project/progress` bằng state mới (`REVISION_REQUIRED`, `FAILED`), thêm bảng `ProjectRevision` để quản lý round sửa, thêm `ProjectEvent` làm source-of-truth timeline. Mọi transition quan trọng đi qua use-case services và transaction để tránh lệch trạng thái. UI chỉ hiển thị state machine và action được phép theo role.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, NextAuth, Vitest

---

## File Structure Lock-In

### New files
- `prisma/migrations/<timestamp>_project_revision_and_events/migration.sql`
  - Migration enums + bảng `ProjectRevision`, `ProjectEvent`.
- `src/modules/progress/services/revision-lifecycle.ts`
  - Pure state transition helpers và guard utilities.
- `src/modules/progress/services/revision-lifecycle.test.ts`
  - Unit tests cho transition table.
- `src/modules/progress/services/event-log.ts`
  - Helper tạo event payload chuẩn.
- `src/modules/progress/services/event-log.test.ts`
  - Unit tests event typing/metadata.
- `src/app/(dashboard)/student/my-projects/revision-request-card.tsx`
  - UI block hiển thị note vòng sửa hiện tại + trạng thái round.

### Modified files
- `prisma/schema.prisma`
- `src/modules/progress/repo/progress-repo.ts`
- `src/modules/progress/services/use-cases.ts`
- `src/modules/progress/services/index.ts`
- `src/modules/progress/public.ts`
- `src/modules/progress/services/presenter.ts`
- `src/modules/progress/services/use-cases.test.ts`
- `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- `src/app/(dashboard)/student/my-projects/page.tsx`
- `src/app/(dashboard)/student/my-projects/project-progress-actions.tsx`
- `src/modules/shared/services/app-data.ts`

### Existing files to inspect
- `src/modules/project/services/use-cases.ts`
- `src/modules/application/model/lifecycle-rules.ts`
- `src/app/(dashboard)/sme/projects/[id]/accept-deliverable-button.tsx`

---

### Task 0: Baseline Verification

**Files:**
- Verify only (no code changes)

- [ ] **Step 1: Run typecheck baseline**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 2: Run test baseline**

Run:
```bash
npm test
```
Expected: PASS.

- [ ] **Step 3: Run build baseline**

Run:
```bash
npx cross-env AUTH_SECRET=dummy NEXTAUTH_SECRET=dummy next build
```
Expected: PASS (allow existing known lint warnings).

- [ ] **Step 4: Commit checkpoint**

```bash
git commit --allow-empty -m "chore: checkpoint before execution workflow completion"
```

---

### Task 1: Add Schema for Revision + Events

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_project_revision_and_events/migration.sql`

- [ ] **Step 1: Extend enums**
- Add `REVISION_REQUIRED`, `FAILED` to `ProjectStatus`.
- Add `REVISION_REQUIRED`, `FAILED` to `ProgressStatus`.
- Add new enums: `RevisionStatus`, `ProjectEventType`.

- [ ] **Step 2: Add `ProjectRevision` model**
- Include `roundNumber`, request/resubmit/resolve fields, actor references.
- Add indexes: `(projectId, roundNumber)` unique.

- [ ] **Step 3: Add `ProjectEvent` model**
- Include `actorUserId`, `type`, `message`, `metadata`, timestamps.
- Add indexes for `(projectId, createdAt)`.

- [ ] **Step 4: Generate migration**

Run:
```bash
npx prisma migrate dev --name project_revision_and_events
```
Expected: Migration SQL generated and Prisma client updated.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(prisma): add revision and project event schema"
```

---

### Task 2: Implement Revision Lifecycle Domain Logic

**Files:**
- Create: `src/modules/progress/services/revision-lifecycle.ts`
- Create: `src/modules/progress/services/revision-lifecycle.test.ts`
- Modify: `src/modules/progress/services/presenter.ts`
- Modify: `src/modules/progress/services/index.ts`

- [ ] **Step 1: Write failing lifecycle tests**
- Cases:
  - `SUBMITTED -> REVISION_REQUIRED` allowed
  - `REVISION_REQUIRED -> SUBMITTED` allowed
  - `SUBMITTED -> COMPLETED` allowed
  - `SUBMITTED/REVISION_REQUIRED -> FAILED` allowed
  - Invalid transitions blocked

- [ ] **Step 2: Run focused test (must fail)**

Run:
```bash
npm test -- src/modules/progress/services/revision-lifecycle.test.ts
```

- [ ] **Step 3: Implement minimal lifecycle helpers**
- Add pure guard fns for request/resubmit/approve/reject.
- Add helper for next round number/state labels.

- [ ] **Step 4: Update presenter labels/classes for new statuses**
- Ensure `REVISION_REQUIRED`, `FAILED` have visible tone in UI.

- [ ] **Step 5: Run focused test (must pass)**

Run:
```bash
npm test -- src/modules/progress/services/revision-lifecycle.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/progress/services/revision-lifecycle.ts src/modules/progress/services/revision-lifecycle.test.ts src/modules/progress/services/presenter.ts src/modules/progress/services/index.ts
git commit -m "feat(progress): add revision lifecycle state helpers"
```

---

### Task 3: Add Repo + Use-Case Actions (Transaction-Safe)

**Files:**
- Modify: `src/modules/progress/repo/progress-repo.ts`
- Create: `src/modules/progress/services/event-log.ts`
- Create: `src/modules/progress/services/event-log.test.ts`
- Modify: `src/modules/progress/services/use-cases.ts`
- Modify: `src/modules/progress/services/use-cases.test.ts`
- Modify: `src/modules/progress/public.ts`

- [ ] **Step 1: Add failing tests for new actions**
- `requestRevisionBySme`
- `resubmitDeliverableByStudent`
- `approveProjectBySme`
- `rejectProjectBySme`
- Assert event emitted + status changed atomically.

- [ ] **Step 2: Run focused test (must fail)**

Run:
```bash
npm test -- src/modules/progress/services/use-cases.test.ts src/modules/progress/services/event-log.test.ts
```

- [ ] **Step 3: Implement repo helpers**
- Create/update revision round.
- Close/open rounds.
- Insert project events.
- Query latest round for project.

- [ ] **Step 4: Implement use-cases with transaction boundaries**
- Keep all state/revision/event writes in single transaction.
- Reuse existing ownership guard patterns.

- [ ] **Step 5: Export new actions from module public**

- [ ] **Step 6: Run focused tests (must pass)**

Run:
```bash
npm test -- src/modules/progress/services/use-cases.test.ts src/modules/progress/services/event-log.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/modules/progress/repo/progress-repo.ts src/modules/progress/services/event-log.ts src/modules/progress/services/event-log.test.ts src/modules/progress/services/use-cases.ts src/modules/progress/services/use-cases.test.ts src/modules/progress/public.ts
git commit -m "feat(progress): add revision and project event use-cases"
```

---

### Task 4: Integrate SME + Student UI for Revision Loop

**Files:**
- Create: `src/app/(dashboard)/student/my-projects/revision-request-card.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/student/my-projects/page.tsx`
- Modify: `src/app/(dashboard)/student/my-projects/project-progress-actions.tsx`

- [ ] **Step 1: SME detail action panel**
- At `SUBMITTED` show buttons:
  - Request revision
  - Approve
  - Reject

- [ ] **Step 2: Student my-projects state panel**
- At `REVISION_REQUIRED` show newest revision note + `Resubmit deliverable`.
- At `FAILED` show final rejected message and lock edit actions.

- [ ] **Step 3: Add `revision-request-card` component**
- Render round number, note, requested time, current round status.

- [ ] **Step 4: Verify UI state matrix manually**

Run:
```bash
npm run dev
```
Expected:
- SME sees correct actions by state.
- Student sees revision note and resubmit path only when allowed.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(dashboard)'/sme/projects/[id]/page.tsx src/app/'(dashboard)'/student/my-projects/page.tsx src/app/'(dashboard)'/student/my-projects/project-progress-actions.tsx src/app/'(dashboard)'/student/my-projects/revision-request-card.tsx
git commit -m "feat(ui): wire revision workflow actions for sme and student"
```

---

### Task 5: Add Event Timeline Feed (Foundation for Notifications)

**Files:**
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/student/my-projects/page.tsx`

- [ ] **Step 1: Add query helpers for project events**
- Return latest events sorted desc and optionally scoped by project.

- [ ] **Step 2: Render timeline panel in SME detail**
- Show actor, event type label, relative timestamp, message.

- [ ] **Step 3: Render student-side compact activity list**
- Show latest 5 events on current project card.

- [ ] **Step 4: Commit**

```bash
git add src/modules/shared/services/app-data.ts src/app/'(dashboard)'/sme/projects/[id]/page.tsx src/app/'(dashboard)'/student/my-projects/page.tsx
git commit -m "feat(ui): add project event timeline feed"
```

---

### Task 6: Deadline + Risk Visibility

**Files:**
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/student/my-projects/page.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/sme/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`

- [ ] **Step 1: Add simple risk scoring helper**
- Inputs: deadline, latest update time, status.
- Outputs: `ON_TRACK`, `AT_RISK`, `OVERDUE`.

- [ ] **Step 2: Surface risk badges in detail pages**
- Show near progress/status section.

- [ ] **Step 3: Add dashboard counters**
- Count by risk bucket to guide action priorities.

- [ ] **Step 4: Commit**

```bash
git add src/modules/shared/services/app-data.ts src/app/'(dashboard)'/student/my-projects/page.tsx src/app/'(dashboard)'/sme/projects/[id]/page.tsx src/app/'(dashboard)'/sme/dashboard/page.tsx src/app/'(dashboard)'/student/dashboard/page.tsx
git commit -m "feat(metrics): add deadline risk visibility and counters"
```

---

### Task 7: Final Verification and Docs Update

**Files:**
- Modify: `README.md` (if behavior/state docs needed)
- Modify: `MO_TA_TUNG_PAGE.md` (if route behavior docs needed)

- [ ] **Step 1: Run full verification**

Run:
```bash
npm run typecheck
npm test
npx cross-env AUTH_SECRET=dummy NEXTAUTH_SECRET=dummy next build
npm run check:architecture
npm run check:ui-imports
```
Expected: PASS.

- [ ] **Step 2: Smoke test critical routes**
- `/sme/projects/[id]`
- `/student/my-projects`
- `/sme/dashboard`
- `/student/dashboard`

- [ ] **Step 3: Update docs for new states**
- Document `REVISION_REQUIRED`, `FAILED`, revision rounds, event feed.

- [ ] **Step 4: Final commit**

```bash
git add README.md MO_TA_TUNG_PAGE.md
git commit -m "docs: document execution workflow and revision lifecycle"
```

---

## Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-23-project-execution-workflow-completion.md`.

Two execution options:
1. Subagent-Driven (recommended)
2. Inline Execution
