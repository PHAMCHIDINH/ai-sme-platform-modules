"use client";

import Link from "next/link";
import { Button } from "@/modules/shared";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Layers, Search, UserRound } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0 }}
      className="fixed left-0 right-0 top-0 z-50"
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <div
        className={`mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-7xl items-center justify-between rounded-2xl border border-black/10 px-4 py-3 transition-all md:px-6 ${
          scrolled
            ? "bg-white/96 shadow-sm backdrop-blur"
            : "bg-white/88 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-1.5">
            <Layers className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="space-y-0.5 leading-none">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Project Marketplace
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              VnSME<span className="text-emerald-700">Match</span>
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 lg:flex">
          <Link href="/student/projects" className="transition hover:text-emerald-700">
            Projects
          </Link>
          <Link href="/sme/students" className="transition hover:text-emerald-700">
            Students
          </Link>
          <Link href="/sme/projects" className="transition hover:text-emerald-700">
            SMEs
          </Link>
          <Link href="/ai-standardization" className="transition hover:text-emerald-700">
            AI Matching
          </Link>
          <Link href="/about" className="transition hover:text-emerald-700">
            For Businesses
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 md:inline-flex"
            href="/student/projects"
          >
            <Search className="h-4 w-4" /> Search
          </Link>
          <Link href="/login">
            <Button className="hidden rounded-full border border-black/10 bg-white px-4 text-slate-700 hover:bg-slate-50 sm:inline-flex" variant="outline">
              <UserRound className="h-4 w-4" />
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full border-0 bg-emerald-700 px-4 text-white hover:bg-emerald-800">
              <Building2 className="h-4 w-4" /> Dành cho SME
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
