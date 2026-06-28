import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Route slug → i18n nav key. Unknown slugs (e.g. UUIDs) fall back to raw slug. */
const SEGMENT_NAV_KEYS: Record<string, string> = {
  dashboard: "nav.dashboard",
  kompaniyalar: "nav.companies",
  "platform-foydalanuvchilar": "nav.platform_users",
  "system-health": "nav.system_health",
  filiallar: "nav.branches",
  guruhlar: "nav.groups",
  talabalar: "nav.students",
  tolovlar: "nav.payments",
  operatorlar: "nav.operators",
  oqituvchilar: "nav.teachers",
  foydalanuvchilar: "nav.users",
  audit: "nav.audit",
  profile: "nav.profile",
};

export const Breadcrumbs = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "login") return null;

  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const navKey = SEGMENT_NAV_KEYS[segment];
    const label = navKey ? t(navKey) : segment;
    return { segment, href, label };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1 text-sm"
    >
      <Link
        to="/dashboard"
        className="inline-flex items-center text-muted-foreground hover:text-foreground"
        aria-label={t("actions.home")}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground">{c.label}</span>
            ) : (
              <Link
                to={c.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
