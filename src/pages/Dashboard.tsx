/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hook';
import { approveRequest, getMyPeerPendingRequests, rejectRequest } from '@/api/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import LeaveHistory from '@/components/LeaveHistory';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LeaveSummary from '@/components/LeaveSummary';

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

type ConfirmDialogState = (ConfirmDialogConfig & { open: boolean }) | null;

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const [pendingApprovalRequests, setPendingApprovalRequests] = useState<pendingApprovalRequests[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<pendingApprovalRequests | null>();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");


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
    setIsLoading(true);
    try {
      const resp = await rejectRequest(selectedRequest.id, rejectNotes);
      if (resp.success) {
        toast.success("Leave Request Rejected");
        setSelectedRequest(null);
        setRejectNotes("");
        await fetchPeerPendingRequests();
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }

  };

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
    } else if (status === "reject") {
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

  async function fetchPeerPendingRequests() {
    try {
      const resp = await getMyPeerPendingRequests();
      if (resp.success)
        setPendingApprovalRequests(resp.data);
    } catch (error: any) {
      toast.error(error);
    }
  }

  useEffect(() => {
    fetchPeerPendingRequests();

  }, [])


  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hi, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
      </div>

      {/* Pending Approval*/}
      <div className='w-5/6 rounded'>
        {
          pendingApprovalRequests?.length > 0 && (<div>
            <h3 className='font-bold text-2xl'>Pending Approval</h3>
            <div className='w-full dark:bg-neutral-900 shadow-sm rounded-xl'>
              {pendingApprovalRequests?.length > 0 ? (
                <Card className="dark:bg-neutral-900 shadow-md">
                  <CardContent>
                    <ScrollArea className="h-64 pr-2">
                      <div className="space-y-2">
                        {pendingApprovalRequests.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedRequest(item)}
                          >
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
                      </div>
                    </div>
                  )}

                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="destructive"
                      disabled={isLoading || (rejectNotes === "")}
                      onClick={() => pendingRequestAction("reject")}
                    >
                      Reject
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


      {/* Leave Summary */}
      <div className=''>
        <LeaveSummary />
      </div>


      {/* Leave History */}
      <div className='flex flex-col gap-3'>
        <h3 className='text-xl font-bold'>Leave History</h3>
        <LeaveHistory />
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
    </div>
  );
};

export default Dashboard;