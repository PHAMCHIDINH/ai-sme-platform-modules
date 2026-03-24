import { ReactNode } from "react";

import { cn } from "../kernel/utils";

type ProfileSummaryPanelProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ProfileSummaryPanel({ title, subtitle, meta, actions, children, className }: ProfileSummaryPanelProps) {
  return (
    <section className={cn("rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h2>
          {subtitle ? <p className="text-sm leading-6 text-slate-600 md:text-base">{subtitle}</p> : null}
          {meta ? <div className="flex flex-wrap gap-2 text-sm text-slate-500">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-5 border-t border-black/10 pt-5">{children}</div> : null}
    </section>
  );
}
