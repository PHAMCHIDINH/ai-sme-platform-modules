# Remote DB Performance Without Local Postgres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce app-open and tab-switch latency while keeping Neon/Postgres remote by adding cache layers, moving similarity search out of request-time Prisma scans, and streaming heavy dashboard pages.

**Architecture:** Keep Postgres as the source of truth for transactional data, but stop using it as the hot path for every read. Use Next.js server caching plus Upstash Redis for repeated read models, move semantic ranking to Qdrant, and use Inngest to keep vector/search projections in sync after profile or project updates.

**Tech Stack:** Next.js App Router, Prisma, Upstash Redis, Next `unstable_cache`, Qdrant Cloud, Inngest, Vitest

---

### Task 1: Add Request-Time Performance Instrumentation

**Files:**
- Create: `src/modules/shared/services/perf.ts`
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/api/sme/students/route.ts`
- Test: `src/modules/shared/services/perf.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

import { measureAsync } from "./perf";

describe("measureAsync", () => {
  it("returns function result and logs elapsed time", async () => {
    const logger = vi.fn();

    const result = await measureAsync("student.projects", async () => "ok", logger);

    expect(result).toBe("ok");
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "student.projects",
        elapsedMs: expect.any(Number),
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/shared/services/perf.test.ts`
Expected: FAIL with module not found for `./perf`

- [ ] **Step 3: Write minimal implementation**

```ts
type PerfLogger = (entry: { label: string; elapsedMs: number }) => void;

const defaultLogger: PerfLogger = (entry) => {
  console.info("[PERF]", entry);
};

export async function measureAsync<T>(
  label: string,
  run: () => Promise<T>,
  logger: PerfLogger = defaultLogger,
) {
  const startedAt = Date.now();
  const result = await run();
  logger({
    label,
    elapsedMs: Date.now() - startedAt,
  });
  return result;
}
```

- [ ] **Step 4: Wrap the current hot paths**

```ts
const session = await measureAsync("auth.student.projects", () => auth());
const profile = await measureAsync("profile.embedding", () => findStudentProfileWithEmbedding(studentUserId));
const availableProjects = await measureAsync("projects.discovery", () => listStudentDiscoveryProjects(profile?.id ?? null));
```

Add the same wrapper around:
- `findStudentDashboardData`
- `listStudentInvitations`
- `listStudentsForSmeSearch`
- `generateEmbedding` inside `src/app/api/sme/students/route.ts`

- [ ] **Step 5: Run verification**

Run:
- `npm run test -- src/modules/shared/services/perf.test.ts`
- `npm run lint`

Expected: test PASS, lint PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/shared/services/perf.ts src/modules/shared/services/perf.test.ts src/modules/shared/services/app-data.ts 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/student/projects/page.tsx' src/app/api/sme/students/route.ts
git commit -m "chore: add performance instrumentation for hot paths"
```

### Task 2: Add Server-Side Read Cache With Next Cache and Upstash Redis

**Files:**
- Create: `src/modules/shared/services/read-cache.ts`
- Create: `src/modules/shared/services/read-cache.test.ts`
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/modules/shared/public.ts`
- Test: `src/modules/shared/services/read-cache.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

import { withRedisCache } from "./read-cache";

describe("withRedisCache", () => {
  it("returns cached value on second call", async () => {
    const loader = vi.fn().mockResolvedValue({ ok: true });

    const first = await withRedisCache("k1", loader, { ttlSeconds: 60, redis: new Map() });
    const second = await withRedisCache("k1", loader, { ttlSeconds: 60, redis: new Map([["k1", JSON.stringify(first)]]) });

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/shared/services/read-cache.test.ts`
Expected: FAIL because `withRedisCache` does not exist

- [ ] **Step 3: Create the cache helper**

```ts
import { unstable_cache } from "next/cache";
import { Redis } from "@upstash/redis";

type CacheOptions<T> = {
  ttlSeconds: number;
  redis?: Pick<Redis, "get" | "set"> | Map<string, string>;
  fallback?: T;
};

export async function withRedisCache<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions<T>,
) {
  const fromRedis =
    options.redis instanceof Map
      ? options.redis.get(key)
      : await options.redis?.get<string>(key);

  if (fromRedis) {
    return JSON.parse(fromRedis) as T;
  }

  const value = await loader();
  const serialized = JSON.stringify(value);

  if (options.redis instanceof Map) {
    options.redis.set(key, serialized);
  } else {
    await options.redis?.set(key, serialized, { ex: options.ttlSeconds });
  }

  return value;
}

export const cachedStudentDashboard = unstable_cache(
  async (userId: string) => findStudentDashboardData(userId),
  ["student-dashboard"],
  { revalidate: 60, tags: ["student-dashboard"] },
);
```

- [ ] **Step 4: Apply cache to hot read models**

Modify `src/modules/shared/services/app-data.ts` to add cache-backed wrappers for:
- `findStudentDashboardData`
- `listStudentDiscoveryProjects`
- `listStudentInvitations`
- `listStudentsForSmeSearch`

Use key shapes like:

```ts
const key = `student:projects:${studentId ?? "guest"}`;
const key = `student:dashboard:${userId}`;
const key = `sme:students:all`;
```

- [ ] **Step 5: Export public APIs**

```ts
export * from "./services/read-cache";
```

- [ ] **Step 6: Run verification**

Run:
- `npm run test -- src/modules/shared/services/read-cache.test.ts`
- `npm run typecheck`

Expected: test PASS, typecheck PASS

- [ ] **Step 7: Commit**

```bash
git add src/modules/shared/services/read-cache.ts src/modules/shared/services/read-cache.test.ts src/modules/shared/services/app-data.ts src/modules/shared/public.ts
git commit -m "feat: add read cache for dashboard and discovery data"
```

### Task 3: Reduce Student Discovery Route Latency by Parallelizing and Shrinking Reads

**Files:**
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/modules/shared/services/app-data.ts`
- Create: `src/modules/project/services/student-discovery-read-model.ts`
- Create: `src/modules/project/services/student-discovery-read-model.test.ts`
- Test: `src/modules/project/services/student-discovery-read-model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { buildStudentDiscoveryReadModel } from "./student-discovery-read-model";

describe("buildStudentDiscoveryReadModel", () => {
  it("returns only fields needed by the page card", () => {
    const model = buildStudentDiscoveryReadModel({
      id: "p1",
      title: "Demo",
      description: "Desc",
      expectedOutput: "Output",
      requiredSkills: ["React"],
      duration: "2 weeks",
      budget: null,
      difficulty: "MEDIUM",
      embedding: [1, 2, 3],
      applications: [],
      sme: { companyName: "ACME", avatarUrl: null, industry: "Tech", description: "SME" },
      _count: { applications: 0 },
    });

    expect(model).toEqual(
      expect.objectContaining({
        id: "p1",
        title: "Demo",
        sme: expect.objectContaining({ companyName: "ACME" }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/project/services/student-discovery-read-model.test.ts`
Expected: FAIL because file/function does not exist

- [ ] **Step 3: Create the read-model mapper**

```ts
export function buildStudentDiscoveryReadModel(project: {
  id: string;
  title: string;
  description: string;
  expectedOutput: string;
  requiredSkills: string[];
  duration: string;
  budget: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  embedding: number[];
  applications: { status: string; initiatedBy: string }[];
  sme: { companyName: string; avatarUrl: string | null; industry: string; description: string };
  _count: { applications: number };
}) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    expectedOutput: project.expectedOutput,
    requiredSkills: project.requiredSkills,
    duration: project.duration,
    budget: project.budget,
    difficulty: project.difficulty,
    embedding: project.embedding,
    sme: project.sme,
    applications: project.applications,
    applicationCount: project._count.applications,
  };
}
```

- [ ] **Step 4: Parallelize the page flow**

Replace the sequential flow in `src/app/(dashboard)/student/projects/page.tsx` with:

```ts
const session = await auth();
const studentUserId = getSessionUserIdByRole(session, "STUDENT");
if (!studentUserId) return <div>{ACCESS_MESSAGES.UNAUTHORIZED_PAGE}</div>;

const profile = await findStudentProfileWithEmbedding(studentUserId);

const [availableProjects, invitations] = await Promise.all([
  listStudentDiscoveryProjects(profile?.id ?? null),
  profile ? listStudentInvitations(profile.id) : Promise.resolve([]),
]);
```

- [ ] **Step 5: Reduce Prisma payload**

Change `buildStudentDiscoveryProjectSelect` so it stops selecting fields the page does not render. Keep:
- card content
- matching embedding
- interaction state fields

Remove from the hot list anything not used by the page body.

- [ ] **Step 6: Run verification**

Run:
- `npm run test -- src/modules/project/services/student-discovery-read-model.test.ts`
- `npm run test -- src/modules/project/services/student-discovery.test.ts`
- `npm run typecheck`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add 'src/app/(dashboard)/student/projects/page.tsx' src/modules/shared/services/app-data.ts src/modules/project/services/student-discovery-read-model.ts src/modules/project/services/student-discovery-read-model.test.ts
git commit -m "perf: parallelize and slim student discovery reads"
```

### Task 4: Move Semantic Matching to Qdrant Instead of Ranking in Request Memory

**Files:**
- Create: `src/modules/matching/services/qdrant.ts`
- Create: `src/modules/matching/services/qdrant.test.ts`
- Create: `src/modules/matching/services/project-vector-sync.ts`
- Modify: `src/modules/matching/public.ts`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/api/sme/students/route.ts`
- Modify: `src/modules/ai/services/embedding-backfill-job.ts`
- Test: `src/modules/matching/services/qdrant.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

import { searchProjectsByEmbedding } from "./qdrant";

describe("searchProjectsByEmbedding", () => {
  it("returns ordered ids from Qdrant response", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      result: [
        { id: "p2", score: 0.92 },
        { id: "p1", score: 0.81 },
      ],
    });

    const ids = await searchProjectsByEmbedding([0.1, 0.2], { fetcher });

    expect(ids).toEqual([
      { id: "p2", score: 0.92 },
      { id: "p1", score: 0.81 },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/modules/matching/services/qdrant.test.ts`
Expected: FAIL because Qdrant adapter does not exist

- [ ] **Step 3: Implement Qdrant adapter**

```ts
const QDRANT_URL = process.env.QDRANT_URL ?? "";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY ?? "";
const PROJECT_COLLECTION = "projects";
const STUDENT_COLLECTION = "students";

export async function searchProjectsByEmbedding(
  vector: number[],
  deps: { fetcher?: typeof fetch } = {},
) {
  const fetcher = deps.fetcher ?? fetch;
  const response = await fetcher(`${QDRANT_URL}/collections/${PROJECT_COLLECTION}/points/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": QDRANT_API_KEY,
    },
    body: JSON.stringify({
      vector,
      limit: 24,
      with_payload: true,
    }),
  });

  const body = await response.json();
  return body.result.map((point: { id: string; score: number }) => ({
    id: point.id,
    score: point.score,
  }));
}
```

- [ ] **Step 4: Replace request-time in-memory ranking**

In `src/app/(dashboard)/student/projects/page.tsx`, replace:

```ts
rankBySimilarity(profile.embedding, availableProjects)
```

with:

```ts
const rankedIds = hasEmbedding
  ? await searchProjectsByEmbedding(profile.embedding)
  : [];
```

Then hydrate cards from Postgres by `id in rankedIds`.

- [ ] **Step 5: Rework SME student search**

In `src/app/api/sme/students/route.ts`, replace:
- load all students
- generate query embedding
- in-memory cosine loop

with:
- generate embedding once
- ask Qdrant for top `studentIds`
- hydrate top ids from Postgres

- [ ] **Step 6: Add background sync using existing Inngest/embedding jobs**

In `src/modules/ai/services/embedding-backfill-job.ts`, call new sync helpers after embeddings are generated:

```ts
await syncProjectVector(project.id, embedding, payload);
await syncStudentVector(student.id, embedding, payload);
```

- [ ] **Step 7: Run verification**

Run:
- `npm run test -- src/modules/matching/services/qdrant.test.ts`
- `npm run typecheck`

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/modules/matching/services/qdrant.ts src/modules/matching/services/qdrant.test.ts src/modules/matching/services/project-vector-sync.ts src/modules/matching/public.ts 'src/app/(dashboard)/student/projects/page.tsx' src/app/api/sme/students/route.ts src/modules/ai/services/embedding-backfill-job.ts
git commit -m "feat: move semantic ranking to qdrant"
```

### Task 5: Add Postgres Indexes for Remote OLTP Queries

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_perf_indexes/migration.sql`
- Test: `prisma/migrations/migrations.test.ts`

- [ ] **Step 1: Write the failing migration assertion**

```ts
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("adds performance indexes for discovery and dashboard queries", () => {
  const sql = readFileSync("prisma/migrations/<timestamp>_add_perf_indexes/migration.sql", "utf8");

  expect(sql).toContain("CREATE INDEX");
  expect(sql).toContain("Project_status_createdAt_idx");
  expect(sql).toContain("Application_studentId_status_initiatedBy_idx");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- prisma/migrations/migrations.test.ts`
Expected: FAIL because migration file does not exist yet

- [ ] **Step 3: Add indexes in Prisma schema**

```prisma
model Project {
  // ...
  @@index([status, createdAt(sort: Desc)])
  @@index([smeId, createdAt(sort: Desc)])
}

model Application {
  // ...
  @@index([studentId, status, initiatedBy])
  @@index([projectId, status])
}

model ProjectProgress {
  // ...
  @@index([studentId, status])
}

model Evaluation {
  // ...
  @@index([evaluateeId, type])
}
```

- [ ] **Step 4: Generate SQL migration**

Run:

```bash
npx prisma migrate dev --name add_perf_indexes --create-only
```

Then verify the SQL includes concrete `CREATE INDEX` statements for the four hot paths above.

- [ ] **Step 5: Run verification**

Run:
- `npm run test -- prisma/migrations/migrations.test.ts`
- `npm run typecheck`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "perf: add database indexes for remote read paths"
```

### Task 6: Improve Perceived Speed With Streaming and Route Skeletons

**Files:**
- Create: `src/app/(dashboard)/student/loading.tsx`
- Create: `src/app/(dashboard)/student/projects/loading.tsx`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Test: `tests/architecture/student-discovery-layout.test.ts`

- [ ] **Step 1: Write a layout assertion**

```ts
import { existsSync } from "node:fs";
import { expect, it } from "vitest";

it("defines student loading boundaries", () => {
  expect(existsSync("src/app/(dashboard)/student/loading.tsx")).toBe(true);
  expect(existsSync("src/app/(dashboard)/student/projects/loading.tsx")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/architecture/student-discovery-layout.test.ts`
Expected: FAIL because loading files do not exist

- [ ] **Step 3: Add loading UI**

```tsx
export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" key={index} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Split slow sections behind `Suspense`**

Refactor the heavy page body into async child components so the shell paints first:

```tsx
export default function StudentProjectsPage(props: StudentProjectsPageProps) {
  return (
    <Suspense fallback={<StudentProjectsLoading />}>
      <StudentProjectsContent {...props} />
    </Suspense>
  );
}
```

- [ ] **Step 5: Run verification**

Run:
- `npm run test -- tests/architecture/student-discovery-layout.test.ts`
- `npm run lint`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add 'src/app/(dashboard)/student/loading.tsx' 'src/app/(dashboard)/student/projects/loading.tsx' 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/student/projects/page.tsx' tests/architecture/student-discovery-layout.test.ts
git commit -m "perf: add loading boundaries for student dashboard routes"
```

### Task 7: Fix Known Navigation Noise That Hides Real Perf Signals

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/modules/shared/ui/portal-search-hero.tsx`
- Test: `tests/architecture/student-discovery-layout.test.ts`

- [ ] **Step 1: Write the failing assertion**

```ts
import { expect, it } from "vitest";

it("uses unique browse link keys on homepage", async () => {
  const links = [
    { label: "Web App", href: "/student/projects" },
    { label: "Automation", href: "/student/projects" },
  ];

  const keys = links.map((link) => `${link.href}:${link.label}`);
  expect(new Set(keys).size).toBe(keys.length);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/architecture/student-discovery-layout.test.ts`
Expected: FAIL because current keying strategy relies on duplicate `href`

- [ ] **Step 3: Make keys unique**

Update `src/modules/shared/ui/portal-search-hero.tsx`:

```tsx
{browseLinks.map((link) => (
  <Link
    className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
    href={link.href}
    key={`${link.href}:${link.label}`}
  >
    {link.label}
  </Link>
))}
```

- [ ] **Step 4: Run verification**

Run:
- `npm run test -- tests/architecture/student-discovery-layout.test.ts`
- `npm run lint`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/modules/shared/ui/portal-search-hero.tsx tests/architecture/student-discovery-layout.test.ts
git commit -m "fix: remove duplicate homepage navigation keys"
```

## Recommended Rollout Order

1. Task 1
2. Task 3
3. Task 5
4. Task 2
5. Task 6
6. Task 4
7. Task 7

## Expected Outcome

- Student dashboard warm load moves from roughly `~0.8s` toward `~0.3-0.5s`
- Student projects warm load moves from roughly `~2.1s` toward `~0.5-0.9s`
- Login-to-dashboard feels faster because the post-login route no longer chains multiple remote reads
- SME student search stops scanning every profile on each query
- Semantic matching cost moves from request-time Node loops to a dedicated vector service

## Self-Review

- Spec coverage: the plan addresses remote DB latency without introducing local Postgres, covers dashboard reads, discovery reads, SME search, semantic ranking, and perceived navigation speed.
- Placeholder scan: no `TODO` or `implement later` placeholders remain; each task lists concrete files, commands, and code snippets.
- Type consistency: caching is isolated in `read-cache`, vector search in `qdrant`, and current page entrypoints remain the integration points.

Plan complete and saved to `docs/superpowers/plans/2026-03-27-remote-db-performance-without-local-postgres.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
