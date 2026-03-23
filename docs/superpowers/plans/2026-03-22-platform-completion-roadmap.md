# Platform Completion Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the AI SME platform from a polished MVP/demo into a more complete product with stronger hiring flow, collaboration loop, trust layer, admin operations, and production readiness.

**Architecture:** This is a master roadmap, not a single-feature implementation plan. The scope spans multiple independent subsystems, so execution should be split into separate implementation plans after product confirmation. Prioritize user-facing workflow gaps first, then platform trust/admin capabilities, then production hardening.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Prisma, PostgreSQL, NextAuth, OpenAI API, TanStack Query, Vitest

---

## Scope Check

This scope is too broad for one coding pass. It should be executed as a sequence of smaller plans:

1. Student project discovery and application UX
2. Project collaboration, feedback, and notifications
3. Trust/reputation and explainable matching
4. Admin and moderation workflows
5. Production hardening and operational readiness

Use this document as the product and engineering roadmap. Write a dedicated implementation plan per subsystem before coding.

## Current Baseline

The current codebase already supports the core marketplace loop:

- User registration and role-based auth
- SME profile and project creation
- AI-assisted project brief standardization
- Student profile with embeddings
- AI similarity ranking and invitations/applications
- Project progress, deliverable submission, and two-way evaluation

Relevant existing surfaces:

- `MO_TA_TUNG_PAGE.md`
- `prisma/schema.prisma`
- `src/app/(dashboard)/sme/projects/new/page.tsx`
- `src/app/(dashboard)/student/projects/page.tsx`
- `src/app/(dashboard)/student/my-projects/page.tsx`
- `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- `src/app/(dashboard)/sme/projects/[id]/candidates/page.tsx`
- `src/app/api/projects/route.ts`
- `src/app/api/student-profile/route.ts`
- `src/app/api/sme/students/route.ts`

## Priority Summary

### Must Have

- Student-facing project detail and application status experience
- In-project collaboration loop with revision requests and notifications
- Real profile completion and matching explanation
- Stronger operational dashboards and real metrics

### Should Have

- Reputation and trust signals for SME and student
- Admin moderation and dispute handling
- Better search, filters, saved items, and shortlist management

### Nice To Have

- Contracts, billing, escrow, or paid placement
- Advanced analytics funnels
- External integrations like email automation, storage, and calendar sync

## Task 1: Student Discovery Flow Completion

**Outcome:** Student users can inspect a project before applying, track their application state, and manage discovery with less friction.

**Files:**
- Create: `src/app/(dashboard)/student/projects/[id]/page.tsx`
- Create: `src/modules/project/services/student-project-detail.ts`
- Create: `src/modules/project/services/student-project-detail.test.ts`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/modules/project/public.ts`
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `prisma/schema.prisma` if new saved-project or view-tracking entities are approved

- [ ] Confirm product rules for what student can see before applying: full brief, budget, deadline, company profile, candidate count, status labels.
- [ ] Add a student project detail query path that exposes only student-safe fields.
- [ ] Render a dedicated project detail page with project summary, required skills, duration, budget, and application CTA.
- [ ] Show application state explicitly on list/detail pages: not applied, pending, invited, accepted, rejected.
- [ ] Add secondary discovery improvements only if approved: saved projects, filters, sorting, or “recently viewed”.
- [ ] Write tests for visibility rules and application-state presentation logic.
- [ ] Verify with targeted tests, then run `npm run test`, `npm run typecheck`, and `npm run lint`.

## Task 2: Collaboration and Delivery Loop

**Outcome:** The project lifecycle supports real back-and-forth work instead of a single submit-and-accept handoff.

**Files:**
- Create: `src/modules/progress/services/revision-lifecycle.ts`
- Create: `src/modules/progress/services/revision-lifecycle.test.ts`
- Create: `src/app/(dashboard)/student/my-projects/revision-request-card.tsx`
- Create: `src/app/(dashboard)/sme/projects/[id]/request-revision-button.tsx`
- Create: `src/app/api/notifications/route.ts` if in-app notifications are approved
- Modify: `prisma/schema.prisma`
- Modify: `src/modules/progress/services/use-cases.ts`
- Modify: `src/app/(dashboard)/student/my-projects/page.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/page.tsx`

- [ ] Decide the minimal revision model: comment thread, revision request, resubmission timestamp, and notification event.
- [ ] Extend the data model to support revision requests and delivery history without breaking the current happy path.
- [ ] Add SME action to request revision instead of only accepting deliverable.
- [ ] Add student view for revision notes and resubmission.
- [ ] Add in-app notification records or a simpler event feed if full notification center is too large for one phase.
- [ ] Preserve current submit/complete permissions and add tests for new lifecycle transitions.
- [ ] Verify the lifecycle with focused Vitest coverage and full project verification commands.

## Task 3: Matching Quality and Trust Layer

**Outcome:** Matching is easier to trust because the platform explains fit and profile quality is measured more honestly.

