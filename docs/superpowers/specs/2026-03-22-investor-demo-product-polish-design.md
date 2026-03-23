# Investor Demo Product Polish Design (`ai-sme-platform-modules`)

Date: 2026-03-22  
Status: Approved Draft for Planning  
Scope: Redesign the demo-facing surface of the product so it feels brighter, more professional, and more investor-ready while preserving the project's youthful pastel/neo visual DNA.

## 1. Context

The current product already contains meaningful functional depth:
- role-based entry points for SME and student users
- AI-assisted project brief creation
- project discovery and matching
- application, progress, and evaluation flows

However, the demo-facing experience is still uneven for investor storytelling:
- the landing page explains features but does not strongly communicate the market-gap thesis
- dashboards feel product-internal rather than presentation-ready
- the SME and student flows do not clearly prove the social impact thesis in a few minutes
- the visual system has energy, but the product still reads closer to a student demo than an investable platform narrative

The core investor story to communicate is:

> The platform helps close the gap between education and market demand by converting real SME problems into practical project opportunities for students.

## 2. Objectives

- Make the product feel investor-demo ready: bright, polished, coherent, and credible.
- Preserve the existing youthful and distinctive UI character rather than replacing it with generic SaaS styling.
- Make the social impact thesis legible in the first minute of the demo.
- Restructure demo-facing screens so the walkthrough becomes story-led, not feature-led.
- Produce a phased implementation roadmap that allows incremental delivery without losing the big-picture design.

## 3. Non-Goals

- No attempt to redesign every operational screen in the first implementation phase.
- No changes to backend product scope purely for investor storytelling unless they materially improve the demo-facing experience.
- No major schema redesign or domain-model rewrite.
- No rebrand or visual identity replacement that abandons the current pastel + strong-border product feel.
- No attempt to make the app look like a conventional enterprise dashboard at the expense of personality.

## 4. Chosen Product Positioning

The product will be presented as:

**A market-bridge platform** that transforms raw SME needs into structured practical work, giving students earlier real-world experience and helping SMEs access digital transformation more easily.

This is intentionally different from positioning the app as:
- a simple student job board
- a generic matching marketplace
- a project management tool with AI features

The investor-facing narrative must prioritize:
1. the gap between education and real demand
2. the platform mechanism that bridges the gap
3. the repeatable social and economic value created when the system scales

## 5. Visual Direction

Chosen visual direction: **Bright Editorial Neo**

Desired visual qualities:
- brighter overall presentation
- more white and warm-light surfaces
- cleaner spacing and hierarchy
- stronger editorial headline treatment
- reduced visual noise
- preserved pastel accents and bold structural borders
- youthful, optimistic energy without looking childish

The visual direction should feel:
- more professional than the current baseline
- still recognizably connected to the current UI language
- appropriate for investor demo screenshots, presentation recordings, and live walkthroughs

### 5.1 Visual Principles

- Keep the current pastel family, but use it more selectively and with more white breathing room.
- Preserve strong edge definition and tactile cards/buttons.
- Increase clarity of information hierarchy before adding ornamental polish.
- Treat large headline and metrics blocks as editorial statements, not just UI widgets.
- Use color to reinforce meaning:
  - cyan for platform/system intelligence
  - yellow for opportunity/attention
  - pink for human narrative / transformation
  - lime for positive momentum / action / readiness

### 5.2 System-Level UI Changes

- Refine global background treatment to be lighter and less busy.
- Standardize card depth, rounded corners, metric blocks, section spacing, and CTA treatment.
- Introduce a clearer “investor-facing content block” pattern for hero metrics, impact stats, proof modules, and mini case studies.
- Make dashboard summary cards look more intentional and less placeholder-like.

## 6. Demo Narrative Architecture

The walkthrough should become:

1. **Landing Thesis**
   - Explain the market gap and why it matters.
2. **SME Intake Proof**
   - Show that real business needs can enter the system in structured form.
3. **Student Opportunity Proof**
   - Show that students are moved closer to practical market readiness.
4. **Impact Layer**
   - Show why the model can create repeatable social value at scale.

This structure explicitly avoids a “tour every feature” demo.

## 7. Landing Page Design

The landing page becomes the primary investor-facing narrative surface.

### 7.1 Required Sections

#### Hero

The hero must communicate the thesis directly:

> Close the gap between education and market demand through practical SME projects.

Hero responsibilities:
- establish the social/economic problem immediately
- explain the product mechanism in one short paragraph
- present 2 primary CTAs:
  - view platform demo
  - view social impact
- present 3 fast value signals:
  - students gain real project experience
  - SMEs access digital problem-solving more easily
  - the market gains a better-prepared talent pipeline

#### Problem Section

Must make the gap visible in concrete terms:
- students learn but lack real project exposure
- SMEs have real operational needs but often cannot create structured briefs
- the market loses efficiency because the handoff between training and demand is weak

#### How It Works Section

Three-step engine:
1. SME submits raw business need
2. AI helps standardize the brief and support matching
3. Student executes real work and builds market-relevant evidence

#### Impact Section

Must present illustrative impact metrics, even if demo data is simulated:
- practical projects created
- students building real portfolio evidence
- SMEs supported with digital transformation tasks
- student market-readiness uplift indicators

#### Proof + CTA Section

Must transition into the live product walkthrough:
- SME flow
- student flow
- impact summary

### 7.2 Landing Page Tone

- thesis-driven, not slogan-driven
- concise and credible
- socially meaningful without sounding NGO-like
- optimistic without sounding exaggerated

## 8. Phase 1 Surface Area: Demo-Facing Screens

The “upgrade everything” request is translated into a practical first master scope:

