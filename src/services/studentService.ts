import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Student, CourseType } from "@/types/student";
import type { CreateStudentPayload } from "@/components/ui/StudentModal";

export const useStudents = (
  courseType?: CourseType,
  branchId?: string,
  page?: number,
  limit?: number,
  operatorId?: string,
  options?: { enabled?: boolean },
) => {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<Student[]>({
    queryKey: [
      "students",
      activeCompanyId,
      courseType,
      branchId,
      page,
      limit,
      operatorId,
    ],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data: res } = await axiosInstance.get("/students", {
        params: {
          course_type: courseType,
          branch_id: branchId,
          page,
          limit,
          operator_id: operatorId,
        },
      });
      const arr = res?.data;
      if (Array.isArray(arr)) return arr;
      if (Array.isArray(res)) return res;
      return [];
    },
  });
};

export const useCreateStudent = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (student: CreateStudentPayload) => {
      const { data } = await axiosInstance.post("/students", student);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["payments", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["dashboard", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["payment-snapshot", activeCompanyId] });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async ({
      id,
      ...student
    }: Partial<CreateStudentPayload> & { id: string }) => {
      const { data } = await axiosInstance.patch(`/students/${id}`, student);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["payments", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["dashboard", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["payment-snapshot", activeCompanyId] });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/students/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["students", activeCompanyId] }),
  });
};
