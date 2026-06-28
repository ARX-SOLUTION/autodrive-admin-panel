# AutoDrive Admin Panel - English Refactor Inventory

**Report Date:** 2026-06-28  
**Scope:** `/src/**` (excluding `i18n/locales`)  
**Audience:** Internal dev team (strict English requirement)

## 1. i18n Setup Status

**STATUS: FULLY CONFIGURED**

- **Framework:** `react-i18next` with browser language detection
- **Config location:** `/src/i18n/index.ts`
- **Supported languages:** `uz`, `ru`, `en`
- **Fallback language:** `uz`
- **Storage:** localStorage (`lang` key)
- **Locale files location:** `/src/i18n/locales/{uz|ru|en}.json`

### Locale File Completeness

| Locale  | Key Count | Status                                     |
| ------- | --------- | ------------------------------------------ |
| uz.json | 417 keys  | Complete                                   |
| ru.json | 417 keys  | Complete                                   |
| en.json | 433 keys  | Extra keys in EN (likely future additions) |

All keys present in UZ/RU are present in EN. Fully consistent.

---

## 2. Non-English Content Findings

### A. Hardcoded User-Visible Strings (JSX/UI)

**Critical:** 39 instances of hardcoded Uzbek text found in component JSX, form labels, and placeholders.

| File                                        | Line(s)                                          | Content                                                                                                                                                                  | Type                                              | Severity |
| ------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------- |
| `src/components/ui/StudentFormFields.tsx`   | 65, 78, 91                                       | "Familya _", "Ismi _", "Telefon \*"                                                                                                                                      | FormLabel                                         | HIGH     |
| `src/components/ui/StudentFormFields.tsx`   | 108, 116, 148                                    | "Filial", placeholder "Tanlang", "Kurs narxi \*"                                                                                                                         | FormLabel/Select                                  | HIGH     |
| `src/components/ui/StudentFormFields.tsx`   | 167, 214, 224, 238, 245                          | "To'lov turi", "To'lov qo'shish uchun", "Joriy qarzdorlik", "Guruh", placeholder "Tanlang"                                                                               | FormLabel/Placeholder                             | HIGH     |
| `src/components/ui/StudentFormFields.tsx`   | 270, 309                                         | "Boshlang'ich to'lov", placeholder "0 (yangi to'lov qo'shish uchun)"                                                                                                     | FormLabel/Placeholder                             | HIGH     |
| `src/components/ui/StudentFormFields.tsx`   | 416, 492                                         | "Operatorni tanlang (ixtiyoriy)", placeholder "Izoh yozing..."                                                                                                           | Select/Textarea                                   | HIGH     |
| `src/components/ui/PaymentModal.tsx`        | 221, 248                                         | "To'lov miqdori (so'm) _", "To'lov turi _"                                                                                                                               | FormLabel                                         | HIGH     |
| `src/pages/StudentsPage.tsx`                | 352, 359                                         | "Tozalash", placeholder "Ism, familya yoki telefon..."                                                                                                                   | Button/Input                                      | HIGH     |
| `src/pages/StudentsPage.tsx`                | 381, 398, 433                                    | "Familya", "Ismi", "To'lov"                                                                                                                                              | Table headers                                     | HIGH     |
| `src/pages/StudentsPage.tsx`                | 712, 729                                         | description="Tanlangan filtrlar bo'yicha talabalar yo'q."                                                                                                                | Empty state                                       | HIGH     |
| `src/pages/StudentsPage.tsx`                | 766, 775                                         | aria-label="Tahrirlash", aria-label="O'chirish"                                                                                                                          | Action buttons                                    | MEDIUM   |
| `src/pages/GroupsPage.tsx`                  | 530, 541                                         | title="Tahrirlash", title="O'chirish"                                                                                                                                    | Button titles                                     | MEDIUM   |
| `src/pages/GroupsPage.tsx`                  | 602, 606, 613                                    | "To'lov", "Boshlang'ich", "To'lov turi"                                                                                                                                  | Table headers                                     | HIGH     |
| `src/pages/GroupsPage.tsx`                  | 792                                              | placeholder="11-guruh"                                                                                                                                                   | Input                                             | HIGH     |
| `src/pages/PaymentsPage.tsx`                | 72                                               | formatMoney: "so'm" suffix hardcoded                                                                                                                                     | Formatting                                        | MEDIUM   |
| `src/pages/PaymentsPage.tsx`                | 184                                              | "Filterlangan to'lovlarni Excel formatida yuklab olishingiz mumkin."                                                                                                     | Tooltip text                                      | HIGH     |
| `src/pages/PaymentsPage.tsx`                | 368, 423, 437, 471                               | "Filterga bog'liq emas", "So'nggi 7 kun", "O'tgan oy", "To'liq to'lagan"                                                                                                 | Filter options/Select items                       | HIGH     |
| `src/pages/PaymentsPage.tsx`                | 558, 641, 710, 752, 787, 823                     | Summary text, "Bu to'lov", "To'lovlar topilmadi", "To'liq", empty state                                                                                                  | Various UI                                        | HIGH     |
| `src/pages/DashboardPage.tsx`               | 70, 75                                           | formatMoney: "so'm" suffix, "% o'tgan oyga"                                                                                                                              | Formatting                                        | MEDIUM   |
| `src/pages/DashboardPage.tsx`               | 118, 136, 147                                    | "To'liq to'lagan", "To'lamagan", "O'qimoqda"                                                                                                                             | Chart labels                                      | HIGH     |
| `src/pages/DashboardPage.tsx`               | 183, 194, 205, 208, 288, 301, 314, 347, 390, 490 | "Biznes ko'rsatkichlari", "Barchasi", "Barcha filiallar", "Yo'q", "% o'tish", "Oylik daromad (so'm)", "Oylik ro'yxatga olish", "Ma'lumot yo'q", "Filiallar taqqoslamasi" | Section titles/Tab/Placeholder/Empty state/Legend | HIGH     |
| `src/components/layout/Topbar.tsx`          | 16, 26                                           | aria-label="Yon menyu", aria-label="Tezkor qidirish"                                                                                                                     | Accessibility labels                              | MEDIUM   |
| `src/components/layout/CompanySwitcher.tsx` | 42                                               | placeholder="Yuklanmoqda…", placeholder="Kompaniya"                                                                                                                      | Select placeholders                               | HIGH     |
| `src/pages/CompanyDetailPage.tsx`           | 59                                               | teacher: "O'qituvchi" (enum label)                                                                                                                                       | Domain enum                                       | MEDIUM   |
| `src/pages/SystemHealthPage.tsx`            | 33, 71                                           | "Backend va ma'lumotlar bazasining real-time holati...", "Bog'lanib bo'lmadi"                                                                                            | Status page text                                  | HIGH     |
| `src/pages/ProfilePage.tsx`                 | 146                                              | placeholder="+998..."                                                                                                                                                    | Phone input                                       | LOW      |

