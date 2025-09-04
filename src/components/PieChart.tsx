"use client"

import { InfinityIcon } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { type PolicySummary } from "./LeaveSummary"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartPieProps {
    data: PolicySummary
}

const ChartPie = ({ data }: ChartPieProps) => {
    const hasData = (data.available !== null) || Number(data.consumed) > 0

    const chartData = hasData
        ? data.available === null
            ? [
                {
                    key: "Available",
                    value: 0,
                    fill: "#0f766e",
                },
                {
                    key: "Consumed",
                    value: Number(data.consumed),
                    fill: "#14b8a6 ",
                },
            ]
            : [
                {
                    key: "Available",
                    value: Number(data.available),
                    fill: "#0f766e",
                },
                {
                    key: "Consumed",
                    value: Number(data.consumed),
                    fill: "#14b8a6 ",
                },
            ]
        : []

    const chartConfig = {
        available: {
            label: "Available",
            color: "#0f766e",
        },
        consumed: {
            label: "Consumed",
            color: "#14b8a6",
        },
    } satisfies ChartConfig

    return (
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-center">{data.leavename}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
                {hasData ? (
                    <div className="relative">
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[220px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="key"
                                    innerRadius={65}
                                    strokeWidth={2}
                                    stroke="#fff"
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) - 8}
                                                            className="fill-foreground text-2xl font-bold"
                                                        >
                                                            {data.available === null ? "∞" : data.available}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 16}
                                                            className="text-xs fill-muted-foreground"
                                                        >
                                                            {(data.available > 1 || data.available === null) ? "Days " : "Day"} Available
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[220px]">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                                <InfinityIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No data to display</p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t rounded-b-lg w-full">
                <div className="flex gap-4 w-full py-2 justify-around">
                    {/* Available Days */}
                    <div className="text-center p-3 rounded-lg">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Available</div>
                        <div className="flex items-center justify-center">
                            {data.available === null ? (
                                <InfinityIcon className="w-5 h-5 text-teal-600" />
                            ) : (
                                <span className="text-lg font-bold text-teal-600">{data.available}</span>
                            )}
                        </div>
                    </div>

                    {/* Consumed Days */}
                    <div className="text-center p-3 rounded-lg">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Consumed</div>
                        <div className="flex items-center justify-center">
                            <span className="text-lg font-bold">{data.consumed}</span>
                        </div>
                    </div>

                    {/* Annual Quota */}

                    <div className="text-center p-3 rounded-lg">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Annual Quota</div>
                        <div className="flex items-center justify-center">
                            {data.annual_quota === null ? (
                                <InfinityIcon className="w-5 h-5 " />
                            ) : (
                                <span className="text-lg font-bold    ">{data.annual_quota}</span>
                            )}
                        </div>
                    </div>
                </div>


            </CardFooter>
        </Card>
    )
}

export default ChartPie