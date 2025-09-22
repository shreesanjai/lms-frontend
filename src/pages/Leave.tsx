import { cancelRequest, myPendingRequests } from "@/api/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import LeaveHistory from "@/components/LeaveHistory";
import LeaveRequest from "@/components/LeaveRequest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { useEffect, useState } from "react"
import { toast } from "sonner";

type LeaveRequest = {
    id: string
    employee_id: string
    startdate: string
    enddate: string
    status: string
    no_of_days: string
    notes: string
    policy_id: string
    employee_name: string
    employee_username: string
    manager_name: string
    manager_username: string
    leave_type: string
    hr_name: string
}


type ConfirmDialogConfig = {
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
};

type ConfirmDialogState = (ConfirmDialogConfig & { open: boolean }) | null;



const Leave = () => {

    const [leaveRequestOpen, setLeaveRequestOpen] = useState(false);
    const years = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - 1 + i)
    const [year, setYear] = useState(new Date().getFullYear());

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);


    const showConfirmDialog = (config: ConfirmDialogConfig) => {
        setConfirmDialog({
            ...config,
            open: true
        });
    };
    const hideConfirmDialog = () => {
        setConfirmDialog(null);
    };


    const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);

    async function getPendingRequests() {
        try {

            const resp = await myPendingRequests();

            if (resp.success)
                setPendingRequests(resp.data)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Error in retrieving pending requests", error.message)
        }
    }

    const cancelLeaveRequest = async (id: string) => {

        async function cancelRequestFunction() {
            try {
                const response = await cancelRequest(id);
                if (response.success) {

                    toast.success("Request cancelled")
                    await getPendingRequests();
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast.error(error.message)
            }
        }

        showConfirmDialog({
            title: "Cancel Request",
            description: "Are you sure you want to cancel this request ?",
            confirmText: "Cancel Request",
            onConfirm: () => {
                hideConfirmDialog();
                cancelRequestFunction();
            },
            onCancel: hideConfirmDialog
        })


    }

    useEffect(() => {
        getPendingRequests()
    }, [])

    return (
        <div className="flex flex-col ">
            <div className="flex justify-between flex-row-reverse items-baseline py-5">
                <Button onClick={() => setLeaveRequestOpen(true)} className="bg-teal-600 hover:bg-teal-700 float-end ">Request Leave</Button>

                <h2 className="text-xl font-semibold">My Pending Requests</h2>
            </div>
            <Card className="m-5">
                <CardContent>
                    <ScrollArea className="h-[200px] pr-3">

                        {pendingRequests.length > 0 ?
                            (<div className="space-y-3">
                                <TooltipProvider>
                                    {pendingRequests.map((req) => (
                                        <Tooltip key={req.id}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                                                >
                                                    <div className="mt-3 text-sm space-y-1 flex flex-row justify-around">
                                                        <p className="flex flex-col">
                                                            <span className="font-medium text-gray-600 dark:text-gray-300 ">From</span>
                                                            <span className="font-light text-xs">
                                                                {format(new Date(req.startdate), "dd MMM yyyy")}
                                                            </span>
                                                        </p>
                                                        <p className="flex flex-col">
                                                            <span className="font-medium text-gray-600 dark:text-gray-300">To</span>
                                                            <span className="font-light text-xs">
                                                                {format(new Date(req.enddate), "dd MMM yyyy")}
                                                            </span>
                                                        </p>
                                                        <p className="flex flex-col">
                                                            <span className="font-medium text-gray-600 dark:text-gray-300">Leave Type</span>
                                                            <span className="font-light text-xs">{req.leave_type}</span>
                                                        </p>
                                                        <p className="flex flex-col">
                                                            <span className="font-medium text-gray-600 dark:text-gray-300">Days</span>
                                                            <span className="font-light text-xs">{req.no_of_days}</span>
                                                        </p>
                                                        <Button onClick={() => cancelLeaveRequest(req.id)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    {req.status !== "partially_approved" ?
                                                        (<div className="mt-3 border-t pt-2 text-xs text-gray-500">
                                                            Approver:{" "}
                                                            <span className="font-medium">{req.manager_name}</span>

                                                        </div>) : (<div className="mt-3 border-t pt-2 text-xs text-gray-500">
                                                            Approved By {req.manager_name}. Waiting For Confirmation from {req.hr_name} (HR) . . .
                                                        </div>)}

                                                </div>
                                            </TooltipTrigger>

                                            <TooltipContent side="bottom" className="max-w-xs text-sm">
                                                {req.notes || "No notes provided"}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>) :
                            (<div
                                className="w-full p-3"
                            >
                                <div className="font-semibold">No Pending Requests</div>


                            </div>)}

                    </ScrollArea>
                </CardContent>
            </Card>

            {leaveRequestOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setLeaveRequestOpen(false)}
                    />

                    <div className="relative z-10 w-full max-w-lg">
                        <LeaveRequest onClose={() => setLeaveRequestOpen(false)} refresh={getPendingRequests} />
                    </div>
                </div>
            )}

            <div className='flex flex-col'>
                <div className="flex flex-row justify-between">

                    <h3 className='text-xl font-bold'>Leave History</h3>

                    <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Pick a year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((item) => (
                                <SelectItem key={item} className="text-bold" value={String(item)}>
                                    Jan {item} - Dec {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>
                <LeaveHistory year={year} />
            </div>

            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    description={confirmDialog.description}
                    open={confirmDialog.open}
                    confirmText={confirmDialog.confirmText}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}

        </div>


    )
}

export default Leave