- landing page
- SME dashboard
- SME create-project flow
- student dashboard
- student project discovery / matching view
- impact summary layer

These are the required first-class demo screens.

The following are secondary in the first implementation wave:
- auth screens
- profile maintenance forms
- progress workflow details
- evaluation workflow details
- edge-case management screens

They may receive cleanup later, but should not absorb the main design effort before the investor demo surfaces are strong.

## 9. SME Flow Design

## 9.1 SME Dashboard

The SME dashboard should become a narrative dashboard, not just an operations summary.

Required emphasis:
- active project demand
- candidate pipeline quality
- business problem categories
- AI-assisted workflow credibility
- visible entry into the “create project” flow

UI goals:
- stronger summary cards
- better empty and near-empty states
- recent projects presented with more meaning, not just list rows
- stronger connection between dashboard metrics and the investment thesis

## 9.2 SME Create Project

This screen should be positioned as a **problem intake engine**.

Current strength:
- it already includes an AI chat + structured form combination

Required upgrade:
- visually polish the experience so it feels central to the product thesis
- frame the AI assistant as helping SMEs convert ambiguous needs into actionable project briefs
- make progress and readiness states more persuasive
- make the right column feel like a real “structured opportunity preview”

Narrative function in demo:
- prove that market demand enters the system in usable form

## 10. Student Flow Design

## 10.1 Student Dashboard

This dashboard should shift from a personal summary toward a **market-readiness view**.

Required emphasis:
- current opportunities
- practical growth
- completed evidence
- skill-to-demand alignment
- momentum toward real-world readiness

Narrative function in demo:
- prove that the platform does not just show listings; it moves students toward employable experience

## 10.2 Student Project Discovery / Matching

This screen should become the strongest “bridge” proof on the student side.

Required emphasis:
- fit/relevance clarity
- learning outcome or readiness gain
- project realism
- why a given opportunity matters to the student's career path

Matching should feel:
- interpretable
- useful
- not purely decorative AI scoring

Narrative function in demo:
- prove that the platform meaningfully connects people to the right real-world work

## 11. Impact Layer Design

The product needs a dedicated investor-facing impact surface.

This can be implemented as:
- a dashboard section
- a dedicated page
- or a guided summary state in the demo flow

It must present:
- impact metrics
- short case-study style proof points
- signals of scale potential

Illustrative data is acceptable in this phase, but it must remain plausible and internally consistent.

This surface should answer:
- why this matters socially
- why this can scale
- why the product mechanism is not just cosmetic

## 12. Content Strategy

The content system must become more intentional across the demo-facing product.

Rules:
- prefer clear investor-readable copy over generic UX filler
- replace vague statements with concrete outcome-oriented language
- make CTAs narrative-aware
- keep Vietnamese wording concise, confident, and natural

Examples of copy direction:
- avoid “Bắt đầu ngay” when “Xem demo nền tảng” or “Xem tác động xã hội” is more contextually correct
- avoid generic dashboard labels when a more thesis-linked label can improve meaning

## 13. Full Master Phase Plan

### Phase 0: Foundation

- create/standardize visual system tokens and patterns
- align backgrounds, cards, metrics, CTA hierarchy, and section rhythm
- prepare shared reusable UI patterns needed by later phases

### Phase 1: Investor Landing

- redesign landing page around market-bridge thesis
- add problem, mechanism, impact, and demo-transition sections

### Phase 2: SME Demo Flow

- upgrade SME dashboard
- upgrade SME create-project screen
- improve investor readability of the SME-side story

### Phase 3: Student Demo Flow

- upgrade student dashboard
- upgrade project discovery / matching surfaces
- strengthen evidence of market-readiness progression

### Phase 4: Impact Layer

- add dedicated impact summary surface
- create demo-quality metrics and case-study framing

### Phase 5: Secondary Polish

- clean supporting screens for consistency
- align auth/profile/secondary interaction quality with new design system

## 14. Architecture and Implementation Constraints

- Follow the existing module-oriented architecture in `src/modules`.
- Keep `src/app` thin and use existing domain/service boundaries where possible.
- Avoid rewriting stable product logic just to fit the new presentation layer.
- Prefer reusable shared presentation patterns over one-off landing-only code where appropriate.
- Do not erase existing personality in search of generic polish.

## 15. Testing and Verification Expectations

The redesign is primarily presentation-led, but it still requires verification.

Required verification categories:
- lint
- typecheck
- tests for changed behavior when applicable
- manual browser verification for major demo-facing surfaces
- responsive checks for landing and primary dashboards

For demo-facing work, visual verification matters as much as code correctness.

## 16. Risks and Mitigations

- Risk: over-expanding scope by trying to redesign every screen at once.
  - Mitigation: execute by phased demo-facing priority.

- Risk: making the app look more “corporate” but less distinctive.
  - Mitigation: preserve pastel + strong-border identity and youthful tone.

- Risk: overly narrative screens feel disconnected from real product behavior.
  - Mitigation: use product flows as proof surfaces, not fake marketing layers only.

- Risk: investor-facing metrics become unrealistic.
  - Mitigation: keep demo metrics illustrative but plausible and internally consistent.

## 17. Acceptance Criteria

- The first minute of the demo clearly communicates the market-gap thesis.
- The landing page reads as investor-facing, not only user-facing.
- The product feels brighter, more professional, and more coherent while preserving current visual DNA.
- SME flow clearly demonstrates structured intake of real market demand.
- Student flow clearly demonstrates movement toward practical market readiness.
- The app includes an explicit impact layer suitable for investor storytelling.
- Work is decomposed into phases that can be implemented sequentially without losing strategic consistency.
