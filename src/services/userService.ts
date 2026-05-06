import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { User } from "@/types/user";

const demoUsers: User[] = [
  {
    id: "1",
    email: "owner@autodrive.uz",
    phone: "+998901234567",
    role: "owner",
    is_active: true,
    created_at: "2024-01-01",
  },
  {
    id: "2",
    email: "manager@autodrive.uz",
    phone: "+998907654321",
    role: "manager",
    branch_id: "minor",
    branch_name: "Minor",
    is_active: true,
    created_at: "2024-01-01",
  },
];

export const useUsers = (role?: string) =>
  useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get("/users", { params: role ? { role } : {} });
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('API failed, returning demo data:', error);
          return demoUsers;
        }
        throw error;
      }
    },
  });

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...op }: { id: string; fullName?: string; phone?: string; branchId?: string; specialization?: 'THEORY' | 'PRACTICE' }) => {
      const { data } = await axiosInstance.patch(`/users/${id}`, op);
      return data?.data || data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};
