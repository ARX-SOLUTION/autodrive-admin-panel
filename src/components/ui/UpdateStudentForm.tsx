import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student, CourseType } from "@/types/student";
import { CreateStudentPayload, studentFormSchema, StudentFormValues } from "@/lib/schemas/student.schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { useBranches } from "@/services/branchService";
import { useGroups } from "@/services/groupService";
import { User } from "@/types/user";
import { StudentFormFields } from "./StudentFormFields";

interface UpdateStudentFormProps {
  student: Student;
  courseType: CourseType;
  onSubmit: (data: CreateStudentPayload) => void;
  onCancel: () => void;
  loading?: boolean;
  operators?: User[];
  disabledFields?: string[];
}

export function UpdateStudentForm({
  student,
  courseType,
  onSubmit,
  onCancel,
  loading,
  operators = [],
  disabledFields = [],
}: UpdateStudentFormProps) {
  const { isOwner } = useAuthStore();
  const { data: branches } = useBranches();
  const { data: groups } = useGroups();

  const branchList = branches || [];

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      first_name: student.first_name,
      last_name: student.last_name,
      phone: student.phone,
      course_type: student.course_type,
      branch_id: student.branch_id,
      payment_method: student.payment_method,
      result: student.result,
      has_document: student.has_document,
      o83: student.o83,
      total_price: student.total_price,
      amount_paid: 0,
      initial_payment: student.initial_payment || 0,
      group_id: student.group_id || "",
      completion_date: student.completion_date === undefined ? "" : student.completion_date,
      contract_number: student.contract_number || "",
      notes: student.notes === undefined ? "" : student.notes,
      status: student.status || "active",
      registered_by: student.registered_by_id || "",
    },
  });

  const [debt, setDebt] = useState(0);

  const watchedAmountPaid = form.watch("amount_paid");
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
    form.reset({
      first_name: student.first_name,
      last_name: student.last_name,
      phone: student.phone,
      course_type: student.course_type,
      branch_id: student.branch_id,
      payment_method: student.payment_method,
      result: student.result,
      has_document: student.has_document,
      o83: student.o83,
      total_price: student.total_price,
      amount_paid: 0,
      initial_payment: student.initial_payment || 0,
      group_id: student.group_id || "",
      completion_date: student.completion_date === undefined ? "" : student.completion_date,
      contract_number: student.contract_number || "",
      notes: student.notes === undefined ? "" : student.notes,
      status: student.status || "active",
      registered_by: student.registered_by_id || "",
    });
  }, [student, courseType]);

  useEffect(() => {
    setDebt(Math.max(0, (student.debt || 0) - (Number(watchedAmountPaid) || 0)));
  }, [watchedAmountPaid, student]);

  useEffect(() => {
    if (watchedGroupId && !groupList.some((g) => g.id === watchedGroupId)) {
      form.setValue("group_id", "");
    }
    if (watchedRegisteredBy && !operatorList.some((op) => op.id === watchedRegisteredBy)) {
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
      if ((Number(values.amount_paid) || 0) > 0) {
        payload.amount_paid = Number(values.amount_paid);
      }
    }
    onSubmit(payload);
  });

  const currentBranchName =
    branchList.find((b) => b.id === watchedBranchId)?.name || watchedBranchId || "";

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <StudentFormFields
          form={form}
          courseType={courseType}
          isUpdate={true}
          debt={debt}
          disabledFields={disabledFields}
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
          <Button type="submit" disabled={loading || form.formState.isSubmitting}>
            {loading || form.formState.isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