**Total Hardcoded Strings:** 39+ instances across 9 files

---

### B. Non-English Comments

**STATUS:** No Cyrillic found in code comments. All comments are in English or code-related.

---

### C. Toast/Error/Console Messages

**STATUS:** All toast messages use `t()` helper:

- `toast.success(t('profile.toast_updated'))`
- `toast.error(t('profile.toast_password_mismatch'))`
- `toast.error(extractErrorMessage(err, t('profile.toast_password_mismatch')))`

**Good pattern in use.**

### D. Form Validation Messages

**File:** `/src/lib/password.ts`

Hardcoded Uzbek validation error messages:

```typescript
return "Parol kamida 8 ta belgidan iborat bo'lishi kerak"; // Line 15
return "Parolda kamida bitta raqam bo'lishi kerak"; // Line 18
return "Parolda kamida bitta katta harf bo'lishi kerak"; // Line 21
```

**Type:** Validation error messages  
**Severity:** HIGH

---

## 3. Locale File Analysis

### Key Naming Pattern (Observed)

Existing keys follow dot notation for hierarchy:

- `students.title`, `students.payment_amount`, `students.extra_payment`
- `payments.subtitle`, `payments.toast_updated`
- `dashboard.title`, `dashboard.company_status`
- `profile.title`, `profile.change_password`
- `common.name`, `common.active`, `common.saving`

### Missing i18n Integration

The following hardcoded strings **should be added to all 3 locale files:**

