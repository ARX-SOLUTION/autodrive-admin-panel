import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { PlatformAnalytics } from "@/types/analytics";

export const usePlatformAnalytics = () => {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery<PlatformAnalytics>({
    queryKey: ["platform-analytics"],
    queryFn: async () => {
      const { data: res } = await axiosInstance.get("/platform/analytics");
      return (res?.data ?? res) as PlatformAnalytics;
    },
    enabled: role === "dev",
    staleTime: 60_000,
  });
};
