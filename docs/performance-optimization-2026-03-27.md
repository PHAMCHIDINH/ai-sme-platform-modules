# Performance Optimization Log - 2026-03-27

## Scope

Tối ưu độ trễ mở app và chuyển tab cho các màn dashboard/discovery trong khi vẫn giữ Postgres remote.

## Root Cause Confirmed

1. `next dev` compile on-demand làm lần mở đầu của từng route chậm rõ rệt.
2. Các read-path nóng vẫn chạm Postgres remote trực tiếp cho mỗi request.
3. `student/projects` trước đó fetch tuần tự:
   - profile embedding
   - discovery projects
   - invitations
4. Homepage có warning duplicate key làm nhiễu việc đo console và route behavior.

## What Was Implemented

### 1. Request-time instrumentation

Thêm helper đo thời gian:
- `src/modules/shared/services/perf.ts`

Đã gắn vào:
- `src/app/(dashboard)/student/dashboard/page.tsx`
- `src/app/(dashboard)/student/projects/page.tsx`
- `src/app/api/sme/students/route.ts`

Các label chính:
- `auth.student.dashboard`
- `data.student.dashboard`
- `auth.student.projects`
- `data.student.profile.embedding`
- `data.student.discovery.projects`
- `data.student.discovery.invitations`
- `auth.sme.students`
- `data.sme.students`
- `ai.sme.students.embedding`

### 2. Server-side read cache

Thêm helper cache:
- `src/modules/shared/services/read-cache.ts`

Áp dụng cho:
- `findStudentProfileWithEmbeddingCached`
- `findStudentDashboardDataCached`
- `listStudentDiscoveryProjectsCached`
- `listStudentInvitationsCached`
- `listStudentsForSmeSearchCached`

TTL hiện tại:
- dashboard: `60s`
- discovery projects: `60s`
- invitations: `30s`
- SME student list: `60s`
- student embedding: `60s`

### 3. Parallelized discovery reads

`src/app/(dashboard)/student/projects/page.tsx`

Đã đổi từ flow tuần tự sang:
- lấy session
- lấy profile embedding
- `Promise.all` cho projects + invitations

### 4. Loading boundaries

Thêm loading UI:
- `src/app/(dashboard)/student/loading.tsx`
- `src/app/(dashboard)/student/projects/loading.tsx`

Mục tiêu:
- shell render sớm hơn
- giảm cảm giác đứng hình khi route đang chờ server response

### 5. DB indexes cho truy vấn nóng

Schema cập nhật:
- `Project @@index([status, createdAt(sort: Desc)])`
- `Project @@index([smeId, createdAt(sort: Desc)])`
- `Application @@index([studentId, status, initiatedBy])`
- `Application @@index([projectId, status])`
- `ProjectProgress @@index([studentId, status])`
- `Evaluation @@index([evaluateeId, type])`

Migration:
- `prisma/migrations/20260327141000_add_perf_indexes/migration.sql`

### 6. Contract fix for cached `Date`

Khi dùng `unstable_cache`, `Date` trong discovery list bị serialize thành string và làm vỡ sort/filter.

Đã sửa tại:
- `src/modules/shared/services/app-data.ts`

Bằng cách normalize lại `createdAt` và `deadline` sau khi lấy dữ liệu từ cache.

### 7. Homepage key warning cleanup

Sửa unique key cho browse links:
- `src/modules/shared/ui/portal-search-hero.tsx`

## Verification Evidence

### Automated checks

Đã chạy:
- `npm run test -- src/modules/shared/services/perf.test.ts`
- `npm run test -- src/modules/shared/services/read-cache.test.ts`
- `npm run test -- src/modules/shared/services/app-data.test.ts`
- `npm run test -- tests/architecture/student-discovery-layout.test.ts`
- `npm run test -- prisma/migrations/migrations.test.ts`
- `npm run typecheck`
- `npm run lint`

Kết quả:
- các test trên PASS
- `typecheck` PASS
- `lint` PASS với 1 warning cũ, không thuộc phạm vi đợt này:
  - `src/app/(dashboard)/sme/projects/new/page.tsx`
  - `react-hooks/exhaustive-deps`

### Runtime observations from dev logs

Sau khi bật cache và warm route:

- `POST /login 303 in 869ms`
- `GET /student/dashboard?_rsc=... 200 in 1084ms`
- `GET /student/projects 200 in 762ms`

Perf logs sau warm cache:

- `auth.student.dashboard`: `4ms`
- `data.student.dashboard`: `1056ms`
- `auth.student.projects`: `7-71ms`
- `data.student.profile.embedding`: `0-1ms`
- `data.student.discovery.projects`: `0-2ms`
- `data.student.discovery.invitations`: `1-2ms`

Điểm cải thiện rõ nhất là `student/projects`, nơi phần đọc remote được kéo từ mức giây xuống gần như tức thời sau warm cache.

## Deferred Work

Chưa triển khai trong vòng này:
- Qdrant/vector DB cho semantic ranking
- background sync projection qua Inngest cho vector index
- invalidation chi tiết theo mutation bằng `revalidateTag`

Lý do:
- cần thêm hạ tầng ngoài repo
- nên chỉ làm sau khi read-path hiện tại đã ổn định

## Files Added

- `docs/performance-optimization-2026-03-27.md`
- `src/modules/shared/services/perf.ts`
- `src/modules/shared/services/perf.test.ts`
- `src/modules/shared/services/read-cache.ts`
- `src/modules/shared/services/read-cache.test.ts`
- `src/app/(dashboard)/student/loading.tsx`
- `src/app/(dashboard)/student/projects/loading.tsx`
- `prisma/migrations/20260327141000_add_perf_indexes/migration.sql`

## Files Updated

- `src/modules/shared/services/app-data.ts`
- `src/modules/shared/services/app-data.test.ts`
- `src/modules/shared/public.ts`
- `src/app/(dashboard)/student/dashboard/page.tsx`
- `src/app/(dashboard)/student/projects/page.tsx`
- `src/app/(dashboard)/student/projects/[id]/page.tsx`
- `src/app/api/sme/students/route.ts`
- `src/modules/shared/ui/portal-search-hero.tsx`
- `tests/architecture/student-discovery-layout.test.ts`
- `prisma/schema.prisma`
- `prisma/migrations/migrations.test.ts`
