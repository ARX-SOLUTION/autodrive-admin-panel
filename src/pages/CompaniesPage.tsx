import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Briefcase,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";
import { extractErrorMessage } from "@/lib/errors";
import { Company, CompanyStatus } from "@/types/company";
import {
  useApproveCompany,
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useSuspendCompany,
  useUpdateCompany,
} from "@/services/companyService";
import * as XLSX from "xlsx";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const StatusLabel = ({ status }: { status: CompanyStatus }) => {
  const { t } = useTranslation();
  return <>{t(`companies.status_${status}`)}</>;
};

const STATUS_BADGE: Record<CompanyStatus, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
};

interface FormState {
  name: string;
  slug: string;
  status: CompanyStatus;
  contactPhone: string;
  contactEmail: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  status: "active",
  contactPhone: "",
  contactEmail: "",
};

const CompaniesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [sortField, setSortField] = useState<keyof Company>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Company | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading } = useCompanies({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });
  const createMut = useCreateCompany();
  const updateMut = useUpdateCompany();
  const deleteMut = useDeleteCompany();
  const approveMut = useApproveCompany();
  const suspendMut = useSuspendCompany();

  const items = data?.items ?? [];

  const toggleSort = (field: keyof Company) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc" ? (va < vb ? -1 : va > vb ? 1 : 0) : va > vb ? -1 : va < vb ? 1 : 0;
  });

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(sorted);
  const startIndex = (currentPage - 1) * 10;

  const exportToExcel = () => {
    const rows = sorted.map((c, idx) => ({
      "#": idx + 1,
      [t('companies.name')]: c.name,
      [t('companies.slug')]: c.slug,
      [t('companies.status')]: c.status === 'active' ? t('common.active') : c.status === 'pending' ? t('companies.status_pending') : t('companies.status_suspended'),
      [t('common.phone')]: c.contact_phone ?? "—",
      [t('common.email')]: c.contact_email ?? "—",
      [t('companies.created')]: formatDate(c.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('companies.title'));
    XLSX.writeFile(wb, `kompaniyalar_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditItem(c);
    setForm({
      name: c.name,
      slug: c.slug,
      status: c.status,
      contactPhone: c.contact_phone ?? "",
      contactEmail: c.contact_email ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      status: form.status,
      contactPhone: form.contactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
    };
    if (editItem) {
      updateMut.mutate(
        { id: editItem.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t('companies.toast_updated'));
            setModalOpen(false);
          },
          onError: (err) => toast.error(extractErrorMessage(err)),
        },
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success(t('companies.toast_created'));
          setModalOpen(false);
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t('companies.toast_deleted'));
        setDeleteId(null);
      },
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const handleApprove = (id: string) =>
    approveMut.mutate(id, {
      onSuccess: () => toast.success(t('companies.toast_approved')),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });

  const handleSuspend = (id: string) =>
    suspendMut.mutate(id, {
      onSuccess: () => toast.success(t('companies.toast_suspended')),
      onError: (err) => toast.error(extractErrorMessage(err)),
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-balance">{t('companies.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('companies.count', { count: items.length })}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={exportToExcel}
            disabled={sorted.length === 0}
          >
            <Download className="h-4 w-4" /> {t('companies.export')}
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t('companies.add_new')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('companies.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CompanyStatus | "all")}>
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('companies.filter_all')}</SelectItem>
            <SelectItem value="active">{t('companies.status_active')}</SelectItem>
            <SelectItem value="pending">{t('companies.status_pending')}</SelectItem>
            <SelectItem value="suspended">{t('companies.status_suspended')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {t('companies.name')}
                    {sortField === "name" ? (
                      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('companies.slug')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('companies.contact')}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('companies.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {t('companies.created')}
                    {sortField === "created_at" ? (
                      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('companies.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={7} className="p-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedItems.map((c, idx) => (
                    <tr key={c.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/kompaniyalar/${c.id}`} className="hover:text-primary hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{c.contact_email || "—"}</span>
                          <span className="text-xs">{c.contact_phone || ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status]}`}
                        >
                          {t(`companies.status_${c.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatDate(c.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {c.status !== "active" && (
                            <button
                              onClick={() => handleApprove(c.id)}
                              disabled={approveMut.isPending}
                              title={t('companies.approve_action')}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {c.status !== "suspended" && (
                            <button
                              onClick={() => handleSuspend(c.id)}
                              disabled={suspendMut.isPending}
                              title={t('companies.suspend_action')}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(c)}
                            title={t('companies.edit_action')}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(c.id)}
                            title={t('companies.delete_action')}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {items.length === 0 && !isLoading && (
            <EmptyState
              icon={Briefcase}
              title={t('companies.not_found_title')}
              description={t('companies.not_found_desc')}
            />
          )}
        </div>
      </div>

      {/* Card list (mobile) */}
      <div className="grid gap-3 md:hidden">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t('companies.not_found_title')}
            description={t('companies.not_found_desc')}
          />
        ) : (
          paginatedItems.map((c) => (
            <DataCard
              key={c.id}
              title={c.name}
              subtitle={c.slug}
              onClick={() => navigate(`/kompaniyalar/${c.id}`)}
              fields={[
                {
                  label: t('companies.status'),
                  value: (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[c.status]}`}
                    >
                      {t(`companies.status_${c.status}`)}
                    </span>
                  ),
                },
                { label: t('companies.created'), value: formatDate(c.created_at) },
                { label: t('companies.branch_count'), value: "—" },
                { label: t('companies.user_count'), value: "—" },
                { label: t('companies.contact'), value: c.contact_phone || c.contact_email || "—" },
              ]}
              actions={
                <>
                  {c.status !== "active" && (
                    <button
                      onClick={() => handleApprove(c.id)}
                      disabled={approveMut.isPending}
                      title={t('companies.approve_action')}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {c.status !== "suspended" && (
                    <button
                      onClick={() => handleSuspend(c.id)}
                      disabled={suspendMut.isPending}
                      title={t('companies.suspend_action')}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(c)}
                    title={t('companies.edit_action')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    title={t('companies.delete_action')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              }
            />
          ))
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editItem ? t('companies.edit_title') : t('companies.add_title')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('companies.name_label')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('companies.slug_label')}</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder={t('companies.slug_placeholder')}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                {t('companies.slug_helper')}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t('companies.status_label')}</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as CompanyStatus }))}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('companies.status_active')}</SelectItem>
                  <SelectItem value="pending">{t('companies.status_pending')}</SelectItem>
                  <SelectItem value="suspended">{t('companies.status_suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('companies.phone_label')}</Label>
              <Input
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder={t('companies.phone_placeholder')}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('companies.email_label')}</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                placeholder={t('companies.email_placeholder')}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending
                  ? t('common.saving')
                  : editItem
                    ? t('common.save')
                    : t('common.add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default CompaniesPage;
