"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/components";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    variant?: "danger" | "warning" | "success" | "info";
    confirmText?: string;
    cancelText?: string;
};

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    variant = "danger",
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const Icon = {
        danger: AlertCircle,
        warning: AlertTriangle,
        success: CheckCircle2,
        info: Info,
    }[variant];

    const colors = {
        danger: "text-red-500 bg-red-500/10 border-red-500/20",
        warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        success: "text-green-500 bg-green-500/10 border-green-500/20",
        info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    }[variant];

    const buttonColors = {
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        warning: "bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)]",
        success: "bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]",
        info: "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    }[variant];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto border-2", colors)}>
                        <Icon size={32} />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-gray-400 font-light leading-relaxed">{description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="h-12 rounded-2xl text-gray-400 hover:text-white hover:bg-[#111] border border-[#1A1A1A] font-bold"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={cn("h-12 rounded-2xl font-bold transition-transform active:scale-95", buttonColors)}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AlertDialog({
    isOpen,
    onClose,
    title,
    description,
    variant = "info",
    buttonText = "Understood",
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    variant?: "danger" | "warning" | "success" | "info";
    buttonText?: string;
}) {
    if (!isOpen) return null;

    const Icon = {
        danger: AlertCircle,
        warning: AlertTriangle,
        success: CheckCircle2,
        info: Info,
    }[variant];

    const colors = {
        danger: "text-red-500 bg-red-500/10 border-red-500/20",
        warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        success: "text-green-500 bg-green-500/10 border-green-500/20",
        info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    }[variant];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-[#222] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto border-2", colors)}>
                        <Icon size={32} />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-gray-400 font-light leading-relaxed">{description}</p>
                    </div>

                    <Button
                        onClick={onClose}
                        className="w-full h-12 mt-10 rounded-2xl bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold transition-transform active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
