# AI SME Platform

Nen tang AI ket noi sinh vien voi bai tap thuc chien tu doanh nghiep SME.

## Kien truc module (cap nhat 2026-03-21)

Codebase da duoc migrate sang feature-based module structure:

```txt
src/
  app/        # thin pages/routes/layout
  modules/
    auth/
    project/
    application/
    progress/
    ai/
    matching/
    shared/
```

Quy uoc chinh:
- `src/app` khong import truc tiep `prisma` hoac `repo` internals.
- Cross-module import dung entrypoint `@/modules/<feature>`.
- `@/lib/*` va `components/ui/*` da duoc loai bo khoi runtime code.
- Shared UI duoc expose qua `@/modules/shared`.

Quality gates:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check:architecture
npm run check:ui-imports
```

## Chay local (khong Docker)

```bash
npm install
npm run db:up
npm run db:push
npm run dev
```

Ung dung chay tai [http://localhost:3000](http://localhost:3000).

Luu y:
- Local dev van can PostgreSQL o `localhost:5432` (duoc chay boi `db` service).
- Neu gap loi `Can't reach database server at localhost:5432`, chay lai `npm run db:up`.
- Neu dang chay `next dev`, su dung `npm run db:push` (da `--skip-generate`) de tranh loi khoa file Prisma engine tren Windows.
- De bat AI on dinh, can set day du bo bien OPENAI (khong chi `OPENAI_API_KEY`).

### Cau hinh AI env (local va Docker can dong bo)

Bat buoc:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (de trong neu goi truc tiep OpenAI)
- `OPENAI_CHAT_MODEL`
- `OPENAI_EMBEDDING_MODEL`

Vi du OpenRouter:
- `OPENAI_BASE_URL=https://openrouter.ai/api/v1`
- `OPENAI_CHAT_MODEL=stepfun/step-3.5-flash:free`
- `OPENAI_EMBEDDING_MODEL=openai/text-embedding-3-small`

Vi du OpenAI:
- `OPENAI_BASE_URL=` (bo trong)
- `OPENAI_CHAT_MODEL=gpt-4o-mini`
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`

### Cau hinh upload anh (Cloudinary)

Can them 3 bien moi truong:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Luong upload avatar su dung signed upload:
- Frontend goi `POST /api/cloudinary/sign` de lay `timestamp + signature`.
- Browser upload truc tiep len Cloudinary, sau do luu `secure_url` vao `avatarUrl`.

## Trien khai bang Docker

### 1) Chuan bi bien moi truong

Tao file `.env.docker` tu mau:

```bash
cp .env.docker.example .env.docker
```

Cap nhat gia tri:
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET` (nen dung cung gia tri voi `AUTH_SECRET` de tranh loi giai ma session JWT)

### 2) Build va chay

```bash
docker compose --env-file .env.docker up --build -d
```

Dich vu duoc tao:
- `db`: PostgreSQL 16 (`localhost:5432`)
- `app`: Next.js app (`http://localhost:3000`)

App se tu dong chay `prisma db push` khi start de dong bo schema.

### 3) Xem log

```bash
docker compose logs -f app
docker compose logs -f db
```

### 4) Dung he thong

```bash
docker compose down
```

Neu muon xoa ca volume DB:

```bash
docker compose down -v
```

## Scripts nhanh

```bash
npm run db:up
npm run db:down
npm run analyze
npm run docker:up
npm run docker:logs
npm run docker:down
```

## Frontend libraries

Du an da tich hop them:
- `react-hook-form`
- `@hookform/resolvers`
- `@tanstack/react-query`
- `@next/bundle-analyzer`

Quy uoc:
- Dung `react-hook-form` + `zodResolver` cho cac form client co nhieu field va validation.
- Dung `@tanstack/react-query` cho client-owned fetch/mutation nhu submit form qua API route.
- Giu server component data fetching o server.
- Giu server actions cho cac thao tac da on dinh, khong ep chuyen het sang React Query.

## Phan tich bundle

```bash
npm run analyze
```

Lenh nay se build app voi bundle analyzer de xem package/chunk nao dang chiem nhieu dung luong.

Tai lieu chi tiet:
- `docs/frontend-libraries.md`
