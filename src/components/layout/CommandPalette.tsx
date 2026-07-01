import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  GraduationCap,
  CreditCard,
  Headphones,
  Users,
  User,
  Layers,
  UserCog,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuthStore } from "@/store/authStore";
import { useCompanies } from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";

type NavEntry = {
  labelKey: string;
  path: string;
  icon: typeof LayoutDashboard;
  devOnly?: boolean;
  ownerOnly?: boolean;
  branchAccess?: boolean;
};

const NAV_ENTRIES: NavEntry[] = [
  { labelKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    labelKey: "nav.companies",
    path: "/companies",
    icon: Briefcase,
    devOnly: true,
  },
  {
    labelKey: "nav.platform_users",
    path: "/platform-users",
    icon: KeyRound,
    devOnly: true,
  },
  {
    labelKey: "nav.branches",
    path: "/branches",
    icon: Building2,
    branchAccess: true,
  },
  { labelKey: "nav.groups", path: "/groups", icon: Layers },
  { labelKey: "nav.students", path: "/students", icon: GraduationCap },
  { labelKey: "nav.payments", path: "/payments", icon: CreditCard },
  { labelKey: "nav.operators", path: "/operators", icon: Headphones },
  { labelKey: "nav.teachers", path: "/teachers", icon: Users },
  {
    labelKey: "nav.users",
    path: "/users",
    icon: UserCog,
    ownerOnly: true,
  },
  { labelKey: "nav.audit", path: "/audit", icon: ShieldCheck, ownerOnly: true },
  { labelKey: "nav.profile", path: "/profile", icon: User },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDev = useAuthStore((s) => s.isDev());
  const isOwner = useAuthStore((s) => s.isOwner());
  const canViewBranches = useAuthStore((s) => s.canViewBranches());
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);

  const { data: companies } = useCompanies({ limit: 100 });
  const { data: users } = usePlatformUsers({ limit: 100 });

  const visibleNav = NAV_ENTRIES.filter((n) => {
    if (n.devOnly) return isDev;
    if (n.branchAccess) return canViewBranches;
    if (n.ownerOnly) return isOwner || isDev;
    return true;
  });

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const goCompany = (id: string) => {
    setActiveCompanyId(id);
    onOpenChange(false);
    navigate(`/companies/${id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("actions.search_companies_users")} />
      <CommandList>
        <CommandEmpty>{t("actions.search_empty")}</CommandEmpty>

        <CommandGroup heading={t("actions.search_pages")}>
          {visibleNav.map((n) => {
            const label = t(n.labelKey);
            return (
              <CommandItem
                key={n.path}
                value={`${label} ${n.path}`}
                onSelect={() => go(n.path)}
              >
                <n.icon className="mr-2 h-4 w-4" />
                {label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {isDev && companies?.items && companies.items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("nav.companies")}>
              {companies.items.slice(0, 20).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`company ${c.name} ${c.slug}`}
                  onSelect={() => goCompany(c.id)}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {c.slug}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {isDev && users?.items && users.items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("actions.search_users")}>
              {users.items.slice(0, 20).map((u) => (
                <CommandItem
                  key={u.id}
                  value={`user ${u.name} ${u.email}`}
                  onSelect={() => go("/platform-users")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{u.name || u.email}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {u.role}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

/**
 * Hook that registers the cmd+k / ctrl+k global shortcut and exposes
 * open state for the command palette.
 */
export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
};
