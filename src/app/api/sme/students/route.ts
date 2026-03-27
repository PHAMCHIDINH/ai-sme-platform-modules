import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { handlePrismaApiError, listStudentsForSmeSearchCached, measureAsync, unauthorizedResponse } from "@/modules/shared";
import { generateEmbedding, canGenerateEmbedding } from "@/modules/ai";

export const dynamic = "force-dynamic";

// Helper function manually calculating cosine similarity
function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(req: Request) {
  try {
    const session = await measureAsync("auth.sme.students", () => auth());
    const userId = getSessionUserIdByRole(session, "SME");

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    // Lấy toàn bộ sinh viên
    const students = await measureAsync("data.sme.students", () => listStudentsForSmeSearchCached());

    if (!q || !canGenerateEmbedding()) {
      // Nếu không có query hoặc không có AI, trả về toàn bộ
      return NextResponse.json(students);
    }

    // Nếu có query, dùng AI để matching
    const queryEmbedding = await measureAsync("ai.sme.students.embedding", () => generateEmbedding(q));
    if (!queryEmbedding.length) {
      return NextResponse.json(students);
    }

    const scoredStudents = students.map((student) => {
      let score = 0;
      if (student.embedding && student.embedding.length === queryEmbedding.length) {
        score = cosineSimilarity(queryEmbedding, student.embedding);
      }
      return {
        ...student,
        matchScore: Math.round(score * 100),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(scoredStudents);
  } catch (error) {
    console.error("[SME_STUDENTS_GET]", error);
    return handlePrismaApiError(error, "Không thể tải danh sách sinh viên lúc này.");
  }
}
