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
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {student ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({courseType === "tezkor" ? "Tezkor" : "Avto maktab"})
            </span>
          </DialogTitle>
        </DialogHeader>

        {student ? (
          <UpdateStudentForm
            student={student}
            courseType={courseType}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            operators={operators}
            disabledFields={disabledFields}
          />
        ) : (
          <CreateStudentForm
            courseType={courseType}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            operators={operators}
            defaultBranchId={defaultBranchId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;
