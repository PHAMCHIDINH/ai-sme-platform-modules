# Investor Demo Product Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a phased redesign of the demo-facing product surfaces so the app feels brighter, more professional, and more investor-ready while preserving the current youthful pastel/neo identity.

**Architecture:** Keep core product logic and module boundaries intact, but add a thin investor-demo content/presenter layer plus a small set of shared marketing/dashboard UI primitives. Landing, SME, student, and impact surfaces should consume those helpers instead of hardcoding copy and display logic repeatedly. Implement new pure helpers with @superpowers/test-driven-development and verify all claims with @superpowers/verification-before-completion plus manual browser checks.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Prisma, NextAuth, Vitest

---

## File Structure Lock-In

### New files
- `src/modules/shared/services/investor-demo-content.ts`
  Responsibility: central source for investor-facing hero copy, impact metrics, case-study snippets, and CTA configuration used across landing and impact surfaces.
- `src/modules/shared/services/investor-demo-content.test.ts`
  Responsibility: verify required narrative sections, CTA targets, and impact-metric shape stay intact.
- `src/modules/matching/services/presenter.ts`
  Responsibility: convert raw match scores into investor-readable/student-readable labels, tones, and helper copy.
- `src/modules/matching/services/presenter.test.ts`
  Responsibility: lock score band behavior and prevent decorative/meaningless AI labels.
- `src/modules/shared/ui/marketing-section.tsx`
  Responsibility: shared section shell for landing/about/impact blocks with consistent spacing and framing.
- `src/modules/shared/ui/marketing-hero-stat.tsx`
  Responsibility: reusable hero/stat card for landing and impact metrics.
- `src/modules/shared/ui/narrative-metric-card.tsx`
  Responsibility: dashboard/impact stat card with stronger investor-demo hierarchy.
- `src/modules/shared/ui/highlight-list.tsx`
  Responsibility: reusable list block for “problem”, “value”, and “proof” bullets without repeating ad-hoc markup.
- `src/app/impact/page.tsx`
  Responsibility: dedicated investor-facing impact layer with metrics, case-study proof, and demo CTA handoff.

### Modified files
- `src/app/globals.css`
  Responsibility: brighten the global theme, reduce background noise, and add shared surface utilities.
- `src/app/layout.tsx`
  Responsibility: upgrade metadata/title/description to match the investor-demo thesis.
- `components/layout/navbar.tsx`
  Responsibility: align top-level marketing navigation and CTA labels with investor-facing storytelling.
- `components/layout/dashboard-sidebar.tsx`
  Responsibility: make dashboard navigation feel more polished and consistent with the new surface language.
- `components/layout/header.tsx`
  Responsibility: align dashboard header tone, badges, and action styling with the refreshed system.
- `src/app/page.tsx`
  Responsibility: replace the current homepage with the investor-facing landing narrative.
- `src/app/(dashboard)/layout.tsx`
  Responsibility: refresh dashboard chrome/background rhythm to match the new system.
- `src/app/(dashboard)/sme/dashboard/page.tsx`
  Responsibility: turn the SME dashboard into a narrative dashboard that proves real demand intake.
- `src/app/(dashboard)/sme/projects/new/page.tsx`
  Responsibility: reposition the AI-assisted flow as a polished “problem intake engine”.
- `src/app/(dashboard)/student/dashboard/page.tsx`
  Responsibility: shift the student dashboard toward “market-readiness” storytelling.
- `src/app/(dashboard)/student/projects/page.tsx`
  Responsibility: make matching results more interpretable and investor-demo friendly.
- `src/modules/shared/services/app-data.ts`
  Responsibility: enrich selectors/aggregates for new dashboard and impact summaries.
- `src/modules/shared/public.ts`
  Responsibility: export new investor-demo content helpers.
- `src/modules/shared/ui/public.ts`
  Responsibility: export the new shared marketing/dashboard primitives.
- `src/app/about/page.tsx`
  Responsibility: secondary polish so supporting narrative pages do not feel visually behind the landing.
- `src/app/quality-assurance/page.tsx`
  Responsibility: secondary polish and tone alignment with the new brighter investor-facing system.
- `src/app/ai-standardization/page.tsx`
  Responsibility: secondary polish for the AI proof surface so it matches the new demo story.

