/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDownIcon, InfinityIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Label } from "./ui/label"
import { useEffect, useState, useCallback, useMemo, type FormEvent } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { checkFloaterAvailable, createLeaveRequest, getBeforeAfterLater, getLeaveOnDays, getPolicyTypes, getworkingDays } from "@/api/api"
import { toast } from "sonner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select"
import { SelectValue } from "@radix-ui/react-select"
import { Textarea } from "./ui/textarea"

interface LeaveRequestProps {
    onClose: () => void
    refresh: () => void
}

interface PolicyType {
    id: string
    leavename: string
    availability: string | null,
    applicationrule: string,
    notes: string[]
}

const LeaveRequest = ({ onClose, refresh }: LeaveRequestProps) => {
    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [workingDays, setWorkingDays] = useState<number>(0)
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyType | null>(null)
    const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([])
    const [notes, setNotes] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    // Memoize date strings to avoid recalculation
    const dateStrings = useMemo(() => ({
        startDateString: startDate?.toLocaleDateString("en-CA"),
        endDateString: endDate?.toLocaleDateString("en-CA")
    }), [startDate, endDate])

    // Memoize policy availability calculation
    const availableDays = useMemo(() => {
        if (!selectedPolicy) return null
        return selectedPolicy.availability === null ? Infinity : Number(selectedPolicy.availability)
    }, [selectedPolicy])

    // Memoize days difference calculation
    const daysDifference = useMemo(() => {
        if (!startDate) return 0
        const todayDate = new Date()
        return Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    }, [startDate])

    // Memoize whether dates are valid
    const isDatesValid = useMemo(() => {
        return startDate && endDate && startDate <= endDate
    }, [startDate, endDate])

    // Load policy types on mount
    useEffect(() => {
        let isMounted = true

        const loadPolicyTypes = async () => {
            try {
                const types: PolicyType[] = (await getPolicyTypes()).data
                if (isMounted) {
                    setPolicyTypes(types)
                }
            } catch (error: any) {
                if (isMounted) {
                    toast.error("Error Occurred - Cannot get leave Types", error.message)
                }
            }
        }

        loadPolicyTypes()

        return () => {
            isMounted = false
        }
    }, [])

    // Memoized callback for updating errors
    const updateErrors = useCallback((updater: (prev: Record<string, string>) => Record<string, string>) => {
        setErrors(updater)
    }, [])

    // Validate working days and date conflicts
    useEffect(() => {
        if (!isDatesValid) return

        let isMounted = true

        const validateDatesAndWorkingDays = async () => {
            try {
                // Check if end date is after start date
                if (startDate! > endDate!) {
                    if (isMounted) {
                        updateErrors(prev => ({ ...prev, endDate: "End Date must be after Start Date" }))
                    }
                    return
                } else {
                    if (isMounted) {
                        updateErrors(prev => ({ ...prev, endDate: "" }))
                    }
                }

                // Get working days
                const workingDaysResp = await getworkingDays(
                    dateStrings.startDateString!,
                    dateStrings.endDateString!
                )

                if (isMounted) {
                    setWorkingDays(workingDaysResp.data.workingDays)
                }

                // Check for existing leave requests on selected days
                const requestsOnDays = await getLeaveOnDays(
                    dateStrings.startDateString!,
                    dateStrings.endDateString!
                )

                if (isMounted) {
                    updateErrors(prev => ({
                        ...prev,
                        notes: requestsOnDays.message || ""
                    }))
                }
            } catch (error: any) {
                if (isMounted) {
                    toast.error(error.message)
                }
            }
        }

        validateDatesAndWorkingDays()

        return () => {
            isMounted = false
        }
    }, [dateStrings.endDateString, dateStrings.startDateString, endDate, isDatesValid, startDate, updateErrors])

    // Validate floater leave and before/after leave constraints
    useEffect(() => {
        if (!isDatesValid || !selectedPolicy) return

        let isMounted = true

        const validateLeaveConstraints = async () => {
            try {
                // Floater leave validation
                if (selectedPolicy.leavename === "Floater Leave") {
                    const floater = await checkFloaterAvailable(
                        dateStrings.startDateString!,
                        dateStrings.endDateString!
                    )

                    if (isMounted) {
                        updateErrors(prev => {
                            const updated = { ...prev }
                            if (floater.success && floater.data.length !== workingDays) {
                                updated.notes = "Selected Non-floater leave in the range"
                            } else if (updated.notes === "Selected Non-floater leave in the range") {
                                delete updated.notes
                            }
                            return updated
                        })
                    }
                } else {
                    if (isMounted) {
                        updateErrors(prev => {
                            const updated = { ...prev }
                            if (updated.notes === "Selected Non-floater leave in the range") {
                                delete updated.notes
                            }
                            return updated
                        })
                    }
                }

                // Before/after leave validation
                const resp = await getBeforeAfterLater(
                    dateStrings.startDateString!,
                    dateStrings.endDateString!
                )
                const data = resp.data

                if (isMounted) {
                    const conflictingLeaves = data.map((item: any) => item.leavename)
                    const hasConflict = conflictingLeaves.every((name: string) => 
                        selectedPolicy.notes.includes(name)
                    )

                    updateErrors(prev => ({
                        ...prev,
                        notes: hasConflict 
                            ? `Leave Type ${selectedPolicy.leavename} cannot continue with ${selectedPolicy.notes.join(", ")}`
                            : ""
                    }))
                }
            } catch (error: any) {
                if (isMounted) {
                    toast.error(error.message)
                }
            }
        }

        validateLeaveConstraints()

        return () => {
            isMounted = false
        }
    }, [isDatesValid, selectedPolicy, workingDays, dateStrings.startDateString, dateStrings.endDateString, updateErrors])

    // Validate policy constraints (availability and application rule)
    useEffect(() => {
        updateErrors(prev => {
            const updated = { ...prev }
            delete updated.selectedPolicy

            if (selectedPolicy) {
                // Check availability constraint
                if (availableDays !== null && workingDays > availableDays) {
                    updated.selectedPolicy = `Only ${availableDays === Infinity ? 'unlimited' : availableDays} days available`
                }

                // Check application rule constraint
                if (selectedPolicy.applicationrule && daysDifference > Number(selectedPolicy.applicationrule)) {
                    updated.selectedPolicy = `Should be within ${selectedPolicy.applicationrule} days of the startDate`
                }
            }

            return updated
        })
    }, [selectedPolicy, workingDays, availableDays, daysDifference, updateErrors])

    // Memoized callback for handling policy change
    const handlePolicyChange = useCallback((policyId: string) => {
        const policy = policyTypes.find(item => item.id === policyId) || null
        setSelectedPolicy(policy)
    }, [policyTypes])

    // Memoized callback for handling start date selection
    const handleStartDateSelect = useCallback((date: Date | undefined) => {
        setStartDate(date ? new Date(date.toLocaleDateString("en-CA").split("T")[0]) : undefined)
        setStartOpen(false)
        setEndOpen(true)
    }, [])

    // Memoized callback for handling end date selection
    const handleEndDateSelect = useCallback((date: Date | undefined) => {
        setEndDate(date ? new Date(date.toLocaleDateString("en-CA").split("T")[0]) : undefined)
        setEndOpen(false)
    }, [])

    // Memoized callback for handling notes change
    const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value)
    }, [])

    // Memoized callback for form submission
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}

        if (!startDate) newErrors.startDate = "Start date is required"
        if (!endDate) newErrors.endDate = "End date is required"
        if (!selectedPolicy) newErrors.selectedPolicy = "Leave type is required"
        if (!notes.trim()) newErrors.notes = "Notes are required"

        if (selectedPolicy && availableDays !== null && workingDays > availableDays) {
            newErrors.selectedPolicy = `Only ${availableDays === Infinity ? 'unlimited' : availableDays} days available`
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }))
            return
        }

        try {
            setIsLoading(true)
            const resp = await createLeaveRequest({
                startDate,
                endDate,
                no_of_days: workingDays,
                policy_id: Number(selectedPolicy!.id),
                notes,
            })
            if (resp.success) {
                toast.success("Leave Request Applied")
            }
            onClose()
            refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }, [startDate, endDate, selectedPolicy, notes, workingDays, availableDays, onClose, refresh])

    // Memoized policy select items
    const policySelectItems = useMemo(() => 
        policyTypes?.map((item) => (
            <SelectItem value={item.id} key={item.id} disabled={item.availability === "0"}>
                <div className="flex w-full gap-3 justify-between items-center">
                    <span>{item.leavename}</span>
                    <div>
                        <span className="text-muted-foreground text-xs">
                            {item.availability === null ? <InfinityIcon /> : item.availability}
                        </span>
                    </div>
                </div>
            </SelectItem>
        )) || []
    , [policyTypes])

    // Memoized working days display
    const workingDaysDisplay = useMemo(() => 
        `${workingDays} ${workingDays > 1 ? "days" : "day"}`
    , [workingDays])

    return (
        <div className="border dark:border-zinc-800 border-zinc-400 p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl shadow-teal-300/20">
            <div className="flex justify-between p-2">
                <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-row gap-2">
                    <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold mb-1">Start Date</Label>
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-light">
                                    {dateStrings.startDateString || "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    captionLayout="dropdown"
                                    onSelect={handleStartDateSelect}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate}</p>}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <Label className="text-xs font-semibold mb-1">End Date</Label>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-light">
                                    {dateStrings.endDateString || "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    captionLayout="dropdown"
                                    onSelect={handleEndDateSelect}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex flex-row justify-between mb-1">
                        <Label className="text-xs font-semibold">Leave Type</Label>
                        <div className="text-xs font-medium dark:text-teal-200 text-teal-700 mr-2">
                            {workingDaysDisplay}
                        </div>
                    </div>
                    <Select onValueChange={handlePolicyChange} value={selectedPolicy?.id || ""}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {policySelectItems}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {errors.selectedPolicy && <p className="text-red-500 text-xs">{errors.selectedPolicy}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold mb-1">Notes</Label>
                    <Textarea 
                        value={notes} 
                        onChange={handleNotesChange} 
                        className="h-24" 
                    />
                    {errors.notes && <p className="text-red-500 text-xs">{errors.notes}</p>}
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-teal-600 hover:bg-teal-800"
                >
                    Apply
                </Button>
            </form>
        </div>
    )
}

LeaveRequest.displayName = 'LeaveRequest'

export default LeaveRequest