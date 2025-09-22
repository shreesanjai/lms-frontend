/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchLeaveHistory } from "@/api/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getStatus, type LeaveStatusKey } from "@/utils/constants";

type LeaveHistoryData = {
    id: string;
    employee_id: string;
    startdate: string;
    enddate: string;
    status: LeaveStatusKey;
    no_of_days: string;
    notes: string;
    policy_id: string;
    statusupdate_at: Date | null;
    created_at: Date | null;
    leavename: string;
    name: string;
    approver: string;
    reject_cancel_reason?: string
    hr: string
};
interface LeaveHistoryProps {
    year: number
}
const LeaveHistory = ({ year }: LeaveHistoryProps) => {
    const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryData[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetchLeaveHistory(year);
                if (resp.success) setLeaveHistory(resp.data);
            } catch (error: any) {
                toast.error(error.message);
            }
        })();
    }, [year]);

    return (
        <div className="m-5 overflow-x-auto">
            <Table className="border dark:border-neutral-800  rounded-lg shadow-md">
                <TableHeader>
                    <TableRow className="dark:bg-neutral-900/70 bg-neutral-200/40 uppercase text-xs font-semibold dark:text-neutral-300">
                        <TableHead>
                            Leave Dates
                        </TableHead>
                        <TableHead >
                            Leave Type
                        </TableHead>
                        <TableHead>
                            Status
                        </TableHead>
                        <TableHead>
                            Requested By
                        </TableHead>
                        <TableHead >
                            Last Action Taken On
                        </TableHead>
                        <TableHead>
                            Leave Note
                        </TableHead>
                        <TableHead>
                            Reject/Cancellation Reason
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaveHistory.length > 0 ? (
                        leaveHistory.map((item, idx) => {
                            const isSingleDay = Number(item.no_of_days) === 1;
                            const start = new Date(item.startdate).toLocaleDateString("en-CA", {
                                dateStyle: "medium"
                            });
                            const end = item.enddate
                                ? new Date(item.enddate).toLocaleDateString("en-CA", {
                                    dateStyle: "medium"
                                })
                                : "";

                            return (
                                <TableRow
                                    key={idx}
                                    className="dark:bg-neutral-950/40 hover:dark:bg-neutral-800/40 border-b dark:border-neutral-800 bg-white hover:bg-neutral-200/20 border-neutral-200"
                                >
                                    <TableCell className="py-3">
                                        <div className="font-semibold dark:text-white">{isSingleDay ? start : `${start} - ${end}`}</div>
                                        <div className="text-xs text-neutral-400">
                                            {isSingleDay ? "1 Day" : `${item.no_of_days} Days`}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3">
                                        <div className="font-semibold dark:text-white">{item.leavename}</div>
                                        <div className="text-xs text-neutral-400">
                                            Requested on{" "}
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString("en-CA", {
                                                    dateStyle: "medium"
                                                })
                                                : "-"}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3">
                                        <div className="font-semibold dark:text-white capitalize">{getStatus(item.status).split(" ")[0]}</div>
                                        <div className="text-xs text-neutral-400">
                                            {item.status === "approved" ? "by " + item.hr : item.status === "partially_approved" ? "by " + item.approver : ""}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3 font-semibold ">{item.name}</TableCell>

                                    <TableCell className="py-3">
                                        <div className="font-semibold ">
                                            {item.statusupdate_at
                                                ? new Date(item.statusupdate_at).toLocaleDateString("en-CA", {
                                                    dateStyle: "medium"
                                                })
                                                : "-"}
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-3 dark:text-neutral-300 text-neutral-400">{item.notes || "-"}</TableCell>

                                    <TableCell className="py-3 dark:text-neutral-400 text-neutral-500 italic">{item.reject_cancel_reason || "-"}</TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-neutral-400 py-6"
                            >
                                No leave history found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default LeaveHistory;