/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDownIcon, InfinityIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Label } from "./ui/label"
import { useEffect, useState, type FormEvent } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { checkFloaterAvailable, createLeaveRequest, getPolicyTypes, getworkingDays } from "@/api/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select"
import { SelectValue } from "@radix-ui/react-select"
import { Textarea } from "./ui/textarea"

interface LeaveRequestProps {
    onClose: () => void
    refresh: () => void
}

interface Response {
    workingDays: number
    weekends: number
    holidays: number
    totalDays: number
}

interface PolicyType {
    id: string
    leavename: string
    availability: string | null
}

const LeaveRequest = ({ onClose, refresh }: LeaveRequestProps) => {

    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [workingDays, setWorkingDays] = useState<number>(0)
    const [policyId, setPolicyId] = useState<number>(0)
    const [leaveType, setLeaveType] = useState<PolicyType[]>([])
    const [notes, setNotes] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        (async () => {
            try {
                const types: PolicyType[] = (await getPolicyTypes()).data
                setLeaveType(types)
            } catch (error: any) {
                toast.error("Error Occured - Cannot get leave Types", error.message)
            }
        })()

    }, [])

    useEffect(() => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                setErrors(prev => ({ ...prev, endDate: "End Date must be after Start Date" }))
                return
            } else {
                setErrors(prev => {
                    const updated = { ...prev }
                    delete updated.endDate
                    return updated
                })
            }

            (async () => {
                try {
                    const resp: Response = (await getworkingDays(
                        startDate.toLocaleDateString("en-CA"),
                        endDate.toLocaleDateString("en-CA")
                    )).data
                    setWorkingDays(resp.workingDays)

                    setErrors(prev => {
                        const updated = { ...prev }
                        if (resp.workingDays === 0) {
                            updated.notes = "No working days in selected range"
                        } else if (updated.notes === "No working days in selected range") {
                            delete updated.notes
                        }
                        return updated
                    })
                } catch (error: any) {
                    toast.error(error.message)
                }
            })()
        }
    }, [startDate, endDate])

    useEffect(() => {
        const floaterType = leaveType.find(item => item.leavename === "Floater Leave")

        if (floaterType && Number(floaterType.id) === policyId && startDate && endDate) {
            (async () => {
                try {
                    const start = startDate.toLocaleDateString("en-CA")
                    const end = endDate.toLocaleDateString("en-CA")

                    const floater = await checkFloaterAvailable(start, end)

                    setErrors(prev => {
                        const updated = { ...prev }
                        if (floater.success && floater.data.length !== workingDays) {
                            updated.notes = "Selected Non-floater leave in the range"
                        } else if (updated.notes === "Selected Non-floater leave in the range") {
                            delete updated.notes
                        }
                        return updated
                    })
                } catch (error: any) {
                    toast.error("Cannot fetch Floater leave on Selected days", error)
                }
            })()
        } else {
            setErrors(prev => {
                const updated = { ...prev }
                if (updated.notes === "Selected Non-floater leave in the range") {
                    delete updated.notes
                }
                return updated
            })
        }
    }, [startDate, endDate, leaveType, policyId, workingDays])

    useEffect(() => {
        setErrors(prev => {
            const updated = { ...prev }
            if (updated.policyId?.startsWith("Only")) {
                delete updated.policyId
            }
            return updated
        })
    }, [policyId])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}

        if (!startDate) newErrors.startDate = "Start date is required"
        if (!endDate) newErrors.endDate = "End date is required"
        if (!policyId) newErrors.policyId = "Leave type is required"
        if (!notes.trim()) newErrors.notes = "Notes are required"

        const selectedPolicy = leaveType.find(p => Number(p.id) === policyId)
        if (selectedPolicy) {
            const available =
                selectedPolicy.availability === null
                    ? Infinity
                    : Number(selectedPolicy.availability)
            if (workingDays > available) {
                newErrors.policyId = `Only ${available} days available`
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }))
            return
        }

        try {
            const resp = await createLeaveRequest({
                startDate,
                endDate,
                no_of_days: workingDays,
                policy_id: policyId,
                notes,
            })
            if (resp.success) {
                toast.success("Leave Request Applied")
            }
            onClose()
            refresh()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="border dark:border-zinc-800 border-zinc-400 p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl shadow-teal-300/20">
            <div className="flex justify-between p-2">
                <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
                <Button variant="ghost" size="icon" onClick={() => onClose()}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-row gap-2">
                    {/* Start Date */}
                    <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold mb-1">Start Date</Label>
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-light">
                                    {startDate ? startDate.toLocaleDateString("en-CA") : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setStartDate(date)
                                        setStartOpen(false)
                                        setEndOpen(true)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
                    </div>



                    {/* End Date */}
                    <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold mb-1">End Date</Label>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-light">
                                    {endDate ? endDate.toLocaleDateString("en-CA") : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setEndDate(date)
                                        setEndOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                    </div>
                </div>

                {/* Leave Type */}
                <div className="flex flex-col gap-1">
                    <div className="flex flex-row justify-between mb-1">
                        <Label className="text-xs font-semibold">Leave Type</Label>
                        <div className="text-xs font-medium dark:text-teal-200 text-teal-700  mr-2">
                            {workingDays} {workingDays > 1 ? "days" : "day"}
                        </div>
                    </div>
                    <Select onValueChange={(value) => setPolicyId(Number(value))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {leaveType?.map((item) => (
                                    <SelectItem value={item.id} key={item.id} disabled={item.availability == "0"}>
                                        <div className="flex w-full gap-3 justify-between items-center">
                                            <span>{item.leavename}</span>
                                            <div>
                                                <span className="text-muted-foreground text-xs">
                                                    {item.availability === null ? <InfinityIcon /> : item.availability}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.policyId && <p className="text-red-500 text-xs">{errors.policyId}</p>}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold mb-1">Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-24" />
                    {errors.notes && <p className="text-red-500 text-xs">{errors.notes}</p>}
                </div>

                <Button type="submit" className="bg-teal-600 hover:bg-teal-800">Apply</Button>
            </form>
        </div>
    )
}

export default LeaveRequest
