import { cn } from "../kernel/utils";

const toneClasses = {
  cyan: "bg-cyan-200/70",
  pink: "bg-pink-200/70",
  yellow: "bg-yellow-200/80",
  lime: "bg-lime-200/75",
  violet: "bg-violet-200/75",
  white: "bg-white/95",
} as const;

type MarketingHeroStatTone = keyof typeof toneClasses;

type MarketingHeroStatProps = React.ComponentPropsWithoutRef<"article"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: MarketingHeroStatTone;
};

export function MarketingHeroStat({
  label,
  value,
  detail,
  tone = "white",
  className,
  ...props
}: MarketingHeroStatProps) {
  return (
    <article className={cn("metric-panel space-y-3", toneClasses[tone], className)} {...props}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-foreground/70">{label}</p>
      <p className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{value}</p>
      {detail ? <p className="text-sm font-medium leading-6 text-muted-foreground">{detail}</p> : null}
    </article>
  );
}
