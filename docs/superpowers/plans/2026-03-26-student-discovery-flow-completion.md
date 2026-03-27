# Student Discovery Flow Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the student-side project discovery flow so students can search, filter, inspect, and track project opportunities with clear state and low friction.

**Architecture:** Keep `src/app` thin and push discovery rules into `src/modules/project` and `src/modules/shared/services/app-data.ts`. Reuse the current presenter pattern for interaction state, and add a small filter/sort helper so list-page behavior is deterministic and testable without UI-only tests. Avoid schema expansion in this phase; ship list/detail completeness first.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Prisma, PostgreSQL, Vitest

---

## File Structure

- Create: `src/modules/project/services/student-project-detail.ts`
- Create: `src/modules/project/services/student-project-detail.test.ts`
- Create: `src/modules/project/services/student-project-filters.ts`
- Create: `src/modules/project/services/student-project-filters.test.ts`
- Modify: `src/modules/project/public.ts`
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/invitation-card.tsx`
- Modify: `src/app/(dashboard)/student/projects/application-status-badge.tsx`

Notes:
- The repo already has `src/modules/project/services/student-discovery.ts`; leave its interaction-state helper in place or move shared logic into `student-project-detail.ts` if the file is getting crowded.
- Do not add saved-project schema or view-tracking tables in this plan. Those are separate product decisions and would widen scope.

### Task 1: Harden Discovery Query Contract

**Files:**
- Create: `src/modules/project/services/student-project-detail.ts`
- Create: `src/modules/project/services/student-project-detail.test.ts`
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/modules/project/public.ts`

- [ ] **Step 1: Write the failing tests for visibility and detail shaping**

```ts
import { describe, expect, it } from "vitest";

import {
  deriveStudentProjectInteractionState,
  presentStudentProjectDetailCard,
} from "@/modules/project";

describe("student project detail presenter", () => {
  it("marks open projects as ready to apply when the student has a profile and no application", () => {
    expect(
      deriveStudentProjectInteractionState({
        hasStudentProfile: true,
        projectStatus: "OPEN",
        application: null,
      }),
    ).toBe("READY_TO_APPLY");
  });

  it("includes deadline and applicant count in the shaped detail payload", () => {
    const detail = presentStudentProjectDetailCard(
      {
        id: "project_1",
        title: "CRM automation",
        description: "Automate SME sales flow",
        standardizedBrief: "Build a CRM MVP",
        expectedOutput: "Working demo",
        requiredSkills: ["Next.js", "PostgreSQL"],
        duration: "8 weeks",
        budget: "20.000.000 VND",
        difficulty: "MEDIUM",
        deadline: new Date("2026-04-30T00:00:00.000Z"),
        applicantCount: 7,
        embedding: [],
        sme: {
          companyName: "SME One",
          avatarUrl: "https://example.com/a.png",
          industry: "Retail",
          description: "Retail operations SME",
        },
        applications: [],
      },
      { hasStudentProfile: true, matchScore: 82 },
    );

    expect(detail.deadlineLabel).toBeTruthy();
    expect(detail.applicantCount).toBe(7);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm run test -- src/modules/project/services/student-project-detail.test.ts
```

Expected: FAIL because `presentStudentProjectDetailCard` and the new fields do not exist yet.

- [ ] **Step 3: Extend the shared Prisma queries with student-safe fields**

```ts
export async function listStudentDiscoveryProjects(studentId: string | null) {
  return prisma.project.findMany({
    where: {
      OR: [
        { status: "OPEN" },
        ...(studentId
          ? [
              {
                applications: {
                  some: { studentId },
                },
              },
            ]
          : []),
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
      deadline: true,
      createdAt: true,
      status: true,
      embedding: true,
      _count: {
        select: {
          applications: true,
        },
      },
      sme: {
        select: {
          companyName: true,
          avatarUrl: true,
          industry: true,
          description: true,
        },
      },
      applications: studentId
        ? {
            where: { studentId },
            select: {
              status: true,
              initiatedBy: true,
            },
            take: 1,
          }
        : false,
    },
  });
}
```

- [ ] **Step 4: Add the domain-level detail presenter and export it**

