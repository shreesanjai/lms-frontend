import { myPendingRequests } from "@/api/api";
import LeaveRequest from "@/components/LeaveRequest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Badge } from "lucide-react";
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
}


const LeavePage = () => {

    const [leaveRequestOpen, setLeaveRequestOpen] = useState(false);


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

    useEffect(() => {

        getPendingRequests();
    }, [])

    return (
        <div className="flex flex-col ">
            <div className="flex justify-between flex-row-reverse items-baseline py-5">
                <Button onClick={() => setLeaveRequestOpen(true)} className="bg-teal-600 text-white hover:bg-teal-700 float-end ">Request Leave</Button>

                <h2 className="text-xl font-semibold">My Pending Requests</h2>
            </div>
            <Card className="w-full">
                <CardContent>
                    <ScrollArea className="h-[400px] pr-3">
                        <div className="space-y-3">
                            {pendingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="border rounded-xl p-4 shadow-sm hover:shadow-md transition "
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{req.employee_name}</p>
                                            <p className="text-sm ">@{req.employee_username}</p>
                                        </div>
                                        <Badge className="capitalize">
                                            {req.leave_type}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 text-sm space-y-1">
                                        <p>
                                            <span className="font-semibold">From:</span>{" "}
                                            {format(new Date(req.startdate), "dd MMM yyyy")}
                                        </p>
                                        <p>
                                            <span className="font-semibold">To:</span>{" "}
                                            {format(new Date(req.enddate), "dd MMM yyyy")}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Days:</span> {req.no_of_days}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Notes:</span> {req.notes}
                                        </p>
                                    </div>

                                    <div className="mt-3 border-t pt-2 text-xs text-gray-500">
                                        Reporting Manager:{" "}
                                        <span className="font-medium">
                                            {req.manager_name} (@{req.manager_username})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {
                leaveRequestOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">

                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setLeaveRequestOpen(false)}
                        />

                        <div className="relative z-10 w-full max-w-lg">
                            <LeaveRequest onClose={() => setLeaveRequestOpen(false)} refresh={getPendingRequests} />
                        </div>
                    </div>
                )
            }

        </div>


    )
}

export default LeavePage