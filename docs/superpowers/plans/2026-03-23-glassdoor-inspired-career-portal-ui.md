# Glassdoor-Inspired Career Portal UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public and authenticated UI so the product feels like a calmer, more credible, Glassdoor-inspired career portal for SME projects and student talent.

**Architecture:** Keep the existing Next.js route structure and product logic intact, but rebuild the UI around a shared portal design system: updated global tokens, a search-led public shell, a cleaner dashboard shell, and reusable listing/profile/metric patterns. Implement the redesign from shared primitives outward so landing, auth, discovery, dashboard, and detail pages converge on one system instead of diverging further.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, NextAuth, React Query, Vitest

---

## File Structure Lock-In

### New files
- `src/modules/shared/ui/portal-search-hero.tsx`
  Responsibility: reusable hero block with headline, search fields, trust metrics, and taxonomy/browse links for the landing page and future public discovery surfaces.
- `src/modules/shared/ui/discovery-metric-strip.tsx`
  Responsibility: compact metric row used by landing and dashboard summaries for trust signals and marketplace stats.
- `src/modules/shared/ui/discovery-result-card.tsx`
  Responsibility: standardized card shell for search/listing results with title, metadata, badges, score treatment, and CTA slot.
- `src/modules/shared/ui/profile-summary-panel.tsx`
  Responsibility: reusable profile identity/summary block for SME and student profile/detail pages.
- `src/modules/shared/ui/filter-sidebar.tsx`
  Responsibility: lightweight filter shell for discovery routes, with desktop sidebar and mobile sheet-friendly content.

### Modified files
- `src/app/globals.css`
  Responsibility: replace the current neo-brutalist visual tokens with the calmer career-portal token system and shared layout utilities.
- `src/app/layout.tsx`
  Responsibility: align metadata and font/body setup with the new portal presentation.
- `components/layout/navbar.tsx`
  Responsibility: convert the public navigation into search/taxonomy-led marketplace navigation.
- `components/layout/dashboard-sidebar.tsx`
  Responsibility: refresh authenticated navigation into a cleaner portal workspace sidebar.
- `components/layout/dashboard-shell.tsx`
  Responsibility: ensure shared dashboard spacing and shell behavior align with the new design system if this shell is used by current or future routes.
- `components/layout/header.tsx`
  Responsibility: align authenticated top bar states and summary cues with the portal shell.
- `components/layout/sidebar.tsx`
  Responsibility: keep alternate sidebar shell visually consistent if still used by any route.
- `src/app/page.tsx`
  Responsibility: rebuild landing as a search-led public discovery hub.
- `src/app/(auth)/layout.tsx`
  Responsibility: align auth shell background and spacing with the portal system.
- `src/app/(auth)/login/page.tsx`
  Responsibility: restyle login to match the calmer public portal.
- `src/app/(auth)/register/page.tsx`
  Responsibility: restyle register and role selection to match the calmer public portal.
- `src/app/(dashboard)/layout.tsx`
  Responsibility: replace the current colorful dashboard frame with the portal workspace shell.
- `src/app/(dashboard)/student/dashboard/page.tsx`
  Responsibility: shift student dashboard to action-oriented summary plus recommended opportunities.
- `src/app/(dashboard)/sme/dashboard/page.tsx`
  Responsibility: shift SME dashboard to action-oriented summary plus candidate/project activity.
- `src/app/(dashboard)/student/projects/page.tsx`
  Responsibility: rebuild student project discovery as a filter-and-results experience.
- `src/app/(dashboard)/sme/students/page.tsx`
  Responsibility: rebuild SME student discovery as a symmetric filter-and-results experience.
- `src/app/(dashboard)/student/profile/page.tsx`
  Responsibility: restyle student profile as a marketplace profile page.
- `src/app/(dashboard)/sme/profile/page.tsx`
  Responsibility: restyle SME profile as a marketplace profile page.
- `src/app/(dashboard)/student/projects/[id]/page.tsx`
  Responsibility: align project detail with the new listing/detail system.
