export const departments: Array<string> =
    ["INTERN", "PRODUCTS", "FINANCE", "HR", "DEVOPS", "IT", "CUSTOMER", "MARKETING", "QA", "ADMIN"]

export const leave_status = {
    pending: "Pending",
    partially_approved: "Approved By Reporting Manager",
    cancelled: "Cancelled",
    approved: "Approved",
} as const;

export type LeaveStatusKey = keyof typeof leave_status;
export type LeaveStatusValue = (typeof leave_status)[LeaveStatusKey];

export const getStatus = (data: LeaveStatusKey) => {
    return leave_status[data];
}

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};