# Feature-Based Module Structure Big-Bang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `ai-sme-platform` to bounded-context architecture under `src/modules` with `src/app` as thin entrypoints, while preserving runtime contracts.

**Architecture:** Execute big-bang migration in four batches (`A/B/C/D`) with checkpoint commits. Each bounded context (`auth`, `project`, `application`, `progress`, `ai`, `matching`, `shared`) exposes only module entrypoint (`index.ts` -> `public.ts`). Enforce boundaries via architecture checks and remove `@/lib/*` imports at end-state.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma, Vitest, ESLint, custom Node scripts (`check:architecture`, `check:ui-imports`)

---

## File Structure Lock-In (Target)

```txt
src/
  app/                                # thin routes/pages/layout only
  modules/
    auth/
    project/
    application/
    progress/
    ai/
    matching/
    shared/
```

Each module must contain:
- `index.ts` (public import entry)
- `public.ts` (export surface)
- Context-specific subfolders (`model`, `services`, `repo`, `api`, `ui`, `types`) as defined in spec.

---

### Task 0: Prepare Isolated Execution Context

**Files:**
- Verify: `.git`, current branch/worktree state

- [ ] **Step 1: Create dedicated worktree for migration**
Run:
```bash
git worktree add ../ai-sme-platform-modules -b codex/feature-modules-bigbang
```
Expected: new worktree path exists and branch starts with `codex/`.

- [ ] **Step 2: Capture baseline verification**
Run:
```bash
npm run lint && npm run typecheck && npm run test && npm run build && npm run check:architecture && npm run check:ui-imports
```
Expected: snapshot of current pass/fail state saved in task notes.

- [ ] **Step 3: Commit checkpoint metadata (if needed)**
Run:
```bash
git commit --allow-empty -m "chore: checkpoint before module-structure big-bang"
```

---

## Batch A: Foundation

### Task 1: Scaffold `src/modules` and Module Entrypoints

**Files:**
- Create:
  - `src/modules/{auth,project,application,progress,ai,matching,shared}/index.ts`
  - `src/modules/{auth,project,application,progress,ai,matching,shared}/public.ts`
  - `src/modules/{auth,project,application,progress,ai,matching}/{model,services,repo,api,ui,types}/.gitkeep`
  - `src/modules/shared/{kernel,errors,http,ui}/.gitkeep`
- Test: `scripts/check-architecture.mjs` (later task will enforce)

- [ ] **Step 1: Write failing architecture test for module entrypoint convention**
Create:
`tests/architecture/module-entrypoints.test.ts`
with assertions:
- each module has `index.ts`
- `index.ts` re-exports `./public`

- [ ] **Step 2: Run test to confirm failure before scaffolding**
Run:
```bash
npm run test -- tests/architecture/module-entrypoints.test.ts
```
Expected: FAIL (missing paths).

- [ ] **Step 3: Create module skeleton and entry files**
Add in each `index.ts`:
```ts
export * from "./public";
```
Keep `public.ts` minimal placeholder exports initially.

- [ ] **Step 4: Run entrypoint test and fix until PASS**
Run:
```bash
npm run test -- tests/architecture/module-entrypoints.test.ts
```

- [ ] **Step 5: Commit**
```bash
git add src/modules tests/architecture/module-entrypoints.test.ts
git commit -m "chore(modules): scaffold bounded-context module entrypoints"
```

### Task 2: Move App Root to `src/app` Thin-Layer Baseline

**Files:**
- Move: `app/**` -> `src/app/**` (using `git mv`)
- Modify: `tsconfig.json`, `next-env.d.ts` includes if needed
- Verify: `middleware.ts`, `auth.ts`, `auth.config.ts` imports still resolve

- [ ] **Step 1: Write failing build test in CI notes**
Run:
```bash
npm run build
```
Expected: FAIL after first partial move (transient).

- [ ] **Step 2: Move route tree preserving history**
Run:
```bash
git mv app src/app
```

- [ ] **Step 3: Update path assumptions**
Ensure `@/*` points to `src/*` in `tsconfig.json`:
```json
"paths": { "@/*": ["./src/*"] }
```
Keep temporary aliases for migration only if required and documented.

- [ ] **Step 4: Run typecheck and build until PASS**
Run:
```bash
npm run typecheck && npm run build
```

- [ ] **Step 5: Commit**
```bash
git add src/app tsconfig.json
git commit -m "refactor(app): move routes to src/app baseline"
```

