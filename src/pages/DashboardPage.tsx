import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import PlatformTab from "./dashboard/PlatformTab";
import CompanyTab from "./dashboard/CompanyTab";

type DashboardView = "platform" | "company";

const DashboardPage = () => {
  const { t } = useTranslation();
  const isDev = useAuthStore((s) => s.isDev());
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);

  // Default view: dev with no active company -> platform; otherwise company.
  const [view, setView] = useState<DashboardView>(
    isDev && !activeCompanyId ? "platform" : "company",
  );

  // Non-dev users only see the company view (their company is implicit).
  const showSwitcher = isDev;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            {view === "platform"
              ? t("dashboard.title")
              : t("dashboard.tenant_title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "platform"
              ? t("dashboard.view_platform_hint")
              : t("dashboard.view_company_hint")}
          </p>
        </div>
        {showSwitcher && (
          <Tabs value={view} onValueChange={(v) => setView(v as DashboardView)}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="platform">
                {t("dashboard.tab_platform")}
              </TabsTrigger>
              <TabsTrigger value="company">
                {t("dashboard.tab_company")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </header>

      {view === "platform" && showSwitcher ? <PlatformTab /> : <CompanyTab />}
    </div>
  );
};

export default DashboardPage;
