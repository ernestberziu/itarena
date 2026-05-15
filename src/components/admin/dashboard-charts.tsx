"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; total: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(246,100%,42%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(246,100%,42%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [`${Number(v ?? 0).toLocaleString("sq-AL")} ALL`, "Xhiro"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(246,100%,42%)"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface TicketBarChartProps {
  data: { status: string; count: number; label: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "hsl(246,100%,42%)",
  ASSIGNED: "hsl(258,70%,58%)",
  IN_PROGRESS: "hsl(38,95%,52%)",
  PAUSED: "hsl(215,14%,52%)",
  PENDING_CLIENT: "hsl(25,95%,53%)",
  RESOLVED: "hsl(172,66%,40%)",
  CLOSED: "hsl(217,16%,48%)",
};

export function TicketBarChart({ data }: TicketBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [String(v ?? 0), "Bileta"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? "hsl(var(--primary))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SlaRingProps {
  compliant: number;
  breached: number;
}

export function SlaRing({ compliant, breached }: SlaRingProps) {
  const total = compliant + breached;
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 100;
  const pieData = [
    { name: "Respektohet", value: compliant },
    { name: "Shkelur", value: breached },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <PieChart width={120} height={120}>
          <Pie
            data={pieData}
            cx={55}
            cy={55}
            innerRadius={38}
            outerRadius={52}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="hsl(172,66%,40%)" />
            <Cell fill="hsl(0,84%,60%)" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold">{pct}%</span>
          <span className="text-[10px] text-muted-foreground">SLA</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-muted-foreground">Respektohet</span>
          <span className="font-semibold ml-auto">{compliant}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-muted-foreground">Shkelur</span>
          <span className="font-semibold ml-auto">{breached}</span>
        </div>
      </div>
    </div>
  );
}
