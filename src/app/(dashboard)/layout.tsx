import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: "SME" | "STUDENT"; name?: string | null; email?: string | null };
  const role = user.role === "SME" ? "SME" : "STUDENT";
  const userName = user.name || user.email || "Người dùng";

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex">
        <DashboardSidebar role={role} userName={userName} />
      </div>

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,166,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(166,250,255,0.18),transparent_28%)]" />

        <header className="relative px-4 pt-4 md:hidden">
          <div className="surface-panel flex min-h-16 items-center justify-between px-4 py-3">
            <span className="text-base font-black">
              VnSME<span className="text-violet-700">Match</span>
            </span>
            <div className="max-w-[180px] truncate text-sm font-semibold">{userName}</div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
          <div className="mx-auto h-full max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