- `src/app/(dashboard)/sme/projects/[id]/page.tsx`
  Responsibility: align SME project detail with the same portal detail language.
- `src/modules/shared/ui/public.ts`
  Responsibility: export new shared portal components.
- `src/modules/shared/public.ts`
  Responsibility: expose any shared portal UI exports that routes currently consume through the module public barrel.

### Existing files to inspect while implementing
- `src/app/(dashboard)/student/projects/invitation-card.tsx`
- `src/app/(dashboard)/student/projects/application-status-badge.tsx`
- `src/app/(dashboard)/student/projects/apply-button.tsx`
- `src/app/(dashboard)/sme/projects/[id]/candidates/candidate-actions.tsx`
- `src/app/(dashboard)/sme/projects/[id]/candidates/invite-action.tsx`
- `src/modules/shared/ui/button.tsx`
- `src/modules/shared/ui/card.tsx`
- `src/modules/shared/ui/badge.tsx`
- `src/modules/shared/ui/input.tsx`
- `src/modules/shared/ui/table.tsx`

---

### Task 0: Baseline and Scope Guard

**Files:**
- Verify only (no code changes)

- [ ] **Step 1: Snapshot the current typecheck baseline**

Run:
```bash
npm run typecheck
```
Expected: PASS, or capture all pre-existing failures before UI work begins.

- [ ] **Step 2: Snapshot the current test baseline**

Run:
```bash
npm test -- src/modules/project/services/presenter.test.ts src/modules/matching/services/presenter.test.ts src/modules/shared/services/investor-demo-content.test.ts
```
Expected: PASS, confirming core presenter/content helpers are stable before route redesign.

- [ ] **Step 3: Inventory the exact redesign route set**

Run:
```bash
rg -n "export default" src/app/page.tsx 'src/app/(auth)/login/page.tsx' 'src/app/(auth)/register/page.tsx' 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/sme/dashboard/page.tsx' 'src/app/(dashboard)/student/projects/page.tsx' 'src/app/(dashboard)/sme/students/page.tsx' 'src/app/(dashboard)/student/profile/page.tsx' 'src/app/(dashboard)/sme/profile/page.tsx' 'src/app/(dashboard)/student/projects/[id]/page.tsx' 'src/app/(dashboard)/sme/projects/[id]/page.tsx'
```
Expected: Exact surface list for the redesign scope described in the approved spec.

- [ ] **Step 4: Commit empty checkpoint**

Run:
```bash
git commit --allow-empty -m "chore: checkpoint before career portal ui redesign"
```

---

### Task 1: Establish Shared Portal UI Primitives

**Files:**
- Create: `src/modules/shared/ui/portal-search-hero.tsx`
- Create: `src/modules/shared/ui/discovery-metric-strip.tsx`
- Create: `src/modules/shared/ui/discovery-result-card.tsx`
- Create: `src/modules/shared/ui/profile-summary-panel.tsx`
- Create: `src/modules/shared/ui/filter-sidebar.tsx`
- Modify: `src/modules/shared/ui/public.ts`
- Modify: `src/modules/shared/public.ts`
- Test: smoke render via `npm run build`

- [ ] **Step 1: Create the search hero primitive**

Create `src/modules/shared/ui/portal-search-hero.tsx` with a typed API similar to:
```tsx
type SearchField = { label: string; placeholder: string };
type Metric = { label: string; value: string; helper?: string };
type BrowseLink = { label: string; href: string };

export function PortalSearchHero(props: {
  eyebrow: string;
  title: string;
  description: string;
  fields: SearchField[];
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  metrics: Metric[];
  browseLinks: BrowseLink[];
}) {
  // search-led hero shell
}
```

- [ ] **Step 2: Create the compact metric strip**

Create `src/modules/shared/ui/discovery-metric-strip.tsx` for reusing trust stats on landing and dashboards.

- [ ] **Step 3: Create the standardized result card**

Create `src/modules/shared/ui/discovery-result-card.tsx` with slots for:
- eyebrow / identity
- title
- summary
- metadata row
- badges / skills
- score pill
- action area

