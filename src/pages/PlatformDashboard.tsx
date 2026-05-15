import { Link } from "react-router-dom";
import {
  Briefcase,
  UserCog,
  ShieldCheck,
  Pause,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const PlatformDashboard = () => {
  const { data: companies, isLoading: companiesLoading } = useCompanies({ limit: 100 });
  const { data: users, isLoading: usersLoading } = usePlatformUsers({ limit: 100 });

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
        <h1 className="font-heading text-2xl font-bold">Platforma boshqaruvi</h1>
        <p className="text-sm text-muted-foreground">
          Barcha kompaniyalar va foydalanuvchilarni nazorat qiling
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Kompaniyalar
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title="Jami kompaniyalar"
            value={stats.total}
            icon={<Briefcase className="h-5 w-5" />}
          />
          <SummaryCard
            title="Faol"
            value={stats.active}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <SummaryCard
            title="Kutilmoqda"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
          />
          <SummaryCard
            title="To'xtatilgan"
            value={stats.suspended}
            icon={<Pause className="h-5 w-5" />}
            trendDown={stats.suspended > 0}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Foydalanuvchilar
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title="Jami foydalanuvchilar"
            value={userStats.total}
            icon={<UserCog className="h-5 w-5" />}
          />
          <SummaryCard title="Owner" value={userStats.owners} />
          <SummaryCard title="Manager" value={userStats.managers} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold">
              So'nggi qo'shilgan kompaniyalar
            </h3>
            <Link to="/kompaniyalar">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Barchasi <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {recentCompanies.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Hozircha kompaniyalar yo'q
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {recentCompanies.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
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
                      {c.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
            <h3 className="font-heading text-sm font-semibold">Tezkor amallar</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Link to="/kompaniyalar">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4" /> Kompaniyalarni boshqarish
              </Button>
            </Link>
            <Link to="/platform-foydalanuvchilar">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserCog className="h-4 w-4" /> Foydalanuvchilar va parol
              </Button>
            </Link>
            <Link to="/audit">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShieldCheck className="h-4 w-4" /> Audit jurnali
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
