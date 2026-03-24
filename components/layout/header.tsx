import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge, Button } from "@/modules/shared/ui";

type HeaderProps = {
  name: string;
  role: "SME" | "STUDENT";
  onToggleNavigation: () => void;
};

export function Header({ name, role, onToggleNavigation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 px-4 pt-4 md:px-8">
      <div className="page-wrap flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <Button className="lg:hidden rounded-full border border-border bg-white text-slate-700 hover:bg-slate-50" onClick={onToggleNavigation} size="sm" variant="outline">
            Menu
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workspace
            </p>
            <p className="text-sm font-semibold text-foreground md:text-base">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 font-semibold text-emerald-700" variant="outline">
            {role === "SME" ? "Doanh nghiệp" : "Sinh viên"}
          </Badge>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