**Files:**
- Create: `src/modules/matching/services/explain-score.ts`
- Create: `src/modules/matching/services/explain-score.test.ts`
- Create: `src/modules/matching/services/profile-completion.ts`
- Create: `src/modules/matching/services/profile-completion.test.ts`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/candidates/page.tsx`
- Modify: `src/modules/matching/public.ts`
- Modify: `src/app/api/student-profile/route.ts`

- [ ] Replace the current approximate profile completion indicator with a weighted score across skills, technologies, links, description, and availability.
- [ ] Add score explanation helpers that translate embedding-driven matching into human-readable reasons.
- [ ] Surface “why matched” and “what is missing” on candidate and student project views.
- [ ] Define a minimal trust layer: completed projects, average rating, response history, or verified links.
- [ ] Add tests for scoring determinism and explanation output.
- [ ] Run `npm run test`, `npm run typecheck`, `npm run lint`, and snapshot-check affected UI manually.

## Task 4: SME and Student Operational Dashboards

**Outcome:** Dashboards show actionable operating metrics instead of mostly static or demo-like summaries.

**Files:**
- Create: `src/modules/shared/services/dashboard-metrics.ts`
- Create: `src/modules/shared/services/dashboard-metrics.test.ts`
- Modify: `src/app/(dashboard)/sme/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/modules/shared/services/app-data.ts`

- [ ] Define metrics that matter: application conversion, invitation response, completion rate, average rating, overdue work, profile quality.
- [ ] Replace heuristic values with real computed values from Prisma queries.
- [ ] Add empty-state guidance that points users to the next most valuable action.
- [ ] Keep metrics cheap to query; avoid expensive dashboards that slow every page load.
- [ ] Write tests for metric aggregation and edge cases.
- [ ] Run targeted verification plus full lint/typecheck/test.

## Task 5: Admin, Moderation, and Dispute Operations

**Outcome:** The platform can be governed instead of relying entirely on trusted users.

**Files:**
- Create: `src/app/(dashboard)/admin/page.tsx`
- Create: `src/app/(dashboard)/admin/projects/page.tsx`
- Create: `src/app/(dashboard)/admin/users/page.tsx`
- Create: `src/modules/admin/public.ts`
- Create: `src/modules/admin/services/moderation.ts`
- Create: `src/modules/admin/services/moderation.test.ts`
- Modify: `prisma/schema.prisma`
- Modify: `middleware.ts`
- Modify: `auth.ts`

- [ ] Decide whether admin is a true first-class role or a temporary protected email allowlist.
- [ ] Add the smallest useful moderation model: flag project, flag user, deactivate listing, resolve dispute, audit note.
- [ ] Create admin-only routes and auth guards.
- [ ] Add moderation summaries for suspicious or incomplete listings.
- [ ] Avoid building a large back-office prematurely; keep the first pass focused on safety and support operations.
- [ ] Add tests for access control and moderation actions.
- [ ] Verify all role-protected routes after implementation.

## Task 6: Production Hardening

**Outcome:** The system becomes safer to deploy and operate with real users and real data.

**Files:**
- Create: `src/modules/shared/services/health-check.ts`
- Create: `src/modules/shared/services/health-check.test.ts`
- Create: `src/modules/shared/services/audit-log.ts`
- Create: `src/modules/shared/services/audit-log.test.ts`
- Modify: `src/app/api/health/route.ts`
- Modify: `DEPLOYMENT.md`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `prisma/seed.ts`

- [ ] Upgrade health checks to distinguish app-up from dependencies-healthy: database reachable, AI configured, migrations applied if needed.
- [ ] Separate demo seed flow from production deployment flow so production deploy does not imply destructive reseeding.
- [ ] Add basic audit logging for high-risk actions: accept candidate, reject candidate, submit deliverable, complete project, evaluation.
- [ ] Add minimal rate limiting and request protection on sensitive public endpoints if traffic risk is real.
- [ ] Add production environment documentation with required secrets and safe rollout commands.
- [ ] Verify build and boot flow with `npm run build` and `npm run ci:verify`.

## Recommended Delivery Order

1. Task 1: Student Discovery Flow Completion
2. Task 2: Collaboration and Delivery Loop
3. Task 3: Matching Quality and Trust Layer
4. Task 4: SME and Student Operational Dashboards
5. Task 6: Production Hardening
6. Task 5: Admin, Moderation, and Dispute Operations

Rationale:

- Tasks 1 and 2 close the biggest product gaps in the core loop.
- Tasks 3 and 4 improve platform usefulness and credibility without changing the product category.
- Task 6 reduces deployment and operational risk before wider usage.
- Task 5 is important, but can follow once the marketplace loop is worth governing.

## Phase-Based Release View

### Phase 1: Must Have Release

- Student project detail page
- Explicit application states
- Revision request and resubmission flow
- Notification/event feed for key lifecycle actions
- Real dashboard metrics
- Real profile completion score

### Phase 2: Should Have Release

- Matching explanations
- Reputation and trust signals
- Saved projects and better filtering
- Admin moderation basics

### Phase 3: Nice To Have Release

- Billing/contracts
- Advanced analytics and funnel reporting
- Deeper integrations with email, object storage, and scheduling

## Verification Standard For Each Follow-Up Plan

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:architecture`
- `npm run check:ui-imports`

## Handoff

This roadmap should now branch into separate implementation plans, one subsystem at a time. Start with Task 1 unless product strategy says collaboration is the more urgent differentiator.