```ts
import { format } from "date-fns";

export function presentStudentProjectDetailCard(
  raw: StudentDiscoveryProjectRaw,
  options: { hasStudentProfile: boolean; matchScore: number },
) {
  const application = raw.applications[0] ?? null;
  const interactionState = deriveStudentProjectInteractionState({
    hasStudentProfile: options.hasStudentProfile,
    projectStatus: raw.status ?? "OPEN",
    application,
  });

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? "",
    standardizedBrief: raw.standardizedBrief ?? null,
    expectedOutput: raw.expectedOutput,
    requiredSkills: raw.requiredSkills,
    duration: raw.duration,
    budget: raw.budget ?? null,
    difficulty: raw.difficulty ?? "MEDIUM",
    interactionState,
    matchScore: options.matchScore,
    applicantCount: raw.applicantCount ?? 0,
    deadlineLabel: raw.deadline ? format(raw.deadline, "dd/MM/yyyy") : "Không có deadline cứng",
    companyName: raw.sme?.companyName ?? "Doanh nghiệp SME",
    companyAvatarUrl: raw.sme?.avatarUrl ?? "",
    companyIndustry: raw.sme?.industry ?? "",
    companyDescription: raw.sme?.description ?? "",
  };
}
```

- [ ] **Step 5: Run the tests and commit**

Run:

```bash
npm run test -- src/modules/project/services/student-project-detail.test.ts src/modules/project/services/student-discovery.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/modules/project/services/student-project-detail.ts src/modules/project/services/student-project-detail.test.ts src/modules/shared/services/app-data.ts src/modules/project/public.ts
git commit -m "feat: harden student discovery query contract"
```

### Task 2: Add Search, Filter, and Sort as Domain Logic

**Files:**
- Create: `src/modules/project/services/student-project-filters.ts`
- Create: `src/modules/project/services/student-project-filters.test.ts`
- Modify: `src/modules/project/public.ts`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`

- [ ] **Step 1: Write the failing tests for query-param normalization and filtering**

```ts
import { describe, expect, it } from "vitest";

import {
  applyStudentProjectFilters,
  normalizeStudentProjectFilters,
} from "@/modules/project";

describe("student project filters", () => {
  it("normalizes incoming query params into safe defaults", () => {
    expect(
      normalizeStudentProjectFilters({
        q: "crm",
        difficulty: "MEDIUM",
        sort: "match",
      }),
    ).toEqual({
      q: "crm",
      difficulty: "MEDIUM",
      sort: "match",
    });
  });

  it("filters by search text and difficulty", () => {
    const result = applyStudentProjectFilters(
      [
        { id: "1", title: "CRM Automation", expectedOutput: "Internal tool", difficulty: "MEDIUM", matchScore: 88, companyName: "A" },
        { id: "2", title: "Landing Page", expectedOutput: "Marketing site", difficulty: "EASY", matchScore: 72, companyName: "B" },
      ],
      { q: "crm", difficulty: "MEDIUM", sort: "match" },
    );

    expect(result.map((item) => item.id)).toEqual(["1"]);
  });
});
```

- [ ] **Step 2: Run the filter tests to verify they fail**

Run:

```bash
npm run test -- src/modules/project/services/student-project-filters.test.ts
```

Expected: FAIL because the new filter helpers do not exist yet.

- [ ] **Step 3: Implement pure helpers for filter normalization and sorting**

```ts
export type StudentProjectSort = "match" | "newest";

export function normalizeStudentProjectFilters(input: Record<string, string | string[] | undefined>) {
  const q = typeof input.q === "string" ? input.q.trim().toLowerCase() : "";
  const difficulty =
    input.difficulty === "EASY" || input.difficulty === "MEDIUM" || input.difficulty === "HARD"
      ? input.difficulty
      : "ALL";
  const sort = input.sort === "newest" ? "newest" : "match";

  return { q, difficulty, sort };
}

