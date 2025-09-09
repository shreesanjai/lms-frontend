
import {
    Calendar as BigCalendar,
    momentLocalizer,
    type CalendarProps,
} from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from "react"
import { useTheme } from "./ui/theme-provider"

import type { Holiday } from "@/pages/HolidayPage"

const localizer = momentLocalizer(moment)

interface BigCalenderViewProps {
    props: Omit<CalendarProps, "localizer">
    holidays: Holiday[]
}

const BigCalenderView = ({ props, holidays }: BigCalenderViewProps) => {
    const [date, setDate] = useState(new Date())
    const { theme } = useTheme()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventPropGetter = (event: any) => {
        const style: React.CSSProperties = {
            backgroundColor: event.team ? "#F5EEDD" : "#096B68",
            color: event.team ? "black" : "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 10px",
            fontWeight: 500
        }
        if (event.isImportant) {
            style.backgroundColor = "#dc2626"
        }
        return { style }
    }

    const dayPropGetter = (dateCell: Date) => {
        const style: React.CSSProperties = {}
        const isToday = moment(dateCell).isSame(moment(), "day")
        const isWeekend = [0, 6].includes(moment(dateCell).day())
        const isOutsideMonth = !moment(dateCell).isSame(moment(date), "month")
        const holiday = (holidays || []).find(h =>
            moment(h.date).isSame(moment(dateCell), "day")
        )

        if (isOutsideMonth) {
            style.backgroundColor = theme === "light" ? "#f9fafb" : "#1f2937"
            style.opacity = 0.5
        }
        if (isWeekend) {
            style.backgroundColor = theme === "light" ? "#f0fdfa" : "#0f766e33"
        }
        if (isToday) {
            style.backgroundColor = theme === "light" ? "#ecfdf5" : "#064e3b"
            style.border = `1px solid ${theme === "light" ? "#10b981" : "#34d399"}`
        }
        if (holiday) {
            style.backgroundColor = theme === "light" ? "#fef9c3" : "#facc1533"
            style.position = "relative"
        }

        return {
            style,
            className: holiday ? "holiday-slot" : ""
        }
    }

    return (
        <div className="h-screen">
            <BigCalendar
                eventPropGetter={eventPropGetter}
                views={["month"]}
                defaultView="month"
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                dayPropGetter={dayPropGetter}
                localizer={localizer}
                {...props}
            />
        </div>
    )
}

export default BigCalenderView;