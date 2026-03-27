import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "./button";
import { cn } from "../kernel/utils";

export type PortalSearchField = {
  id: string;
  label: string;
  placeholder: string;
};

export type PortalHeroMetric = {
  label: string;
  value: string;
  helper?: string;
};

export type PortalBrowseLink = {
  label: string;
  href: string;
};

type PortalSearchHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  fields: PortalSearchField[];
  primaryActionLabel: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  metrics: PortalHeroMetric[];
  browseLinks: PortalBrowseLink[];
  className?: string;
  actionSlot?: ReactNode;
};

export function PortalSearchHero({
  eyebrow,
  title,
  description,
  fields,
  primaryActionLabel,
  primaryActionHref = "#",
  secondaryActionLabel,
  secondaryActionHref = "#",
  metrics,
  browseLinks,
  className,
  actionSlot,
}: PortalSearchHeroProps) {
  return (
    <section className={cn("rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8", className)}>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{eyebrow}</p>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight text-slate-900 md:text-6xl">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{description}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-slate-50 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{field.label}</span>
              <input
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-600/30 transition focus:ring-2"
                id={field.id}
                name={field.id}
                placeholder={field.placeholder}
                type="text"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={primaryActionHref}>
            <Button className="!h-11 !rounded-full !border-0 bg-emerald-700 px-6 text-white hover:bg-emerald-800">
              {primaryActionLabel}
            </Button>
          </Link>
          {secondaryActionLabel ? (
            <Link href={secondaryActionHref}>
              <Button
                className="!h-11 !rounded-full border border-black/10 bg-white px-6 text-slate-800 hover:bg-slate-50"
                variant="outline"
              >
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : null}
          {actionSlot}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
            {metric.helper ? <p className="mt-1 text-sm text-slate-500">{metric.helper}</p> : null}
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {browseLinks.map((link) => (
          <Link
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            href={link.href}
            key={`${link.href}:${link.label}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
