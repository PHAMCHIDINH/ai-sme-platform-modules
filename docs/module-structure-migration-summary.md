# Module Structure Migration Summary

Ngay hoan tat: 2026-03-21
Nhanh: `codex/feature-modules-bigbang`

## Muc tieu dat duoc

- Chuyen sang feature-based modules duoi `src/modules`.
- Giu `src/app` thanh thin entrypoints (page/layout/route composition).
- Giu nguyen runtime API contract.
- Them guard script + architecture tests de enforce boundary.

## Ban do module da migrate

- `auth`
  - session helpers, auth actions, register flow, auth schemas/error mapping.
- `project`
  - project repo/presenter/schema, sme profile schema.
- `application`
  - invitation/apply/respond actions, lifecycle services/rules.
- `progress`
  - progress lifecycle/use-cases/presenter/parser + repos.
- `ai`
  - openai client, embedding, chat-brief services.
- `matching`
  - similarity ranking + student profile schema.
- `shared`
  - kernel (`result`, `action-result`, `prisma`, `utils`), error/http helpers,
    UI components, app-level data adapters for thin app layer.

## Legacy cleanup da hoan tat

- Xoa `components/ui/*` bridge files.
- Xoa runtime `lib/*` remnants.
- Doi import UI ve `@/modules/shared`.
- Doi architecture guard sang scan `src/app` + `src/modules`.
- Doi ui-import guard sang layout moi (`src/app`, `src/modules/**/ui`, legacy scan logic).

## Architecture checks duoc bo sung

- `tests/architecture/no-heavy-logic-in-app.test.ts`
- `tests/architecture/no-cross-module-deep-imports.test.ts`
- `tests/architecture/no-legacy-layout.test.ts`
- `tests/scripts/check-architecture.test.ts`
- `tests/scripts/check-ui-imports.test.ts`

## Contract invariants (manual verification)

- API route paths giu nguyen:
  - `/api/ai/chat-brief`
  - `/api/ai/generate-embedding`
  - `/api/ai/standardize-brief`
  - `/api/auth/[...nextauth]`
  - `/api/health`
  - `/api/matching`
  - `/api/projects`
  - `/api/sme/students`
  - `/api/student-profile`
- Response/status semantics giu nguyen; thay doi chu yeu o wiring va data-access boundary.

## Full quality gates (bat buoc) - PASS

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check:architecture
npm run check:ui-imports
```

## Follow-up de xuat (khong blocker)

1. Tach `@/auth`, `@/auth.config`, `components/*`, `hooks/*` vao `src/` de alias `@/*` chi con 1 root duy nhat.
2. Giam surface `src/modules/shared/public.ts` bang facade theo domain UI nho hon neu can.
3. Bo sung integration contract tests cho cac API route co luong nghiep vu phuc tap.
