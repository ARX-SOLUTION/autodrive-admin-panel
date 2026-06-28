import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useDashboardAnalytics } from "@/services/dashboardService";
import { useBranches } from "@/services/branchService";
import PlatformDashboard from "./PlatformDashboard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  UserPlus,
  Car,
  BadgeCheck,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { CourseType } from "@/types/student";

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--popover-foreground))",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--popover-foreground))" },
  itemStyle: { color: "hsl(var(--popover-foreground))" },
  cursor: { fill: "hsl(var(--muted))" },
};

const AXIS_PROPS = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const formatMillion = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " mlrd";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " mln";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + " ming";
  return String(n);
};

const formatSumRaw = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(n));

const PIE_COLORS = [
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];
const RESULT_COLORS = [
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
];

const TenantDashboard = () => {
  const { t } = useTranslation();
  const { isOwner, user } = useAuthStore();
  const [courseType, setCourseType] = useState<CourseType | undefined>();
  const [branchId, setBranchId] = useState<string | undefined>(
    isOwner() ? undefined : user?.branch_id || undefined,
  );
  const { data: analytics, isLoading } = useDashboardAnalytics(
    branchId,
    courseType,
  );
  const { data: branches } = useBranches();

  const owner = isOwner();

  const formatSum = (n: number) =>
    `${formatSumRaw(n)} ${t("dashboard.currency_suffix")}`;
  const trendLabel = (current: number, previous: number) => {
    if (!previous) return null;
    const pct = Math.round(((current - previous) / previous) * 100);
    return {
      text: t("dashboard.trend_compared_last_month", {
        pct: `${pct >= 0 ? "+" : ""}${pct}`,
      }),
      down: pct < 0,
    };
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const revenueTrend = analytics
    ? trendLabel(analytics.this_month_revenue, analytics.last_month_revenue)
    : null;
  const studentTrend = analytics
    ? trendLabel(analytics.new_this_month, analytics.new_last_month)
    : null;

  const totalPieStudents =
    (analytics?.payment_status.paid ?? 0) +
    (analytics?.payment_status.partial ?? 0) +
    (analytics?.payment_status.debt ?? 0);

  const pieData = [
    {
      name: t("dashboard.status_fully_paid"),
      value: analytics?.payment_status.paid ?? 0,
      pct: totalPieStudents
        ? Math.round(
            ((analytics?.payment_status.paid ?? 0) / totalPieStudents) * 100,
          )
        : 0,
    },
    {
      name: t("dashboard.status_partial"),
      value: analytics?.payment_status.partial ?? 0,
      pct: totalPieStudents
        ? Math.round(
            ((analytics?.payment_status.partial ?? 0) / totalPieStudents) * 100,
          )
        : 0,
    },
    {
      name: t("dashboard.status_unpaid"),
      value: analytics?.payment_status.debt ?? 0,
      pct: totalPieStudents
        ? Math.round(
            ((analytics?.payment_status.debt ?? 0) / totalPieStudents) * 100,
          )
        : 0,
    },
  ];

  const resultData = [
    {
      name: t("dashboard.result_studying"),
      value: analytics?.result_stats.oqimoqda ?? 0,
    },
    {
      name: t("dashboard.result_passed"),
      value: analytics?.result_stats.topshirdi ?? 0,
    },
    {
      name: t("dashboard.result_failed"),
      value: analytics?.result_stats.yiqildi ?? 0,
    },
  ];

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-balance">
            {t("dashboard.tenant_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.business_metrics")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs
            value={courseType || "all"}
            onValueChange={(v) =>
              setCourseType(v === "all" ? undefined : (v as CourseType))
            }
          >
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">{t("dashboard.tab_all")}</TabsTrigger>
              <TabsTrigger value="tezkor">
                {t("dashboard.tab_fast")}
              </TabsTrigger>
              <TabsTrigger value="avto_maktab">
                {t("dashboard.tab_school")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {owner && (
            <Select
              value={branchId || "all"}
              onValueChange={(v) => setBranchId(v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder={t("dashboard.all_branches")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.all_branches")}
                </SelectItem>
                {(branches || []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ── Row 1: Student KPIs ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-balance">
          {t("dashboard.section_students")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title={t("dashboard.card_active_students")}
            value={analytics.total_students}
            icon={<GraduationCap className="h-5 w-5" />}
            trend={t("dashboard.card_new_trend", {
              count: analytics.new_this_month,
            })}
          />
          <SummaryCard
            title={t("dashboard.card_new_this_month")}
            value={analytics.new_this_month}
            icon={<UserPlus className="h-5 w-5" />}
            trend={studentTrend?.text}
            trendDown={studentTrend?.down}
          />
          <SummaryCard
            title={t("dashboard.card_fast_track")}
            value={analytics.active_tezkor}
            icon={<Car className="h-5 w-5" />}
          />
          <SummaryCard
            title={t("dashboard.card_driving_school")}
            value={analytics.active_avto}
            icon={<Users className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* ── Row 2: Financial KPIs ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-balance">
          {t("dashboard.section_finance")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {owner && (
            <SummaryCard
              title={t("dashboard.card_this_month_revenue")}
              value={formatSum(analytics.this_month_revenue)}
              icon={<TrendingUp className="h-5 w-5" />}
              trend={revenueTrend?.text}
              trendDown={revenueTrend?.down}
            />
          )}
          {owner && (
            <SummaryCard
              title={t("dashboard.card_total_revenue")}
              value={formatSum(analytics.total_revenue)}
              icon={<Wallet className="h-5 w-5" />}
            />
          )}
          <SummaryCard
            title={t("dashboard.card_total_debt")}
            value={formatSum(analytics.total_debt)}
            icon={<AlertTriangle className="h-5 w-5" />}
            trendDown
            trend={
              analytics.total_debt > 0
                ? t("dashboard.card_total_debt_trend", {
                    count: analytics.payment_status.debt,
                  })
                : undefined
            }
          />
          <SummaryCard
            title={t("dashboard.card_average_debt")}
            value={
              analytics.avg_debt > 0
                ? formatSum(analytics.avg_debt)
                : t("dashboard.card_no_value")
            }
            icon={<TrendingDown className="h-5 w-5" />}
            trendDown={analytics.avg_debt > 0}
          />
          <SummaryCard
            title={t("dashboard.card_graduates")}
            value={analytics.result_stats.topshirdi}
            icon={<BadgeCheck className="h-5 w-5" />}
            trend={
              analytics.result_stats.topshirdi +
                analytics.result_stats.yiqildi >
              0
                ? t("dashboard.card_pass_rate", {
                    pct: Math.round(
                      (analytics.result_stats.topshirdi /
                        (analytics.result_stats.topshirdi +
                          analytics.result_stats.yiqildi)) *
                        100,
                    ),
                  })
                : undefined
            }
          />
        </div>
      </section>

      {/* ── Charts row 1 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        {owner && (
          <div className="glass-card p-5">
            <h3 className="font-heading text-sm font-semibold mb-4 text-balance">
              {t("dashboard.chart_monthly_revenue")}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.monthly_revenue} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis dataKey="month" {...AXIS_PROPS} />
                <YAxis
                  {...AXIS_PROPS}
                  tickFormatter={formatMillion}
                  width={56}
                />
                <Tooltip
                  {...CHART_STYLE}
                  formatter={(v: number) => [
                    formatSum(v),
                    t("dashboard.chart_legend_revenue"),
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--info))"
                  radius={[4, 4, 0, 0]}
                  name={t("dashboard.chart_legend_revenue")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly enrollment */}
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 text-balance">
            {t("dashboard.chart_monthly_enrollment")}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.monthly_enrollment} barSize={16}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis dataKey="month" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} allowDecimals={false} width={30} />
              <Tooltip {...CHART_STYLE} />
              <Bar
                dataKey="tezkor"
                fill="hsl(var(--info))"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.chart_legend_fast")}
              />
              <Bar
                dataKey="avto_maktab"
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.chart_legend_school")}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                }}
                iconType="circle"
                iconSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts row 2 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment status pie */}
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 text-balance">
            {t("dashboard.chart_payment_status")}
          </h3>
          {totalPieStudents === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              {t("dashboard.no_data")}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                    label={({ pct }) => `${pct}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...CHART_STYLE}
                    formatter={(
                      v: number,
                      _: string,
                      props: { payload?: { pct?: number } },
                    ) => [
                      t("dashboard.chart_value_with_pct", {
                        count: v,
                        pct: props.payload?.pct ?? 0,
                      }),
                      "",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-1">
                {pieData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    {d.name}: {d.value} ({d.pct}%)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Result stats */}
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 text-balance">
            {t("dashboard.chart_student_results")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resultData} layout="vertical" barSize={20}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis type="number" {...AXIS_PROPS} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                {...AXIS_PROPS}
                width={80}
              />
              <Tooltip
                {...CHART_STYLE}
                formatter={(v: number) => [
                  t("dashboard.chart_value_unit", { count: v }),
                  "",
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {resultData.map((_, i) => (
                  <Cell key={i} fill={RESULT_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {resultData.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: RESULT_COLORS[i] }}
                />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Branch comparison (owner only, full width) ──────────────────────── */}
      {owner && analytics.branch_stats.length > 1 && (
        <div className="glass-card p-5">
          <h3 className="font-heading text-sm font-semibold mb-4 text-balance">
            {t("dashboard.chart_branch_comparison")}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.branch_stats} barSize={22}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis dataKey="branch" {...AXIS_PROPS} />
              <YAxis
                yAxisId="students"
                orientation="left"
                {...AXIS_PROPS}
                allowDecimals={false}
                width={30}
              />
              <YAxis
                yAxisId="money"
                orientation="right"
                {...AXIS_PROPS}
                tickFormatter={formatMillion}
                width={56}
              />
              <Tooltip
                {...CHART_STYLE}
                formatter={(v: number, name: string) =>
                  name === t("dashboard.chart_legend_students")
                    ? [`${v}`, name]
                    : [formatSum(v), name]
                }
              />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="students"
                dataKey="students"
                fill="hsl(var(--info))"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.chart_legend_students")}
              />
              <Bar
                yAxisId="money"
                dataKey="revenue"
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.chart_legend_revenue")}
              />
              <Bar
                yAxisId="money"
                dataKey="debt"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                name={t("dashboard.chart_legend_debt")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const isDev = useAuthStore((s) => s.isDev);
  if (isDev()) return <PlatformDashboard />;
  return <TenantDashboard />;
};

export default DashboardPage;
