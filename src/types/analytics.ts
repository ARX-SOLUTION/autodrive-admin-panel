import { CompanyStatus } from "./company";
import { UserRole } from "./user";

export interface PlatformAnalytics {
  companies: {
    total: number;
    by_status: Record<CompanyStatus, number>;
    new_last_30d: number;
  };
  users: {
    total: number;
    by_role: Record<UserRole, number>;
    new_last_30d: number;
  };
  tenants: {
    branches: number;
    students_active: number;
    students_total: number;
  };
  revenue: {
    total_amount: number;
    last_30d_amount: number;
    last_30d_count: number;
  };
  monthly_growth: Array<{
    month: string;
    companies: number;
    users: number;
    payments_count: number;
  }>;
}
