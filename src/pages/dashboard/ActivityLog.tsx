import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/audit";

const ACTION_ICON: Record<AuditLog["action"], JSX.Element> = {
  CREATE: <Plus className="h-4 w-4" />,
  UPDATE: <Pencil className="h-4 w-4" />,
  DELETE: <Trash2 className="h-4 w-4" />,
};

const ACTION_TONE: Record<AuditLog["action"], string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-info/10 text-info",
  DELETE: "bg-destructive/10 text-destructive",
};

interface ActivityLogProps {
  logs: AuditLog[];
  emptyText: string;
}

const relativeTime = (
  iso: string,
  t: (k: string, p?: Record<string, unknown>) => string,
) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t("dashboard.just_now");
  if (minutes < 60) return t("dashboard.minutes_ago", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("dashboard.hours_ago", { count: hours });
  const days = Math.floor(hours / 24);
  return t("dashboard.days_ago", { count: days });
};

export const ActivityLog = ({ logs, emptyText }: ActivityLogProps) => {
  const { t } = useTranslation();
  if (!logs.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="-mt-1 flex flex-col">
      {logs.map((log) => {
        const actionText = t(
          log.action === "CREATE"
            ? "dashboard.activity_action_create"
            : log.action === "UPDATE"
              ? "dashboard.activity_action_update"
              : "dashboard.activity_action_delete",
        );
        const actor = log.user?.name ?? t("common.platform_admin");
        const role = log.user?.role;
        return (
          <li
            key={log.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border py-3 last:border-b-0"
          >
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg",
                ACTION_TONE[log.action],
              )}
              aria-hidden
            >
              {ACTION_ICON[log.action]}
            </span>
            <div className="min-w-0 text-sm leading-snug">
              <span className="font-semibold">{actor}</span>
              {role && (
                <span className="text-muted-foreground"> ({role})</span>
              )}{" "}
              <span className="text-muted-foreground">{actionText}</span>{" "}
              <span className="font-medium">{log.entity}</span>
            </div>
            <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
              {relativeTime(log.createdAt, t)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
