'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  earningsUsd: {
    label: 'Earnings',
    color: 'hsl(var(--chart-1))',
  },
  feesUsd: {
    label: 'Platform fees',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export type RevenueChartRow = {
  date: string;
  earningsUsd: number;
  feesUsd: number;
};

export function RevenueAreaChart({ data }: { data: RevenueChartRow[] }) {
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
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="feesUsd"
          type="monotone"
          fill="var(--color-feesUsd)"
          fillOpacity={0.18}
          stroke="var(--color-feesUsd)"
          strokeWidth={2}
          stackId="a"
        />
        <Area
          dataKey="earningsUsd"
          type="monotone"
          fill="var(--color-earningsUsd)"
          fillOpacity={0.3}
          stroke="var(--color-earningsUsd)"
          strokeWidth={2}
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
