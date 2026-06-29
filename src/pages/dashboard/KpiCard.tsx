import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type DeltaTone = "up" | "down" | "neutral";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon: ReactNode;
  /** Tone of the colored icon chip. */
  iconTone?: "primary" | "info" | "warning" | "success" | "destructive";
  /** Optional pill at bottom-left, e.g. "+29%" or "23 students". */
  delta?: { text: string; tone: DeltaTone };
  /** Optional muted-foreground tail next to the delta pill. */
  meta?: string;
  /** Inline series for a tiny background spark. Values normalised to [0,1]. */
  spark?: number[];
  className?: string;
}

const TONE_BG: Record<NonNullable<KpiCardProps["iconTone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

const DELTA_TONE: Record<DeltaTone, string> = {
  up: "bg-success/10 text-success",
  down: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

const SPARK_STROKE: Record<NonNullable<KpiCardProps["iconTone"]>, string> = {
  primary: "hsl(var(--primary))",
  info: "hsl(var(--info))",
  warning: "hsl(var(--warning))",
  success: "hsl(var(--success))",
  destructive: "hsl(var(--destructive))",
};

const sparkPath = (values: number[]) => {
  if (!values.length) return "";
  const w = 240;
  const h = 32;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

export const KpiCard = ({
  label,
  value,
  unit,
  icon,
  iconTone = "primary",
  delta,
  meta,
  spark,
  className,
}: KpiCardProps) => {
  const stroke = SPARK_STROKE[iconTone];
  const path = spark && spark.length > 1 ? sparkPath(spark) : "";
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius)] border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            TONE_BG[iconTone],
          )}
          aria-hidden
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-tight tracking-tight tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
      {(delta || meta) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                DELTA_TONE[delta.tone],
              )}
            >
              {delta.tone === "up" && <ArrowUp className="h-3 w-3" />}
              {delta.tone === "down" && <ArrowDown className="h-3 w-3" />}
              {delta.tone === "neutral" && <Minus className="h-3 w-3" />}
              {delta.text}
            </span>
          ) : (
            <span />
          )}
          {meta && (
            <span className="truncate text-xs text-muted-foreground">
              {meta}
            </span>
          )}
        </div>
      )}
      {path && (
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 opacity-50"
          viewBox="0 0 240 32"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
        </svg>
      )}
    </article>
  );
};
