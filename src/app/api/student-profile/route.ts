import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { handlePrismaApiError, unauthorizedResponse } from "@/modules/shared";
import { canGenerateEmbedding, generateEmbedding } from "@/modules/ai";
import { studentProfileSchema } from "@/modules/matching";
import { findStudentProfileForApi, findStudentProfileForEmbeddingRefresh, upsertStudentProfile } from "@/modules/shared";

function normalizeList(value: string[] | undefined) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

function listEquals(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function joinList(value: string[]) {
  return value.join(", ");
}

export async function GET() {
  try {
    const session = await auth();
    const userId = getSessionUserIdByRole(session, "STUDENT");

    if (!userId) {
      return unauthorizedResponse();
    }

    const profile = await findStudentProfileForApi(userId);

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        university: profile.university,
        major: profile.major,
        skills: joinList(profile.skills),
        technologies: joinList(profile.technologies),
        githubUrl: profile.githubUrl ?? "",
        portfolioUrl: profile.portfolioUrl ?? "",
        availability: profile.availability,
        description: profile.description,
        interests: joinList(profile.interests),
      },
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return handlePrismaApiError(error, "Failed to load profile");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = getSessionUserIdByRole(session, "STUDENT");

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const parsed = studentProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu hồ sơ không hợp lệ." },
        { status: 400 },
      );
    }

    const {
      university,
      major,
      skills,
      technologies,
      githubUrl,
      portfolioUrl,
      availability,
      description,
      interests,
    } = parsed.data;

    // Tách mảng
    const skillsArray = normalizeList(
      skills.split(","),
    );
    const techArray = normalizeList(
      technologies.split(","),
    );
    const interestsArray = normalizeList(
      interests.split(","),
    );

    const existingProfile = await findStudentProfileForEmbeddingRefresh(userId);

    const shouldRegenerateEmbedding =
      canGenerateEmbedding() &&
      (
        !existingProfile ||
        existingProfile.major !== major ||
        existingProfile.description !== description ||
        !listEquals(existingProfile.skills, skillsArray) ||
        !listEquals(existingProfile.technologies, techArray) ||
        !listEquals(existingProfile.interests, interestsArray)
      );

    const embedding = shouldRegenerateEmbedding
      ? await generateEmbedding(
          `Chuyên ngành: ${major}. Kỹ năng: ${skillsArray.join(", ")}. Công nghệ: ${techArray.join(", ")}. Lĩnh vực quan tâm: ${interestsArray.join(", ")}. Mô tả: ${description}`,
        )
      : existingProfile?.embedding ?? [];

    // Upsert Student Profile
    const profile = await upsertStudentProfile({
      userId,
      university,
      major,
      skills: skillsArray,
      technologies: techArray,
      githubUrl,
      portfolioUrl,
      availability,
      description,
      interests: interestsArray,
      embedding,
      shouldRegenerateEmbedding,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return handlePrismaApiError(error, "Failed to update profile");
  }
}
