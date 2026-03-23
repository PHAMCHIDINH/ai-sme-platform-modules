import { NextResponse } from "next/server";
import { standardizeBrief } from "@/modules/ai";
import { standardizeBriefSchema } from "@/modules/project";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = standardizeBriefSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Mô tả dự án không hợp lệ." },
        { status: 400 },
      );
    }

    const brief = await standardizeBrief(parsed.data.description);

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("AI Standardize Error:", error);
    return NextResponse.json({ error: "Không thể chuẩn hóa mô tả dự án lúc này." }, { status: 500 });
  }
}
