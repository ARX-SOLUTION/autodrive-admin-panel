import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useDashboardAnalytics } from "@/services/dashboardService";
import { useBranches } from "@/services/branchService";
import { usePayments } from "@/services/paymentService";
import { useAuditLogs } from "@/services/auditService";
import { CourseType } from "@/types/student";
import { KpiCard } from "./KpiCard";
import { DashboardCard } from "./DashboardCard";
import { RevenueAreaChart } from "./RevenueAreaChart";
import { DonutCard } from "./DonutCard";
import { ActivityLog } from "./ActivityLog";

const formatMillion = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};

const formatSumRaw = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(n));

const BRANCH_GRADIENTS = [
  "from-[hsl(221_83%_53%)] to-[hsl(199_89%_48%)]",
  "from-[hsl(38_92%_50%)] to-[hsl(15_86%_56%)]",
  "from-[hsl(142_71%_38%)] to-[hsl(160_70%_42%)]",
  "from-[hsl(262_83%_58%)] to-[hsl(290_70%_56%)]",
  "from-[hsl(0_72%_51%)] to-[hsl(340_80%_56%)]",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const COURSE_COLORS = {
  tezkor: "hsl(38 92% 50%)",
  avto_maktab: "hsl(221 83% 53%)",
};

const RESULT_COLORS = {
  oqimoqda: "hsl(var(--info))",
  topshirdi: "hsl(var(--success))",
  yiqildi: "hsl(var(--destructive))",
};

const CompanyTab = () => {
  const { t } = useTranslation();
  const { isOwner, isDev, user } = useAuthStore();
  const owner = isOwner() || isDev();
  const [courseType, setCourseType] = useState<CourseType | undefined>();
  const [branchId, setBranchId] = useState<string | undefined>(
    owner ? undefined : user?.branch_id || undefined,
  );

  const { data: analytics, isLoading } = useDashboardAnalytics(
    branchId,
    courseType,
  );
  const { data: branches } = useBranches();
  const { data: payments } = usePayments(branchId, courseType);
  const { data: auditData } = useAuditLogs({ limit: 6 });

  const recentPayments = useMemo(() => {
    if (!payments) return [];
    return [...payments]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [payments]);

  if (isLoading || !analytics) {
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

  // Trend
  const trendPct = (() => {
    if (!analytics.last_month_revenue) return null;
    const pct = Math.round(
      ((analytics.this_month_revenue - analytics.last_month_revenue) /
        analytics.last_month_revenue) *
        100,
    );
    return pct;
  })();

  const revenueSeries = analytics.monthly_revenue.map((m) => ({
    label: m.month,
    value: m.amount,
  }));

  const revenueSpark = analytics.monthly_revenue.map((m) => m.amount);
  const studentSpark = analytics.monthly_enrollment.map(
    (m) => m.tezkor + m.avto_maktab,
  );

  // Course mix
  const courseSlices = [
    {
      name: t("dashboard.course_avto"),
      value: analytics.active_avto,
      color: COURSE_COLORS.avto_maktab,
    },
    {
      name: t("dashboard.course_tezkor"),
      value: analytics.active_tezkor,
      color: COURSE_COLORS.tezkor,
    },
  ];

  // Top branches
  const topBranches = [...(analytics.branch_stats ?? [])]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Result mix
  const resultSlices = [
    {
      name: t("dashboard.result_studying"),
      value: analytics.result_stats.oqimoqda,
      color: RESULT_COLORS.oqimoqda,
    },
    {
      name: t("dashboard.result_passed"),
      value: analytics.result_stats.topshirdi,
      color: RESULT_COLORS.topshirdi,
    },
    {
      name: t("dashboard.result_failed"),
      value: analytics.result_stats.yiqildi,
      color: RESULT_COLORS.yiqildi,
    },
  ];

  const totalStudents = analytics.total_students;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={courseType || "all"}
          onValueChange={(v) =>
            setCourseType(v === "all" ? undefined : (v as CourseType))
          }
        >
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">{t("dashboard.tab_all")}</TabsTrigger>
            <TabsTrigger value="tezkor">{t("dashboard.tab_fast")}</TabsTrigger>
            <TabsTrigger value="avto_maktab">
              {t("dashboard.tab_school")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {owner && branches && branches.length > 0 && (
          <Select
            value={branchId || "all"}
            onValueChange={(v) => setBranchId(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-44 bg-secondary border-border">
              <SelectValue placeholder={t("dashboard.all_branches")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.all_branches")}</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* KPI ROW */}
      <section
        aria-label={t("dashboard.section_overview")}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label={t("dashboard.kpi_this_month_revenue")}
          value={formatMillion(analytics.this_month_revenue)}
          unit={t("dashboard.currency_suffix")}
          icon={<TrendingUp className="h-4 w-4" />}
          iconTone="primary"
          delta={
            trendPct === null
              ? undefined
              : {
                  tone: trendPct > 0 ? "up" : trendPct < 0 ? "down" : "neutral",
                  text: `${trendPct >= 0 ? "+" : ""}${trendPct}%`,
                }
          }
          meta={t("dashboard.kpi_this_month_revenue_meta", {
            sum: formatMillion(analytics.last_month_revenue),
          })}
          spark={revenueSpark}
        />
        <KpiCard
          label={t("dashboard.kpi_total_students")}
          value={totalStudents}
          icon={<GraduationCap className="h-4 w-4" />}
          iconTone="info"
          delta={
            analytics.new_this_month > 0
              ? { tone: "up", text: `+${analytics.new_this_month}` }
              : undefined
          }
          meta={t("dashboard.kpi_total_students_meta", {
            count: analytics.new_this_month,
          })}
          spark={studentSpark}
        />
        <KpiCard
          label={t("dashboard.kpi_total_debt")}
          value={formatMillion(analytics.total_debt)}
          unit={t("dashboard.currency_suffix")}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconTone="warning"
          delta={
            analytics.payment_status.debt > 0
              ? {
                  tone: "down",
                  text: t("dashboard.kpi_total_debt_meta", {
                    count: analytics.payment_status.debt,
                  }),
                }
              : undefined
          }
          meta={formatSum(analytics.total_debt)}
        />
        <KpiCard
          label={t("dashboard.kpi_new_this_month")}
          value={analytics.new_this_month}
          icon={<UserPlus className="h-4 w-4" />}
          iconTone="success"
          meta={t("dashboard.kpi_new_this_month_meta", {
            count: analytics.new_last_month,
          })}
        />
      </section>

      {/* CHART + DONUT */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {owner && (
          <DashboardCard
            className="lg:col-span-3"
            title={t("dashboard.chart_revenue_trend")}
            subtitle={t("dashboard.chart_revenue_trend_sub")}
          >
            <RevenueAreaChart
              data={revenueSeries}
              formatValue={(v) => formatSum(v)}
              formatTick={formatMillion}
            />
          </DashboardCard>
        )}
        <DashboardCard
          className={owner ? "lg:col-span-2" : "lg:col-span-5"}
          title={t("dashboard.chart_course_mix")}
          subtitle={t("dashboard.chart_course_mix_sub")}
        >
          <DonutCard
            slices={courseSlices}
            centerValue={totalStudents}
            centerLabel={t("dashboard.kpi_total_students")}
            formatValue={(v) => t("dashboard.course_students", { count: v })}
          />
        </DashboardCard>
      </section>

      {/* THREE COLUMN */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard
          title={t("dashboard.top_branches")}
          subtitle={t("dashboard.top_branches_sub")}
          action={
            <Link
              to="/filiallar"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("dashboard.top_branches_link")}
            </Link>
          }
        >
          {topBranches.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("dashboard.no_branches_data")}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 text-left font-semibold">
                    {t("dashboard.th_branch")}
                  </th>
                  <th className="py-2.5 text-right font-semibold">
                    {t("dashboard.th_revenue")}
                  </th>
                  <th className="py-2.5 text-right font-semibold">
                    {t("dashboard.th_students")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topBranches.map((b, idx) => (
                  <tr
                    key={b.branch}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-2.5 font-medium">
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br text-[11px] font-bold text-white ${BRANCH_GRADIENTS[idx % BRANCH_GRADIENTS.length]}`}
                          aria-hidden
                        >
                          {initials(b.branch)}
                        </span>
                        <span className="truncate">{b.branch}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      {formatMillion(b.revenue)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {b.students}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DashboardCard>

        <DashboardCard
          title={t("dashboard.recent_payments")}
          subtitle={t("dashboard.recent_payments_sub")}
          action={
            <Link
              to="/tolovlar"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("dashboard.recent_payments_link")}
            </Link>
          }
        >
          {recentPayments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("dashboard.no_payments")}
            </p>
          ) : (
            <ul className="-mt-1 flex flex-col">
              {recentPayments.map((p, idx) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white ${BRANCH_GRADIENTS[idx % BRANCH_GRADIENTS.length]}`}
                    aria-hidden
                  >
                    {initials(p.student_name)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {p.student_name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.branch_name} ·{" "}
                      {p.course_type === "tezkor"
                        ? t("dashboard.course_tezkor")
                        : t("dashboard.course_avto")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums text-success">
                      +{formatSumRaw(p.amount_paid)}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {format(new Date(p.created_at), "dd MMM")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          title={t("dashboard.student_results")}
          subtitle={t("dashboard.student_results_sub")}
        >
          <DonutCard
            slices={resultSlices}
            centerValue={
              analytics.result_stats.oqimoqda +
              analytics.result_stats.topshirdi +
              analytics.result_stats.yiqildi
            }
            centerLabel={t("dashboard.section_students")}
          />
        </DashboardCard>
      </section>

      {/* ACTIVITY LOG */}
      <DashboardCard
        title={t("dashboard.activity_recent")}
        subtitle={t("dashboard.activity_company_sub")}
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

export default CompanyTab;