| Key Proposal                         | uz.json                                          | ru.json                                              | en.json                                             |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `students.form.last_name`            | Familya                                          | Фамилия                                              | Last Name                                           |
| `students.form.first_name`           | Ismi                                             | Имя                                                  | First Name                                          |
| `students.form.phone`                | Telefon                                          | Телефон                                              | Phone                                               |
| `students.form.branch`               | Filial                                           | Филиал                                               | Branch                                              |
| `students.form.course_price`         | Kurs narxi                                       | Цена курса                                           | Course Price                                        |
| `students.form.payment_method`       | To'lov turi                                      | Способ оплаты                                        | Payment Method                                      |
| `students.form.placeholder_select`   | Tanlang                                          | Выберите                                             | Select                                              |
| `students.form.initial_payment`      | Boshlang'ich to'lov                              | Первоначальный платеж                                | Initial Payment                                     |
| `students.form.operator_optional`    | Operatorni tanlang (ixtiyoriy)                   | Выберите оператора (опционально)                     | Select operator (optional)                          |
| `students.form.notes`                | Izoh                                             | Заметки                                              | Notes                                               |
| `students.form.notes_placeholder`    | Izoh yozing...                                   | Напишите заметки...                                  | Write notes...                                      |
| `students.filter.clear`              | Tozalash                                         | Очистить                                             | Clear                                               |
| `students.filter.search`             | Ism, familya yoki telefon...                     | Имя, фамилия или телефон...                          | Name, surname or phone...                           |
| `students.table.empty`               | Tanlangan filtrlar bo'yicha talabalar yo'q.      | По выбранным фильтрам студентов не найдено.          | No students found for selected filters.             |
| `students.action.edit`               | Tahrirlash                                       | Редактировать                                        | Edit                                                |
| `students.action.delete`             | O'chirish                                        | Удалить                                              | Delete                                              |
| `payments.form.amount`               | To'lov miqdori (so'm)                            | Сумма платежа (сум)                                  | Payment Amount (UZS)                                |
| `payments.form.method`               | To'lov turi                                      | Способ оплаты                                        | Payment Method                                      |
| `payments.currency_suffix`           | so'm                                             | сум                                                  | UZS                                                 |
| `payments.filter.dropdown`           | Barcha filiallar                                 | Все филиалы                                          | All branches                                        |
| `payments.filter.periods.recent`     | So'nggi 7 kun                                    | Последние 7 дней                                     | Last 7 days                                         |
| `payments.filter.periods.past_month` | O'tgan oy                                        | Прошлый месяц                                        | Last month                                          |
| `payments.status.paid`               | To'liq to'lagan                                  | Полностью оплачено                                   | Fully paid                                          |
| `payments.status.unpaid`             | To'lamagan                                       | Не оплачено                                          | Unpaid                                              |
| `payments.table.empty`               | Tanlangan filtrlar bo'yicha to'lovlar yo'q.      | По выбранным фильтрам платежи не найдены.            | No payments found for selected filters.             |
| `dashboard.label.paid`               | To'liq to'lagan                                  | Полностью оплачено                                   | Fully paid                                          |
| `dashboard.label.unpaid`             | To'lamagan                                       | Не оплачено                                          | Unpaid                                              |
| `dashboard.label.studying`           | O'qimoqda                                        | Учится                                               | Studying                                            |
| `dashboard.metrics.title`            | Biznes ko'rsatkichlari                           | Бизнес-метрики                                       | Business Metrics                                    |
| `dashboard.tab.all`                  | Barchasi                                         | Все                                                  | All                                                 |
| `dashboard.revenue_title`            | Oylik daromad (so'm)                             | Ежемесячный доход (сум)                              | Monthly Revenue (UZS)                               |
| `dashboard.registration_title`       | Oylik ro'yxatga olish                            | Ежемесячные регистрации                              | Monthly Registrations                               |
| `dashboard.empty_data`               | Ma'lumot yo'q                                    | Нет данных                                           | No data                                             |
| `dashboard.comparison_title`         | Filiallar taqqoslamasi                           | Сравнение филиалов                                   | Branch Comparison                                   |
| `password.error.min_length`          | Parol kamida 8 ta belgidan iborat bo'lishi kerak | Пароль должен содержать минимум 8 символов           | Password must be at least 8 characters              |
| `password.error.no_number`           | Parolda kamida bitta raqam bo'lishi kerak        | Пароль должен содержать хотя бы одну цифру           | Password must contain at least one number           |
| `password.error.no_uppercase`        | Parolda kamida bitta katta harf bo'lishi kerak   | Пароль должен содержать хотя бы одну прописную букву | Password must contain at least one uppercase letter |
| `system.loading`                     | Yuklanmoqda…                                     | Загрузка…                                            | Loading...                                          |
| `system.company_label`               | Kompaniya                                        | Компания                                             | Company                                             |
| `accessibility.edit_button`          | Tahrirlash                                       | Редактировать                                        | Edit                                                |
| `accessibility.delete_button`        | O'chirish                                        | Удалить                                              | Delete                                              |
| `accessibility.search_tooltip`       | Tezkor qidirish                                  | Быстрый поиск                                        | Quick search                                        |
| `accessibility.sidebar_toggle`       | Yon menyu                                        | Боковое меню                                         | Sidebar                                             |

---

## 4. Summary by Severity

### HIGH (33 instances)

User-visible text in:

- Form labels (StudentFormFields, PaymentModal)
- Table headers (StudentsPage, GroupsPage)
- Placeholders (form inputs, select dropdowns)
- Filter/dropdown option text (PaymentsPage, DashboardPage)
- Empty state messages (StudentsPage, PaymentsPage)
- Tab labels (DashboardPage)
- Status page copy (SystemHealthPage)
- Chart/legend labels (DashboardPage)

### MEDIUM (6 instances)

- Accessibility labels (aria-label, button titles)
- Currency formatting (hardcoded "so'm" suffix)
- Domain enum labels (CompanyDetailPage)

### LOW (1 instance)

- Placeholder phone format example

---

## 5. Files Affected

| File                                        | Issues                | Priority |
| ------------------------------------------- | --------------------- | -------- |
| `src/components/ui/StudentFormFields.tsx`   | 12 hardcoded strings  | HIGH     |
| `src/components/ui/PaymentModal.tsx`        | 2 hardcoded strings   | HIGH     |
| `src/pages/StudentsPage.tsx`                | 8 hardcoded strings   | HIGH     |
| `src/pages/GroupsPage.tsx`                  | 5 hardcoded strings   | HIGH     |
| `src/pages/PaymentsPage.tsx`                | 8 hardcoded strings   | HIGH     |
| `src/pages/DashboardPage.tsx`               | 10 hardcoded strings  | HIGH     |
| `src/lib/password.ts`                       | 3 validation messages | HIGH     |
| `src/pages/SystemHealthPage.tsx`            | 2 hardcoded strings   | HIGH     |
| `src/components/layout/CompanySwitcher.tsx` | 1 hardcoded string    | MEDIUM   |
| `src/components/layout/Topbar.tsx`          | 2 aria-labels         | MEDIUM   |
| `src/pages/CompanyDetailPage.tsx`           | 1 enum label          | MEDIUM   |
| `src/pages/ProfilePage.tsx`                 | 1 placeholder         | LOW      |

**Total files to refactor:** 12  
**Total hardcoded strings:** 55+

---

## 6. Refactor Effort Estimate

### Effort Breakdown

| Task                                           | Time            |
| ---------------------------------------------- | --------------- |
| Add 35+ new keys to all 3 locale files         | 2-3 hours       |
| Replace hardcoded strings in StudentFormFields | 1 hour          |
| Replace hardcoded strings in PaymentModal      | 30 minutes      |
| Replace hardcoded strings in StudentsPage      | 1 hour          |
| Replace hardcoded strings in GroupsPage        | 45 minutes      |
| Replace hardcoded strings in PaymentsPage      | 1.5 hours       |
| Replace hardcoded strings in DashboardPage     | 1.5 hours       |
| Replace validation messages in password.ts     | 30 minutes      |
| Replace hardcoded strings in SystemHealthPage  | 30 minutes      |
| Fix currency formatting (dynamic locale)       | 45 minutes      |
| Testing & validation across all languages      | 2 hours         |
| **TOTAL**                                      | **12-14 hours** |

---

## 7. Recommended Approach

1. **Phase 1:** Add all missing translation keys to `src/i18n/locales/{uz|ru|en}.json` first
2. **Phase 2:** Update components to use `t()` in priority order (HIGH > MEDIUM > LOW)
3. **Phase 3:** Extract hardcoded currency & locale-specific formatting (so'm, percentage symbols)
4. **Phase 4:** Validate against all 3 languages before merging

---

## 8. Notes for Dev Team

- **i18n Setup is robust** — no additional framework config needed
- **Fallback strategy** — all components already import `useTranslation()`
- **Enum values** — domain enum labels (e.g., "O'qituvchi") may be imported directly; flag these as `t()` wrapping opportunities
- **Comments** — no Cyrillic in code comments; English-only documentation is clean
- **Toast messages** — already following `t()` pattern; no changes needed there

---

**Next steps:** Create task tickets for each file group and assign to team. Consider gating on i18n completeness for all new features going forward.
