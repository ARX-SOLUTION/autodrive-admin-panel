import { z } from "zod";
import {
  CourseType,
  PaymentMethod,
  ResultStatus,
  StudentStatus,
} from "@/types/student";

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  phone: string;
  course_type: CourseType;
  total_price: number;
  amount_paid?: number;
  initial_payment?: number;
  payment_method?: PaymentMethod;
  group_id?: string;
  branch_id?: string;
  completion_date?: string;
  contract_number?: string;
  o83?: boolean;
  has_document?: boolean;
  result?: ResultStatus;
  notes?: string;
  status?: StudentStatus;
  registered_by?: string;
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  naqd: "Cash",
  karta: "Card",
  perechisleniya: "Transfer",
};

export const resultLabels: Record<ResultStatus, string> = {
  oqimoqda: "In progress",
  topshirdi: "Passed",
  yiqildi: "Failed",
};

export const studentFormSchema = z
  .object({
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    phone: z
      .string()
      .min(1, "Required")
      .regex(/^\+?\d{9,15}$/, "Invalid phone number"),
    course_type: z.enum(["tezkor", "avto_maktab"]),
    branch_id: z
      .string()
      .min(1, "Branch not selected. Please select a branch."),
    payment_method: z.enum(["naqd", "karta", "perechisleniya"]).optional(),
    result: z.enum(["oqimoqda", "topshirdi", "yiqildi"]).optional(),
    has_document: z.boolean().optional(),
    o83: z.boolean().optional(),
    total_price: z.coerce.number().nonnegative("Required"),
    amount_paid: z.coerce.number().nonnegative().optional(),
    initial_payment: z.coerce.number().nonnegative().optional(),
    group_id: z.string().optional(),
    completion_date: z.string().optional(),
    contract_number: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["active", "completed", "dropped", "suspended"]).optional(),
    registered_by: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.course_type === "avto_maktab" && !data.group_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["group_id"],
        message: "Group is required for driving school course",
      });
    }
  });

export type StudentFormValues = z.infer<typeof studentFormSchema>;