### Task 3: Foundation Checkpoint

**Files:**
- Verify only

- [ ] **Step 1: Run full gates for Batch A**
Run:
```bash
npm run lint && npm run typecheck && npm run test && npm run build && npm run check:architecture && npm run check:ui-imports
```

- [ ] **Step 2: Commit checkpoint A**
```bash
git commit --allow-empty -m "chore: checkpoint A foundation complete"
```

---

## Batch B: Move by Bounded Context

### Task 4: Migrate `shared` Core Primitives

**Files:**
- Move:
  - `lib/types/result.ts` -> `src/modules/shared/kernel/result.ts`
  - `lib/types/action-result.ts` -> `src/modules/shared/kernel/action-result.ts`
  - `lib/services/errors/access-messages.ts` -> `src/modules/shared/errors/access-messages.ts`
  - `lib/http/prisma-api.ts` -> `src/modules/shared/http/prisma-api.ts`
  - `components/ui/**` -> `src/modules/shared/ui/**` (or temporary bridge if required)
- Modify:
  - `src/modules/shared/public.ts`
  - import paths in all consuming files
- Test:
  - existing tests for result/action/error paths

- [ ] **Step 1: Write failing import-migration test**
Create `tests/architecture/no-lib-imports-in-new-modules.test.ts` to fail when `src/app/**` or `src/modules/**` imports `@/lib/*`.

- [ ] **Step 2: Move shared primitives with `git mv`**

- [ ] **Step 3: Update consumers to `@/modules/shared` entry imports**

- [ ] **Step 4: Run targeted tests**
Run:
```bash
npm run test -- lib/types/result.test.ts lib/types/action-result.test.ts lib/services/errors/access-messages.test.ts
```
Then migrate these tests into `src/modules/shared/**` in next step.

- [ ] **Step 5: Commit**
```bash
git add src/modules/shared tests/architecture
git commit -m "refactor(shared): migrate shared kernel/errors/http primitives"
```

### Task 5: Migrate `auth` Bounded Context

**Files:**
- Move:
  - `lib/auth/**`
  - `app/actions/auth.ts`
  - `src/app/(auth)/**` internals that contain auth-specific logic
- Create:
  - `src/modules/auth/public.ts` exports
  - `src/modules/auth/api/actions.ts`
- Modify:
  - imports from `@/lib/auth/*` and auth action consumers

- [ ] **Step 1: Write failing auth module export test**
Create `tests/architecture/auth-module-public.test.ts` to assert exported symbols needed by app routes/actions.

- [ ] **Step 2: Move auth files into module folders (`model/services/repo/api/ui/types`)**

- [ ] **Step 3: Update `src/app` auth pages to call module APIs only**

- [ ] **Step 4: Run auth-related tests + typecheck**
Run:
```bash
npm run test -- src/modules/auth
npm run typecheck
```

- [ ] **Step 5: Commit**
```bash
git add src/modules/auth src/app/(auth)
git commit -m "refactor(auth): migrate auth domain to src/modules/auth"
```

### Task 6: Migrate `project` and `application` Contexts

**Files:**
- Move project:
  - `lib/repos/project-repo.ts`
  - project presenter/status helpers
  - project validators and project API routes
- Move application:
  - `app/actions/application.ts`
  - `lib/services/application-lifecycle.ts`
  - `lib/repos/application-repo.ts`
  - related domain transition rules
- Create:
  - `src/modules/project/public.ts`
  - `src/modules/application/public.ts`
  - `src/modules/application/api/actions.ts`

- [ ] **Step 1: Write failing test for lifecycle exports and invariants**
Move/adapt:
- `lib/services/application-lifecycle.test.ts`
- `lib/domain/lifecycle-rules.test.ts`
to module test paths first; ensure they fail due missing imports.

- [ ] **Step 2: Move project/application files**

- [ ] **Step 3: Update import graph in student/sme pages and APIs**

- [ ] **Step 4: Migrate `src/app/api/student-profile/route.ts` explicitly**
Map:
- `src/app/api/student-profile/route.ts`
- `lib/validators/student-profile.ts` (or current equivalent)
into the chosen bounded context module surface (`auth` + `matching` per spec), then switch route to module entry imports.

- [ ] **Step 5: Run lifecycle and project tests**
Run:
```bash
npm run test -- src/modules/application src/modules/project
```

