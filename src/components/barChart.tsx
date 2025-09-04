"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { MonthlyStat, WeeklyStat } from "./LeaveSummary"

interface ChartDataProps<T extends MonthlyStat | WeeklyStat> {
    chartData: T[];
    title: string;
}

const chartConfig = {
    consumed: {
        label: "Consumed ",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

const ChartBar = <T extends MonthlyStat | WeeklyStat>({ chartData, title }: ChartDataProps<T>) => {
    const key = chartData.length > 0
        ? ("month" in chartData[0] ? "month" : "week")
        : "month";

    return (
        <Card className="w-full h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey={key}
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0}
                                tickFormatter={(value: string | number) => {
                                    const str = value.toString();
                                    return str.length > 3 ? str.slice(0, 3) : str;
                                }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(20, 184, 166, 0.1)' }}
                                content={<ChartTooltipContent
                                    hideLabel={false}
                                // labelFormatter={(label) => `${title.includes('Weekly') ? 'Day' : 'Month'}: ${label}`}
                                />}
                            />
                            <Bar
                                dataKey="consumed"
                                fill="#14b8a6"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default ChartBar;