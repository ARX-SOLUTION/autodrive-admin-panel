import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { AuditLogsResponse } from "@/types/audit";

const toLocalDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const useAuditLogs = (params: {
  entity?: string;
  action?: string;
  userId?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) =>
  useQuery<AuditLogsResponse>({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get("/platform/audit-log", {
          params: {
            entity: params.entity,
            action: params.action,
            user_id: params.userId,
            company_id: params.companyId,
            start_date: params.startDate
              ? toLocalDateStr(params.startDate)
              : undefined,
            end_date: params.endDate
              ? toLocalDateStr(params.endDate)
              : undefined,
            page: params.page,
            limit: params.limit,
          },
        });
        return res?.data || res;
      } catch {
        return { data: [], total: 0, page: 1, limit: 50 };
      }
    },
  });
