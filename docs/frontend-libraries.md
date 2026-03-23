# Frontend Libraries

Tai lieu nay mo ta cach su dung 3 nhom thu vien moi trong repo.

## 1) `@next/bundle-analyzer`

Muc dich:
- Do bundle size de tim package/chunk gay tang first load JS.
- Khong dung de thay doi runtime behavior.

Su dung:

```bash
npm run analyze
```

Khi doc ket qua:
- Tim page/chunk nao co kich thuoc lon bat thuong.
- Uu tien xem cac package UI, icons, animation, hoac thu vien chi duoc dung o mot vai page.
- Chi toi uu sau khi co so lieu, khong doan.

## 2) `react-hook-form` + `@hookform/resolvers`

Muc dich:
- Chuan hoa form state.
- Giam re-render khong can thiet.
- Dung chung validation schema voi Zod.

Quy uoc trong repo:
- Form client nen dung `useForm(...)` + `zodResolver(...)`.
- Validation schema dat o `lib/validators/*`.
- Loi field hien ngay tai input.
- Loi server/action hien o form-level.

Da ap dung cho:
- login
- register
- student profile
- SME create project

## 3) `@tanstack/react-query`

Muc dich:
- Quan ly client-owned fetch/mutation.
- Cache, dedupe, loading state, retry, invalidation.

Default query client:
- `staleTime: 30000`
- `gcTime: 300000`
- `refetchOnWindowFocus: false`
- `queries.retry: 1`
- `mutations.retry: 0`

Quy uoc trong repo:
- Dung React Query cho form submit qua API route.
- Khong dung React Query de thay the server component data fetching.
- Khong ep chuyen cac server action hien co sang React Query neu luong do da on dinh.

Da ap dung cho:
- `POST /api/student-profile`
- `POST /api/ai/standardize-brief`
- `POST /api/projects`

## Rule of thumb

- Neu data duoc render tot hon o server: fetch o server component.
- Neu do la form client co mutation/loading/toast: uu tien RHF + React Query.
- Neu do la mutation bang server action dang hoat dong on: giu nguyen server action, khong refactor chi de dong bo cong cu.
