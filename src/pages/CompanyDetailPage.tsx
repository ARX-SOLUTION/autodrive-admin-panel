import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  KeyRound,
  Layers,
  Mail,
  PauseCircle,
  Pencil,
  Phone,
  UserCog,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";
import {
  useApproveCompany,
  useCompany,
  useSuspendCompany,
} from "@/services/companyService";
import { usePlatformUsers } from "@/services/platformUserService";
import { useBranches } from "@/services/branchService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataCard } from "@/components/ui/DataCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompanyStatus } from "@/types/company";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/errors";

const statusVariant: Record<
  CompanyStatus,
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  pending: "secondary",
  suspended: "destructive",
};

const roleLabel: Record<UserRole, string> = {
  dev: "Platforma admin",
  owner: "Egasi",
  manager: "Manager",
  operator: "Operator",
  teacher: "O'qituvchi",
};

const StatTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number | string;
}) => (
  <Card className="flex items-center gap-3 p-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
    </div>
  </Card>
);

const USERS_PAGE_SIZE = 10;

const CompanyDetailPage = () => {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);
  const { data: company, isLoading } = useCompany(id);
  const { currentPage: usersPage, setCurrentPage: setUsersPage } =
    usePagination([], USERS_PAGE_SIZE);
  const { data: users, isLoading: usersLoading } = usePlatformUsers({
    companyId: id,
    page: usersPage,
    limit: USERS_PAGE_SIZE,
  });
  const { data: branches, isLoading: branchesLoading } = useBranches({
    companyId: id,
  });
  const approve = useApproveCompany();
  const suspend = useSuspendCompany();
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const userItems = users?.items ?? [];
  const usersTotalPages = users
    ? Math.max(1, Math.ceil(users.total / USERS_PAGE_SIZE))
    : 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t("company_detail.not_found_title")}
        description={t("company_detail.not_found_desc")}
        action={{
          label: t("company_detail.not_found_action"),
          onClick: () => navigate("/companies"),
        }}
      />
    );
  }

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(id);
      toast.success(t("company_detail.toast_approved"));
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setConfirmApprove(false);
    }
  };

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync(id);
      toast.success(t("company_detail.toast_blocked"));
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setConfirmSuspend(false);
    }
  };

  const handleViewAs = () => {
    setActiveCompanyId(id);
    toast.success(t("company_detail.toast_view_as", { name: company.name }));
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/companies"
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-bold text-foreground text-balance">
                {company.name}
              </h1>
              <Badge variant={statusVariant[company.status]}>
                {company.status}
              </Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              slug: {company.slug}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleViewAs}>
            {t("company_detail.view_as")}
          </Button>
          {company.status !== "active" && (
            <Button size="sm" onClick={() => setConfirmApprove(true)}>
              <CheckCircle2 className="mr-1 h-4 w-4" />{" "}
              {t("company_detail.approve")}
            </Button>
          )}
          {company.status === "active" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmSuspend(true)}
            >
              <PauseCircle className="mr-1 h-4 w-4" />{" "}
              {t("company_detail.block")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/companies")}
          >
            <Pencil className="mr-1 h-4 w-4" /> {t("company_detail.edit")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            {t("company_detail.tab_overview")}
          </TabsTrigger>
          <TabsTrigger value="branches">
            {t("company_detail.tab_branches")}
          </TabsTrigger>
          <TabsTrigger value="users">
            {t("company_detail.tab_users")}
          </TabsTrigger>
          <TabsTrigger value="audit">
            {t("company_detail.tab_audit")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatTile
              icon={Building2}
              label={t("company_detail.stat_branches")}
              value={company.stats?.branches ?? 0}
            />
            <StatTile
              icon={Users}
              label={t("company_detail.stat_users")}
              value={company.stats?.users ?? 0}
            />
            <StatTile
              icon={GraduationCap}
              label={t("company_detail.stat_students")}
              value={company.stats?.students ?? 0}
            />
            <StatTile
              icon={CreditCard}
              label={t("company_detail.stat_payments")}
              value={company.stats?.payments ?? 0}
            />
          </div>

          <Card className="p-4">
            <h2 className="mb-3 font-heading text-sm font-semibold text-foreground text-balance">
              {t("company_detail.section_contact")}
            </h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">
                  {t("company_detail.label_phone")}
                </dt>
                <dd className="text-foreground">
                  {company.contact_phone ?? "—"}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">
                  {t("company_detail.label_email")}
                </dt>
                <dd className="text-foreground">
                  {company.contact_email ?? "—"}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">
                  {t("company_detail.label_created")}
                </dt>
                <dd className="text-foreground">
                  {format(new Date(company.created_at), "dd-MMM-yyyy HH:mm")}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <dt className="text-muted-foreground">
                  {t("company_detail.label_updated")}
                </dt>
                <dd className="text-foreground">
                  {format(new Date(company.updated_at), "dd-MMM-yyyy HH:mm")}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 font-heading text-sm font-semibold text-foreground text-balance">
              {t("company_detail.section_quick")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("company_detail.quick_help")}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-3">
          {branchesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !branches || branches.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t("company_detail.branches_empty_title")}
              description={t("company_detail.branches_empty_desc")}
            />
          ) : (
            <div className="grid gap-3">
              {branches.map((b) => (
                <DataCard
                  key={b.id}
                  title={b.name}
                  subtitle={b.location}
                  fields={[
                    {
                      label: t("company_detail.branch_manager"),
                      value: b.manager_name ?? "—",
                    },
                    {
                      label: t("company_detail.branch_active_students"),
                      value: b.active_students ?? 0,
                    },
                    {
                      label: t("company_detail.branch_created"),
                      value: b.created_at
                        ? format(new Date(b.created_at), "dd-MMM-yyyy")
                        : "—",
                    },
                  ]}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          {usersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !users || userItems.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title={t("company_detail.users_empty_title")}
              description={t("company_detail.users_empty_desc")}
              action={{
                label: t("company_detail.users_empty_action"),
                onClick: () => navigate("/platform-users"),
              }}
            />
          ) : (
            <>
              <div className="grid gap-3">
                {userItems.map((u) => (
                  <DataCard
                    key={u.id}
                    title={u.name || u.email}
                    subtitle={u.email}
                    fields={[
                      {
                        label: t("company_detail.user_role"),
                        value: roleLabel[u.role] ?? u.role,
                      },
                      {
                        label: t("company_detail.user_branch"),
                        value: u.branch_name ?? "—",
                      },
                      {
                        label: t("company_detail.user_phone"),
                        value: u.phone ?? "—",
                      },
                      {
                        label: t("company_detail.user_created"),
                        value: u.created_at
                          ? format(new Date(u.created_at), "dd-MMM-yyyy")
                          : "—",
                      },
                    ]}
                    actions={
                      <Link
                        to="/platform-users"
                        aria-label={t("common.edit")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Link>
                    }
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={setUsersPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-3">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-heading text-sm font-semibold text-foreground text-balance">
                {t("company_detail.audit_section_title")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("company_detail.audit_help")}{" "}
              <Button
                variant="link"
                className="h-auto p-0 align-baseline"
                onClick={() => {
                  navigate(`/audit?company=${id}`);
                }}
              >
                {t("company_detail.audit_link")}
              </Button>
              {t("company_detail.audit_help_tail")}
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        title={t("company_detail.confirm_approve_title")}
        description={t("company_detail.confirm_approve_desc", {
          name: company.name,
        })}
        onConfirm={handleApprove}
        loading={approve.isPending}
      />
      <ConfirmDialog
        open={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        title={t("company_detail.confirm_block_title")}
        description={t("company_detail.confirm_block_desc", {
          name: company.name,
        })}
        onConfirm={handleSuspend}
        loading={suspend.isPending}
      />
    </div>
  );
};

export default CompanyDetailPage;
