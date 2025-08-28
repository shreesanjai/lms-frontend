import { ChevronDownIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { useEffect, useState, type FormEvent } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { createLeaveRequest, getPolicyTypes, getworkingDays } from "@/api/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Textarea } from "./ui/textarea";

interface LeaveRequestProps {
    onClose: () => void;
    refresh: () => void;
}

interface Response {
    workingDays: number;
    weekends: number;
    holidays: number;
    totalDays: number;
}

interface PolicyType {
    id: string;
    leavename: string;
}

const LeaveRequest = ({ onClose, refresh }: LeaveRequestProps) => {

    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [workingDays, setWorkingDays] = useState<number>(0);
    const [policyId, setPolicyId] = useState(0);
    const [leaveType, setLeaveType] = useState<PolicyType[]>([]);
    const [notes, setNotes] = useState("");


    useEffect(() => {
        async function getPolicyType() {
            try {
                const types: PolicyType[] = (await getPolicyTypes()).data
                setLeaveType(types)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error("Error Occured - Cannot get leave Types", error.message)
            }
        }
        getPolicyType()
    }, [])


    useEffect(() => {
        async function getWorkDays() {
            try {
                if (startDate !== undefined && endDate !== undefined) {
                    const resp: Response = (await getworkingDays(startDate?.toLocaleDateString("en-CA"), endDate?.toLocaleDateString("en-CA"))).data;
                    setWorkingDays(resp.workingDays)
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error(error.message)
            }
        }

        if (startDate !== undefined && endDate !== undefined) {
            if (new Date(startDate) > new Date(endDate)) {
                toast.error("Start Date must be less than end Date");
                setStartDate(new Date());
                setEndDate(new Date());
                return;
            }
            getWorkDays();
        }

    }, [startDate, endDate])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const resp = await createLeaveRequest({
                startDate,
                endDate,
                no_of_days: workingDays,
                policy_id: policyId,
                notes
            })
            if (resp.success) {
                toast.success("Leave Request Applied")
            }
            onClose();
            refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="border border-gray-700 p-6 rounded-2xl bg-white dark:bg-black">
            <div className="flex justify-between p-2">
                <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onClose()}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex flex-col gap-3">

                <div className="flex flex-row justify-between gap-3">

                    {/* start Date */}
                    <div className="flex flex-col gap-3 w-full">
                        <Label htmlFor="date" className="px-1">
                            Start Date
                        </Label>
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-full justify-between font-light"
                                >
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
                    </div>

                    {workingDays > 0 && (
                        <div className="flex justify-center items-end pb-1 w-full">
                            <div className="border border-gray-800  rounded-sm px-2 py-1 text-sm"> {workingDays} {workingDays > 1 ? " days" : "day"} </div>
                        </div>
                    )}

                    {/* End Date */}
                    <div className="flex flex-col gap-3 w-full">
                        <Label htmlFor="date" className="px-1">
                            End Date
                        </Label>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-full justify-between font-normal"
                                >
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
                    </div>

                </div>

                {
                    leaveType.length > 0 && (<div>
                        <Label className="px-1 pb-2">
                            Leave Type
                        </Label>
                        <Select onValueChange={(value) => setPolicyId(Number(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a Leave Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {leaveType?.map((item) => (
                                        <SelectItem value={item.id} key={item.id}>
                                            {item.leavename}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>)
                }

                <div>
                    <Label className="px-1 pb-2">
                        Notes
                    </Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div>
                    <Button onClick={handleSubmit}>Apply</Button>
                </div>
            </div>
        </div>
    )
}

export default LeaveRequest