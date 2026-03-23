"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button, cn } from "@/modules/shared";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  UserCircle,
  Layers,
  LogOut,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";

const routes = {
  SME: [
    { name: "Tổng quan", href: "/sme/dashboard", icon: LayoutDashboard },
    { name: "Dự án của tôi", href: "/sme/projects", icon: FolderKanban },
    { name: "Đăng dự án mới", href: "/sme/projects/new", icon: PlusCircle },
    { name: "Tìm sinh viên", href: "/sme/students", icon: Search },
    { name: "Hồ sơ doanh nghiệp", href: "/sme/profile", icon: UserCircle },
  ],
  STUDENT: [
    { name: "Tổng quan", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Việc làm gợi ý", href: "/student/projects", icon: FolderKanban },
    { name: "Dự án đang làm", href: "/student/my-projects", icon: Layers },
    { name: "Hồ sơ năng lực", href: "/student/profile", icon: UserCircle },
  ],
};

interface DashboardSidebarProps {
  role: "SME" | "STUDENT";
  userName: string;
}

export function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const menuItems = routes[role] || routes.STUDENT;

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <aside className="flex h-full w-80 flex-col bg-transparent p-4 md:p-5">
      <div className="surface-panel mb-4 p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl border-2 border-black bg-violet-200 p-1.5 shadow-neo-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-foreground/60">
              Bright editorial demo
            </span>
            <span className="text-lg font-black">
              VnSME<span className="text-violet-700">Match</span>
            </span>
          </div>
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border-2 border-black bg-cyan-200/85 p-4 shadow-neo-sm">
        <div className="mb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/70">
          Workspace hiện tại
        </div>
        <div className="truncate text-base font-black">{userName}</div>
        <div className="mt-2 inline-flex rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.12em] shadow-neo-sm">
          {role === "SME" ? "Doanh nghiệp SME" : "Sinh viên thực chiến"}
        </div>
      </div>

      <div className="surface-panel flex min-h-0 flex-1 flex-col p-3">
        <div className="mb-3 px-2 text-xs font-black uppercase tracking-[0.16em] text-foreground/60">
          Điều hướng chính
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) &&
                item.href !== "/sme/dashboard" &&
                item.href !== "/student/dashboard");

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-11 w-full justify-start rounded-xl text-sm",
                    isActive ? "bg-pink-200 hover:bg-pink-300" : "bg-white/90 hover:bg-yellow-200"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-black bg-white/90 p-3 shadow-neo-sm">
        <Button
          variant="destructive"
          className="w-full justify-start rounded-xl"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
