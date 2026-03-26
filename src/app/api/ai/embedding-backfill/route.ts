import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { EMBEDDING_BACKFILL_EVENT } from "@/modules/ai";
import { getSessionUserIdByRole } from "@/modules/auth";
import { unauthorizedResponse } from "@/modules/shared";
import { inngest, isInngestEnabled } from "../../../../modules/shared/services/inngest";

const schema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const smeUserId = getSessionUserIdByRole(session, "SME");

    if (!smeUserId) {
      if (session?.user) {
        return NextResponse.json(
          { error: "Chỉ doanh nghiệp mới có quyền trigger embedding backfill." },
          { status: 403 },
        );
      }

      return unauthorizedResponse();
    }

    if (!isInngestEnabled()) {
      return NextResponse.json(
        { error: "Inngest chưa được cấu hình (thiếu INNGEST_EVENT_KEY)." },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Payload không hợp lệ." },
        { status: 400 },
      );
    }

    const response = await inngest.send({
      name: EMBEDDING_BACKFILL_EVENT,
      data: {
        limit: parsed.data.limit,
        requestedBy: smeUserId,
      },
    });

    const eventIds = Array.isArray((response as { ids?: string[] }).ids)
      ? (response as { ids?: string[] }).ids
      : [];

    return NextResponse.json({
      ok: true,
      message: "Đã gửi job embedding backfill vào hàng đợi.",
      eventIds,
    });
  } catch (error) {
    console.error("[EMBEDDING_BACKFILL_TRIGGER_ERROR]", error);
    return NextResponse.json(
      { error: "Không thể trigger embedding backfill lúc này." },
      { status: 500 },
    );
  }
}
