import { cn } from "../kernel/utils";

export type DiscoveryMetricItem = {
  label: string;
  value: string;
  helper?: string;
};

type DiscoveryMetricStripProps = {
  metrics: DiscoveryMetricItem[];
  className?: string;
};

export function DiscoveryMetricStrip({ metrics, className }: DiscoveryMetricStripProps) {
  return (
    <section className={cn("grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-xl border border-black/10 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
          {metric.helper ? <p className="mt-1 text-sm text-slate-500">{metric.helper}</p> : null}
        </article>
      ))}
    </section>
  );
}