- [ ] **Step 6: Commit**
```bash
git add src/modules/project src/modules/application src/app
git commit -m "refactor(project,application): migrate lifecycle and project domains"
```

### Task 7: Migrate `progress`, `ai`, and `matching` Contexts

**Files:**
- Move progress:
  - `lib/services/progress/**`
  - `lib/repos/progress-repo.ts`
  - related student/sme progress/evaluation UI logic
- Move ai:
  - `lib/services/chat-brief/**`
  - `lib/services/ai-embedding.ts`
  - `lib/openai.ts`
  - `src/app/api/ai/**`
- Move matching:
  - `lib/matching.ts`
  - `src/app/api/matching/**`
  - `src/app/api/sme/students/**`
- Create/update:
  - `src/modules/{progress,ai,matching}/public.ts`

- [ ] **Step 1: Write failing tests for each module public surface**
Create:
- `tests/architecture/progress-module-public.test.ts`
- `tests/architecture/ai-module-public.test.ts`
- `tests/architecture/matching-module-public.test.ts`

- [ ] **Step 2: Move files with `git mv` per context**

- [ ] **Step 3: Update route handlers/pages to module entry imports only**

- [ ] **Step 4: Run module suites**
Run:
```bash
npm run test -- src/modules/progress src/modules/ai src/modules/matching
```

- [ ] **Step 5: Commit**
```bash
git add src/modules/progress src/modules/ai src/modules/matching src/app
git commit -m "refactor(progress,ai,matching): migrate bounded contexts to src/modules"
```

### Task 8: Batch B Checkpoint

**Files:**
- Verify only

- [ ] **Step 1: Run full gates**
```bash
npm run lint && npm run typecheck && npm run test && npm run build && npm run check:architecture && npm run check:ui-imports
```

- [ ] **Step 2: Commit checkpoint B**
```bash
git commit --allow-empty -m "chore: checkpoint B bounded-context migration complete"
```

---

## Batch C: Thin App Layer Cutover

### Task 9: Strip Business Logic from `src/app` Pages and Actions

**Files:**
- Modify:
  - `src/app/**/page.tsx` with inline server actions
  - `src/app/actions/*.ts`
  - API routes under `src/app/api/**`
- Create (if needed):
  - module-level API adapters in `src/modules/*/api/*`

- [ ] **Step 1: Write failing static analysis test**
Create `tests/architecture/no-heavy-logic-in-app.test.ts`:
- flag Prisma imports from `src/app/**`
- flag direct repo imports from `src/app/**`

- [ ] **Step 2: Move orchestration logic into modules**

- [ ] **Step 3: Keep `src/app` files as thin composition only**

- [ ] **Step 4: Run architecture test**
```bash
npm run test -- tests/architecture/no-heavy-logic-in-app.test.ts
```

- [ ] **Step 5: Commit**
```bash
git add src/app src/modules tests/architecture/no-heavy-logic-in-app.test.ts
git commit -m "refactor(app): enforce thin route entrypoints"
```

### Task 10: Eliminate Cross-Module Deep Imports

**Files:**
- Modify: imports in `src/app/**` and `src/modules/**`
- Modify: `src/modules/*/index.ts`, `src/modules/*/public.ts`

- [ ] **Step 1: Write failing test for deep import violations**
Create `tests/architecture/no-cross-module-deep-imports.test.ts`.

- [ ] **Step 2: Replace all deep imports with `@/modules/<feature>`**

- [ ] **Step 3: Verify no `@/lib/*` imports remain in `src/app` and `src/modules`**
Run:
```bash
rg -n 'from "@/lib/' src/app src/modules
```
Expected: no matches.

- [ ] **Step 4: Run test**
```bash
npm run test -- tests/architecture/no-cross-module-deep-imports.test.ts
```

- [ ] **Step 5: Commit**
```bash
git add src/app src/modules tests/architecture/no-cross-module-deep-imports.test.ts
git commit -m "refactor(imports): switch to module entrypoint-only imports"
```

### Task 11: Batch C Checkpoint

**Files:**
- Verify only

- [ ] **Step 1: Run full gates**
```bash
npm run lint && npm run typecheck && npm run test && npm run build && npm run check:architecture && npm run check:ui-imports
```

- [ ] **Step 2: Commit checkpoint C**
```bash
git commit --allow-empty -m "chore: checkpoint C app cutover complete"
```

---

## Batch D: Enforcement and Cleanup

