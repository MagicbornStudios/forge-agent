'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  totalCostUsd: {
    label: 'AI spend (USD)',
    color: 'hsl(var(--chart-2))',
  },
  totalTokensK: {
    label: 'Tokens (thousands)',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export type AiUsageChartRow = {
  date: string;
  totalCostUsd: number;
  totalTokensK: number;
};

export function AiUsageAreaChart({ data }: { data: AiUsageChartRow[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tickFormatter={(value: string) => value.slice(5)}
        />
        <YAxis tickLine={false} axisLine={false} width={56} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="totalTokensK"
          type="monotone"
          fill="var(--color-totalTokensK)"
          fillOpacity={0.12}
          stroke="var(--color-totalTokensK)"
          strokeWidth={2}
        />
        <Area
          dataKey="totalCostUsd"
          type="monotone"
          fill="var(--color-totalCostUsd)"
          fillOpacity={0.35}
          stroke="var(--color-totalCostUsd)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
