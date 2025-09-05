import {
    Calendar as BigCalendar,
    momentLocalizer,
    type CalendarProps,
} from "react-big-calendar"
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

const BigCalenderView = (props: Omit<CalendarProps, "localizer">) => {
    return (
        <div className="h-screen">
            <BigCalendar
                views={["month"]}
                defaultView="month"
                {...props}
                localizer={localizer}
            />
        </div>
    )
}

export default BigCalenderView  