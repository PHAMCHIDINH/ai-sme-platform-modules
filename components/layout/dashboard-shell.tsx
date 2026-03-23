"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type DashboardShellProps = {
  role: "SME" | "STUDENT";
  name: string;
  children: React.ReactNode;
};

export function DashboardShell({ role, name, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar onClose={() => setMobileOpen(false)} open={mobileOpen} pathname={pathname} role={role} />
      <div className="lg:pl-72">
        <Header name={name} onToggleNavigation={() => setMobileOpen((current) => !current)} role={role} />
        <main className="page-wrap py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
