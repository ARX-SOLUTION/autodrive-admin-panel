import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { Branch } from '@/types/branch';

const demoBranches: Branch[] = [
  { id: 'minor', name: 'Minor', location: 'Minor tumani, Toshkent', manager_name: 'Sardor Aliyev', active_students: 45, created_at: '2024-01-01' },
  { id: 'chorsu', name: 'Chorsu', location: 'Chorsu tumani, Toshkent', manager_name: 'Dilshod Rahimov', active_students: 38, created_at: '2024-01-01' },
  { id: 'novza', name: 'Novza', location: 'Novza tumani, Toshkent', manager_name: 'Javohir Sobirov', active_students: 32, created_at: '2024-01-01' },
  { id: 'samarqand', name: 'Samarqand', location: 'Samarqand shahri', manager_name: 'Bekzod Tursunov', active_students: 28, created_at: '2024-01-01' },
];

export const useBranches = () =>
  useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/branches');
        return data;
      } catch {
        return demoBranches;
      }
    },
  });

export const useCreateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (branch: Partial<Branch>) => {
      const { data } = await axiosInstance.post('/branches', branch);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
};

export const useDeleteBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await axiosInstance.delete(`/branches/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
};
