"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; value: number };

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function fmtCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${(n ?? 0).toLocaleString("es-AR")}`;
  }
}

export function SalesChart({
  data,
  currency = "ARS",
}: {
  data: Point[];
  currency?: string;
}) {
  const chartData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        name: MONTH_LABELS[d.month] ?? d.month,
        total: d.value ?? 0,
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="gray"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="gray"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtCurrency(Number(v), currency)}
        />
        <Tooltip
          formatter={(v: any) => fmtCurrency(Number(v), currency)}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(var(--primary))" }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
