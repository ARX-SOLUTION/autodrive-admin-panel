import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { Payment, PaymentSummary } from "@/types/payment";

export const usePayments = (branchId?: string, courseType?: string) =>
  useQuery<Payment[]>({
    queryKey: ["payments", branchId, courseType],
    queryFn: async () => {
      try {
        const { data: res } = await axiosInstance.get("/payments", {
          params: { branch_id: branchId, course_type: courseType },
        });
        const arr = res?.data;
        if (Array.isArray(arr)) return arr;
        if (Array.isArray(res)) return res;
        return [];
      } catch {
        return [];
      }
    },
  });

export const usePaymentSummary = (
  branchId?: string,
  startDate?: Date,
  endDate?: Date,
  payment_status?: boolean | undefined,
  payment_type?: string,
  course_type?: string,
) =>
  useQuery<PaymentSummary>({
    queryKey: [
      "payment-summary",
      branchId,
      startDate,
      endDate,
      payment_status,
      payment_type,
      course_type,
    ],
    queryFn: async () => {
      try {

        const { data: res } = await axiosInstance.get("/payments/summary", {
          params: {
            branch_id: branchId,
            startDate: startDate,
            endDate: endDate,
            payment_status,
            payment_type,
            course_type,
          },
        });
        return res?.data || res;
      } catch {
        return [];
      }
    },
  });

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: {
      student_id: string;
      amount: number;
      payment_method: string;
    }) => {
      const { data } = await axiosInstance.post("/payments", payment);
      return data?.data || data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payment-summary"] });
    },
  });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/payments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payment-summary"] });
    },
  });
};
