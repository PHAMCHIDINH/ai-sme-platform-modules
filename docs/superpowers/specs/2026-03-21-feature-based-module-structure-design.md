# Feature-Based Module Structure Design (`ai-sme-platform`)

Date: 2026-03-21  
Status: Approved Draft for Planning  
Scope: Internal architecture refactor (no intentional runtime feature change)

## 1. Context

Current codebase has improved domain separation (`lib/services`, `lib/repos`, `lib/domain`) but still keeps:
- Business logic spread across `app/*` pages/actions/routes
- Cross-cutting helpers mixed under `lib/*` with weak ownership boundaries
- Repeated contracts and presentation rules across features

The target is to reorganize by bounded context using feature-based modules, while preserving release stability.

## 2. Objectives

- Move to `src/modules` as the primary architecture unit.
- Keep `src/app` as thin route/page entrypoints (orchestration only).
- Enforce module boundaries so cross-feature coupling is explicit.
- Support a big-bang migration executed by bounded context batches.
- Keep existing runtime behavior and public API contracts stable unless explicitly noted.

## 3. Non-Goals

- No redesign of business rules in this migration.
- No product-level feature expansion.
- No broad UI redesign.
- No schema redesign beyond previously approved remediation items.

## 4. Chosen Architecture

Chosen strategy:
- Big-bang migration by bounded context
- Root structure: `src/modules`
- Route layer pattern: `src/app` thin entrypoints importing from modules
- Module internal style: feature-first pragmatic

### 4.1 Target Directory Layout

```txt
src/
  app/
    ... route/page/layout/handlers (thin orchestration only)

  modules/
    auth/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    project/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    application/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    progress/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    ai/
      model/
      services/
      api/
      types/
      public.ts

    matching/
      model/
      services/
      repo/
      api/
      ui/
      types/
      public.ts

    shared/
      kernel/
      errors/
      http/
      ui/
      public.ts
```

### 4.2 Module Entry Resolution Convention (Compile-Safe)

- Each feature module must include `index.ts` that re-exports from `public.ts`.
- External consumers must import feature entry only as `@/modules/<feature>`.
- Internal module files must use relative imports or local aliases, not their own external entry import.
- `tsconfig` `paths` keeps `@/* -> src/*`; no special wildcard mapping directly to `public.ts` is required because `index.ts` is the stable entrypoint.

Example:

```ts
// src/modules/project/index.ts
export * from "./public";
```

## 5. Dependency Rules

### 5.1 Directional Rules

- `src/app/*` may import only:
  - module entrypoint `@/modules/<feature>` (resolved by `src/modules/<feature>/index.ts`)
  - shared entrypoint `@/modules/shared` (or explicit shared public exports)
- Inside a module:
  - `ui -> services -> repo -> model/types`
- `repo` must not import `ui`.
- `api` adapters call module services; they do not contain business logic.

### 5.2 Cross-Module Access

- Cross-module imports must go through target module `public.ts`.
- Direct deep imports into another module internals are forbidden.

### 5.3 Shared Constraints

- `shared` contains only cross-feature primitives.
- Feature-specific business logic must remain in its module.

## 6. Bounded Context Mapping (Current -> Target)

### 6.1 Auth

- From: `lib/auth/*`, `app/actions/auth.ts`, `app/(auth)/*`
- To: `src/modules/auth/*`

### 6.2 Application Lifecycle

- From: `app/actions/application.ts`, `lib/services/application-lifecycle.ts`, `lib/repos/application-repo.ts`, related lifecycle rules
- To: `src/modules/application/*`

### 6.3 Project

- From: `app/api/projects/*`, `lib/repos/project-repo.ts`, `lib/validators/project.ts`, project presenters
- To: `src/modules/project/*`

### 6.4 Progress + Evaluation

- From: `lib/services/progress/*`, `lib/repos/progress-repo.ts`, related student/SME progress pages
- To: `src/modules/progress/*`

### 6.5 AI

- From: `app/api/ai/*`, `lib/services/chat-brief/*`, `lib/services/ai-embedding.ts`, `lib/openai.ts`
- To: `src/modules/ai/*`

### 6.6 Matching

- From: `app/api/matching/*`, matching helpers, candidate suggestion flows
- To: `src/modules/matching/*`

### 6.7 Shared

- From: `lib/types/*`, `lib/http/*`, shared errors/helpers, common UI primitives
- To: `src/modules/shared/*`

### 6.8 Route Group and Helper Area Coverage

All current route groups are explicitly covered as follows:

- `app/(auth)/*` -> `src/modules/auth/ui/*` (`src/app` keeps thin route entries)
- `app/(dashboard)/student/*`:
  - `dashboard`, `profile` -> `src/modules/auth` + `src/modules/project` + `src/modules/progress` UI services
  - `projects`, `my-projects` -> `src/modules/project`, `src/modules/application`, `src/modules/progress`, `src/modules/matching`
