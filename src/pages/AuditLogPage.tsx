import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useAuditLogs } from "@/services/auditService";
import { useAuthStore } from "@/store/authStore";
import { useCompanies } from "@/services/companyService";
import { AuditLog } from "@/types/audit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  CalendarIcon,
  X,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const formatDate = (d: string) => {
  try {
    if (!d) return "—";
    return format(new Date(d), "dd.MM.yyyy HH:mm");
  } catch {
    return d;
  }
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-success",
  UPDATE: "text-primary",
  DELETE: "text-destructive",
};

const ACTION_BG: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-primary/10 text-primary",
  DELETE: "bg-destructive/10 text-destructive",
};

const FIELD_LABELS: Record<string, string> = {
  firstName: "Ismi",
  first_name: "Ismi",
  lastName: "Familyasi",
  last_name: "Familyasi",
  phone: "Telefon",
  paymentMethod: "To'lov turi",
  payment_method: "To'lov turi",
  totalPrice: "Kurs narxi",
  total_price: "Kurs narxi",
  amountPaid: "To'langan",
  amount_paid: "To'langan",
  amount: "Miqdor",
  debt: "Qarzdorlik",
  groupId: "Guruh ID",
  group_id: "Guruh ID",
  branchId: "Filial ID",
  branch_id: "Filial ID",
  courseType: "Kurs turi",
  course_type: "Kurs turi",
  result: "Natijasi",
  hasDocument: "Hujjat",
  has_document: "Hujjat",
  notes: "Izoh",
  status: "Holati",
  date: "Sana",
  recordedBy: "Operator",
  recorded_by: "Operator",
  name: "Nomi",
  isActive: "Faol",
  is_active: "Faol",
  role: "Rol",
  username: "Login",
  studentId: "Talaba ID",
  deletedId: "O'chirilgan ID",
  completionDate: "Tugatish sanasi",
  completion_date: "Tugatish sanasi",
  contractNumber: "Shartnoma raqami",
  contract_number: "Shartnoma raqami",
  o83: "O83",
  initialPayment: "Boshlang'ich to'lov",
  initial_payment: "Boshlang'ich to'lov",
};

const VALUE_LABELS: Record<string, string> = {
  naqd: "Naqd",
  karta: "Karta",
  tezkor: "Tezkor",
  avto_maktab: "Avto maktab",
  oqimoqda: "Oqimoqda",
  topshirdi: "Topshirdi",
  yiqildi: "Yiqildi",
  owner: "Egasi",
  manager: "Menejer",
  operator: "Operator",
  teacher: "O'qituvchi",
  active: "Faol",
  inactive: "Nofaol",
};

const formatValue = (v: unknown): string => {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Ha" : "Yo'q";
  if (typeof v === "number") return new Intl.NumberFormat("uz-UZ").format(v);
  if (typeof v === "object") return JSON.stringify(v);
  const s = String(v);
  if (VALUE_LABELS[s]) return VALUE_LABELS[s];
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try {
      return format(new Date(s), "dd.MM.yyyy HH:mm");
    } catch {
      return s;
    }
  }
  return s;
};

