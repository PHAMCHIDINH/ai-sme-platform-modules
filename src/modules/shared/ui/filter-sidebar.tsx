import { ReactNode } from "react";

import { cn } from "../kernel/utils";

type FilterSidebarProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FilterSidebar({
  title = "Filters",
  description = "Refine the results to match your goals.",
  children,
  className,
}: FilterSidebarProps) {
  return (
    <aside className={cn("rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-5", className)}>
      <div className="mb-4 border-b border-black/10 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-700">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </aside>
  );
}
