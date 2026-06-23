import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2, Users, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, Specialization } from '@/services/teacherService';
import { useBranches } from '@/services/branchService';
import { toast } from 'sonner';
import { User } from '@/types/user';

const TeachersPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', branchId: '', specialization: 'THEORY' as Specialization });

  const { data: teachers, isLoading } = useTeachers();
  const { data: branches } = useBranches();
  const createMut = useCreateTeacher();
  const updateMut = useUpdateTeacher();
  const deleteMut = useDeleteTeacher();

  const filtered = (teachers || []).filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search)
  );

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortField as keyof typeof a];
    const vb = b[sortField as keyof typeof b];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string' && typeof vb === 'string') {
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  });

  const { currentPage, totalPages, paginatedItems, setCurrentPage } = usePagination(sorted);

  const openCreate = () => {
    setEditItem(null);
    setForm({ fullName: '', phone: '', branchId: '', specialization: 'THEORY' });
    setModalOpen(true);
  };

  const openEdit = (t: User) => {
    setEditItem(t);
    setForm({ fullName: t.name || '', phone: t.phone || '', branchId: t.branch_id || '', specialization: t.specialization || 'THEORY' });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) return;
    const payload = {
      fullName: form.fullName,
      phone: form.phone || undefined,
      branchId: form.branchId || undefined,
      specialization: form.specialization || undefined,
    };
    if (editItem) {
      updateMut.mutate({ id: editItem.id, ...payload }, {
        onSuccess: () => { toast.success(t('teachers.toast_updated')); setModalOpen(false); },
        onError: () => toast.error(t('teachers.toast_error')),
      });
    } else {
      createMut.mutate(payload, {
        onSuccess: () => { toast.success(t('teachers.toast_created')); setModalOpen(false); },
        onError: () => toast.error(t('teachers.toast_error')),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => { toast.success(t('teachers.toast_deleted')); setDeleteId(null); },
      onError: () => toast.error(t('teachers.toast_error')),
    });
  };

  const getBranchName = (branchId: string) =>
    (branches || []).find((b) => b.id === branchId)?.name || branchId || '—';

  const startIndex = (currentPage - 1) * 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-balance">{t('teachers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('teachers.count', { count: filtered.length })}</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> {t('teachers.add_new')}</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  {t('common.name')}
                  {sortField === 'name' ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <button onClick={() => toggleSort('phone')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  {t('common.phone')}
                  {sortField === 'phone' ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('teachers.specialization')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.branch')}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('common.status')}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td colSpan={7} className="p-4"><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              : paginatedItems.map((t, idx) => (
                <tr key={t.id} className="table-row-striped border-b border-border/50">
                  <td className="px-4 py-3 text-center text-muted-foreground">{startIndex + idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.specialization === 'THEORY' ? t('teachers.spec_theory') : t('teachers.spec_practice')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.branch_name || getBranchName(t.branch_id)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.is_active !== false ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {t.is_active !== false ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(t)} title={t('common.edit')} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(t.id)} title={t('common.delete')} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {filtered.length === 0 && !isLoading && (
          <EmptyState
            icon={Users}
            title={t('teachers.not_found_title')}
            description={t('teachers.not_found_desc')}
          />
        )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden p-3">
          {isLoading ? (
            <div className="grid gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('teachers.not_found_title')}
              description={t('teachers.not_found_desc')}
            />
          ) : (
            <div className="grid gap-3">
              {paginatedItems.map((t) => (
                <DataCard
                  key={t.id}
                  title={t.name || "—"}
                  subtitle={t.phone || "—"}
                  fields={[
                    { label: t('teachers.specialization'), value: t.specialization === 'THEORY' ? t('teachers.spec_theory') : t('teachers.spec_practice') || "—" },
                    { label: t('common.email'), value: t.email || "—" },
                    { label: t('common.branch'), value: t.branch_name || getBranchName(t.branch_id) },
                    { label: t('common.created_at'), value: t.created_at ? new Date(t.created_at).toLocaleDateString("uz-UZ") : "—" },
                  ]}
                  actions={
                    <>
                      <button
                        onClick={() => openEdit(t)}
                        title={t('common.edit')}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        title={t('common.delete')}
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

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">{editItem ? t('teachers.edit_title') : t('teachers.add_title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('teachers.name_label')}</Label>
              <Input value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>{t('teachers.phone_label')}</Label>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder={t('teachers.phone_placeholder')} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>{t('teachers.specialization')} *</Label>
              <Select value={form.specialization} onValueChange={(v) => setForm(f => ({ ...f, specialization: v as Specialization }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="THEORY">{t('teachers.spec_theory')}</SelectItem>
                  <SelectItem value="PRACTICE">{t('teachers.spec_practice')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.branch')}</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm(f => ({ ...f, branchId: v }))}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={t('common.select_placeholder')} /></SelectTrigger>
                <SelectContent>
                  {(branches || []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? t('common.saving') : editItem ? t('common.save') : t('common.add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleteMut.isPending} />
    </div>
  );
};

export default TeachersPage;
