import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
import { formatPhone } from "@/lib/phoneFormater";
import { validateNewPassword } from "@/lib/password";
import { User, UserRole } from "@/types/user";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCompanies } from "@/services/companyService";
import {
  useCreatePlatformUser,
  useDeletePlatformUser,
  usePlatformUsers,
  useResetPlatformUserPassword,
  useUpdatePlatformUser,
} from "@/services/platformUserService";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd.MM.yyyy");
  } catch {
    return d;
  }
};

const ROLE_LABEL: Record<UserRole, string> = {
  dev: "Dev",
  owner: "Owner",
  manager: "Manager",
  operator: "Operator",
  teacher: "Teacher",
};

const ROLE_BADGE: Record<UserRole, string> = {
  dev: "bg-primary/10 text-primary",
  owner: "bg-primary/10 text-primary",
  manager: "bg-blue-500/10 text-blue-500",
  operator: "bg-amber-500/10 text-amber-600",
  teacher: "bg-emerald-500/10 text-emerald-600",
};

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  companyId: string;
  branchId: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "manager",
  companyId: "",
  branchId: "",
};

const PlatformUsersPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading } = usePlatformUsers({
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    companyId: companyFilter === "all" ? undefined : companyFilter,
    limit: 100,
  });
  const { data: companiesData } = useCompanies({ limit: 100 });
  const companies = companiesData?.items ?? [];

  const createMut = useCreatePlatformUser();
  const updateMut = useUpdatePlatformUser();
  const deleteMut = useDeletePlatformUser();
  const resetMut = useResetPlatformUserPassword();

  const sorted = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
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
  }, [data?.items, sortField, sortDir]);

  const { currentPage, totalPages, paginatedItems, setCurrentPage } =
    usePagination(sorted);
  const startIndex = (currentPage - 1) * 10;

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditItem(u);
    setForm({
      name: u.name ?? "",
      email: u.email,
      password: "",
      phone: u.phone ?? "",
      role: u.role,
      companyId: u.company_id ?? "",
      branchId: u.branch_id ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    if (editItem) {
      updateMut.mutate(
        {
          id: editItem.id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          role: form.role,
          companyId: form.companyId || undefined,
          branchId: form.branchId || undefined,
        },
        {
          onSuccess: () => {
            toast.success(t("platform_users.toast_updated"));
            setModalOpen(false);
          },
          onError: (err) => toast.error(extractErrorMessage(err)),
        },
      );
    } else {
      const policyError = validateNewPassword(form.password);
      if (policyError) {
        toast.error(policyError);
        return;
      }
      createMut.mutate(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          role: form.role,
          companyId: form.companyId || undefined,
          branchId: form.branchId || undefined,
        },
        {
          onSuccess: () => {
            toast.success(t("platform_users.toast_created"));
            setModalOpen(false);
          },
          onError: (err) => toast.error(extractErrorMessage(err)),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("platform_users.toast_deleted"));
        setDeleteId(null);
      },
      onError: (err) => toast.error(extractErrorMessage(err)),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    const policyError = validateNewPassword(newPassword);
    if (policyError) {
      toast.error(policyError);
      return;
    }
    resetMut.mutate(
      { id: resetTarget.id, password: newPassword },
      {
        onSuccess: () => {
          toast.success(t("platform_users.toast_password_reset"));
          setResetTarget(null);
          setNewPassword("");
        },
        onError: (err) => toast.error(extractErrorMessage(err)),
      },
    );
  };

  const showCompanyField = form.role !== "dev";
  const showBranchField =
    form.role === "manager" ||
    form.role === "operator" ||
    form.role === "teacher";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-balance">
            {t("platform_users.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("platform_users.count", { count: items.length })}
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t("platform_users.add_new")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("platform_users.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as UserRole | "all")}
        >
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("platform_users.filter_all_roles")}
            </SelectItem>
            <SelectItem value="dev">{t("roles.dev")}</SelectItem>
            <SelectItem value="owner">{t("roles.owner")}</SelectItem>
            <SelectItem value="manager">{t("roles.manager")}</SelectItem>
            <SelectItem value="operator">{t("roles.operator")}</SelectItem>
            <SelectItem value="teacher">{t("roles.teacher")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-56 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("platform_users.filter_all_companies")}
            </SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {t("platform_users.name")}
                    {sortField === "name" ? (
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("platform_users.email")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("platform_users.phone")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("common.role")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("common.company")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("common.branch")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {t("platform_users.created")}
                    {sortField === "created_at" ? (
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
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={9} className="p-4">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                : paginatedItems.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="table-row-striped border-b border-border/50"
                    >
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatPhone(u.phone)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.company_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.branch_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setResetTarget(u);
                              setNewPassword("");
                            }}
                            title={t("platform_users.reset_password_title")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            title={t("common.edit")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(u.id)}
                            title={t("common.delete")}
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
              icon={KeyRound}
              title={t("platform_users.not_found_title")}
              description={t("platform_users.not_found_desc")}
            />
          )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden p-3">
          {isLoading ? (
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title={t("platform_users.not_found_title")}
              description={t("platform_users.not_found_desc")}
            />
          ) : (
            <div className="grid gap-3">
              {paginatedItems.map((u) => (
                <DataCard
                  key={u.id}
                  title={u.name || "—"}
                  subtitle={u.email}
                  fields={[
                    {
                      label: t("common.role"),
                      value: (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      ),
                    },
                    {
                      label: t("common.company"),
                      value: u.company_name || "—",
                    },
                    { label: t("common.branch"), value: u.branch_name || "—" },
                    {
                      label: t("platform_users.created"),
                      value: formatDate(u.created_at),
                    },
                  ]}
                  actions={
                    <>
                      <button
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword("");
                        }}
                        title={t("platform_users.reset_password_title")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        title={t("common.edit")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        title={t("common.delete")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
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
              {editItem
                ? t("platform_users.edit_title")
                : t("platform_users.add_title")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("platform_users.name_label")}</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("platform_users.email_label")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                className="bg-secondary border-border"
              />
            </div>
            {!editItem && (
              <div className="space-y-2">
                <Label>{t("platform_users.password_label")}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  minLength={8}
                  placeholder={t("platform_users.password_placeholder")}
                  className="bg-secondary border-border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("platform_users.phone_label")}</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder={t("platform_users.phone_placeholder")}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("platform_users.role_label")}</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    role: v as UserRole,
                    companyId: v === "dev" ? "" : f.companyId,
                    branchId: v === "dev" || v === "owner" ? "" : f.branchId,
                  }))
                }
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">{t("roles.dev")}</SelectItem>
                  <SelectItem value="owner">{t("roles.owner")}</SelectItem>
                  <SelectItem value="manager">{t("roles.manager")}</SelectItem>
                  <SelectItem value="operator">
                    {t("roles.operator")}
                  </SelectItem>
                  <SelectItem value="teacher">{t("roles.teacher")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCompanyField && (
              <div className="space-y-2">
                <Label>
                  {t("platform_users.company_label")}
                  {form.role !== "dev" ? " *" : ""}
                </Label>
                <Select
                  value={form.companyId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, companyId: v }))
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder={t("common.select_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showBranchField && (
              <div className="space-y-2">
                <Label>{t("platform_users.branch_label")}</Label>
                <Input
                  value={form.branchId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, branchId: e.target.value }))
                  }
                  placeholder={t("platform_users.branch_placeholder")}
                  className="bg-secondary border-border"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
              >
                {createMut.isPending || updateMut.isPending
                  ? t("common.saving")
                  : editItem
                    ? t("common.save")
                    : t("common.add")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => {
          if (!o) {
            setResetTarget(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t("platform_users.reset_password_title")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("platform_users.reset_password_desc", {
                name: resetTarget?.name || resetTarget?.email,
              })}
            </p>
            <div className="space-y-2">
              <Label>{t("platform_users.new_password_label")}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder={t("platform_users.new_password_placeholder")}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetTarget(null);
                  setNewPassword("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={resetMut.isPending}>
                {resetMut.isPending
                  ? t("platform_users.updating_button")
                  : t("platform_users.update_button")}
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

export default PlatformUsersPage;
