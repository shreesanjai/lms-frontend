import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    return (
        <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction className="bg-teal-800 dark:bg-teal-700 hover:bg-teal-800/80 hover:dark:bg-teal-700/80 " onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDialog;
