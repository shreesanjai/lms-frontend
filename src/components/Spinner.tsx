import React from "react";
import { cn } from "@/lib/utils"; // shadcn helper for conditional classNames

interface LoadingSpinnerProps {
    message?: string;
    size?: "small" | "medium" | "large";
    fullScreen?: boolean;
    color?: "blue" | "teal"; // added teal option
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "Loading...",
    size = "medium",
    fullScreen = true,
    color = "blue",
}) => {
    const sizeClasses = {
        small: "w-5 h-5 border-2",
        medium: "w-10 h-10 border-4",
        large: "w-14 h-14 border-6",
    };

    const colorClasses = {
        blue: "border-t-blue-500",
        teal: "border-t-teal-500",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                fullScreen
                    ? "fixed inset-0 z-50 bg-white/90 dark:bg-black/90"
                    : "p-8"
            )}
        >
            <div
                className={cn(
                    "rounded-full border-solid border-gray-200 animate-spin",
                    sizeClasses[size],
                    colorClasses[color]
                )}
            />
            <div
                className={cn(
                    "font-medium text-gray-600 dark:text-gray-300",
                    size === "small"
                        ? "text-sm"
                        : size === "large"
                            ? "text-lg"
                            : "text-base"
                )}
            >
                {message}
            </div>
        </div>
    );
};

export default LoadingSpinner;
