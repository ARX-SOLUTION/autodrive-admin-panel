import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  /** Optional secondary metric shown below the slice name, e.g. "34,560,000 so'm". */
  hint?: string;
}

interface DonutCardProps {
  slices: DonutSlice[];
  centerValue: string | number;
  centerLabel: string;
  /** Optional formatter for the tooltip value. */
  formatValue?: (n: number) => string;
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--popover-foreground))",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--popover-foreground))" },
  itemStyle: { color: "hsl(var(--popover-foreground))" },
};

export const DonutCard = ({
  slices,
  centerValue,
  centerLabel,
  formatValue,
}: DonutCardProps) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const data = slices.filter((s) => s.value > 0);

  return (
    <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-[200px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="100%"
                stroke="none"
                paddingAngle={1}
              >
                {data.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v: number) => [
                  formatValue ? formatValue(v) : v,
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 rounded-full border-[14px] border-muted" />
        )}
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[22px] font-bold leading-none tracking-tight tabular-nums">
              {centerValue}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {centerLabel}
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-col">
        {slices.map((s) => {
          const pct = total ? Math.round((s.value / total) * 1000) / 10 : 0;
          return (
            <li
              key={s.name}
              className="border-b border-border py-2.5 last:border-b-0"
            >
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  {s.name}
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{s.value}</span>
                {s.hint && <span>{s.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
