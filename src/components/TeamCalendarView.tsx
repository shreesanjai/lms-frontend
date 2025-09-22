import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { UserData } from "@/api/api"
import type { teamLeaveSummary } from "@/pages/Team"
import type { Holiday } from "@/pages/Holiday"
import { getInitials } from "@/utils/constants"


interface TeamCalendarViewProps {
    team: UserData[]
    teamLeaveSummary: teamLeaveSummary[]
    holidays: Holiday[]
}

const TeamCalendarView = ({ team = [], teamLeaveSummary = [], holidays = [] }: TeamCalendarViewProps) => {

    const [teamLeave, setTeamLeave] = useState<Record<string, teamLeaveSummary[]>>({});
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    useEffect(() => {
        const leaveByEmployee = teamLeaveSummary.reduce((acc, val) => {
            const emp = val.employee_name;
            if (!acc[emp]) {
                acc[emp] = [];
            }
            acc[emp].push(val);
            return acc;
        }, {} as Record<string, teamLeaveSummary[]>);
        setTeamLeave(leaveByEmployee);
    }, [teamLeaveSummary]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getAllDatesInRange = (startDate: string, endDate: string) => {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        const current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isHoliday = (date: Date) => {
        const dateString = date.toLocaleDateString("en-CA").split('T')[0];

        return holidays.some(holiday => holiday.date === dateString);
    };

    const getLeaveForDate = (employeeName: string, date: Date) => {
        const employeeLeaves = teamLeave[employeeName] || [];

        return employeeLeaves.find(leave => {
            const allDates = getAllDatesInRange(leave.startdate, leave.enddate);
            return allDates.some(leaveDate =>
                leaveDate.toDateString() === date.toDateString()
            );
        });
    };

    const getLeaveTypeColor = (leaveType: string) => {
        switch (leaveType?.toLowerCase()) {
            case '1':
                return 'bg-blue-300 text-black';
            case '2':
                return 'bg-red-300 text-black';
            case '3':
                return 'bg-purple-300 text-black';
            case '4':
                return 'bg-orange-300 text-black';
            case '5':
                return 'bg-gray-300 text-black';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    const getLeaveTypeName = (leaveType: string) => {
        switch (leaveType?.toLowerCase()) {
            case '1':
                return 'Casual Leave';
            case '2':
                return 'Sick Leave';
            case '3':
                return 'Floater Leave';
            case '4':
                return 'Earned Leave';
            case '5':
                return 'Loss Of Pay';
            default:
                return 'Unknown';
        }
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const days = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            days.push({
                date: day,
                day: date.getDay(),
                dateObj: date,
                isWeekend: isWeekend(date),
                isHoliday: isHoliday(date),
            });
        }

        return days;
    };

    const allEmployees = new Set([
        ...team.map(member => member.name),
        ...Object.keys(teamLeave)
    ]);

    const calendarDays = generateCalendarDays();

    return (
        <div className="w-full">

            <div className="">
                <div className="grid grid-cols-[200px_1fr] border-b">

                    <div className="flex items-center justify-center gap-4">
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-7 h-7"
                                onClick={() => navigateMonth('prev')}
                            >
                                <ChevronLeft />
                            </Button>
                            <h2 className="text-sm font-semibold">
                                {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-7 h-7"
                                onClick={() => navigateMonth('next')}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>

                    <div className="h-10 grid grid-cols-31 gap-px">
                        {calendarDays.map((day) => (
                            <div
                                key={day.date}
                                className={`
                                    m-1 text-center text-xs font-medium min-h-[24px] flex items-center justify-center
                                    ${day.isHoliday ? 'bg-yellow-400 text-black ' : ''}
                                    ${day.isWeekend ? 'bg-emerald-500 text-black' : ''} rounded-4xl
                                    
                                `}
                            >
                                {weekdays[day.day].slice(0, 2)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="divide-y">
                {Array.from(allEmployees).map(employeeName => (
                    <div key={employeeName} className="grid grid-cols-[200px_1fr]">
                        <div className="p-3 border-r flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex text-white dark:text-black items-center justify-center font-medium text-sm">
                                {getInitials(employeeName)}
                            </div>
                            <div className="font-medium truncate">
                                {employeeName}
                            </div>
                        </div>

                        <div className="grid grid-cols-31 gap-px">
                            {calendarDays.map((day) => {
                                const leave = getLeaveForDate(employeeName, day.dateObj);

                                return (
                                    <div
                                        key={day.date}
                                        className={`min-h-[40px] flex items-center justify-center relative text-[12px]`}
                                    >
                                        {leave ? (
                                            <div
                                                className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium 
                                                    ${getLeaveTypeColor(leave.calendardaystatus)}
                                                   
                                                `}
                                                title={`${getLeaveTypeName(leave.calendardaystatus)}`}
                                            >
                                                {day.date}
                                            </div>
                                        ) : day.isWeekend ? (
                                            <div title="Week-Off" className="w-6 h-6 rounded-full text-black bg-emerald-400 flex items-center justify-center text-xse">
                                                {day.date}
                                            </div>
                                        ) : day.isHoliday ? (
                                            <div title="Holiday" className="w-6 h-6 rounded-full text-black bg-yellow-400 flex items-center justify-center text-xse">
                                                {day.date}
                                            </div>
                                        ) : (
                                            <span className="text-xs ">
                                                {day.date}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {allEmployees.size === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p className="text-lg font-medium">No team members found</p>
                    <p className="text-sm">Add team members to see their leave schedules</p>
                </div>
            )}

            <div className="p-4 border-t">
                <div className="flex items-center justify-end gap-6 text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                        <span>Casual Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-300 rounded-full"></div>
                        <span>Sick Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
                        <span>Floater Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-300 rounded-full"></div>
                        <span>Earned Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <span>Loss Of Pay</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                        <span>Weekend</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <span>Holiday</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeamCalendarView;