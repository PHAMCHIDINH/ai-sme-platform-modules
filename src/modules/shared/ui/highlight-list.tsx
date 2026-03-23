import { cn } from "../kernel/utils";

type HighlightItem =
  | string
  | {
      title: React.ReactNode;
      description?: React.ReactNode;
    };

type HighlightListProps = React.ComponentPropsWithoutRef<"ul"> & {
  items: HighlightItem[];
  tone?: "cyan" | "pink" | "yellow" | "lime" | "violet";
};

const dotClasses = {
  cyan: "bg-cyan-200",
  pink: "bg-pink-200",
  yellow: "bg-yellow-200",
  lime: "bg-lime-200",
  violet: "bg-violet-200",
} as const;

export function HighlightList({
  items,
  tone = "cyan",
  className,
  ...props
}: HighlightListProps) {
  return (
    <ul className={cn("space-y-3", className)} {...props}>
      {items.map((item, index) => {
        const content = typeof item === "string" ? { title: item } : item;

        return (
          <li
            key={typeof item === "string" ? `string-${index}-${item}` : `item-${index}-${String(content.title)}`}
            className="flex items-start gap-3 rounded-2xl border-2 border-black bg-white/90 p-4 shadow-neo-sm"
          >
            <span
              aria-hidden="true"
              className={cn("mt-1 size-3 shrink-0 rounded-full border border-black", dotClasses[tone])}
            />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-foreground md:text-base">{content.title}</p>
              {content.description ? (
                <p className="text-sm font-medium leading-6 text-muted-foreground">{content.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
