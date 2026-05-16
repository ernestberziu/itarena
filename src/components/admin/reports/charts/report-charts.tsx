"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRIMARY = "hsl(246,100%,42%)";
const GRID = "hsl(var(--border))";
const MUTED = "hsl(var(--muted-foreground))";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export function ReportLineChart({
  data,
  dataKey = "value",
  xKey = "date",
  height = 280,
  color = PRIMARY,
}: {
  data: { [k: string]: string | number }[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} animationDuration={600} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ReportAreaChart({
  data,
  dataKey = "value",
  xKey = "date",
  height = 280,
}: {
  data: { [k: string]: string | number }[];
  dataKey?: string;
  xKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="reportAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
            <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey} stroke={PRIMARY} fill="url(#reportAreaGrad)" animationDuration={600} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReportBarChart({
  data,
  dataKey = "value",
  xKey = "label",
  height = 280,
  colors,
}: {
  data: { [k: string]: string | number }[];
  dataKey?: string;
  xKey?: string;
  height?: number;
  colors?: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} animationDuration={600}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors?.[i % (colors?.length ?? 1)] ?? PRIMARY} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportDonutChart({
  data,
  height = 260,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  const palette = [PRIMARY, "hsl(172,66%,40%)", "hsl(38,95%,52%)", "hsl(258,70%,58%)", "hsl(215,14%,52%)"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} animationDuration={600}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ReportFunnelChart({
  data,
  height = 280,
}: {
  data: { stage: string; count: number }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex flex-col justify-center gap-3 py-2" style={{ minHeight: height }}>
      {data.map((row) => (
        <div key={row.stage} className="group">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium capitalize text-foreground">{row.stage}</span>
            <span className="text-muted-foreground tabular-nums">{row.count}</span>
          </div>
          <div
            className="h-8 rounded-lg bg-primary/15 transition-all duration-500 group-hover:bg-primary/25"
            style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
