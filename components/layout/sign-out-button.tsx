"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/modules/shared/ui";

export function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/login" })} size="sm" variant="secondary">
      Đăng xuất
    </Button>
  );
}
