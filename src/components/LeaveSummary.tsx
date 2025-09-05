import { leaveSummary } from "@/api/api"
import { useEffect, useState } from "react"
import ChartPie from "./PieChart"
import ChartBar from "./barChart"

export type PolicySummary = {
    annual_quota: number
    available: number
    consumed: string
    leavename: string
    policy_id: string
}

const monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const WeekArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export type MonthlyStat = {
    month: number | string,
    consumed: string
}
export type WeeklyStat = {
    week: number | string,
    consumed: string
}

interface LeaveSummaryProps {
    year: number
}

const LeaveSummary = ({ year }: LeaveSummaryProps) => {
    const [summaryData, setSummaryData] = useState<PolicySummary[]>([]);
    const [monthlyStat, setMonthlyStat] = useState<MonthlyStat[]>([]);
    const [weeklyStat, setWeeklyStat] = useState<WeeklyStat[]>([]);

    useEffect(() => {
        (async () => {
            const resp = await leaveSummary(year);
            if (resp) {
                setSummaryData(resp.summary);
                setMonthlyStat(resp.monthStat)
                setWeeklyStat(resp.weekstat)
            }
        })()
    }, [year])

    return (
        <div className="w-full p-4 space-y-6">
            {monthlyStat.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="w-full">
                        <ChartBar
                            chartData={
                                monthlyStat
                                    .map(item => ({
                                        ...item,
                                        month: monthArray[Number(item.month) - 1]
                                    }))
                            }
                            title="Monthly Stats"
                        />
                    </div>
                    <div className="w-full">
                        <ChartBar
                            chartData={
                                weeklyStat
                                    .map(item => ({
                                        ...item,
                                        week: WeekArray[Number(item.week)]
                                    }))
                            }
                            title="Weekly Stats"
                        />
                    </div>
                </div>
            )}

            {summaryData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {summaryData.map((item, index) => (
                        <div key={item.policy_id || index} className="w-full">
                            <ChartPie data={item} />
                        </div>
                    ))}
                </div>
            )}

            {summaryData.length === 0 && monthlyStat.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-lg text-muted-foreground mb-2">Loading leave summary...</div>
                        <div className="text-sm text-muted-foreground">Please wait while we fetch your data</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeaveSummary