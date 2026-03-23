# Refactor PR Checklist (Post Module Migration)

Cap nhat sau migration big-bang feature-based modules ngay 2026-03-21.

## Bat buoc cho moi PR refactor

1. Khong doi runtime API contract (path/status/payload).
2. `src/app` chi la thin composition layer, khong chua data access chi tiet.
3. Import boundary:
   - Khong dung `@/lib/*`.
   - Khong deep import cross-module (`@/modules/<feature>/<internal>`).
   - Khong import `repo` tu `src/app`.
4. UI imports dung `@/modules/shared` (khong dung `components/ui/*`).
5. Them/duy tri test architecture khi bo sung rule moi.

## Gate can pass truoc merge

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check:architecture
npm run check:ui-imports
```

## Checklist verify contract

- [ ] API route paths khong doi:
  - `/api/ai/chat-brief`
  - `/api/ai/generate-embedding`
  - `/api/ai/standardize-brief`
  - `/api/auth/[...nextauth]`
  - `/api/health`
  - `/api/matching`
  - `/api/projects`
  - `/api/sme/students`
  - `/api/student-profile`
- [ ] HTTP status semantics giu nguyen.
- [ ] JSON success/error envelope giu nguyen theo tung route/action.

## Khi can mo rong architecture rules

1. Viet test truoc trong `tests/scripts/` hoac `tests/architecture/`.
2. Cap nhat script guard (`check:architecture` / `check:ui-imports`).
3. Chay lai full gates.
4. Cap nhat docs lien quan (`README.md`, summary docs).