### Task 12: Upgrade Architecture Guard Script for `src/modules`

**Files:**
- Modify: `scripts/check-architecture.mjs`
- Create: `tests/scripts/check-architecture.test.ts`

- [ ] **Step 1: Write failing script tests**
Cover minimum rules from spec section 9.1:
- no `src/app -> src/modules/*/repo`
- no `src/modules` deep-cross import
- no `src/app` import inside `src/modules`
- no `@/lib/*` in `src/app` and `src/modules`
- no intra-module `ui -> repo` direct dependency
- no intra-module `repo -> ui` dependency

- [ ] **Step 2: Implement rule engine in script**
Use explicit allow/deny regex tables and actionable error messages.

- [ ] **Step 3: Run script tests and script command**
```bash
npm run test -- tests/scripts/check-architecture.test.ts
npm run check:architecture
```

- [ ] **Step 4: Commit**
```bash
git add scripts/check-architecture.mjs tests/scripts/check-architecture.test.ts
git commit -m "chore(architecture): enforce module boundaries in check script"
```

### Task 13: Upgrade UI Import Guard for New Layout

**Files:**
- Modify: `scripts/check-ui-imports.mjs`
- Create: `tests/scripts/check-ui-imports.test.ts`

- [ ] **Step 1: Write failing tests for scan paths**
Must scan:
- `src/modules/shared/ui/**/*`
- `src/modules/**/ui/**/*`
- `src/app/**/*`
- and temporary compatibility `components/ui/**/*` until removed.

- [ ] **Step 2: Implement dual-scan transition logic**
Add clear deprecation warning when `components/ui` still exists.

- [ ] **Step 3: Run tests and command**
```bash
npm run test -- tests/scripts/check-ui-imports.test.ts
npm run check:ui-imports
```

- [ ] **Step 4: Commit**
```bash
git add scripts/check-ui-imports.mjs tests/scripts/check-ui-imports.test.ts
git commit -m "chore(ui): align ui import guard with src/modules layout"
```

### Task 14: Remove Temporary Compatibility Paths and Dead Legacy Layout

**Files:**
- Remove or deprecate:
  - `lib/**` remnants
  - `components/ui/**` remnants (after migration to `src/modules/shared/ui`)
- Modify:
  - `tsconfig.json` paths cleanup
  - any temporary bridge re-exports

- [ ] **Step 1: Write failing smoke test for legacy imports**
Create `tests/architecture/no-legacy-layout.test.ts` to fail if:
- `lib/` runtime imports still referenced
- `components/ui` imported from non-shared module path

- [ ] **Step 2: Remove compatibility code**

- [ ] **Step 3: Run smoke test**
```bash
npm run test -- tests/architecture/no-legacy-layout.test.ts
```

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "chore(cleanup): remove legacy layout and compatibility bridges"
```

### Task 15: Final Batch D Verification + Release Note

**Files:**
- Modify: `README.md` (architecture section), `docs/refactor-pr-checklist.md`
- Create: `docs/module-structure-migration-summary.md`

- [ ] **Step 1: Run mandatory full gate**
```bash
npm run lint && npm run typecheck && npm run test && npm run build && npm run check:architecture && npm run check:ui-imports
```

- [ ] **Step 2: Validate contract invariants checklist**
Manual verification checklist:
- API route paths unchanged
- success payload shapes unchanged
- status semantics unchanged

- [ ] **Step 3: Document migration result**
Add summary:
- moved modules map
- removed legacy dirs
- known follow-up cleanup (if any)

- [ ] **Step 4: Commit checkpoint D**
```bash
git add README.md docs/refactor-pr-checklist.md docs/module-structure-migration-summary.md
git commit -m "docs: finalize feature-based module migration notes and checks"
```

---

## Rollback Procedure (Operational)

- If breakage occurs in Batch C import graph, reset worktree to Batch B checkpoint commit.
- If enforcement scripts block release unexpectedly, keep code state and hotfix script rules in separate commit.
- Never use destructive global reset on shared working tree; rollback by commit hash in dedicated worktree branch.

---

## Completion Criteria

- [ ] `src/app` has thin orchestration only (no direct repo/business logic).
- [ ] Module boundaries enforced by scripts.
- [ ] Cross-module imports only via module entrypoints.
- [ ] `@/lib/*` imports removed from `src/app` and `src/modules`.
- [ ] All six quality gates pass.
- [ ] Docs updated with final architecture map.
