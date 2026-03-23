import { cn } from "../kernel/utils";

type MarketingSectionProps = React.ComponentPropsWithoutRef<"section"> & {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
};

export function MarketingSection({
  kicker,
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}: MarketingSectionProps) {
  return (
    <section className={cn("surface-panel p-6 md:p-10", className)} {...props}>
      <div className={cn("space-y-4", headerClassName)}>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <div className="space-y-3">
          <h2 className="editorial-title text-balance text-foreground">{title}</h2>
          {description ? (
            <p className="max-w-3xl text-base font-medium leading-7 text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("mt-8", contentClassName)}>{children}</div>
    </section>
  );
}