- `app/(dashboard)/sme/*`:
  - `dashboard`, `profile` -> `src/modules/project`, `src/modules/application`, `src/modules/auth`
  - `projects/*`, `students` -> `src/modules/project`, `src/modules/application`, `src/modules/progress`, `src/modules/matching`, `src/modules/ai`
- `app/api/auth/*` -> `src/modules/auth/api/*`
- `app/api/projects/*` -> `src/modules/project/api/*`
- `app/api/student-profile/*` -> `src/modules/auth` + `src/modules/matching` (student profile ownership lives in `auth` bounded context for identity/profile)
- `app/api/sme/students/*` -> `src/modules/matching/api/*`
- `app/api/matching/*` -> `src/modules/matching/api/*`
- `app/api/ai/*` -> `src/modules/ai/api/*`
- `app/actions/*`:
  - `auth` actions -> `src/modules/auth/api/actions`
  - `application` actions -> `src/modules/application/api/actions`

Helper area coverage:

- `lib/validators/*` split by feature module (`auth`, `project`, `matching`) and shared validators in `shared/kernel` only when cross-feature.
- `lib/openai.ts` and AI helpers -> `src/modules/ai/services/*`.
- Any remaining `lib/*` path after cutover is treated as migration defect unless listed in an explicit temporary compatibility list.

## 7. Big-Bang Execution Plan

### Batch A: Foundation

- Create `src/modules/*` skeleton + `public.ts` per module.
- Create `src/modules/shared/*` and base exports.
- Prepare tsconfig path aliases for `@/modules/*`.

### Batch B: Move by Bounded Context

- Relocate files via `git mv` to preserve history.
- Keep behavior unchanged while relocating.
- Stabilize each module internal imports.

### Batch C: Thin App Layer Cutover

- Convert `src/app` pages/routes/actions to module-driven entrypoints.
- Replace deep `lib/*` imports with module public imports.

### Batch D: Enforcement and Cleanup

- Enable architecture guard checks (import boundary rules).
- Remove temporary compatibility exports if any.
- Final consistency cleanup and dead code removal.

## 8. Error Handling and Contracts

### 8.1 Contract Invariants (Must Not Change)

- HTTP endpoint paths remain unchanged.
- Response JSON shape for public APIs remains unchanged for success payloads.
- Status-code semantics remain unchanged for existing scenarios.
- Existing frontend calls to public endpoints must continue to work without caller-side schema updates.

### 8.2 Explicitly Allowed Changes

- Internal server-action return typing may be unified via shared module primitives when external UI behavior is preserved.
- Error message text localization/wording is allowed only when:
  - response field names and status codes are preserved
  - no additional required client parsing logic is introduced
- Internal error handling consolidation (shared helpers) is allowed when public contract invariants above remain true.

### 8.3 Migration Guard

- Any intentional API contract change (field names, payload structure, or status semantics) is out of this migration scope and requires a separate RFC/spec.

## 9. Quality Gates (Mandatory)

All must pass before migration is considered done:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:architecture`
- `npm run check:ui-imports`

### 9.1 Required Architecture Enforcement Rules

`check:architecture` must enforce at minimum:

- No import from `src/app/**` into `src/modules/**`.
- No cross-module deep import:
  - forbidden: `@/modules/<feature>/<non-public-path>`
  - allowed: `@/modules/<feature>` (resolved via `public.ts`)
- No `ui -> repo` direct dependency inside a module.
- No `repo -> ui` dependency inside a module.
- No direct `src/modules/<feature>/repo/*` import from `src/app/*`.
- No new `@/lib/*` imports from `src/app/*` or `src/modules/*` after cutover (except explicit temporary compatibility list in Batch D, which must become empty at completion).

`check:ui-imports` must be updated to scan:

- `src/modules/shared/ui/**/*`
- `src/modules/**/ui/**/*`
- `src/app/**/*`

and verify UI primitive imports resolve correctly under the new `src` layout.

Note:
- `components/ui` may remain temporarily during migration, but end-state ownership is `src/modules/shared/ui`.
- During transition, `check-ui-imports` must scan both locations until compatibility layer removal in Batch D.

## 10. Rollback Strategy

- Create checkpoint commits per batch (`A`, `B`, `C`, `D`).
- If Batch C import graph breaks broadly, rollback to Batch B checkpoint.
- Avoid partial-file rollback across modules; rollback by checkpoint.

## 11. Risks and Mitigations

- Risk: Mass import breakage during cutover
  - Mitigation: public.ts boundary contract + scripted import rewrites + batch checkpoints

- Risk: Hidden cross-module coupling
  - Mitigation: architecture checks + strict no-deep-import rule

- Risk: Behavior regression during relocation
  - Mitigation: no-logic-change policy in move phase + full gate suite

## 12. Acceptance Criteria

- No `app` business logic heavy paths; route layer is orchestration-only.
- No direct deep import across module internals.
- Feature logic discoverable by bounded context under `src/modules`.
- Full quality gates pass.
- Team can add new feature code by module without touching unrelated modules.
