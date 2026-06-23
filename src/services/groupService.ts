import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { Group, GroupOverview, GroupsById } from "@/types/group";

export const useGroups = () => {
  const branchId = useAuthStore((s) => s.user?.branch_id);
  const role = useAuthStore((s) => s.user?.role);
  const isCrossTenantRole = role === "owner" || role === "dev";
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<Group[]>({
    queryKey: ["groups", activeCompanyId, branchId],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get("/groups");
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!branchId || isCrossTenantRole,
  });
};

export const useGroupsOverview = () => {
  const branchId = useAuthStore((s) => s.user?.branch_id);
  const role = useAuthStore((s) => s.user?.role);
  const isCrossTenantRole = role === "owner" || role === "dev";
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<GroupOverview[]>({
    queryKey: ["groups-overview", activeCompanyId, branchId],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get("/groups/overview");
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!branchId || isCrossTenantRole,
  });
};

export const useGroupsById = ({ id }: { id: string }) => {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<GroupsById>({
    queryKey: ["groups", activeCompanyId, "detail", id],
    queryFn: async () =>
      axiosInstance
        .get(`/groups/${id}`)
        .then(({ data }) => data?.data || data)
        .catch(() => null),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (group: {
      name: string;
      branchId: string;
      courseType: string;
    }) => {
      const { data } = await axiosInstance.post("/groups", group);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["groups-overview", activeCompanyId] });
    },
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async ({
      id,
      ...group
    }: {
      id: string;
      name?: string;
      branchId?: string;
      courseType?: string;
    }) => {
      const { data } = await axiosInstance.patch(`/groups/${id}`, group);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["groups-overview", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["students", activeCompanyId] });
    },
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", activeCompanyId] });
      qc.invalidateQueries({ queryKey: ["groups-overview", activeCompanyId] });
    },
  });
};
