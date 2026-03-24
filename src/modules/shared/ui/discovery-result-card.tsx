import { ReactNode } from "react";

import { cn } from "../kernel/utils";

type DiscoveryResultCardProps = {
  eyebrow?: ReactNode;
  leading?: ReactNode;
  title: string;
  summary?: string;
  metadata?: ReactNode;
  badges?: ReactNode;
  score?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function DiscoveryResultCard({
  eyebrow,
  leading,
  title,
  summary,
  metadata,
  badges,
  score,
  actions,
  className,
}: DiscoveryResultCardProps) {
  return (
    <article className={cn("overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm", className)}>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {leading ? <div className="shrink-0">{leading}</div> : null}
            <div className="min-w-0 space-y-2">
              {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{eyebrow}</div> : null}
              <h3 className="text-lg font-semibold leading-snug text-slate-900">{title}</h3>
            </div>
          </div>
          {score ? <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{score}</div> : null}
        </div>

        {summary ? <p className="line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p> : null}
        {metadata ? <div className="flex flex-wrap gap-3 text-sm text-slate-500">{metadata}</div> : null}
        {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 border-t border-black/10 bg-slate-50 p-4">{actions}</div> : null}
    </article>
  );
}
