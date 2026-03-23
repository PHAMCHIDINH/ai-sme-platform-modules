# Dependency Upgrade Track

## Mục tiêu
- Giảm rủi ro bảo mật từ các advisory mức `high` mà không phá vỡ luồng nghiệp vụ hiện tại.
- Triển khai theo batch nhỏ, có kiểm thử hồi quy sau mỗi batch.

## Batch 1 (ưu tiên cao)
- Nâng `next` lên bản an toàn mới nhất tương thích với app router hiện tại.
- Nâng `eslint-config-next` theo cùng major/minor tương ứng với `next`.
- Chạy full `npm run ci:verify` + smoke test các route auth/dashboard/API.

## Batch 2
- Rà soát advisory chain liên quan Prisma (`@prisma/config`, `effect`) và quyết định chiến lược nâng phiên bản an toàn.
- Chạy migration rehearsal trên môi trường staging với snapshot dữ liệu gần production.

## Batch 3
- Rà soát các phụ thuộc gián tiếp còn advisory cao sau Batch 1-2.
- Chốt baseline mới bằng lockfile, sau đó bật kiểm tra `npm audit --omit=dev` trong CI release branch.