- [ ] **Step 4: Create shared profile and filter shells**

Create:
- `profile-summary-panel.tsx` for consistent header + summary blocks
- `filter-sidebar.tsx` for desktop sidebar content and mobile-friendly filter container

- [ ] **Step 5: Export all new portal primitives**

Update:
```ts
// src/modules/shared/ui/public.ts
export * from "./portal-search-hero";
export * from "./discovery-metric-strip";
export * from "./discovery-result-card";
export * from "./profile-summary-panel";
export * from "./filter-sidebar";
```

Mirror any necessary exports through `src/modules/shared/public.ts`.

- [ ] **Step 6: Verify the new primitives compile**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 7: Commit**

Run:
```bash
git add src/modules/shared/ui/portal-search-hero.tsx src/modules/shared/ui/discovery-metric-strip.tsx src/modules/shared/ui/discovery-result-card.tsx src/modules/shared/ui/profile-summary-panel.tsx src/modules/shared/ui/filter-sidebar.tsx src/modules/shared/ui/public.ts src/modules/shared/public.ts
git commit -m "feat: add shared portal ui primitives"
```

---

### Task 2: Replace Global Tokens and Shell Styling

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `components/layout/navbar.tsx`
- Modify: `components/layout/dashboard-sidebar.tsx`
- Modify: `components/layout/dashboard-shell.tsx`
- Modify: `components/layout/header.tsx`
- Modify: `components/layout/sidebar.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/(auth)/layout.tsx`
- Verify: browser render for `/login` and a dashboard route

- [ ] **Step 1: Rewrite global design tokens**

Update `src/app/globals.css` to:
- remove the heavy grid/radial neo-brutalist background
- replace thick black-border utilities with softer surface utilities
- define portal color tokens for background, card, muted surfaces, primary action, score states, and subtle borders
- add shared utilities such as `portal-shell`, `portal-panel`, `portal-metric`, `portal-kicker`, `portal-listing-grid`

- [ ] **Step 2: Align root layout metadata and body framing**

Update `src/app/layout.tsx` metadata and body/frame assumptions so the app presents itself as a project discovery portal rather than a demo board.

- [ ] **Step 3: Rebuild the public navbar**

Update `components/layout/navbar.tsx` to use:
- cleaner logo treatment
- marketplace taxonomy links
- calmer CTA styling
- less ornamental motion and fewer loud color blocks

- [ ] **Step 4: Rebuild the authenticated shell**

Update:
- `components/layout/dashboard-sidebar.tsx`
- `components/layout/dashboard-shell.tsx`
- `components/layout/header.tsx`
- `components/layout/sidebar.tsx`
- `src/app/(dashboard)/layout.tsx`

so the workspace uses:
- quieter sidebar navigation
- better active states
- consistent spacing
- summary-oriented header treatment
- no leftover neo-brutalist shadows or black borders

- [ ] **Step 5: Align auth layout background**

Update `src/app/(auth)/layout.tsx` so auth pages use the same light portal framing as the landing page.

- [ ] **Step 6: Verify core shells**

Run:
```bash
npm run build
```
Expected: PASS, proving the shared shell refactor compiles through public and authenticated layouts.

- [ ] **Step 7: Manual shell check**

Run:
```bash
npm run dev
```
Expected: `/`, `/login`, and one authenticated page all share the same calmer visual DNA.

- [ ] **Step 8: Commit**

Run:
```bash
git add src/app/globals.css src/app/layout.tsx components/layout/navbar.tsx components/layout/dashboard-sidebar.tsx components/layout/dashboard-shell.tsx components/layout/header.tsx components/layout/sidebar.tsx 'src/app/(dashboard)/layout.tsx' 'src/app/(auth)/layout.tsx'
git commit -m "feat: add career portal layout system"
```

---

### Task 3: Rebuild the Landing and Auth Surfaces

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Test: build + manual browser review

- [ ] **Step 1: Rewrite the landing hero around search**

