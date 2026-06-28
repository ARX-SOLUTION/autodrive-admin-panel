import { useTranslation } from "react-i18next";
import { Student, CourseType } from "@/types/student";
import { CreateStudentPayload } from "@/lib/schemas/student.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { CreateStudentForm } from "./CreateStudentForm";
import { UpdateStudentForm } from "./UpdateStudentForm";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentPayload) => void;
  loading?: boolean;
  student?: Student | null;
  courseType: CourseType;
  operators?: User[];
  disabledFields?: string[];
  defaultBranchId?: string;
}

const StudentModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  student,
  courseType,
  operators = [],
  disabledFields = [],
  defaultBranchId,
}: StudentModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {student ? t("students.edit_title") : t("students.add_title")}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (
              {courseType === "tezkor"
                ? t("students.course_fast")
                : t("students.course_school")}
              )
            </span>
          </DialogTitle>
        </DialogHeader>

        {student ? (
          <UpdateStudentForm
            student={student}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            operators={operators}
            disabledFields={disabledFields}
          />
        ) : (
          <CreateStudentForm
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            courseType={courseType}
            operators={operators}
            defaultBranchId={defaultBranchId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
