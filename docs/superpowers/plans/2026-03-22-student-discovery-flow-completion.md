# Student Discovery Flow Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real student-side project detail flow and explicit application-state UX so students can inspect a project before applying and understand their current interaction state.

**Architecture:** Keep `src/app` thin and push student discovery logic into `src/modules/project` plus the existing shared Prisma data layer. Avoid schema changes in the first pass; reuse `Application.status` and `initiatedBy` to compute visibility, CTA state, and labels.

**Tech Stack:** Next.js 14 App Router, React Server Components, TypeScript, Prisma, PostgreSQL, Vitest

---

## Inputs

- Roadmap source: `docs/superpowers/plans/2026-03-22-platform-completion-roadmap.md`
- Relevant current files:
  - `src/app/(dashboard)/student/projects/page.tsx`
  - `src/app/(dashboard)/student/projects/apply-button.tsx`
  - `src/modules/shared/services/app-data.ts`
  - `src/modules/application/api/actions.ts`
  - `src/modules/project/public.ts`
  - `src/modules/matching/services/matching.ts`

## Product Decisions Locked For This Plan

- No new Prisma models in this first pass.
- Student project detail page is read-only except for application CTA.
- Accepted projects continue living in `/student/my-projects`, not on the discovery page.
- Invited projects continue getting the existing dedicated invitation card treatment.
- Rejected projects are not re-opened for re-apply in this phase.
- The list page should stop hiding all projects with existing interaction; instead it should present explicit state where appropriate.

## File Structure

### Create

- `src/modules/project/services/student-discovery.ts`
  - Pure presentation/state helpers for student discovery
- `src/modules/project/services/student-discovery.test.ts`
  - Unit tests for state mapping and student-safe detail shaping
- `src/app/(dashboard)/student/projects/[id]/page.tsx`
  - Student project detail server page
- `src/app/(dashboard)/student/projects/application-status-badge.tsx`
  - Reusable status badge for student-facing interaction states

### Modify

- `src/modules/shared/services/app-data.ts`
  - New Prisma queries for student discovery list and student project detail
- `src/modules/project/public.ts`
  - Export new student discovery helpers
- `src/app/(dashboard)/student/projects/page.tsx`
  - Replace current list mapping with state-aware project cards and detail links
- `src/app/(dashboard)/student/projects/apply-button.tsx`
  - Support richer disabled/app-state rendering
- `MO_TA_TUNG_PAGE.md`
  - Update page description once the detail page exists

## Data Shape To Introduce

### Student discovery raw item

```ts
type StudentDiscoveryProjectRaw = {
  id: string;
  title: string;
  description: string;
  standardizedBrief: string | null;
  expectedOutput: string;
  requiredSkills: string[];
  duration: string;
  budget: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "DRAFT";
  embedding: number[];
  sme: {
    companyName: string;
    industry: string;
  } | null;
  applications: Array<{
    status: "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED";
    initiatedBy: "SME" | "STUDENT";
  }>;
};
```

### Presented student card/detail state

```ts
type StudentProjectInteractionState =
  | "READY_TO_APPLY"
  | "PROFILE_REQUIRED"
  | "PENDING"
  | "INVITED"
  | "ACCEPTED"
  | "REJECTED"
  | "PROJECT_CLOSED";
```

## Task 1: Add Student Discovery Presenter Logic

**Files:**
- Create: `src/modules/project/services/student-discovery.ts`
- Create: `src/modules/project/services/student-discovery.test.ts`
- Modify: `src/modules/project/public.ts`

- [ ] **Step 1: Write the failing tests for interaction-state mapping**

