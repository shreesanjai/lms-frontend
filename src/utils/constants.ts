export const departments: Array<string> =
    ["INTERN", "PRODUCTS", "FINANCE", "HR", "DEVOPS", "IT", "CUSTOMER", "MARKETING", "QA", "ADMIN"]

export const leave_status = {
    pending: "Pending",
    partially_approved: "Approved By Reporting Manager",
    cancelled: "Cancelled",
    approved: "Approved",
} as const;

export type LeaveStatusKey = keyof typeof leave_status;   // "pending" | "partially_approved" | "cancelled" | "approved"
export type LeaveStatusValue = (typeof leave_status)[LeaveStatusKey]; // "Pending" | "Approved By Reporting Manager" | "Cancelled" | "Approved"

export const getStatus = (data: LeaveStatusKey) => {
    return leave_status[data];
}