Update `src/app/page.tsx` to lead with:
- concise headline
- search-led hero using `PortalSearchHero`
- trust metric strip
- browse taxonomy links
- featured project and SME content blocks
- role-based CTA handoff

- [ ] **Step 2: Remove loud marketing-panel patterns**

Replace current poster-like badges, thick borders, and pastel slabs with:
- lighter cards
- compact section headers
- clearer browse/taxonomy sections
- more consistent metadata presentation

- [ ] **Step 3: Restyle login**

Update `src/app/(auth)/login/page.tsx` to:
- simplify logo treatment
- reduce decorative chrome
- improve form hierarchy and CTA clarity
- inherit the portal spacing/token system

- [ ] **Step 4: Restyle register**

Update `src/app/(auth)/register/page.tsx` to:
- make role selection cleaner and less loud
- align form and CTA styling with login
- keep role choice obvious without using the old neo-brutalist blocks

- [ ] **Step 5: Verify public/auth surfaces**

Run:
```bash
npm run build
```
Expected: PASS.

- [ ] **Step 6: Manual browser review**

Run:
```bash
npm run dev
```
Expected:
- landing feels search-led and portal-like
- login/register look like part of the same product

- [ ] **Step 7: Commit**

Run:
```bash
git add src/app/page.tsx 'src/app/(auth)/login/page.tsx' 'src/app/(auth)/register/page.tsx'
git commit -m "feat: redesign landing and auth as career portal surfaces"
```

---

### Task 4: Rebuild Discovery Flows for Students and SMEs

**Files:**
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Modify: `src/app/(dashboard)/sme/students/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/invitation-card.tsx`
- Modify: `src/app/(dashboard)/student/projects/application-status-badge.tsx`
- Modify: `src/app/(dashboard)/student/projects/apply-button.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/candidates/candidate-actions.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/candidates/invite-action.tsx`
- Verify: manual interaction checks

- [ ] **Step 1: Refactor student discovery around sidebar + result cards**

Update `src/app/(dashboard)/student/projects/page.tsx` to use:
- a summary/search header
- optional filter sidebar shell
- standardized result cards
- quieter status chips and match-score treatment

- [ ] **Step 2: Preserve existing behavior while replacing presentation**

Keep current logic for:
- ranking
- invitation visibility
- apply eligibility
- application states

Only rewrite presentation and component composition.

- [ ] **Step 3: Normalize invitation and status components**

Update:
- `invitation-card.tsx`
- `application-status-badge.tsx`
- `apply-button.tsx`

so they visually match the new discovery cards and no longer look like separate design systems.

- [ ] **Step 4: Refactor SME student discovery symmetrically**

Update `src/app/(dashboard)/sme/students/page.tsx` to match the same portal discovery language:
- compact search/filter zone
- calmer result cards
- consistent score treatment
- cleaner invite modal styling

- [ ] **Step 5: Normalize SME candidate actions**

Update:
- `candidate-actions.tsx`
- `invite-action.tsx`

to match the new button/modal conventions.

- [ ] **Step 6: Verify discovery routes compile**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 7: Manual discovery review**

Run:
```bash
npm run dev
```
Expected:
- student discovery and SME discovery feel like mirror flows
- filters, scores, and CTAs are easy to scan on desktop and mobile widths

- [ ] **Step 8: Commit**

Run:
```bash
git add 'src/app/(dashboard)/student/projects/page.tsx' 'src/app/(dashboard)/sme/students/page.tsx' 'src/app/(dashboard)/student/projects/invitation-card.tsx' 'src/app/(dashboard)/student/projects/application-status-badge.tsx' 'src/app/(dashboard)/student/projects/apply-button.tsx' 'src/app/(dashboard)/sme/projects/[id]/candidates/candidate-actions.tsx' 'src/app/(dashboard)/sme/projects/[id]/candidates/invite-action.tsx'
git commit -m "feat: redesign student and sme discovery flows"
```

---

### Task 5: Rebuild the Student and SME Dashboards

