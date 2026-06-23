# Auto Drive Admin Panel — Domain Context

This document describes the domain language, UI architecture, state management patterns, route map, and tech stack for the Auto Drive CRM admin panel.

---

## Domain Glossary

### Platform-level

| Term | Definition |
|------|------------|
| Platform | The top-level tenant owned by ARX Solutions. Managed via admin panel. |
| Company | A driving school tenant within the platform (typically a franchisee). Each company has its own branches, users, students, groups, etc. |
| Platform User | A user at the platform level (dev role). Can switch between companies. |
| Dev | Super-admin role. Full access to platform management and all companies. |
| Company Management | CRUD operations on companies — creation, suspension, configuration, billing. |

### Company-level

| Term | Definition |
|------|------------|
| Branch | A physical location belonging to a company (e.g., "Yunusobod filiali"). |
| User | A person with system access at a company/branch. Roles: `owner`, `manager`, `operator`, `teacher`. |
| Student | A learner enrolled at a branch. Tracks personal info, course type, group assignment, payment status. |
| Group | A class cohort within a branch. Students are assigned to groups for scheduling and progress tracking. |
| Payment | A student payment record linked to a company. Tracks amount, method, due date, status. |
| Course | A course type (e.g., B-avto). Defines the program a group or student follows. |
| Owner | Company-level admin role. Full access to company data, users, branches. |
| Manager / Operator / Teacher | Sub-owner roles with progressively narrower scope within a company. |

### Common

| Term | Definition |
|------|------------|
| Soft Delete | Standard pattern on core entities. Records have `deletedAt` field; filtered out by default. |
| RBAC | Role-based access control enforced at the API level. Admin panel mirrors these guards with route wrappers. |
| TanStack Query | Server state library used for all data fetching, caching, and mutation invalidation. |
| Zustand | Lightweight global state store for auth/session data only. |
| axiosInstance | Shared Axios instance with interceptors for JWT token injection and response handling. |

---

## UI Architecture (Admin-specific)

### Theme: Shabnam

The admin panel uses a custom **"Shabnam"** dark-mode-first theme:

- **Accent color**: Amber — `38 92% 50%` (HSL). Not cyan like the tenant frontend.
- **Dark mode**: Default. The theme is dark-first with a light mode variant.
- **Glassmorphism**: Glass-card backgrounds, frosted borders, backdrop blur throughout.
- **Neon glow**: Subtle amber neon glow on active/hover states (`neon-glow-sm`).

### Fonts

| Usage | Font |
|-------|------|
| Headings | **Unbounded** — weights 400-800 |
| Body | **Inter** — weights 300-700 |

Applied via Tailwind: `.font-heading` (Unbounded), `.font-body` (Inter).

### Components

- **shadcn/ui** components built on **Radix UI** primitives.
- Custom layout components: `Sidebar`, `Topbar`, `AppLayout`, `SummaryCard`.
- All standard Radix primitives available (Dialog, DropdownMenu, Select, Sheet, Tabs, etc.).

### Layout

Two-panel layout:

1. **Collapsible sidebar** (desktop): `w-60` expanded / `w-[68px]` collapsed. Glass background with border. Collapse toggle button. Mobile variant uses Sheet drawer.
2. **Glass topbar**: Sticky `h-14` header with backdrop blur, company switcher, and user menu.
3. **Main content**: Scrollable area with `glass-sm` cards and data tables.

Layout transitions animate with `duration-300` on sidebar width change.

---

## State Management

- **TanStack Query**: All server state (companies, users, students, payments, groups). Query keys typically include `activeCompanyId` for scoping. Mutations invalidate affected query keys and show toast feedback via `sonner`.
- **Zustand** (`authStore`): Only for auth/session state — `user`, `token`, `isAuthenticated`, `activeCompanyId`. The `setActiveCompanyId` action switches the active company for cross-company view-as.
- **axiosInstance**: Injects JWT from cookies/Bearer header. Adds `company_id` query param for dev cross-company behavior. The `activeCompanyId` param always overrides any user-supplied value.

### activeCompanyId

The single most important state variable for cross-company behavior:

- Stored in `authStore.activeCompanyId`.
- When set, all tenant routes scope their data queries to this company.
- Platform routes (`/platform/*`) are exempt from company scoping.
- Used in every service hook as a query key dimension (`["students", activeCompanyId, ...]`).
- Resets on logout.

---

## Route Map

| Path | Page | Guard | Notes |
|------|------|-------|-------|
| `/login` | Login page | LoginRoute (redirects if authed) | — |
| `/dashboard` | Platform overview | Authenticated | — |
| `/kompaniyalar` | Company CRUD | DevRoute | Dev-only |
| `/kompaniyalar/:id` | Company detail + branch mgmt | DevRoute | Dev-only |
| `/platform-foydalanuvchilar` | Platform users | DevRoute | Dev-only |
| `/platform/system-health` | System health dashboard | DevRoute | Dev-only |
| `/talabalar` | Students list | OwnerRoute | Scoped to activeCompanyId |
| `/tolovlar` | Payments list | OwnerRoute | Scoped to activeCompanyId |
| `/guruhlar` | Groups list | OwnerRoute | Scoped to activeCompanyId |
| `/foydalanuvchilar` | Users within active company | OwnerRoute | Scoped to activeCompanyId |

### Route Guards

- **`DevRoute`**: Only `dev` role may access. Used for platform management pages.
- **`OwnerRoute`**: `owner` or `dev` role may access. Used for tenant data pages.
- **`LoginRoute`**: Redirects authenticated users to `/dashboard`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.8 |
| Bundler | Vite |
| Styling | Tailwind CSS + shadcn/ui + Radix primitives |
| Server state | TanStack Query 5 |
| Global state | Zustand 5 |
| Routing | react-router-dom 6 |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Icons | lucide-react |
| Toasts | sonner |
| Testing | Vitest |
| PWA | vite-plugin-pwa |

---

## Key Patterns

1. **activeCompanyId** drives which company's data is shown on tenant routes. Platform routes (`/platform/*`) are unrestricted.
2. **DevRoute** guard for dev-only pages (company mgmt, platform users, system health).
3. **OwnerRoute** guard allows both `owner` and `dev` roles.
4. **LoginRoute** redirects authenticated users to `/dashboard`.
5. **Glassmorphism layout** with collapsible sidebar + glass topbar + glass-card content.
6. **Amber accent** everywhere — sidebar active states, primary buttons, focus rings, interactive elements.
7. **Dark-first** theme with a light mode variant (no forced dark mode).
8. **Snake_case API responses** from the backend are mapped to camelCase internally.
9. **Soft deletes** on core entities; `deletedAt: null` filtering is standard.
10. **Mutations invalidate query keys** on success, show toast feedback, and disable buttons while pending.
