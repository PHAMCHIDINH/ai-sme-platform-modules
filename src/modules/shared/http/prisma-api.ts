import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ACCESS_MESSAGES } from "../errors/access-messages";

export function unauthorizedResponse() {
  return NextResponse.json({ error: ACCESS_MESSAGES.UNAUTHORIZED_API }, { status: 401 });
}

function getMetaFieldName(error: Prisma.PrismaClientKnownRequestError) {
  const meta = error.meta;
  if (!meta || typeof meta !== "object" || !("field_name" in meta)) {
    return "";
  }

  const fieldName = meta.field_name;
  return typeof fieldName === "string" ? fieldName.toLowerCase() : "";
}

function getMetaCause(error: Prisma.PrismaClientKnownRequestError) {
  const meta = error.meta;
  if (!meta || typeof meta !== "object" || !("cause" in meta)) {
    return "";
  }

  const cause = meta.cause;
  return typeof cause === "string" ? cause.toLowerCase() : "";
}

export function handlePrismaApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: ACCESS_MESSAGES.DB_UNAVAILABLE },
      { status: 503 },
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return NextResponse.json(
      { error: ACCESS_MESSAGES.DB_SCHEMA_OUTDATED },
      { status: 500 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    const fieldName = getMetaFieldName(error);
    const isUserReference =
      fieldName.includes("user") ||
      fieldName.includes("userid") ||
      fieldName.includes("user_id");

    if (isUserReference) {
      return NextResponse.json(
        { error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Dữ liệu liên kết không còn tồn tại. Vui lòng tải lại trang và thử lại." },
      { status: 409 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    const metaText = `${getMetaFieldName(error)} ${getMetaCause(error)}`;
    const isUserReference =
      metaText.includes("user") ||
      metaText.includes("userid") ||
      metaText.includes("user_id");

    if (isUserReference) {
      return NextResponse.json(
        { error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Dữ liệu bạn thao tác không còn tồn tại. Vui lòng tải lại trang và thử lại." },
      { status: 404 },
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
