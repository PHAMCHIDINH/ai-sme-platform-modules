import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge, Button } from "@/modules/shared";

type HeaderProps = {
  name: string;
  role: "SME" | "STUDENT";
  onToggleNavigation: () => void;
};

export function Header({ name, role, onToggleNavigation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 px-4 pt-4 md:px-8">
      <div className="page-wrap surface-panel flex min-h-20 items-center justify-between gap-3 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <Button className="lg:hidden" onClick={onToggleNavigation} size="sm" variant="secondary">
            Menu
          </Button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Investor demo shell
            </p>
            <p className="text-sm font-semibold text-foreground md:text-base">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={role === "SME" ? "default" : "secondary"} className="rounded-full px-3">
            {role === "SME" ? "Doanh nghiệp" : "Sinh viên"}
          </Badge>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
