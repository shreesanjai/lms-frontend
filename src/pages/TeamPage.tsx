/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from 'react';
import { approveRequest, getMyPeerPendingRequests, getMyTeam, getMyTeamLeave, rejectRequest, type UserData } from '@/api/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BigCalenderView from '@/components/BigCalenderView';
import moment from 'moment';

type pendingApprovalRequests = {
    id: string,
    employee_id: string,
    startdate: Date | string;
    enddate: Date | string;
    status: string;
    no_of_days: number;
    notes: string;
    policy_id: number;
    leavename: string;
    name: string;
    username: string;
}

type ConfirmDialogConfig = {
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
};

type teamLeaveSummary = {
    employee_name: string
    enddate: string
    leave_id: string
    leavename: string
    no_of_days: string
    startdate: string
}



type ConfirmDialogState = (ConfirmDialogConfig & { open: boolean }) | null;


const TeamPage = () => {


    const [pendingApprovalRequests, setPendingApprovalRequests] = useState<pendingApprovalRequests[]>([]);
    const [teamLeaveSummary, setTeamLeaveSummary] = useState<teamLeaveSummary[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<pendingApprovalRequests | null>();
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectNotes, setRejectNotes] = useState("");

    const [myTeam, setMyTeam] = useState<UserData[]>([]);


    const showConfirmDialog = (config: ConfirmDialogConfig) => {
        setConfirmDialog({
            ...config,
            open: true
        });
    };

    const hideConfirmDialog = () => {
        setConfirmDialog(null);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setIsLoading(true)
            const resp = await approveRequest(selectedRequest.id);
            if (resp.success) {
                toast.success("Leave Request Approved");
                setSelectedRequest(null);
                await fetchPeerPendingRequests();
            }
            setIsLoading(false);
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        try {
            setIsLoading(true);
            const resp = await rejectRequest(selectedRequest.id, rejectNotes);
            if (resp.success) {
                toast.success("Leave Request Rejected");
                setSelectedRequest(null);
                setRejectNotes("");
                await fetchPeerPendingRequests();
            }
            setIsLoading(false);
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
        }

    };

    async function fetchPeerPendingRequests() {
        try {
            const resp = await getMyPeerPendingRequests();
            if (resp.success)
                setPendingApprovalRequests(resp.data);
        } catch (error: any) {
            toast.error(error);
        }
    }


    const fetchAllData = useCallback(async () => {
        try {
            const [teamResp, pendingResp, teamLeaveResp] = await Promise.all([
                getMyTeam(),
                getMyPeerPendingRequests(),
                getMyTeamLeave(new Date().getFullYear())
            ]);

            setMyTeam(teamResp.data);
            setPendingApprovalRequests(pendingResp.data);
            setTeamLeaveSummary(teamLeaveResp.data);

        } catch (error: any) {
            toast.error(error.message);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const pendingRequestAction = async (status: string) => {
        if (!selectedRequest) return;

        if (status === "approve") {
            showConfirmDialog({
                title: "Approve Request",
                description: `Are you sure you want to approve ${selectedRequest.name}'s leave request?`,
                confirmText: "Approve",
                onConfirm: () => {
                    hideConfirmDialog();
                    handleApprove();
                },
                onCancel: () => {
                    hideConfirmDialog();
                }
            });
        } else if (status === "reject" && rejectNotes.trim() !== "") {
            showConfirmDialog({
                title: "Reject Request",
                description: `Are you sure you want to reject ${selectedRequest.name}'s leave request?`,
                confirmText: "Reject",
                onConfirm: () => {
                    hideConfirmDialog();
                    handleReject();
                },
                onCancel: () => {
                    hideConfirmDialog();
                }
            });
        }
    };


    return (
        <>
            {/* My Team */}
            {myTeam.length > 0 && (
                <div className='flex flex-col gap-2 m-4'>
                    <div className='font-bold text-4xl'>My Team</div>
                    <div className='grid grid-cols-5 gap-4 m-5'>
                        {myTeam.map(item => (
                            <Card className='w-full hover:scale-105 ease-in-out transition-all'>
                                <CardHeader className='flex flex-col border-b dark:border-neutral-800 border-neutral-200 '>
                                    <CardTitle>{item.name}</CardTitle>
                                    <div className='text-muted-foreground text-sm'>@ {item.username}</div>
                                </CardHeader>
                                <CardContent className='flex flex-col gap-2'>
                                    <div>
                                        <div className='font-black text-sm'>Department</div>
                                        <div className='text-sm text-muted-foreground'>{item.department}</div>
                                    </div>
                                    <div>
                                        <div className='font-black text-sm'>Role</div>
                                        <div className='text-sm text-muted-foreground'>{item.role}</div>
                                    </div>
                                </CardContent>

                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Approval*/}
            <div className='rounded m-4'>
                {
                    pendingApprovalRequests?.length > 0 && (<div>
                        <h3 className='font-bold text-2xl mb-4'>Pending Approval</h3>
                        <div className='dark:bg-neutral-900 shadow-sm rounded-xl m-5'>
                            {pendingApprovalRequests?.length > 0 ? (
                                <Card className="dark:bg-neutral-900 shadow-md">
                                    <CardContent>
                                        <ScrollArea className="h-32 pr-2">
                                            <div className="space-y-2">
                                                {pendingApprovalRequests.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
                                                        onClick={() => setSelectedRequest(item)}>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{item.name}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {item.leavename} ({item.no_of_days} days)
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className='cursor-pointer'
                                                                onClick={() => setSelectedRequest(item)}>
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            ) : (
                                <p className="text-muted-foreground">No pending requests</p>
                            )}

                            {/* Popup Dialog for Details */}
                            <Dialog
                                open={!!selectedRequest}
                                onOpenChange={() => setSelectedRequest(null)}
                            >
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Leave Request Details</DialogTitle>
                                    </DialogHeader>
                                    {selectedRequest && (
                                        <div className="space-y-3">
                                            <p>
                                                <span className="font-semibold">Employee:</span>{" "}
                                                {selectedRequest.name} ({selectedRequest.username})
                                            </p>
                                            <p>
                                                <span className="font-semibold">Leave Type:</span>{" "}
                                                {selectedRequest.leavename}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Start Date:</span>{" "}
                                                {new Date(selectedRequest.startdate).toLocaleDateString("en-CA")}
                                            </p>
                                            <p>
                                                <span className="font-semibold">End Date:</span>{" "}
                                                {new Date(selectedRequest.enddate).toLocaleDateString("en-CA")}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Days:</span>{" "}
                                                {selectedRequest.no_of_days}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Status:</span>{" "}
                                                {selectedRequest.status}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Notes:</span>{" "}
                                                {selectedRequest.notes || "—"}
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <Label>Notes</Label>
                                                <Textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
                                                <span className='text-sm text-red-700' hidden={rejectNotes.trim() !== ""}>To reject notes is required</span>
                                            </div>
                                        </div>
                                    )}

                                    <DialogFooter className="flex justify-end gap-2">
                                        <Button
                                            variant="destructive"
                                            disabled={isLoading}
                                            onClick={() => pendingRequestAction("reject")}
                                        >Reject
                                        </Button>
                                        <Button
                                            className='bg-teal-800 dark:bg-teal-600 hover:bg-teal-800/80 hover:dark:bg-teal-600/80'
                                            disabled={isLoading}
                                            onClick={() => pendingRequestAction("approve")}
                                        >
                                            Approve
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    )
                }
            </div>

            {/* Big Calendar View */}
            <div>
                <h3 className='ml-6 font-bold text-2xl mb-4'>Leave Sheet</h3>
                <div className='m-10 h-[100vh]'>
                    <BigCalenderView events={teamLeaveSummary.map(item => ({
                        start: moment(item.startdate).toDate(),
                        end: moment(item.enddate).add(1, 'day').toDate(),
                        title: item.employee_name + " - " + item.leavename
                    }))} />
                </div>
            </div>

            {/* Confirmation Dialog */}
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

        </>
    )
}

export default TeamPage