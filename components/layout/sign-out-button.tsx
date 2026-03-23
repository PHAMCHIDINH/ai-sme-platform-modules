"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/modules/shared/ui";

export function SignOutButton() {
  return (
    <Button
      className="rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50"
      onClick={() => signOut({ callbackUrl: "/login" })}
      size="sm"
      variant="outline"
    >
      Đăng xuất
    </Button>
  );
}
