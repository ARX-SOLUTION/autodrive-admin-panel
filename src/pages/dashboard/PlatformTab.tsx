import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, UserCog, TrendingUp, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";
import { usePlatformAnalytics } from "@/services/analyticsService";
import { useAuditLogs } from "@/services/auditService";
import { KpiCard } from "./KpiCard";
import { DashboardCard } from "./DashboardCard";
import { RevenueAreaChart } from "./RevenueAreaChart";
import { DonutCard } from "./DonutCard";
import { ActivityLog } from "./ActivityLog";

const STATUS_COLORS: Record<string, string> = {
  active: "hsl(var(--success))",
  pending: "hsl(var(--warning))",
  suspended: "hsl(var(--destructive))",
};

const formatMillion = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

const formatSumRaw = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(n));

const PlatformTab = () => {
  const { t } = useTranslation();
  const { data: companies, isLoading: companiesLoading } = useCompanies({
    limit: 100,
  });
  const { data: users, isLoading: usersLoading } = usePlatformUsers({
    limit: 100,
  });
  const { data: analytics, isLoading: analyticsLoading } =
    usePlatformAnalytics();
  const { data: auditData } = useAuditLogs({ limit: 6 });

  const recentCompanies = useMemo(() => {
    const items = companies?.items ?? [];
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [companies]);

  if (companiesLoading || usersLoading || analyticsLoading || !analytics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[var(--radius)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-[var(--radius)] lg:col-span-3" />
          <Skeleton className="h-72 rounded-[var(--radius)] lg:col-span-2" />
        </div>
      </div>
    );
  }

  const formatSum = (n: number) =>
    `${formatSumRaw(n)} ${t("dashboard.currency_suffix")}`;

  const activeCompanies = analytics.companies.by_status.active ?? 0;
  const totalCompanies = analytics.companies.total;
  const newCompanies30d = analytics.companies.new_last_30d;
  const totalUsers = analytics.users.total;
  const newUsers30d = analytics.users.new_last_30d;
  const totalBranches = analytics.tenants.branches;
  const activeStudents = analytics.tenants.students_active;
  const revenue30d = analytics.revenue.last_30d_amount;
  const revenue30dCount = analytics.revenue.last_30d_count;

  const monthlyPaymentsSeries = analytics.monthly_growth.map((m) => ({
    label: m.month,
    value: m.payments_count,
  }));
  const companiesSpark = analytics.monthly_growth.map((m) => m.companies);
  const usersSpark = analytics.monthly_growth.map((m) => m.users);
  const paymentsSpark = analytics.monthly_growth.map((m) => m.payments_count);

  const statusSlices = Object.entries(analytics.companies.by_status).map(
    ([k, v]) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: v,
      color: STATUS_COLORS[k] ?? "hsl(var(--primary))",
    }),
  );

  return (
    <div className="space-y-4">
      {/* KPI ROW */}
      <section
        aria-label={t("dashboard.section_overview")}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label={t("dashboard.kpi_active_companies")}
          value={activeCompanies}
          icon={<Briefcase className="h-4 w-4" />}
          iconTone="primary"
          delta={{
            tone: newCompanies30d > 0 ? "up" : "neutral",
            text: `+${newCompanies30d}`,
          }}
          meta={t("dashboard.kpi_active_companies_delta", {
            count: totalCompanies,
          })}
          spark={companiesSpark}
        />
        <KpiCard
          label={t("dashboard.kpi_platform_users")}
          value={totalUsers}
          icon={<UserCog className="h-4 w-4" />}
          iconTone="info"
          delta={{
            tone: newUsers30d > 0 ? "up" : "neutral",
            text: `+${newUsers30d}`,
          }}
          meta={t("dashboard.kpi_platform_users_delta", { count: newUsers30d })}
          spark={usersSpark}
        />
        <KpiCard
          label={t("dashboard.kpi_revenue_30d")}
          value={formatMillion(revenue30d)}
          unit={t("dashboard.currency_suffix")}
          icon={<TrendingUp className="h-4 w-4" />}
          iconTone="success"
          delta={{
            tone: revenue30dCount > 0 ? "up" : "neutral",
            text: t("dashboard.kpi_revenue_30d_delta", {
              count: revenue30dCount,
            }),
          }}
          meta={formatSum(revenue30d)}
          spark={paymentsSpark}
        />
        <KpiCard
          label={t("dashboard.kpi_active_students")}
          value={activeStudents}
          icon={<GraduationCap className="h-4 w-4" />}
          iconTone="warning"
          meta={t("dashboard.kpi_active_students_meta", {
            count: totalBranches,
          })}
        />
      </section>

      {/* CHART + DONUT */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <DashboardCard
          className="lg:col-span-3"
          title={t("dashboard.chart_growth_trend")}
          subtitle={t("dashboard.chart_growth_trend_sub")}
        >
          <RevenueAreaChart
            data={monthlyPaymentsSeries}
            formatValue={(v) => t("dashboard.chart_value_unit", { count: v })}
          />
        </DashboardCard>
        <DashboardCard
          className="lg:col-span-2"
          title={t("dashboard.chart_company_status")}
          subtitle={t("dashboard.section_companies")}
        >
          <DonutCard
            slices={statusSlices}
            centerValue={totalCompanies}
            centerLabel={t("dashboard.section_companies")}
          />
        </DashboardCard>
      </section>

      {/* THREE COLUMN */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard
          title={t("dashboard.recent_companies")}
          subtitle={t("dashboard.recent_companies_sub")}
          action={
            <Link
              to="/companies"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("common.view_all")}
            </Link>
          }
        >
          {recentCompanies.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("dashboard.no_companies")}
            </p>
          ) : (
            <ul className="-mt-1 flex flex-col">
              {recentCompanies.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {c.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === "active"
                          ? "bg-success/10 text-success"
                          : c.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {c.status === "active"
                        ? t("common.active")
                        : c.status === "pending"
                          ? t("companies.status_pending")
                          : t("companies.status_suspended")}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format(new Date(c.created_at), "dd.MM.yyyy")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          title={t("dashboard.section_users")}
          subtitle={t("dashboard.kpi_platform_users")}
        >
          <ul className="-mt-1 flex flex-col">
            {Object.entries(analytics.users.by_role).map(([role, count]) => (
              <li
                key={role}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
              >
                <span className="text-sm font-medium capitalize">
                  {t(`roles.${role}`, role)}
                </span>
                <span className="text-sm font-bold tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title={t("dashboard.section_overview")}
          subtitle={t("dashboard.monthly_payments")}
        >
          <ul className="-mt-1 flex flex-col">
            <li className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-sm text-muted-foreground">
                {t("dashboard.total_companies")}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {totalCompanies}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-sm text-muted-foreground">
                {t("dashboard.total_users")}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {totalUsers}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-sm text-muted-foreground">
                {t("nav.branches")}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {totalBranches}
              </span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-sm text-muted-foreground">
                {t("dashboard.card_total_revenue")}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {formatSum(analytics.revenue.total_amount)}
              </span>
            </li>
          </ul>
        </DashboardCard>
      </section>

      {/* ACTIVITY LOG */}
      <DashboardCard
        title={t("dashboard.activity_recent")}
        subtitle={t("dashboard.activity_recent_sub")}
        action={
          <Link
            to="/audit"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("dashboard.activity_full_link")}
          </Link>
        }
      >
        <ActivityLog
          logs={(auditData?.data ?? []).slice(0, 6)}
          emptyText={t("dashboard.activity_no_data")}
        />
      </DashboardCard>
    </div>
  );
};

export default PlatformTab;
