import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const DashboardCard = ({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: DashboardCardProps) => (
  <article
    className={cn(
      "rounded-[var(--radius)] border bg-card p-5 shadow-sm",
      className,
    )}
  >
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
    <div className={bodyClassName}>{children}</div>
  </article>
);
