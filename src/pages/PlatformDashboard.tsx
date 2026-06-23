import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  UserCog,
  ShieldCheck,
  Pause,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";
import { usePlatformAnalytics } from "@/services/analyticsService";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const STATUS_COLORS: Record<string, string> = {
  active: "hsl(var(--success))",
  pending: "hsl(var(--warning))",
  suspended: "hsl(var(--destructive))",
};

const PlatformDashboard = () => {
  const { t } = useTranslation();
  const { data: companies, isLoading: companiesLoading } = useCompanies({ limit: 100 });
  const { data: users, isLoading: usersLoading } = usePlatformUsers({ limit: 100 });
  const { data: analytics, isLoading: analyticsLoading } = usePlatformAnalytics();

  const companyItems = companies?.items ?? [];
  const userItems = users?.items ?? [];

  const stats = {
    total: companies?.total ?? companyItems.length,
    active: companyItems.filter((c) => c.status === "active").length,
    pending: companyItems.filter((c) => c.status === "pending").length,
    suspended: companyItems.filter((c) => c.status === "suspended").length,
  };

  const userStats = {
    total: users?.total ?? userItems.length,
    owners: userItems.filter((u) => u.role === "owner").length,
    managers: userItems.filter((u) => u.role === "manager").length,
  };

  const recentCompanies = [...companyItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const isLoading = companiesLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-balance">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-balance">
          {t('dashboard.section_companies')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title={t('dashboard.total_companies')}
            value={stats.total}
            icon={<Briefcase className="h-5 w-5" />}
          />
          <SummaryCard
            title={t('common.active')}
            value={stats.active}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <SummaryCard
            title={t('companies.status_pending')}
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
          />
          <SummaryCard
            title={t('companies.status_suspended')}
            value={stats.suspended}
            icon={<Pause className="h-5 w-5" />}
            trendDown={stats.suspended > 0}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-balance">
          {t('dashboard.section_users')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title={t('dashboard.total_users')}
            value={userStats.total}
            icon={<UserCog className="h-5 w-5" />}
          />
          <SummaryCard title="Owner" value={userStats.owners} />
          <SummaryCard title="Manager" value={userStats.managers} />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-balance">
          {t('dashboard.section_analytics')}
        </h2>
        {analyticsLoading || !analytics ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="glass-card p-5">
              <h3 className="mb-3 font-heading text-sm font-semibold text-balance">
                {t('dashboard.company_status')}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.companies.by_status).map(([k, v]) => ({
                      name: k,
                      value: v,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {Object.keys(analytics.companies.by_status).map((status) => (
                      <Cell key={status} fill={STATUS_COLORS[status] ?? "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="mb-3 font-heading text-sm font-semibold text-balance">
                {t('dashboard.monthly_growth')}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.monthly_growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    name={t('dashboard.legend_companies')}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name={t('dashboard.legend_users')}
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="mb-3 font-heading text-sm font-semibold text-balance">
                {t('dashboard.monthly_payments')}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.monthly_growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="payments_count"
                    name={t('dashboard.legend_payments')}
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-balance">
              {t('dashboard.recent_companies')}
            </h3>
            <Link to="/kompaniyalar">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {t('common.view_all')} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {recentCompanies.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('dashboard.no_companies')}
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {recentCompanies.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 scroll-animate">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.slug}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === "active"
                          ? "bg-success/10 text-success"
                          : c.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {c.status === "active" ? t('common.active') : c.status === "pending" ? t('companies.status_pending') : t('companies.status_suspended')}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-balance">{t('dashboard.quick_actions')}</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Link to="/kompaniyalar">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4" /> {t('dashboard.manage_companies')}
              </Button>
            </Link>
            <Link to="/platform-foydalanuvchilar">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserCog className="h-4 w-4" /> {t('dashboard.manage_users')}
              </Button>
            </Link>
            <Link to="/audit">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShieldCheck className="h-4 w-4" /> {t('dashboard.audit_log')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
