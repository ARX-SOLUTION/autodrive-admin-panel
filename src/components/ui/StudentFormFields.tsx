import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  StudentFormValues,
  paymentMethodLabels,
  resultLabels,
} from "@/lib/schemas/student.schema";
import { CourseType, PaymentMethod, ResultStatus } from "@/types/student";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

interface StudentFormFieldsProps {
  form: UseFormReturn<StudentFormValues>;
  courseType: CourseType;
  isUpdate: boolean;
  debt: number;
  disabledFields: string[];
  branchList: { id: string; name: string }[];
  groupList: { id: string; name: string }[];
  operatorList: User[];
  isOwner: boolean;
  currentBranchName: string;
}

export function StudentFormFields({
  form,
  courseType,
  isUpdate,
  debt,
  disabledFields,
  branchList,
  groupList,
  operatorList,
  isOwner,
  currentBranchName,
}: StudentFormFieldsProps) {
  const { t } = useTranslation();
  const formatMoney = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Familya *</FormLabel>
              <FormControl>
                <Input {...field} className="bg-secondary border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ismi *</FormLabel>
              <FormControl>
                <Input {...field} className="bg-secondary border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="+998901234567"
                  className="bg-secondary border-border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branch_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filial</FormLabel>
              {isOwner ? (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branchList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input
                    value={currentBranchName}
                    disabled
                    className="bg-muted border-border"
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <FormField
          control={form.control}
          name="total_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kurs narxi *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  min={0}
                  disabled={disabledFields.includes("total_price")}
                  className={`${disabledFields.includes("total_price") ? "bg-muted" : "bg-secondary"} border-border`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To'lov turi</FormLabel>
              <Select
                value={field.value || "naqd"}
                onValueChange={(v) => field.onChange(v as PaymentMethod)}
                disabled={disabledFields.includes("payment_method")}
              >
                <FormControl>
                  <SelectTrigger
                    className={`${disabledFields.includes("payment_method") ? "bg-muted" : "bg-secondary"} border-border`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {courseType === "tezkor" ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isUpdate
                      ? t("students.extra_payment")
                      : t("students.payment_amount")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      min={0}
                      placeholder={
                        isUpdate ? "0 (yangi to'lov qo'shish uchun)" : "0"
                      }
                      className="bg-secondary border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>{isUpdate ? "Joriy qarzdorlik" : "Qarzdorlik"}</Label>
              <Input
                value={formatMoney(debt)}
                disabled
                className="bg-muted border-border text-destructive font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guruh</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupList.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <FormField
              control={form.control}
              name="initial_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Boshlang'ich to'lov</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      min={0}
                      disabled={
                        isUpdate || disabledFields.includes("initial_payment")
                      }
                      className={`${isUpdate || disabledFields.includes("initial_payment") ? "bg-muted" : "bg-secondary"} border-border`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>{isUpdate ? "Joriy qarzdorlik" : "Qarzdorlik"}</Label>
              <Input
                value={formatMoney(debt)}
                disabled
                className="bg-muted border-border text-destructive font-medium"
              />
            </div>
          </div>
          {isUpdate && (
            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("students.extra_payment")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      min={0}
                      placeholder="0 (yangi to'lov qo'shish uchun)"
                      className="bg-secondary border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Guruh <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupList.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completion_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tugatish sanasi</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      className="bg-secondary border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contract_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shartnoma raqami</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="C-201"
                      className="bg-secondary border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="o83"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(v) => field.onChange(!!v)}
                    id="o83"
                  />
                </FormControl>
                <FormLabel htmlFor="o83" className="!mt-0">
                  O83
                </FormLabel>
              </FormItem>
            )}
          />
        </>
      )}

      {operatorList.length > 0 && (
        <FormField
          control={form.control}
          name="registered_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Operatorni tanlang (ixtiyoriy)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {operatorList.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name || op.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Natijasi</FormLabel>
              <Select
                value={field.value || "oqimoqda"}
                onValueChange={(v) => field.onChange(v as ResultStatus)}
              >
                <FormControl>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(resultLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="has_document"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value || false}
                onCheckedChange={(v) => field.onChange(!!v)}
                id="doc"
              />
            </FormControl>
            <FormLabel htmlFor="doc" className="!mt-0">
              Hujjat mavjud
            </FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Izoh</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                placeholder="Izoh yozing..."
                rows={3}
                className="bg-secondary border-border"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