const AuditChangesView = ({
  changes,
  action,
}: {
  changes: Record<string, unknown>;
  action: string;
}) => {
  const { t } = useTranslation();
  const hasBefore = "before" in changes;
  const hasAfter = "after" in changes;

  if (hasBefore || hasAfter) {
    const before = (changes.before || {}) as Record<string, unknown>;
    const after = (changes.after || {}) as Record<string, unknown>;
    const allKeys = [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ];
    const changedKeys = allKeys.filter(
      (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
    );

    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {t("audit.detail_changes")}
        </p>
        {changedKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("audit.detail_no_changes")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">
                    {t("audit.detail_field")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("audit.detail_old_value")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("audit.detail_new_value")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {changedKeys.map((k) => (
                  <tr
                    key={k}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium">
                      {FIELD_LABELS[k] || k}
                    </td>
                    <td className="px-3 py-2 text-destructive">
                      {formatValue(before[k])}
                    </td>
                    <td className="px-3 py-2 text-success">
                      {formatValue(after[k])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const keys = Object.keys(changes).filter((k) => changes[k] != null);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {action === "CREATE"
          ? t("audit.detail_created_data")
          : action === "DELETE"
            ? t("audit.detail_deleted_data")
            : t("audit.detail_changes")}
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">
                {t("audit.detail_field")}
              </th>
              {action === "UPDATE" ? (
                <>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("audit.detail_old")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("audit.detail_new_value")}
                  </th>
                </>
              ) : (
                <th className="px-3 py-2 text-left font-medium">
                  {t("audit.detail_value")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const val = changes[k];
              const isFromTo =
                val !== null &&
                typeof val === "object" &&
                "from" in (val as object) &&
                "to" in (val as object);
              const fromTo = isFromTo
                ? (val as { from: unknown; to: unknown })
                : null;
              return (
                <tr key={k} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 font-medium">
                    {FIELD_LABELS[k] || k}
                  </td>
                  {action === "UPDATE" ? (
                    fromTo ? (
                      <>
                        <td className="px-3 py-2 text-destructive">
                          {formatValue(fromTo.from)}
                        </td>
                        <td className="px-3 py-2 text-success">
                          {formatValue(fromTo.to)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-muted-foreground">
                          {"—"}
                        </td>
                        <td className="px-3 py-2">{formatValue(val)}</td>
                      </>
                    )
                  ) : (
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatValue(val)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const weekAgo = () => {
  const d = today();
  d.setDate(d.getDate() - 6);
  return d;
};
const monthStart = () => {
  const d = today();
  d.setDate(1);
  return d;
};
const lastMonthStart = () => {
  const d = today();
  d.setMonth(d.getMonth() - 1, 1);
  return d;
};
const lastMonthEnd = () => {
  const d = today();
  d.setDate(0);
  return d;
};

const AuditLogPage = () => {
  const { t } = useTranslation();
  const tt = (key: string) => t(key);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const LIMIT = 50;

  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "all";
  const [companyFilter, setCompanyFilter] = useState(initialCompany);
  const [sortField, setSortField] = useState("createdAt");

  const { isOwner } = useAuthStore();
  const { data: companiesData } = useCompanies();
  const companies = companiesData?.items || [];
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const { data, isLoading } = useAuditLogs({
    entity: entityFilter !== "all" ? entityFilter : undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
    companyId: companyFilter !== "all" ? companyFilter : undefined,
    startDate: dateFrom,
    endDate: dateTo,
    page,
    limit: LIMIT,
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filtered = logs.filter((l) => {
    const name = l.user?.name?.toLowerCase() || "";
    return !search || name.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: unknown, vb: unknown;
    if (sortField === "userName") {
      va = a.user?.name || "";
      vb = b.user?.name || "";
    } else if (sortField === "createdAt") {
      va = a.createdAt;
      vb = b.createdAt;
    } else {
      va = (a as Record<string, unknown>)[sortField];
      vb = (b as Record<string, unknown>)[sortField];
    }
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc"
      ? va < vb
        ? -1
        : va > vb
          ? 1
          : 0
      : va > vb
        ? -1
        : va < vb
          ? 1
          : 0;
  });

  const hasAnyFilter =
    !!dateFrom ||
    !!dateTo ||
    entityFilter !== "all" ||
    actionFilter !== "all" ||
    !!search ||
    companyFilter !== "all";

  const setPreset = (
    preset: "today" | "week" | "month" | "lastMonth" | "all",
  ) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    switch (preset) {
      case "today":
        setDateFrom(today());
        setDateTo(now);
        break;
      case "week":
        setDateFrom(weekAgo());
        setDateTo(now);
        break;
      case "month":
        setDateFrom(monthStart());
        setDateTo(now);
        break;
      case "lastMonth":
        setDateFrom(lastMonthStart());
        setDateTo(lastMonthEnd());
        break;
      case "all":
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
    }
    setPage(1);
  };

  const clearAll = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setEntityFilter("all");
    setActionFilter("all");
    setCompanyFilter("all");
    setSearch("");
    setPage(1);
  };

  const SortTh = ({
    field,
    label,
    align = "left",
  }: {
    field: string;
    label: string;
    align?: string;
  }) => (
    <th className={`px-4 py-3 text-${align} font-medium text-muted-foreground`}>
      <button
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {sortField === field ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </button>
    </th>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2 text-balance">
          <ShieldCheck className="h-6 w-6" /> {t("audit.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("audit.subtitle")}</p>
      </div>

      {/* Filters */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-balance">
            {t("audit.filter_title")}
          </h2>
          {hasAnyFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 gap-1 text-xs"
            >
              <X className="h-3 w-3" /> {t("audit.clear_all")}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {(["today", "week", "month", "lastMonth", "all"] as const).map(
            (p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => setPreset(p)}
              >
                {p === "today"
                  ? t("audit.preset_today")
                  : p === "week"
                    ? t("audit.preset_week")
                    : p === "month"
                      ? t("audit.preset_month")
                      : p === "lastMonth"
                        ? t("audit.preset_last_month")
                        : t("audit.preset_all")}
              </Button>
            ),
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOwner() && (
            <Select
              value={companyFilter}
              onValueChange={(v) => {
                setCompanyFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 bg-secondary border-border">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={entityFilter}
            onValueChange={(v) => {
              setEntityFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("audit.entity_all")}</SelectItem>
              <SelectItem value="student">
                {t("audit.entity_student")}
              </SelectItem>
              <SelectItem value="payment">
                {t("audit.entity_payment")}
              </SelectItem>
              <SelectItem value="user">{t("audit.entity_user")}</SelectItem>
              <SelectItem value="branch">{t("audit.entity_branch")}</SelectItem>
              <SelectItem value="group">{t("audit.entity_group")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("audit.action_all")}</SelectItem>
              <SelectItem value="CREATE">{t("audit.action_create")}</SelectItem>
              <SelectItem value="UPDATE">{t("audit.action_update")}</SelectItem>
              <SelectItem value="DELETE">{t("audit.action_delete")}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-[200px] justify-start text-left font-normal bg-secondary border-border",
                  !dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {!dateFrom
                  ? t("audit.date_placeholder")
                  : dateTo && dateTo.getTime() !== dateFrom.getTime()
                    ? `${format(dateFrom, "dd.MM.yyyy")} → ${format(dateTo, "dd.MM.yyyy")}`
                    : format(dateFrom, "dd.MM.yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateFrom, to: dateTo }}
                onSelect={(range) => {
                  if (!range) {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  } else {
                    setDateFrom(range.from);
                    setDateTo(range.to ?? range.from);
                  }
                  setPage(1);
                }}
                numberOfMonths={2}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("audit.search_placeholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-secondary border-border"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-balance">
            {t("audit.list_title")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t("audit.record_count", { count: total })}
          </span>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    #
                  </th>
                  <SortTh field="userName" label={t("audit.col_user")} />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("audit.col_role")}
                  </th>
                  <SortTh field="action" label={t("audit.col_action")} />
                  <SortTh field="entity" label={t("audit.col_entity")} />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("audit.col_detail")}
                  </th>
                  <SortTh field="createdAt" label={t("audit.col_time")} />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={7} className="p-4">
                        <Skeleton className="h-5" />
                      </td>
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {t("audit.no_records")}
                    </td>
                  </tr>
                ) : (
                  sorted.map((log, idx) => (
                    <tr
                      key={log.id}
                      className="table-row-striped border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {log.user?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {tt(`roles.${log.user?.role}`) || log.user?.role || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-medium text-xs",
                            ACTION_COLORS[log.action],
                          )}
                        >
                          {tt(`audit.action_${log.action.toLowerCase()}`) ||
                            log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {tt(`audit.entity_${log.entity.toLowerCase()}`) ||
                          log.entity}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[240px] truncate">
                        {log.changes
                          ? JSON.stringify(log.changes)
                          : log.entityId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap tabular-nums">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden p-3">
            {isLoading ? (
              <div className="grid gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title={t("audit.not_found_title")}
                description={t("audit.not_found_desc")}
              />
            ) : (
              <div className="grid gap-3">
                {sorted.map((log) => (
                  <DataCard
                    key={log.id}
                    title={`${tt(`audit.action_${log.action.toLowerCase()}`) || log.action} · ${tt(`audit.entity_${log.entity.toLowerCase()}`) || log.entity}`}
                    subtitle={log.user?.name || "—"}
                    fields={[
                      {
                        label: t("common.date"),
                        value: formatDate(log.createdAt),
                      },
                      {
                        label: t("audit.detail_entity_id"),
                        value: log.entityId?.slice(0, 8) || "—",
                      },
                      {
                        label: t("common.branch"),
                        value: log.user?.branchId || "—",
                      },
                      { label: t("common.company"), value: "—" },
                    ]}
                    onClick={() => setSelectedLog(log)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("audit.previous")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("audit.next")}
            </Button>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(o) => !o && setSelectedLog(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      ACTION_BG[selectedLog.action],
                    )}
                  >
                    {tt(`audit.action_${selectedLog.action.toLowerCase()}`) ||
                      selectedLog.action}
                  </span>
                  <span>
                    {tt(`audit.entity_${selectedLog.entity.toLowerCase()}`) ||
                      selectedLog.entity}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm rounded-md bg-muted/30 px-4 py-3">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {t("audit.detail_user")}
                    </span>
                    <p className="font-medium">
                      {selectedLog.user?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {t("audit.detail_role")}
                    </span>
                    <p>
                      {tt(`roles.${selectedLog.user?.role}`) ||
                        selectedLog.user?.role ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {t("audit.detail_time")}
                    </span>
                    <p>{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {t("audit.detail_entity_id")}
                    </span>
                    <p className="font-mono text-xs truncate">
                      {selectedLog.entityId}
                    </p>
                  </div>
                </div>

                {selectedLog.changes ? (
                  <AuditChangesView
                    changes={selectedLog.changes}
                    action={selectedLog.action}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("audit.detail_no_detail")}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogPage;
