import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student, CourseType } from "@/types/student";
import {
  CreateStudentPayload,
  studentFormSchema,
  StudentFormValues,
} from "@/lib/schemas/student.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { useBranches } from "@/services/branchService";
import { useGroups } from "@/services/groupService";
import { User } from "@/types/user";
import { StudentFormFields } from "./StudentFormFields";

interface CreateStudentFormProps {
  courseType: CourseType;
  onSubmit: (data: CreateStudentPayload) => void;
  onCancel: () => void;
  loading?: boolean;
  operators?: User[];
  defaultBranchId?: string;
}

export function CreateStudentForm({
  courseType,
  onSubmit,
  onCancel,
  loading,
  operators = [],
  defaultBranchId,
}: CreateStudentFormProps) {
  const { isOwner, user } = useAuthStore();
  const { data: branches } = useBranches();
  const { data: groups } = useGroups();

  const branchList = branches || [];

  const defaultFormValues = useCallback(
    (): StudentFormValues => ({
      first_name: "",
      last_name: "",
      phone: "",
      course_type: courseType,
      branch_id: isOwner() ? defaultBranchId || "" : user?.branch_id || "",
      payment_method: "naqd",
      result: "oqimoqda",
      has_document: false,
      o83: false,
      total_price: courseType === "tezkor" ? 2500000 : 6000000,
      amount_paid: 0,
      initial_payment: 0,
      group_id: "",
      completion_date: "",
      contract_number: "",
      notes: "",
      status: "active",
      registered_by: "",
    }),
    [courseType, defaultBranchId, isOwner, user?.branch_id],
  );

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: defaultFormValues(),
  });

  const [debt, setDebt] = useState(0);

  const watchedTotalPrice = form.watch("total_price");
  const watchedAmountPaid = form.watch("amount_paid");
  const watchedInitialPayment = form.watch("initial_payment");
  const watchedBranchId = form.watch("branch_id");
  const watchedGroupId = form.watch("group_id");
  const watchedRegisteredBy = form.watch("registered_by");

  const groupList = (groups || []).filter(
    (g) =>
      (g.course_type === courseType || !g.course_type) &&
      (!watchedBranchId || g.branch_id === watchedBranchId),
  );
  const operatorList = operators.filter(
    (op) => !watchedBranchId || op.branch_id === watchedBranchId,
  );

  useEffect(() => {
    form.reset(defaultFormValues());
  }, [courseType, defaultBranchId, form, defaultFormValues]);

  useEffect(() => {
    const total = Number(watchedTotalPrice) || 0;
    const paid =
      courseType === "tezkor"
        ? Number(watchedAmountPaid) || 0
        : Number(watchedInitialPayment) || 0;
    setDebt(Math.max(0, total - paid));
  }, [watchedTotalPrice, watchedAmountPaid, watchedInitialPayment, courseType]);

  useEffect(() => {
    if (watchedGroupId && !groupList.some((g) => g.id === watchedGroupId)) {
      form.setValue("group_id", "");
    }
    if (
      watchedRegisteredBy &&
      !operatorList.some((op) => op.id === watchedRegisteredBy)
    ) {
      form.setValue("registered_by", "");
    }
  }, [form, groupList, operatorList, watchedGroupId, watchedRegisteredBy]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateStudentPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      course_type: courseType,
      total_price: Number(values.total_price),
      payment_method: values.payment_method || undefined,
      branch_id: values.branch_id || undefined,
      result: values.result,
      has_document: values.has_document,
      notes: values.notes || undefined,
      status: values.status || "active",
      registered_by: values.registered_by || undefined,
    };

    if (courseType === "tezkor") {
      payload.amount_paid = Number(values.amount_paid) || 0;
      payload.group_id = values.group_id || undefined;
    } else {
      payload.initial_payment = Number(values.initial_payment) || 0;
      payload.group_id = values.group_id || undefined;
      payload.completion_date = values.completion_date || undefined;
      payload.contract_number = values.contract_number || undefined;
      payload.o83 = values.o83;
    }
    onSubmit(payload);
  });

  const currentBranchName =
    branchList.find((b) => b.id === watchedBranchId)?.name ||
    watchedBranchId ||
    "";

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <StudentFormFields
          form={form}
          courseType={courseType}
          isUpdate={false}
          debt={debt}
          disabledFields={[]}
          branchList={branchList}
          groupList={groupList}
          operatorList={operatorList}
          isOwner={isOwner()}
          currentBranchName={currentBranchName}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={loading || form.formState.isSubmitting}
          >
            {loading || form.formState.isSubmitting
              ? "Saqlanmoqda..."
              : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
