import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueAreaChartProps {
  data: Array<{ label: string; value: number }>;
  formatValue: (n: number) => string;
  formatTick?: (n: number) => string;
}

const AXIS_PROPS = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

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

export const RevenueAreaChart = ({
  data,
  formatValue,
  formatTick,
}: RevenueAreaChartProps) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="hsl(var(--primary))"
            stopOpacity={0.35}
          />
          <stop
            offset="60%"
            stopColor="hsl(var(--primary))"
            stopOpacity={0.1}
          />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="2 4"
        stroke="hsl(var(--border))"
        vertical={false}
      />
      <XAxis dataKey="label" {...AXIS_PROPS} />
      <YAxis
        {...AXIS_PROPS}
        tickFormatter={formatTick ?? ((v: number) => String(v))}
        width={48}
      />
      <Tooltip
        {...TOOLTIP_STYLE}
        formatter={(v: number) => [formatValue(v), ""]}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        fill="url(#revenueArea)"
        activeDot={{
          r: 5,
          strokeWidth: 2,
          stroke: "hsl(var(--primary))",
          fill: "hsl(var(--background))",
        }}
      />
    </AreaChart>
  </ResponsiveContainer>
);
