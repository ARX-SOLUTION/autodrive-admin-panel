import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/types/student";

export interface CreatePaymentPayload {
  student_id: string;
  amount: number;
  payment_method: PaymentMethod;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  debt?: number;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentPayload) => void;
  loading?: boolean;
  students: Student[]; // talabalar ro'yxati
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  naqd: "Naqd",
  karta: "Karta",
  perechisleniya: "Perechileniya",
};

const PaymentModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  students,
}: PaymentModalProps) => {
  const [form, setForm] = useState<CreatePaymentPayload>({
    student_id: "",
    amount: 0,
    payment_method: "naqd",
  });

  useEffect(() => {
    if (open) {
      setForm({ student_id: "", amount: 0, payment_method: "naqd" });
    }
  }, [open]);

  const selectedStudent = students.find((s) => s.id === form.student_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || form.amount <= 0) return;
    onSubmit(form);
  };

  const formatMoney = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">To'lov qo'shish</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Talaba tanlash */}
          <div className="space-y-2">
            <Label>Talaba *</Label>
            <Select
              value={form.student_id}
              onValueChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Talabani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.last_name} {s.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Talaba qarzdorligi ko'rsatish */}
          {selectedStudent && selectedStudent.debt !== undefined && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Qarzdorlik: </span>
              <span className="font-medium text-destructive">
                {formatMoney(selectedStudent.debt)} so'm
              </span>
            </div>
          )}

          {/* Miqdor */}
          <div className="space-y-2">
            <Label>To'lov miqdori (so'm) *</Label>
            <Input
              type="number"
              value={form.amount || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  amount: e.target.value === "" ? 0 : Number(e.target.value),
                }))
              }
              required
              min={1}
              placeholder="0"
              className="bg-secondary border-border"
            />
          </div>

          {/* To'lov turi */}
          <div className="space-y-2">
            <Label>To'lov turi *</Label>
            <Select
              value={form.payment_method}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, payment_method: v as PaymentMethod }))
              }
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.student_id || form.amount <= 0}
            >
              {loading ? "Saqlanmoqda..." : "Qo'shish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;