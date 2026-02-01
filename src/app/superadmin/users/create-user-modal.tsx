"use client";

import { useState } from "react";
import { Shield, Monitor, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui/components";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onCreate: (username: string, role: "ADMIN" | "DISPLAY", password?: string, displayUsername?: string, displayPassword?: string, marqueeText?: string) => Promise<void>;
}

export function CreateUserModal({ isOpen, onClose, onSuccess, onCreate }: CreateUserModalProps) {
    const [adminUsername, setAdminUsername] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [displayUsername, setDisplayUsername] = useState("");
    const [displayPassword, setDisplayPassword] = useState("");
    const [marqueeText, setMarqueeText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!adminUsername || !displayUsername || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onCreate(adminUsername, "ADMIN", adminPassword, displayUsername, displayPassword, marqueeText);
            setAdminUsername("");
            setAdminPassword("");
            setDisplayUsername("");
            setDisplayPassword("");
            setMarqueeText("");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create unit:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-[#222] w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-[#222] flex justify-between items-center bg-gradient-to-r from-black via-[#0A0A0A] to-black">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Initialize Unit Pair</h2>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1 font-bold">1 Admin : 1 Display Assignment</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 gap-8 relative">
                        {/* Admin Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
                                <Shield size={16} className="text-[#D4AF37]" />
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Admin Credentials</span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Username</label>
                                <Input
                                    value={adminUsername}
                                    onChange={(e) => setAdminUsername(e.target.value)}
                                    placeholder="e.g. branch_admin"
                                    className="bg-[#111] border-[#222] text-white focus:border-[#D4AF37] h-10 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Security Key (Password)</label>
                                <Input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="Default: admin123"
                                    className="bg-[#111] border-[#222] text-white focus:border-[#D4AF37] h-10 text-xs"
                                />
                            </div>
                        </div>

                        {/* Pairing Line */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1/2 w-px bg-gradient-to-b from-transparent via-[#222] to-transparent hidden md:block" />

                        {/* Display Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
                                <Monitor size={16} className="text-blue-400" />
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Display Credentials</span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Username</label>
                                <Input
                                    value={displayUsername}
                                    onChange={(e) => setDisplayUsername(e.target.value)}
                                    placeholder="e.g. branch_board"
                                    className="bg-[#111] border-[#222] text-white focus:border-[#D4AF37] h-10 text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Security Key (Password)</label>
                                <Input
                                    type="password"
                                    value={displayPassword}
                                    onChange={(e) => setDisplayPassword(e.target.value)}
                                    placeholder="Default: display123"
                                    className="bg-[#111] border-[#222] text-white focus:border-[#D4AF37] h-10 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] rounded-xl p-4 border border-[#222] flex items-center justify-center gap-4">
                        <Shield size={20} className="text-[#D4AF37] opacity-50" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
                        <LinkIcon size={16} className="text-[#D4AF37]" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#333] to-transparent" />
                        <Monitor size={20} className="text-blue-400 opacity-50" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Running Text (Marquee)</label>
                        <Input
                            value={marqueeText}
                            onChange={(e) => setMarqueeText(e.target.value)}
                            placeholder="Initial scrolling message for the display board..."
                            className="bg-[#111] border-[#222] text-white focus:border-[#D4AF37] h-10 text-xs"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || !adminUsername || !displayUsername}
                        className="w-full bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold h-12 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "INITIALIZE UNIT PAIR"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