---

### Task 0: Baseline and Safety Check

**Files:**
- Verify only (no code changes)

- [ ] **Step 1: Snapshot the current quality baseline**

Run:
```bash
npm run typecheck
```
Expected: PASS, or capture any pre-existing failures before redesign work starts.

- [ ] **Step 2: Snapshot the current demo-facing tests**

Run:
```bash
npm test -- src/modules/project/services/presenter.test.ts src/modules/auth/services/session.test.ts
```
Expected: PASS, giving a small pre-change baseline for existing runtime logic.

- [ ] **Step 3: Inventory the current demo-facing routes**

Run:
```bash
rg -n "export default function|export default async function" src/app/page.tsx src/app/about/page.tsx src/app/quality-assurance/page.tsx src/app/ai-standardization/page.tsx 'src/app/(dashboard)/sme/dashboard/page.tsx' 'src/app/(dashboard)/sme/projects/new/page.tsx' 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/student/projects/page.tsx'
```
Expected: exact surface list to keep phase scope focused.

- [ ] **Step 4: Commit empty checkpoint**

Run:
```bash
git commit --allow-empty -m "chore: checkpoint before investor demo polish"
```

---

### Task 1: Add Investor-Demo Content and Matching Presenter Helpers

**Files:**
- Create: `src/modules/shared/services/investor-demo-content.ts`
- Create: `src/modules/shared/services/investor-demo-content.test.ts`
- Create: `src/modules/matching/services/presenter.ts`
- Create: `src/modules/matching/services/presenter.test.ts`
- Modify: `src/modules/shared/public.ts`
- Test: `src/modules/shared/services/investor-demo-content.test.ts`
- Test: `src/modules/matching/services/presenter.test.ts`

- [ ] **Step 1: Write failing tests for required investor-demo content shape**

Create `src/modules/shared/services/investor-demo-content.test.ts` with cases like:
```ts
import { describe, expect, it } from "vitest";
import { investorDemoContent } from "@/modules/shared";

describe("investor demo content", () => {
  it("includes demo and impact CTAs in hero", () => {
    expect(investorDemoContent.hero.ctas.map((item) => item.href)).toEqual(["/#demo-flow", "/impact"]);
  });

  it("defines four impact metrics", () => {
    expect(investorDemoContent.impact.metrics).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Write failing tests for score-band interpretation**

Create `src/modules/matching/services/presenter.test.ts` with cases like:
```ts
import { describe, expect, it } from "vitest";
import { describeMatchScore } from "@/modules/matching/services/presenter";

