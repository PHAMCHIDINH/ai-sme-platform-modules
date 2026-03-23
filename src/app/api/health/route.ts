import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    status: "ok" as const,
    service: "ai-sme-platform",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? "development",
    version: process.env.npm_package_version ?? "unknown",
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