```ts
import { describe, expect, it } from "vitest";
import {
  deriveStudentProjectInteractionState,
  presentStudentProjectSummary,
} from "@/modules/project";

describe("student discovery presenter", () => {
  it("marks profile-required when the student lacks a profile", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: false,
        projectStatus: "OPEN",
        application: null,
      }),
    ).toBe("PROFILE_REQUIRED");
  });

  it("marks pending when a student application already exists", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: true,
        projectStatus: "OPEN",
        application: { status: "PENDING", initiatedBy: "STUDENT" },
      }),
    ).toBe("PENDING");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: FAIL because the new module does not exist yet.

- [ ] **Step 3: Implement the pure presenter**

```ts
export function deriveStudentProjectInteractionState(input: {
  hasStudentProfile: boolean;
  projectStatus: "DRAFT" | "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
  application:
    | { status: "PENDING" | "INVITED" | "ACCEPTED" | "REJECTED"; initiatedBy: "SME" | "STUDENT" }
    | null;
}) {
  if (!input.hasStudentProfile) return "PROFILE_REQUIRED";
  if (input.projectStatus !== "OPEN") return "PROJECT_CLOSED";
  if (!input.application) return "READY_TO_APPLY";
  return input.application.status;
}
```

- [ ] **Step 4: Add summary/detail presentation helpers**

```ts
export function presentStudentProjectSummary(raw: StudentDiscoveryProjectRaw, options: { hasStudentProfile: boolean; matchScore: number }) {
  const application = raw.applications[0] ?? null;
  const interactionState = deriveStudentProjectInteractionState({
    hasStudentProfile: options.hasStudentProfile,
    projectStatus: raw.status,
    application,
  });

  return {
    id: raw.id,
    title: raw.title,
    companyName: raw.sme?.companyName ?? "Doanh nghiệp SME",
    interactionState,
    matchScore: options.matchScore,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/project/services/student-discovery.ts src/modules/project/services/student-discovery.test.ts src/modules/project/public.ts
git commit -m "feat(project): add student discovery presenter"
```

## Task 2: Extend Shared Data Queries For Student Discovery And Detail

**Files:**
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/modules/project/services/student-discovery.ts`
- Test: `src/modules/project/services/student-discovery.test.ts`

- [ ] **Step 1: Write a failing test for student-safe detail shaping**

```ts
it("does not expose progress or evaluations in student detail presentation", () => {
  const result = presentStudentProjectDetail(
    {
      id: "p1",
      title: "Project",
      description: "desc",
      standardizedBrief: "brief",
      expectedOutput: "site",
      requiredSkills: ["React"],
      duration: "3 tuần",
      budget: "3.000.000 VNĐ",
      difficulty: "MEDIUM",
      status: "OPEN",
      embedding: [],
      sme: { companyName: "ABC", industry: "Retail" },
      applications: [],
    },
    { hasStudentProfile: true, matchScore: 88 },
  );

  expect(result).not.toHaveProperty("progress");
  expect(result).not.toHaveProperty("evaluations");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: FAIL because `presentStudentProjectDetail` does not exist yet.

- [ ] **Step 3: Add new shared data queries**

In `src/modules/shared/services/app-data.ts`, add:

```ts
export async function listStudentDiscoveryProjects(studentId: string | null) {
  return prisma.project.findMany({
    where: {
      OR: [
        { status: "OPEN" },
        ...(studentId ? [{ applications: { some: { studentId } } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      embedding: true,
      sme: { select: { companyName: true, industry: true } },
      applications: studentId
        ? {
            where: { studentId },
            select: { status: true, initiatedBy: true },
            take: 1,
          }
        : false,
    },
  });
}
```

- [ ] **Step 4: Add a project-by-id query for student detail**

```ts
export async function findStudentDiscoveryProjectById(projectId: string, studentId: string | null) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      description: true,
      standardizedBrief: true,
      expectedOutput: true,
      requiredSkills: true,
      duration: true,
      budget: true,
      difficulty: true,
      status: true,
      embedding: true,
      sme: { select: { companyName: true, industry: true, description: true } },
      applications: studentId
        ? {
            where: { studentId },
            select: { status: true, initiatedBy: true },
            take: 1,
          }
        : false,
    },
  });
}
```

- [ ] **Step 5: Implement the corresponding detail presenter**

Keep presentation logic in `src/modules/project/services/student-discovery.ts`, not in `app-data.ts`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/modules/shared/services/app-data.ts src/modules/project/services/student-discovery.ts src/modules/project/services/student-discovery.test.ts
git commit -m "feat(project): add student discovery data queries"
```

## Task 3: Build Student Project Detail Page

**Files:**
- Create: `src/app/(dashboard)/student/projects/[id]/page.tsx`
- Create: `src/app/(dashboard)/student/projects/application-status-badge.tsx`
- Modify: `src/modules/project/public.ts`

- [ ] **Step 1: Write the failing route smoke test as a presenter-level test**

Because the repo does not currently use browser/component test infrastructure, cover the route indirectly by testing the presenter output for the detail page sections.

```ts
it("includes standardized brief when available", () => {
  const detail = presentStudentProjectDetail(rawProject, {
    hasStudentProfile: true,
    matchScore: 84,
  });

  expect(detail.standardizedBrief).toBe("brief");
  expect(detail.interactionState).toBe("READY_TO_APPLY");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: FAIL if detail presenter is incomplete.

- [ ] **Step 3: Create the detail route**

In `src/app/(dashboard)/student/projects/[id]/page.tsx`:

```ts
const session = await auth();
const studentUserId = getSessionUserIdByRole(session, "STUDENT");
if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

const profile = await findStudentProfileWithEmbedding(studentUserId);
const rawProject = await findStudentDiscoveryProjectById(params.id, profile?.id ?? null);
if (!rawProject) return notFound();
```

- [ ] **Step 4: Render the detail sections**

Render:

- company and project title
- match score + fit description
- expected output
- problem description
- standardized brief if present
- required skills
- duration, budget, difficulty
- application status badge and CTA

Use existing shared UI components and keep the page read-only.

- [ ] **Step 5: Add a reusable status badge**

Create `application-status-badge.tsx` with a simple state-to-label mapping:

```ts
const labelByState = {
  READY_TO_APPLY: "Có thể ứng tuyển",
  PROFILE_REQUIRED: "Cần cập nhật hồ sơ",
  PENDING: "Đang chờ SME phản hồi",
  INVITED: "Đã được SME mời",
  ACCEPTED: "Đã được nhận",
  REJECTED: "Đã bị từ chối",
  PROJECT_CLOSED: "Dự án không còn mở",
} as const;
```

- [ ] **Step 6: Run tests**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/'(dashboard)'/student/projects/[id]/page.tsx src/app/'(dashboard)'/student/projects/application-status-badge.tsx src/modules/project/public.ts src/modules/project/services/student-discovery.ts src/modules/project/services/student-discovery.test.ts
git commit -m "feat(student): add project detail page"
```

## Task 4: Update Student Project List And Apply CTA

**Files:**
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/apply-button.tsx`
- Modify: `src/modules/shared/services/app-data.ts`
- Test: `src/modules/project/services/student-discovery.test.ts`

- [ ] **Step 1: Write a failing test for list-card CTA state**

```ts
it("renders rejected applications as non-actionable", () => {
  const project = presentStudentProjectSummary(rawRejectedProject, {
    hasStudentProfile: true,
    matchScore: 72,
  });

  expect(project.interactionState).toBe("REJECTED");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/project/services/student-discovery.test.ts`
Expected: FAIL until rejected-state handling is implemented.

- [ ] **Step 3: Replace the current list query usage**

In `src/app/(dashboard)/student/projects/page.tsx`, stop using the current query that removes all interacted projects:

```ts
const rawProjects = await listStudentDiscoveryProjects(profile?.id ?? null);
const rankedProjects =
  profile?.embedding?.length
    ? rankBySimilarity(profile.embedding, rawProjects)
    : rawProjects.map((project) => ({ ...project, matchScore: 0 }));
```

- [ ] **Step 4: Present each card through the new presenter**

Map raw ranked records into presenter output before rendering. Add a “Xem chi tiết” link on every card and keep `ApplyButton` only for `READY_TO_APPLY`.

- [ ] **Step 5: Expand `ApplyButton` props**

Change `ApplyButton` to accept an optional explicit label or state:

```ts
type ApplyButtonProps = {
  projectId: string;
  matchScore: number;
  disabledReason?: string;
  ctaLabel?: string;
};
```

Do not overload the button with full status logic; the page decides whether to render it at all.

- [ ] **Step 6: Add status UI on cards**

Render `ApplicationStatusBadge` on cards for `PENDING`, `INVITED`, `REJECTED`, and `PROJECT_CLOSED`.

- [ ] **Step 7: Run verification**

Run:

```bash
npm run test -- src/modules/project/services/student-discovery.test.ts
npm run typecheck
npm run lint
```

Expected:

- student discovery tests PASS
- no type errors
- no lint errors

- [ ] **Step 8: Commit**

```bash
git add src/app/'(dashboard)'/student/projects/page.tsx src/app/'(dashboard)'/student/projects/apply-button.tsx src/modules/shared/services/app-data.ts src/modules/project/services/student-discovery.ts src/modules/project/services/student-discovery.test.ts
git commit -m "feat(student): add state-aware project discovery list"
```

## Task 5: Update Documentation And Run Full Verification

**Files:**
- Modify: `MO_TA_TUNG_PAGE.md`
- Modify: `README.md` only if navigation or user flow docs need a short mention

- [ ] **Step 1: Update page documentation**

Change the `/student/projects` and add the new `/student/projects/[id]` description in `MO_TA_TUNG_PAGE.md`.

- [ ] **Step 2: Run full project verification**

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run check:architecture
npm run check:ui-imports
```

Expected:

- all checks PASS
- no architecture import violations
- no build regressions

- [ ] **Step 3: Commit**

```bash
git add MO_TA_TUNG_PAGE.md README.md
git commit -m "docs: update student discovery flow documentation"
```

## Notes For The Implementer

- Do not move Prisma access out of `src/modules/shared/services/app-data.ts` in this plan.
- Keep `src/app` pages thin; no raw Prisma calls inside routes/pages.
- Reuse `rankBySimilarity` as-is unless a concrete bug appears.
- Avoid adding saved-projects, shortlist, or schema changes in this first implementation plan.
- If the list query grows awkward because invited/accepted/rejected items crowd the page, split into sections only after the minimal state-aware list is working.

## Final Verification Checklist

- `src/modules/project/services/student-discovery.test.ts` exists and passes.
- `/student/projects` shows explicit interaction states.
- `/student/projects/[id]` exists and renders student-safe detail.
- Students without profile see a clear gated CTA.
- Students with `PENDING` or `REJECTED` applications do not see a misleading apply CTA.
- Existing invitation flow still works.
- No architecture boundary violations.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-22-student-discovery-flow-completion.md`.

Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
