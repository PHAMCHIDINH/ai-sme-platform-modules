# Glassdoor-Inspired Career Portal UI Design (`ai-sme-platform-modules`)

Date: 2026-03-23  
Status: Approved Draft for Planning  
Scope: Redesign the product UI to feel closer to Glassdoor's career-portal experience while preserving the platform's SME-project-marketplace domain and current brand identity.

## 1. Context

The current product already has meaningful breadth:
- public landing page
- role-based authentication
- student and SME dashboards
- project discovery, application, invitation, progress, and evaluation flows

However, the UI system is inconsistent in tone and hierarchy:
- the landing page currently reads as a bright neo-brutalist marketing surface
- dashboards use a different visual logic from discovery pages
- the app mixes strong pastel blocks, black borders, and glassmorphism-like treatment
- the product does not yet feel like a coherent marketplace where users can search, compare, evaluate, and act

The user's request is not to clone Glassdoor exactly, but to shift the product toward a UI style that is:
- cleaner
- more trustworthy
- more search- and listing-oriented
- more structurally consistent across landing, dashboards, lists, and detail pages

The chosen direction is the closest of the explored options to Glassdoor: **Career Portal**.

## 2. Reference Signals from Glassdoor

The design direction is informed by the current Glassdoor homepage at [glassdoor.com](https://www.glassdoor.com/index.htm), specifically these product signals:
- a search-led hero rather than a poster-like campaign hero
- clear taxonomy in navigation and browse links
- strong trust framing with concise copy
- light, quiet surfaces with restrained brand color usage
- listing and discovery patterns that encourage scanning and comparison

Inference from that reference:
- users should feel like they are entering a structured discovery environment, not a demo microsite
- the first interaction should invite exploration, filtering, and evaluation
- the UI should signal credibility through hierarchy and restraint, not through loud decoration

## 3. Objectives

- Make the app feel like a credible project-and-talent discovery portal.
- Bring landing, auth, dashboards, listings, details, and profile screens into one visual system.
- Replace the current neo-brutalist styling with a calmer and more professional interface.
- Preserve enough of the current brand colors so the product still feels like this project, not a Glassdoor copy.
- Support both primary audiences equally:
  - students discovering practical projects
  - SMEs discovering suitable student candidates

## 4. Non-Goals

- No attempt to replicate Glassdoor pixel-for-pixel.
- No rebrand that replaces the existing brand identity with Glassdoor's brand identity.
- No domain shift from "SME project marketplace" to "generic jobs portal".
- No backend/domain-model changes unless a view cannot support the new UI without them.
- No major feature expansion during the redesign spec phase.

## 5. Chosen Product Positioning

The product should be presented as:

**A career-portal-style marketplace for practical SME projects**, where:
- SMEs publish real execution problems
- students discover matching practical opportunities
- the platform supplies trust, structure, and matching cues to help both sides decide quickly

This is intentionally not:
- a traditional job board
- a generic SaaS dashboard
- an investor-demo landing page with disconnected internal screens

## 6. Visual Direction

Chosen visual direction: **Glassdoor-Inspired Career Portal**

Desired qualities:
- cleaner surfaces
- more whitespace
- sharper content hierarchy
- quieter colors
- stronger search and taxonomy cues
- more compact, scannable cards and rows
- marketplace trust signals over decorative styling

### 6.1 Visual Principles

- Use restraint before novelty.
- Let search, filters, lists, and metrics define the UI rhythm.
- Treat whitespace as a product feature, not wasted space.
- Keep color semantic and intentional.
- Make every primary screen feel like part of the same discovery system.

### 6.2 Color Direction

- Remove the strong multi-pastel emphasis across large surfaces.
- Keep one primary brand accent and one secondary accent from the current palette.
- Use white, off-white, and soft green-gray neutrals as the default canvas.
- Reserve stronger color for:
  - CTAs
  - active navigation
  - selected filters
  - score indicators
  - positive progress/status cues

### 6.3 Typography Direction

- Headings should be confident and compact, but not poster-like.
- Body copy should be slightly smaller, calmer, and easier to scan.
- Navigation, filters, badge labels, and metadata should use tighter type scales and better contrast discipline.
- Marketing-style oversized typography should be limited to the landing hero only.

### 6.4 Surface and Elevation Rules

- Replace thick black borders with subtle borders or soft shadows.
- Standardize corner radii and panel spacing across the app.
- Reduce visual noise from layered gradients and background textures.
- Use hover and focus states that feel precise and quiet.

## 7. Information Architecture Direction

The current app should move from "marketing front page + internal dashboards" toward "public discovery portal + role-specific workspaces."

### 7.1 Primary Navigation

The main public navigation should prioritize marketplace taxonomy:
- Projects
- SMEs
- Students
- AI Matching
- For Businesses / For Employers
- Sign in

This creates the correct top-level mental model:
- explore opportunities
- explore organizations
- explore talent
- understand how matching works

### 7.2 Content Hierarchy

Across public and authenticated screens, the hierarchy should generally follow:
1. search / navigation context
2. trust signals and quick summary
3. listing/results or primary work queue
4. supporting metrics or guidance
5. secondary promotional content

This reverses the current tendency to lead with large decorative panels.

## 8. Route-Level Design

## 8.1 Landing Page

The landing page becomes the public discovery hub.

Required structure:
- concise headline
- search bar centered in the hero
- trust metrics
- browse taxonomy links
- featured project cards
- featured SME cards
- clear role-based entry points for students and SMEs

Hero responsibilities:
- explain what kind of opportunities exist on the platform
- invite search and browsing immediately
- establish the product as a real marketplace, not a concept demo

Suggested sections:
1. Search-led hero
2. Browse by skill / problem type / industry
3. Featured projects
4. Featured SMEs
5. How AI matching helps
6. Final CTA / sign-up

## 8.2 Login and Register

Auth screens should inherit the same calm portal styling:
- cleaner spacing
- simplified side panels
- less decorative color blocking
- stronger form hierarchy

These screens should feel like a continuation of the public experience rather than a separate theme.

## 8.3 Student Discovery

This becomes one of the most important surfaces in the app.

The student project discovery page should use:
- filter sidebar or collapsible mobile filters
- result list with compact project cards
- clear metadata per card
- visible match score
- saved / applied / invited states where applicable

Each project card should clearly communicate:
- project title
- SME identity
- skill tags
- project type / effort / timeline cues
- match score
- current application state

## 8.4 SME Candidate Discovery

The SME student-discovery surface should mirror the same discovery language:
- filter sidebar
- candidate list or cards
- profile highlights
- fit indicators
- clear invitation CTA

This symmetry is important:
- students browse projects
- SMEs browse candidates

The app should feel like two sides of the same marketplace, not two unrelated tools.

## 8.5 Dashboards

Dashboards should become action-oriented summaries rather than decorative landing replacements.

Student dashboard emphasis:
- recommended projects
- current applications and progress
- profile completion
- portfolio and rating signals

SME dashboard emphasis:
- active projects
- recent candidate activity
- project pipeline status
- recommended next actions

Structural rule:
- summary metrics at the top
- recent activity / recommendations in the middle
- quick actions and profile completion on the side or lower sections

## 8.6 Project and Candidate Detail Views

Detail screens should use the same discovery system as list views:
- clear header
- identity block
- structured metadata
- call-to-action zone
- supporting sections below

Avoid large decorative hero panels on detail views.
These should feel like evaluation pages inside a portal.

## 8.7 Profile Views

Student and SME profiles should be rewritten visually as marketplace profiles:
- stronger identity header
- structured summary sections
- standardized tags and metadata
- cleaner spacing
- clearer proof sections

The goal is profile credibility, not form-heavy admin styling.

## 9. Component System Changes

The redesign must be driven by shared UI patterns, not by ad hoc page edits.

### 9.1 Core Components to Rework

- global page background
- navbar
- dashboard sidebar
- buttons
- cards
- badges
- input and search fields
- tables and list rows
- empty states
- metric panels
- section headers

### 9.2 New Shared Patterns to Introduce

- search hero pattern
- browse-link cluster pattern
- result card pattern
- compact metadata row pattern
- trust metric strip pattern
- portal dashboard summary pattern
- profile header pattern

### 9.3 State Styling Rules

- active state should rely on tint, emphasis, and weight rather than high-contrast novelty
- destructive state should stay clear but not visually dominate the full page
- loading states should use soft skeletons
- empty states should feel product-real, not placeholder-demo

## 10. Motion and Interaction

Motion should be minimal and purposeful:
- subtle page reveal
- refined navbar behavior
- light hover transitions
- smooth dropdown and sheet entry

Do not use motion to compensate for weak layout hierarchy.

## 11. Responsive Behavior

The portal style must work across desktop and mobile.

Desktop priorities:
- sidebar filters where useful
- strong two-column or three-column listing layouts
- visible result density

Mobile priorities:
- collapsible filters
- stacked cards
- sticky search and actions where helpful
- preserved readability without oversized blocks

## 12. Error Handling and Empty States

This redesign should improve UX quality in low-data states.

Required principles:
- empty states should explain what the user can do next
- unavailable data should not collapse layout structure
- missing profile or low-completion states should feel like onboarding guidance, not broken screens
- result-empty states should still preserve filters and query context

## 13. Testing Strategy

The redesign should be verified with a UI-focused validation pass.

Required validation areas:
- landing page hierarchy and responsiveness
- auth screen consistency
- student discovery list readability
- SME candidate list readability
- student dashboard hierarchy
- SME dashboard hierarchy
- sidebar and navbar consistency
- shared component regression

Recommended verification methods:
- manual responsive review for public and dashboard surfaces
- smoke tests for routing and auth-gated layouts
- targeted visual inspection of shared UI components after token changes

## 14. Risks

- The app could drift too far toward a generic job portal if project-specific domain cues are not preserved.
- If token changes are made inconsistently, the app will feel half-redesigned.
- If landing is redesigned without the dashboards and listings adopting the same system, the product will still feel fragmented.
- If match score and trust signals are over-designed, the UI may feel artificial rather than credible.

## 15. Implementation Constraints for the Next Phase

- Follow the existing Next.js and shared-component structure rather than introducing a parallel design system.
- Prefer refactoring shared UI primitives and layout wrappers before rewriting individual screens.
- Apply the redesign incrementally but in a sequence that produces visible coherence early.
- Keep the domain language centered on projects, matching, execution, outcomes, and credibility.

## 16. Summary

The product will move from a colorful demo-oriented interface toward a calmer, more credible, Glassdoor-inspired portal. The redesign will:
- keep the current brand, but tone it down
- make search, discovery, and comparison the dominant UI pattern
- unify landing, auth, dashboard, list, and detail screens
- preserve the project's true identity as an SME-student practical project marketplace

This is the approved design direction for implementation planning.