**Files:**
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/sme/dashboard/page.tsx`
- Optionally inspect: `src/modules/shared/services/app-data.ts`
- Verify: build + manual browser review

- [ ] **Step 1: Redesign student dashboard hierarchy**

Update `src/app/(dashboard)/student/dashboard/page.tsx` so the page emphasizes:
- recommended projects
- application/progress state
- profile completion
- proof/readiness metrics

- [ ] **Step 2: Redesign SME dashboard hierarchy**

Update `src/app/(dashboard)/sme/dashboard/page.tsx` so the page emphasizes:
- project pipeline
- candidate activity
- recent project performance
- next actions

- [ ] **Step 3: Keep data contracts stable first**

Prefer preserving the current data selectors. Only modify `src/modules/shared/services/app-data.ts` if an existing selector cannot support the new dashboard layout.

- [ ] **Step 4: Verify dashboards compile**

Run:
```bash
npm run build
```
Expected: PASS.

- [ ] **Step 5: Manual dashboard review**

Run:
```bash
npm run dev
```
Expected:
- both dashboards feel related to the discovery experience
- the UI reads as action-oriented rather than decorative

- [ ] **Step 6: Commit**

Run:
```bash
git add 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/sme/dashboard/page.tsx' src/modules/shared/services/app-data.ts
git commit -m "feat: redesign student and sme dashboards"
```

---

### Task 6: Align Profile and Detail Pages with the Portal System

**Files:**
- Modify: `src/app/(dashboard)/student/profile/page.tsx`
- Modify: `src/app/(dashboard)/sme/profile/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/[id]/page.tsx`
- Modify: `src/app/(dashboard)/sme/projects/[id]/page.tsx`
- Verify: manual browser review

- [ ] **Step 1: Rebuild profile headers and summary sections**

Update the student and SME profile pages to use:
- profile summary panel
- cleaner section grouping
- standardized tags and metadata
- quieter edit/form support states

- [ ] **Step 2: Rebuild detail-page headers**

Update both detail pages so they present:
- strong identity header
- metadata row
- score/status/action zone
- supporting sections beneath

- [ ] **Step 3: Remove leftover legacy visual patterns**

Check these pages for:
- thick black borders
- loud pastel slabs
- off-system button treatments
- mismatched empty states

Replace them with the shared portal components/utilities from earlier tasks.

- [ ] **Step 4: Verify profile/detail routes**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 5: Manual profile/detail review**

Run:
```bash
npm run dev
```
Expected:
- detail pages feel like continuations of discovery cards
- profiles feel like marketplace profiles, not admin forms

- [ ] **Step 6: Commit**

Run:
```bash
git add 'src/app/(dashboard)/student/profile/page.tsx' 'src/app/(dashboard)/sme/profile/page.tsx' 'src/app/(dashboard)/student/projects/[id]/page.tsx' 'src/app/(dashboard)/sme/projects/[id]/page.tsx'
git commit -m "feat: align profile and detail pages with portal ui"
```

---

### Task 7: Full Verification and Cleanup

**Files:**
- Verify only unless a final cleanup is required

- [ ] **Step 1: Run the full local quality gate**

Run:
```bash
npm run ci:verify
```
Expected: PASS.

- [ ] **Step 2: Perform final manual route sweep**

Run:
```bash
npm run dev
```
Expected manual checks:
- `/`
- `/login`
- `/register`
- `/student/dashboard`
- `/student/projects`
- `/student/projects/[id]`
- `/student/profile`
- `/sme/dashboard`
- `/sme/students`
- `/sme/projects/[id]`
- `/sme/profile`

- [ ] **Step 3: Fix any visual regression discovered in the sweep**

If a route still shows legacy styling, patch it before finalizing. Keep fixes scoped to shared tokens or the specific affected route.

- [ ] **Step 4: Capture final diff summary**

Run:
```bash
git status --short
git log --oneline -5
```
Expected: clear summary of redesign commits and remaining changes, if any.

- [ ] **Step 5: Commit final polish**

Run:
```bash
git add -A
git commit -m "feat: complete glassdoor-inspired career portal redesign"
```

