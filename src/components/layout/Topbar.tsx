import { Menu } from "lucide-react";
import { CompanySwitcher } from "./CompanySwitcher";
import { useAuthStore } from "@/store/authStore";

interface TopbarProps {
  onMobileMenuClick: () => void;
}

export const Topbar = ({ onMobileMenuClick }: TopbarProps) => {
  const isDev = useAuthStore((s) => s.isDev());
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4 md:px-6">
      <button
        type="button"
        aria-label="Yon menyu"
        onClick={onMobileMenuClick}
        className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-end gap-3">
        {isDev && <CompanySwitcher />}
      </div>
    </header>
  );
};
