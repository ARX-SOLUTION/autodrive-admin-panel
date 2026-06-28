import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-react";
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
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from "@/services/branchService";
import { extractErrorMessage } from "@/lib/errors";
import { Branch } from "@/types/branch";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormState {
  name: string;
  location: string;
  phone: string;
}

const EMPTY_FORM: FormState = { name: "", location: "", phone: "" };

const BranchesPage = () => {
  const { t } = useTranslation();
  const { isDev, canManageBranches, activeCompanyId } = useAuthStore();
  const canManage = canManageBranches();
  const { data: branches, isLoading } = useBranches();
  const createMut = useCreateBranch();
  const updateMut = useUpdateBranch();
  const deleteMut = useDeleteBranch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditItem(b);
    setForm({ name: b.name, location: b.location, phone: "" });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      phone: form.phone.trim() || undefined,
    };
    if (editItem) {
      updateMut.mutate(
        { id: editItem.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("branches.toast_updated"));
            setModalOpen(false);
          },
          onError: (err) =>
            toast.error(extractErrorMessage(err, t("common.error"))),
        },
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success(t("branches.toast_created"));
          setModalOpen(false);
        },
        onError: (err) =>
          toast.error(extractErrorMessage(err, t("common.error"))),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("branches.toast_deleted"));
        setDeleteId(null);
      },
      onError: (err) =>
        toast.error(extractErrorMessage(err, t("common.error"))),
    });
  };

  return (
    <div className="space-y-6">
      {isDev() && !activeCompanyId && (
        <Alert>
          <AlertDescription>{t("branches.dev_context_hint")}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-balance">
            {t("branches.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {canManage
              ? t("branches.subtitle_count", {
                  count: (branches || []).length,
                })
              : t("branches.subtitle_readonly")}
          </p>
        </div>
        {canManage && (
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("branches.add_new")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (branches || []).length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={Building2}
            title={t("branches.not_found_title")}
            description={t("branches.not_found_desc")}
            action={
              canManage
                ? { label: t("branches.add_new"), onClick: openCreate }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(branches || []).map((b) => (
                <div key={b.id} className="glass-card p-5 animate-slide-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-balance">
                        {b.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {b.location}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEdit(b)}
                            title={t("common.edit")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(b.id)}
                            title={t("common.delete")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {t("common.manager")}:{" "}
                      </span>
                      <span className="text-foreground font-medium">
                        {b.manager_name || t("common.na")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("common.students_count")}:{" "}
                      </span>
                      <span className="text-foreground font-medium">
                        {b.active_students}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {(branches || []).map((b) => (
              <DataCard
                key={b.id}
                title={b.name}
                subtitle={b.location}
                fields={[
                  { label: t("common.phone"), value: t("common.na") },
                  {
                    label: t("common.students_count"),
                    value: b.active_students,
                  },
                  {
                    label: t("common.created"),
                    value: (() => {
                      try {
                        return format(new Date(b.created_at), "dd.MM.yyyy");
                      } catch {
                        return b.created_at;
                      }
                    })(),
                  },
                  {
                    label: t("common.status"),
                    value: t("branches.status_active"),
                  },
                ]}
                actions={
                  canManage ? (
                    <>
                      <button
                        onClick={() => openEdit(b)}
                        title={t("common.edit")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(b.id)}
                        title={t("common.delete")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editItem ? t("branches.edit_title") : t("branches.add_title")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("branches.name_label")}</Label>
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
              <Label>{t("branches.address_label")}</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                required
                placeholder={t("branches.address_placeholder")}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("branches.phone_label")}</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+998..."
                className="bg-secondary border-border"
              />
            </div>
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </div>
  );
};

export default BranchesPage;
