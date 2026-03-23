import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role as string | undefined;

  // Chưa đăng nhập mà vào trang protected → redirect về login
  const isProtected =
    pathname.startsWith("/sme") || pathname.startsWith("/student");
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Sai role → redirect về đúng dashboard
  if (session && pathname.startsWith("/sme") && role !== "SME") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }
  if (session && pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/sme/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/sme/:path*",
    "/student/:path*",
  ],
};
