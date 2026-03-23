import { NextResponse } from "next/server";
import { z } from "zod";

import { generateEmbedding } from "@/modules/ai";
import { TimeoutError, validateEmbeddingText, withTimeout } from "@/modules/ai";

const schema = z.object({
  text: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Text đầu vào không hợp lệ." },
        { status: 400 },
      );
    }

    const validated = validateEmbeddingText(parsed.data.text);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const embedding = await withTimeout(generateEmbedding(validated.value));
    return NextResponse.json({ embedding });
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error("[AI_EMBEDDING_TIMEOUT]", { message: error.message });
      return NextResponse.json(
        { error: "Dịch vụ embedding đang quá tải. Vui lòng thử lại sau." },
        { status: 504 },
      );
    }

    console.error("[AI_EMBEDDING_ERROR]", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Không thể tạo embedding lúc này." },
      { status: 500 },
    );
  }
}
