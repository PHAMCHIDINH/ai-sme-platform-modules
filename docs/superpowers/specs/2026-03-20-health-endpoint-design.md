# Health Endpoint Design

**Date:** 2026-03-20  
**Scope:** Add a lightweight system health endpoint for runtime checks.

## Problem

The project currently lacks a simple unauthenticated endpoint that confirms the API is alive and returns basic runtime metadata for operational checks.

## Proposed Design

Add `GET /api/health` in Next.js App Router at `app/api/health/route.ts`.

Response contract:

```json
{
  "status": "ok",
  "service": "ai-sme-platform",
  "timestamp": "2026-03-20T17:45:00.000Z",
  "uptimeSeconds": 1234,
  "environment": "development",
  "version": "0.1.0"
}
```

Behavior:
- `status` is always `"ok"` when handler executes successfully.
- `timestamp` is generated at request time.
- `uptimeSeconds` is based on `process.uptime()`, floored to integer.
- `environment` reads from `process.env.NODE_ENV` (fallback `"development"`).
- `version` reads from `process.env.npm_package_version` (fallback `"unknown"`).
- Endpoint is unauthenticated.
- Response disables caching with `Cache-Control: no-store`.

## Non-Goals

- No database checks.
- No downstream dependency checks.
- No auth/role constraints.

## Acceptance Criteria

- Route exists at `GET /api/health`.
- Returns HTTP 200 with documented JSON shape.
- Passes project lint and type-check gates.
