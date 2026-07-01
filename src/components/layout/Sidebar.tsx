import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  CreditCard,
  Headphones,
  Users,
  User,
  LogOut,
  ChevronLeft,
  Layers,
  UserCog,
  ShieldCheck,
  Briefcase,
  KeyRound,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type NavItem = {
  path: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  ownerOnly?: boolean;
  devOnly?: boolean;
  branchAccess?: boolean;
};

type NavSection = {
  titleKey?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    items: [
      { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    ],
  },
  {
    titleKey: "common.platform_admin",
    items: [
      {
        path: "/companies",
        labelKey: "nav.companies",
        icon: Briefcase,
        devOnly: true,
      },
      {
        path: "/platform-users",
        labelKey: "nav.platform_users",
        icon: KeyRound,
        devOnly: true,
      },
      {
        path: "/system-health",
        labelKey: "nav.system_health",
        icon: Activity,
        devOnly: true,
      },
    ],
  },
  {
    titleKey: "common.management",
    items: [
      {
        path: "/branches",
        labelKey: "nav.branches",
        icon: Building2,
        branchAccess: true,
      },
      { path: "/groups", labelKey: "nav.groups", icon: Layers },
      { path: "/students", labelKey: "nav.students", icon: GraduationCap },
      { path: "/payments", labelKey: "nav.payments", icon: CreditCard },
    ],
  },
  {
    titleKey: "common.staff",
    items: [
      { path: "/operators", labelKey: "nav.operators", icon: Headphones },
      { path: "/teachers", labelKey: "nav.teachers", icon: Users },
      {
        path: "/users",
        labelKey: "nav.users",
        icon: UserCog,
        ownerOnly: true,
      },
    ],
  },
  {
    items: [
      {
        path: "/audit",
        labelKey: "nav.audit",
        icon: ShieldCheck,
        ownerOnly: true,
      },
      { path: "/profile", labelKey: "nav.profile", icon: User },
    ],
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

const SidebarContent = ({ collapsed, onNavigate }: SidebarContentProps) => {
  const location = useLocation();
  const { user, logout, isOwner, isDev, canViewBranches } = useAuthStore();
  const { t } = useTranslation();

  const canSee = (item: NavItem) => {
    if (item.devOnly) return isDev();
    if (item.branchAccess) return canViewBranches();
    if (item.ownerOnly) return isOwner() || isDev();
    return true;
  };

  const visibleSections = navSections
    .map((section) => ({ ...section, items: section.items.filter(canSee) }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center">
          <img src="/favicon.png" alt="Logo" className="h-full w-full" />
        </div>
        {!collapsed && (
          <span className="font-heading text-lg font-bold text-foreground">
            {t("app.title")}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {visibleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && section.titleKey && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {t(section.titleKey)}
              </div>
            )}
            {section.items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors rounded-lg",
                    collapsed
                      ? "justify-center mx-auto w-10 h-10"
                      : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary/10 text-primary neon-glow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 px-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "dev"
                ? t("roles.dev")
                : user?.role === "owner"
                  ? t("roles.owner")
                  : user?.branch_name}
            </p>
          </div>
        )}
        <div
          className={cn(
            "flex items-center",
            collapsed
              ? "flex-col gap-2 justify-center"
              : "justify-between px-1",
          )}
        >
          <button
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            className={cn(
              "flex items-center rounded-lg text-sm text-muted-foreground hover:text-destructive transition-colors",
              collapsed ? "justify-center w-10 h-10" : "gap-2 px-2 py-2",
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>{t("actions.logout")}</span>}
          </button>
        </div>
      </div>
    </>
  );
};

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export const Sidebar = ({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Desktop: fixed aside on md+ */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-glass-border-light backdrop-blur-2xl transition-all duration-300 md:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={
            collapsed ? t("actions.sidebar_open") : t("actions.sidebar_close")
          }
          className="absolute -right-3 top-20 z-10 rounded-full border border-border bg-background p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </aside>

      {/* Mobile: drawer below md */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 [&>button]:text-sidebar-foreground"
        >
          <div className="flex h-full flex-col">
            <SidebarContent
              collapsed={false}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
