"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/modules/shared";
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
    <aside className="flex h-full w-72 flex-col border-r border-border/60 bg-white/70 p-4 backdrop-blur md:p-5">
      <div className="mb-3 rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-1.5">
            <Layers className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Career Portal
            </span>
            <span className="text-lg font-semibold text-slate-900">
              VnSME<span className="text-emerald-700">Match</span>
            </span>
          </div>
        </Link>
      </div>

      <div className="mb-4 rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Workspace
        </div>
        <div className="truncate text-base font-semibold text-slate-900">{userName}</div>
        <div className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
          {role === "SME" ? "Doanh nghiệp SME" : "Sinh viên thực chiến"}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/80 bg-white p-3 shadow-sm">
        <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Main navigation
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) &&
                item.href !== "/sme/dashboard" &&
                item.href !== "/student/dashboard");

            return (
              <Link
                className={cn(
                  "flex h-11 items-center rounded-xl px-3 text-sm font-medium transition",
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                )}
                key={item.href}
                href={item.href}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border/80 bg-white p-3 shadow-sm">
        <button
          className="flex h-11 w-full items-center rounded-xl bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
