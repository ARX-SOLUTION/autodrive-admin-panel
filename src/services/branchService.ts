import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { Branch } from '@/types/branch';

const demoBranches: Branch[] = [
  { id: 'minor', name: 'Minor', location: 'Minor tumani, Toshkent', manager_name: 'Sardor Aliyev', active_students: 45, created_at: '2024-01-01' },
  { id: 'chorsu', name: 'Chorsu', location: 'Chorsu tumani, Toshkent', manager_name: 'Dilshod Rahimov', active_students: 38, created_at: '2024-01-01' },
  { id: 'novza', name: 'Novza', location: 'Novza tumani, Toshkent', manager_name: 'Javohir Sobirov', active_students: 32, created_at: '2024-01-01' },
  { id: 'samarqand', name: 'Samarqand', location: 'Samarqand shahri', manager_name: 'Bekzod Tursunov', active_students: 28, created_at: '2024-01-01' },
];

export const useBranches = (params: { companyId?: string } = {}) => {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<Branch[]>({
    queryKey: ['branches', activeCompanyId, params],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get('/branches', {
          params: params.companyId ? { company_id: params.companyId } : undefined,
        });
        const arr = res?.data?.data || res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('API failed, returning demo data:', error);
          return demoBranches;
        }
        throw error;
      }
    },
  });
};

export const useCreateBranch = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (b: { name: string; location: string; phone?: string }) => {
      // dev has no companyId of its own — pass the active view-as company so the
      // backend knows which company the new branch belongs to (owner ignores it).
      const { data } = await axiosInstance.post('/branches', b, {
        params: activeCompanyId ? { company_id: activeCompanyId } : undefined,
      });
      return data?.data || data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches', activeCompanyId] }),
  });
};

export const useUpdateBranch = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async ({ id, ...b }: { id: string; name?: string; location?: string; phone?: string }) => {
      const { data } = await axiosInstance.patch(`/branches/${id}`, b);
      return data?.data || data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches', activeCompanyId] }),
  });
};

export const useDeleteBranch = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (id: string) => { await axiosInstance.delete(`/branches/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches', activeCompanyId] }),
  });
};