export function applyStudentProjectFilters<T extends {
  title: string;
  expectedOutput: string;
  companyName: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  matchScore: number;
}>(
  items: T[],
  filters: { q: string; difficulty: "ALL" | "EASY" | "MEDIUM" | "HARD"; sort: StudentProjectSort },
) {
  const filtered = items.filter((item) => {
    const haystack = `${item.title} ${item.expectedOutput} ${item.companyName}`.toLowerCase();
    const matchesQuery = !filters.q || haystack.includes(filters.q);
    const matchesDifficulty = filters.difficulty === "ALL" || item.difficulty === filters.difficulty;
    return matchesQuery && matchesDifficulty;
  });

  return filtered.sort((a, b) => (filters.sort === "newest" ? 0 : b.matchScore - a.matchScore));
}
```

- [ ] **Step 4: Wire the helpers into the server page via `searchParams`**

```tsx
export default async function StudentProjectsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const filters = normalizeStudentProjectFilters(searchParams ?? {});

  const filteredProjects = applyStudentProjectFilters(
    presentedProjects.map((project) => ({
      ...project,
      difficulty: project.difficulty ?? "MEDIUM",
    })),
    filters,
  );

  return (
    <FilterSidebar title="Discovery filters" description="Thu hẹp danh sách theo keyword, độ khó, và cách sắp xếp.">
      <form className="space-y-3" method="GET">
        <input
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          defaultValue={filters.q}
          name="q"
          placeholder="Tìm theo tên dự án hoặc SME"
        />
        <select
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          defaultValue={filters.difficulty}
          name="difficulty"
        >
          <option value="ALL">Mọi độ khó</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>
        <select
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
          defaultValue={filters.sort}
          name="sort"
        >
          <option value="match">Ưu tiên match score</option>
          <option value="newest">Mới nhất</option>
        </select>
        <Button className="w-full rounded-full" type="submit">
          Áp dụng bộ lọc
        </Button>
      </form>
    </FilterSidebar>
  );
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm run test -- src/modules/project/services/student-project-filters.test.ts src/modules/project/services/student-discovery.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/modules/project/services/student-project-filters.ts src/modules/project/services/student-project-filters.test.ts src/modules/project/public.ts 'src/app/(dashboard)/student/projects/page.tsx'
git commit -m "feat: add student project search filters and sorting"
```

### Task 3: Complete the Student Project Detail Experience

**Files:**
- Modify: `src/app/(dashboard)/student/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/invitation-card.tsx`
- Modify: `src/app/(dashboard)/student/projects/application-status-badge.tsx`
- Test: `src/modules/project/services/student-project-detail.test.ts`

- [ ] **Step 1: Write the failing regression test for detail metadata labels**

```ts
it("shows a stable closed-state message for unavailable projects", () => {
  expect(
    deriveStudentProjectInteractionState({
      hasStudentProfile: true,
      projectStatus: "COMPLETED",
      application: null,
    }),
  ).toBe("PROJECT_CLOSED");
});
```

- [ ] **Step 2: Run the relevant tests to confirm the baseline**

Run:

```bash
npm run test -- src/modules/project/services/student-project-detail.test.ts src/modules/project/services/student-discovery.test.ts
```

Expected: PASS for old behavior, then fail after adding assertions for new UI-facing fields until the presenter/page are updated.

- [ ] **Step 3: Expand the detail page with missing operational context**

```tsx
<div className="grid gap-3 text-sm font-medium">
  <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
    <span className="uppercase">Deadline</span>
    <span>{project.deadlineLabel}</span>
  </div>
  <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-3 py-2 text-slate-700">
    <span className="uppercase">Lượt ứng tuyển</span>
    <span>{project.applicantCount}</span>
  </div>
</div>
```

- [ ] **Step 4: Align invitation and state copy with the completed discovery flow**

```tsx
const LABELS: Record<StudentProjectInteractionState, string> = {
  READY_TO_APPLY: "Có thể ứng tuyển",
  PROFILE_REQUIRED: "Cần hồ sơ hoàn chỉnh",
  PENDING: "Đang chờ phản hồi",
  INVITED: "SME đã mời bạn",
  ACCEPTED: "Đã được nhận",
  REJECTED: "Không được chọn",
  PROJECT_CLOSED: "Không còn mở tuyển",
};
```

- [ ] **Step 5: Run focused verification and commit**

Run:

```bash
npm run test -- src/modules/project/services/student-project-detail.test.ts src/modules/project/services/student-discovery.test.ts
npm run lint
```

Expected: PASS, with no new lint failures introduced by the page updates.

Commit:

```bash
git add 'src/app/(dashboard)/student/projects/[id]/page.tsx' 'src/app/(dashboard)/student/projects/invitation-card.tsx' 'src/app/(dashboard)/student/projects/application-status-badge.tsx' src/modules/project/services/student-project-detail.test.ts
git commit -m "feat: finish student project detail discovery experience"
```

### Task 4: Full Verification and Release Readiness

**Files:**
- Modify: `docs/superpowers/plans/2026-03-26-student-discovery-flow-completion.md` if verification uncovers drift

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run check:architecture
npm run check:ui-imports
```

Expected: PASS across all commands.

- [ ] **Step 2: Manually inspect the student discovery journey**

Run:

```bash
npm run dev
```

Manual checklist:
- Visit `/student/projects`
- Search for a keyword that should narrow results
- Change difficulty filter and sort mode
- Open `/student/projects/[id]`
- Verify apply CTA, deadline, applicant count, and interaction badge states
- Verify invited projects still appear in the invitation section and not in the main listing

- [ ] **Step 3: Commit the verified batch**

```bash
git add .
git commit -m "feat: complete student discovery flow"
```

## Self-Review

- Spec coverage: This plan covers student-safe detail exposure, explicit application states, list/detail UX completion, and deterministic filtering/sorting. It intentionally excludes saved projects and view tracking because those would require additional schema/product decisions.
- Placeholder scan: No `TBD` or deferred “write tests later” steps remain.
- Type consistency: The plan uses `deriveStudentProjectInteractionState`, `presentStudentProjectDetailCard`, `normalizeStudentProjectFilters`, and `applyStudentProjectFilters` consistently across tasks.
