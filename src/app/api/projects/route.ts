import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionUserId, getSessionUserIdByRole } from "@/modules/auth";
import { handlePrismaApiError, unauthorizedResponse } from "@/modules/shared";
import { generateEmbedding } from "@/modules/ai";
import { projectFormSchema } from "@/modules/project";
import { createProjectForSme, listProjectsByRole } from "@/modules/shared";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const smeUserId = getSessionUserIdByRole(session, "SME");

    if (!smeUserId) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const parsed = projectFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu dự án không hợp lệ." },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      standardizedBrief,
      expectedOutput,
      requiredSkills,
      difficulty,
      duration,
      budget,
    } = parsed.data;

    // Tách mảng kỹ năng
    const skillsArray = typeof requiredSkills === "string" 
      ? requiredSkills.split(",").map(s => s.trim()).filter(Boolean) 
      : requiredSkills || [];

    const embedding = await generateEmbedding(
      `${title}. ${description}. Kỹ năng yêu cầu: ${skillsArray.join(", ")}`,
    );

    const project = await createProjectForSme({
      smeUserId,
      title,
      description,
      standardizedBrief: standardizedBrief || null,
      expectedOutput,
      requiredSkills: skillsArray,
      difficulty,
      duration,
      budget: budget || null,
      embedding,
    });

    if (!project) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ doanh nghiệp." }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create Project Error:", error);
    return handlePrismaApiError(error, "Không thể tạo dự án lúc này.");
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = getSessionUserId(session);

    if (!userId) {
      return unauthorizedResponse();
    }

    if (session?.user?.role === "SME") {
      const projects = await listProjectsByRole(userId, "SME");
      return NextResponse.json({ projects });
    }

    const projects = await listProjectsByRole(userId, "STUDENT");
    return NextResponse.json({ projects });
    
  } catch (error) {
    console.error("Get Projects Error:", error);
    return handlePrismaApiError(error, "Không thể tải danh sách dự án lúc này.");
  }
}
