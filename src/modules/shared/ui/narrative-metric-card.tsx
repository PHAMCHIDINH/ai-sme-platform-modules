import { cn } from "../kernel/utils";

const accentClasses = {
  cyan: "bg-cyan-200",
  pink: "bg-pink-200",
  yellow: "bg-yellow-200",
  lime: "bg-lime-200",
  violet: "bg-violet-200",
} as const;

type NarrativeMetricCardAccent = keyof typeof accentClasses;

type NarrativeMetricCardProps = React.ComponentPropsWithoutRef<"article"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  accent?: NarrativeMetricCardAccent;
};

export function NarrativeMetricCard({
  eyebrow,
  title,
  value,
  description,
  footer,
  accent = "cyan",
  className,
  ...props
}: NarrativeMetricCardProps) {
  return (
    <article className={cn("metric-panel flex h-full flex-col gap-4", className)} {...props}>
      <div className="space-y-3">
        {eyebrow ? (
          <span
            className={cn(
              "inline-flex rounded-full border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-foreground shadow-neo-sm",
              accentClasses[accent]
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-foreground/70">{title}</p>
          <p className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{value}</p>
          {description ? (
            <p className="text-sm font-medium leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {footer ? <div className="mt-auto border-t-2 border-black/80 pt-4 text-sm font-semibold">{footer}</div> : null}
    </article>
  );
}