describe("matching presenter", () => {
  it("maps scores >= 80 to the strongest fit band", () => {
    expect(describeMatchScore(84)).toMatchObject({ label: "Rất phù hợp", tone: "strong" });
  });

  it("maps scores below 50 to an improvement-oriented band", () => {
    expect(describeMatchScore(42)).toMatchObject({ label: "Cần bù kỹ năng", tone: "weak" });
  });
});
```

- [ ] **Step 3: Run tests to verify RED**

Run:
```bash
npm test -- src/modules/shared/services/investor-demo-content.test.ts src/modules/matching/services/presenter.test.ts
```
Expected: FAIL because modules do not exist yet.

- [ ] **Step 4: Implement minimal content and presenter helpers**

Create `investor-demo-content.ts` with a typed structure like:
```ts
export const investorDemoContent = {
  hero: {
    eyebrow: "Market Bridge Thesis",
    title: "Thu hẹp khoảng cách giữa đào tạo và nhu cầu thị trường",
    description: "...",
    ctas: [
      { label: "Xem demo nền tảng", href: "/#demo-flow" },
      { label: "Xem tác động xã hội", href: "/impact" },
    ],
  },
  impact: {
    metrics: [
      { label: "Dự án thực chiến", value: "128+" },
      { label: "Sinh viên có portfolio thật", value: "540+" },
      { label: "SME được hỗ trợ", value: "76+" },
      { label: "Tỷ lệ readiness uplift", value: "63%" },
    ],
  },
} as const;
```

Create `presenter.ts` with:
```ts
export function describeMatchScore(score: number) {
  if (score >= 80) return { label: "Rất phù hợp", tone: "strong", helper: "Bạn đã khá sát với nhu cầu thực tế." } as const;
  if (score >= 60) return { label: "Tiềm năng cao", tone: "medium", helper: "Phù hợp để ứng tuyển và hoàn thiện thêm đầu ra." } as const;
  return { label: "Cần bù kỹ năng", tone: "weak", helper: "Nên xem đây là cơ hội học hỏi có định hướng." } as const;
}
```

- [ ] **Step 5: Export new helpers**

Update:
```ts
// src/modules/shared/public.ts
export * from "./services/investor-demo-content";
```

- [ ] **Step 6: Run tests to verify GREEN**

Run:
```bash
npm test -- src/modules/shared/services/investor-demo-content.test.ts src/modules/matching/services/presenter.test.ts
```
Expected: PASS.

- [ ] **Step 7: Commit**

Run:
```bash
git add src/modules/shared/services/investor-demo-content.ts src/modules/shared/services/investor-demo-content.test.ts src/modules/matching/services/presenter.ts src/modules/matching/services/presenter.test.ts src/modules/shared/public.ts
git commit -m "feat: add investor demo content and matching presenters"
```

---

### Task 2: Build the Shared Bright Editorial Neo Foundation

**Files:**
- Create: `src/modules/shared/ui/marketing-section.tsx`
- Create: `src/modules/shared/ui/marketing-hero-stat.tsx`
- Create: `src/modules/shared/ui/narrative-metric-card.tsx`
- Create: `src/modules/shared/ui/highlight-list.tsx`
- Modify: `src/modules/shared/ui/public.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `components/layout/navbar.tsx`
- Modify: `components/layout/dashboard-sidebar.tsx`
- Modify: `components/layout/header.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Verify: browser render for `/`

- [ ] **Step 1: Create shared surface components**

Add lightweight primitives such as:
```tsx
export function MarketingSection({ kicker, title, description, children }: Props) {
  return (
    <section className="rounded-2xl border-2 border-black bg-white/90 p-6 shadow-neo-md md:p-10">
      {/* header copy */}
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Export the new UI primitives**

Update:
```ts
export * from "./marketing-section";
export * from "./marketing-hero-stat";
export * from "./narrative-metric-card";
export * from "./highlight-list";
```

- [ ] **Step 3: Brighten global tokens and utilities**

Update `src/app/globals.css` to:
```css
:root {
  --background: 45 100% 96%;
  --card: 0 0% 100%;
  --primary: 200 100% 88%;
  --accent: 320 100% 88%;
  --muted: 54 100% 84%;
}

.surface-panel { @apply rounded-2xl border-2 border-black bg-white/95 shadow-neo-md; }
.metric-panel { @apply rounded-2xl border-2 border-black bg-white p-5 shadow-neo-sm; }
.editorial-title { @apply text-4xl font-black tracking-tight md:text-6xl; }
```

- [ ] **Step 4: Align layout metadata and navigation copy**

Update metadata and navbar CTAs so they speak to the investor-demo thesis, for example:
```ts
export const metadata = {
  title: "VnSMEMatch | Thu hẹp khoảng cách giữa đào tạo và nhu cầu thị trường",
  description: "Nền tảng biến nhu cầu SME thành dự án thực chiến cho sinh viên.",
};
```

- [ ] **Step 5: Refresh the dashboard shell**

Adjust sidebar/header/dashboard layout to use the brighter surfaces and calmer spacing, without changing route logic.

- [ ] **Step 6: Run typecheck to catch shared component mistakes**

Run:
```bash
npm run typecheck
```
Expected: PASS.

- [ ] **Step 7: Run dev server and verify the shell visually**

Run:
```bash
npm run dev
```
Expected: landing and dashboard chrome load without runtime errors; shared surfaces render consistently on desktop and mobile widths.

- [ ] **Step 8: Commit**

Run:
```bash
git add src/modules/shared/ui/public.ts src/modules/shared/ui/marketing-section.tsx src/modules/shared/ui/marketing-hero-stat.tsx src/modules/shared/ui/narrative-metric-card.tsx src/modules/shared/ui/highlight-list.tsx src/app/globals.css src/app/layout.tsx components/layout/navbar.tsx components/layout/dashboard-sidebar.tsx components/layout/header.tsx 'src/app/(dashboard)/layout.tsx'
git commit -m "feat: add bright editorial neo design foundation"
```

---

### Task 3: Implement Phase 1 Investor Landing

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `components/layout/navbar.tsx`
- Read/Use: `src/modules/shared/services/investor-demo-content.ts`
- Read/Use: `src/modules/shared/ui/marketing-section.tsx`
- Read/Use: `src/modules/shared/ui/marketing-hero-stat.tsx`
- Verify: browser render for `/`

- [ ] **Step 1: Replace the current homepage with the investor thesis layout**

Restructure `src/app/page.tsx` into sections:
```tsx
<Hero />
<ProblemSection />
<HowItWorksSection />
<ImpactSection />
<ProofAndCtaSection />
```

- [ ] **Step 2: Wire landing copy to `investorDemoContent`**

Use shared content instead of inline strings wherever the same thesis/metric blocks repeat.

- [ ] **Step 3: Change CTA behavior from generic signup-first to demo/impact-first**

Ensure prominent CTAs become:
```ts
[{ label: "Xem demo nền tảng" }, { label: "Xem tác động xã hội" }]
```

- [ ] **Step 4: Keep role-based registration accessible as secondary actions**

Preserve direct student/SME registration links, but demote them below the thesis and proof blocks.

- [ ] **Step 5: Verify landing manually**

Check:
- hero reads clearly in under 10 seconds
- problem and mechanism are understandable without scrolling fatigue
- page still feels like the same product family

- [ ] **Step 6: Run lint and typecheck**

Run:
```bash
npm run lint
npm run typecheck
```
Expected: PASS.

- [ ] **Step 7: Commit**

Run:
```bash
git add src/app/page.tsx components/layout/navbar.tsx
git commit -m "feat: redesign investor-facing landing page"
```

---

### Task 4: Implement Phase 2 SME Demo Flow

**Files:**
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/sme/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/sme/projects/new/page.tsx`
- Optional Modify: `src/app/(dashboard)/sme/projects/page.tsx`
- Verify: browser render for `/sme/dashboard`, `/sme/projects/new`

- [ ] **Step 1: Enrich SME dashboard data selectors**

Extend `findSmeDashboardMetrics` to return more narrative-friendly slices, for example:
```ts
{
  activeProjects,
  totalApplicants,
  recentProjects,
  openProjects,
  submittedProjects,
  candidateVelocity,
}
```

- [ ] **Step 2: Update SME dashboard to become a narrative dashboard**

Refactor `src/app/(dashboard)/sme/dashboard/page.tsx` so it emphasizes:
- demand pipeline
- candidate flow
- recent business problems
- strong “Tạo dự án” entry

- [ ] **Step 3: Reposition the project creation screen as a problem intake engine**

Update `src/app/(dashboard)/sme/projects/new/page.tsx` so the left AI pane and right structured pane feel like:
```tsx
<ProblemIntakeHero />
<IntakeProgress />
<StructuredOpportunityPreview />
```

- [ ] **Step 4: Improve empty and near-empty states**

Ensure both SME dashboard and projects list communicate:
- why the surface matters
- what action the SME should take next
- what value comes from doing it

- [ ] **Step 5: Run targeted verification**

Run:
```bash
npm run typecheck
```
Then manually verify `/sme/dashboard` and `/sme/projects/new`.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/modules/shared/services/app-data.ts 'src/app/(dashboard)/sme/dashboard/page.tsx' 'src/app/(dashboard)/sme/projects/new/page.tsx' 'src/app/(dashboard)/sme/projects/page.tsx'
git commit -m "feat: upgrade SME demo-facing flow"
```

---

### Task 5: Implement Phase 3 Student Demo Flow

**Files:**
- Modify: `src/modules/shared/services/app-data.ts`
- Modify: `src/app/(dashboard)/student/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/student/projects/page.tsx`
- Read/Use: `src/modules/matching/services/presenter.ts`
- Verify: browser render for `/student/dashboard`, `/student/projects`

- [ ] **Step 1: Extend student summary data if needed**

Add any missing counts or aggregates in `app-data.ts` needed to frame “market readiness”, for example:
```ts
{
  profileCompletion,
  activeProjects,
  completedProjects,
  avgRating,
  invitationCount,
}
```

- [ ] **Step 2: Refactor the student dashboard around readiness, not just activity**

Update `src/app/(dashboard)/student/dashboard/page.tsx` to prioritize:
- current opportunities
- readiness/progression
- evidence of completed work
- clear next actions

- [ ] **Step 3: Make project discovery explain why a project matters**

Update `src/app/(dashboard)/student/projects/page.tsx` to use `describeMatchScore` and render:
```tsx
<MatchBadge label={match.label} />
<p>{match.helper}</p>
```

- [ ] **Step 4: Improve empty/profile-incomplete states**

Replace generic warnings with guidance that connects profile completion to better access to market-relevant work.

- [ ] **Step 5: Run targeted tests and typecheck**

Run:
```bash
npm test -- src/modules/matching/services/presenter.test.ts
npm run typecheck
```
Expected: PASS.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/modules/shared/services/app-data.ts 'src/app/(dashboard)/student/dashboard/page.tsx' 'src/app/(dashboard)/student/projects/page.tsx' src/modules/matching/services/presenter.ts src/modules/matching/services/presenter.test.ts
git commit -m "feat: upgrade student demo-facing flow"
```

---

### Task 6: Implement Phase 4 Impact Layer

**Files:**
- Create: `src/app/impact/page.tsx`
- Modify: `components/layout/navbar.tsx`
- Read/Use: `src/modules/shared/services/investor-demo-content.ts`
- Read/Use: `src/modules/shared/ui/marketing-section.tsx`
- Read/Use: `src/modules/shared/ui/narrative-metric-card.tsx`
- Verify: browser render for `/impact`

- [ ] **Step 1: Create the dedicated impact page**

Build `src/app/impact/page.tsx` with sections like:
```tsx
<ImpactHero />
<ImpactMetricsGrid />
<CaseStudySection />
<ScalePotentialSection />
<DemoCtaBand />
```

- [ ] **Step 2: Use only plausible illustrative metrics**

Source all demo-only numbers from `investorDemoContent` so they stay internally consistent across the landing and impact page.

- [ ] **Step 3: Add navigation entry points**

Expose `/impact` via navbar and landing CTA so the investor story remains easy to follow live.

- [ ] **Step 4: Verify desktop and mobile layouts manually**

Check:
- hero metrics fit on mobile
- case-study cards stack cleanly
- CTA band remains visible and credible

- [ ] **Step 5: Run lint and typecheck**

Run:
```bash
npm run lint
npm run typecheck
```
Expected: PASS.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/app/impact/page.tsx components/layout/navbar.tsx src/modules/shared/services/investor-demo-content.ts
git commit -m "feat: add investor impact layer"
```

---

### Task 7: Implement Phase 5 Secondary Polish and Final Verification

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/quality-assurance/page.tsx`
- Modify: `src/app/ai-standardization/page.tsx`
- Verify: browser render for supporting marketing pages

- [ ] **Step 1: Align supporting narrative pages to the new system**

Refactor supporting pages to reuse the brighter shared surfaces instead of older, noisier one-off layouts.

- [ ] **Step 2: Remove the most visually inconsistent blocks**

Replace the loudest outliers first:
- overly saturated banner blocks
- cramped copy sections
- CTA buttons that no longer match landing/dashboards

- [ ] **Step 3: Run full quality gates**

Run:
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
Expected: PASS across all commands.

- [ ] **Step 4: Run architecture checks**

Run:
```bash
npm run check:architecture
npm run check:ui-imports
```
Expected: PASS.

- [ ] **Step 5: Manual verification sweep**

Verify these routes in the browser:
- `/`
- `/impact`
- `/about`
- `/quality-assurance`
- `/ai-standardization`
- `/sme/dashboard`
- `/sme/projects/new`
- `/student/dashboard`
- `/student/projects`

Expected: no runtime errors, consistent visual language, clear investor-demo narrative.

- [ ] **Step 6: Commit**

Run:
```bash
git add src/app/about/page.tsx src/app/quality-assurance/page.tsx src/app/ai-standardization/page.tsx
git commit -m "feat: complete investor demo product polish"
```
