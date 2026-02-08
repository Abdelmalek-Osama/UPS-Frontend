import React, { useState } from 'react';
import {
    AlertDialog as UIAlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { AlertCircle, CheckCircle2, Info, XCircle, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming this utility exists based on other components

type AlertDialogType = 'info' | 'warning' | 'error' | 'success';

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    description?: string;
    type?: AlertDialogType;
    confirmText?: string;
    cancelText?: string;
}

const icons = {
    info: Info,
    warning: AlertCircle,
    error: XCircle,
    success: CheckCircle2,
};

const buttonVariants: Record<AlertDialogType, "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"> = {
    info: 'default',
    warning: 'default',
    error: 'destructive',
    success: 'default',
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const Icon = icons[type];

    const typeColors = {
        info: '#3b82f6', // blue-500
        warning: '#f59e0b', // amber-500
        error: '#ef4444', // red-500
        success: '#22c55e', // green-500
    };

    const typeBackgrounds = {
        info: '#eff6ff', // blue-50
        warning: '#fffbeb', // amber-50
        error: '#fef2f2', // red-50
        success: '#f0fdf4', // green-50
    };

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await onConfirm();
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    // Inline styles for the amazing UI
    const iconWrapperStyle: React.CSSProperties = {
        padding: '12px',
        borderRadius: '50%',
        backgroundColor: typeBackgrounds[type] || '#f3f4f6',
        border: `1px solid ${typeColors[type] || '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };

    const iconStyle: React.CSSProperties = {
        color: typeColors[type],
        width: '24px',
        height: '24px',
    };

    const titleStyle: React.CSSProperties = {
        marginBottom: '4px',
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
    };

    const descriptionStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        color: '#6b7280', // gray-500
        lineHeight: 1.5,
    };

    return (
        <UIAlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="w-[90vw] sm:w-full sm:max-w-[425px] rounded-xl p-6">
                {/* Close Button X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 end-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 z-10"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                <AlertDialogHeader>
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-start" dir="auto">

                        <div className="flex flex-col gap-1 w-full">
                            <AlertDialogTitle style={titleStyle}>{title}</AlertDialogTitle>
                            {description && (
                                <AlertDialogDescription style={descriptionStyle}>{description}</AlertDialogDescription>
                            )}
                        </div>
                    </div>
                </AlertDialogHeader>
                {/* Custom Footer with Grid Layout to prevent overflow */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 w-full">
                    <AlertDialogCancel
                        onClick={onClose}
                        disabled={isLoading}
                        style={{ borderRadius: '8px', margin: 0 }}
                        className="w-full order-2 sm:order-1"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <Button
                        variant={buttonVariants[type]}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full order-1 sm:order-2"
                        style={{ borderRadius: '8px', fontWeight: 500 }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {confirmText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </AlertDialogContent>
        </UIAlertDialog>
    );
};
