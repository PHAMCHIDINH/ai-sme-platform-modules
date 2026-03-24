import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/modules/auth";
import { unauthorizedResponse } from "@/modules/shared";
import { buildCloudinarySignature, getCloudinaryUploadConfig } from "@/modules/shared/services/cloudinary";

function resolveFolder(rawFolder: unknown) {
  if (typeof rawFolder !== "string") {
    return "student-avatars";
  }

  const normalized = rawFolder.trim();
  if (!normalized) {
    return "student-avatars";
  }

  const isValid = /^[a-zA-Z0-9/_-]+$/.test(normalized);
  return isValid ? normalized : "student-avatars";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const studentUserId = getSessionUserIdByRole(session, "STUDENT");

    if (!studentUserId) {
      return unauthorizedResponse();
    }

    const cloudinary = getCloudinaryUploadConfig();
    if (!cloudinary) {
      return NextResponse.json(
        {
          error: "Thiếu cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).",
        },
        { status: 500 },
      );
    }

    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const folderInput = typeof body === "object" && body !== null && "folder" in body ? body.folder : undefined;
    const folder = resolveFolder(folderInput);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = buildCloudinarySignature({ folder, timestamp }, cloudinary.apiSecret);

    return NextResponse.json({
      cloudName: cloudinary.cloudName,
      apiKey: cloudinary.apiKey,
      folder,
      timestamp,
      signature,
    });
  } catch (error) {
    console.error("[CLOUDINARY_SIGN_POST]", error);
    return NextResponse.json({ error: "Không thể tạo chữ ký upload ảnh lúc này." }, { status: 500 });
  }
}
