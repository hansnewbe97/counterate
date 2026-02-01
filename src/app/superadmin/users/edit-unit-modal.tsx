"use client";

import { useState } from "react";
import { X, Loader2, Save, User as UserIcon, Monitor, Key, MessageSquare } from "lucide-react";
import { Button, Input } from "@/components/ui/components";

type EditUnitModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: any; // The Admin user with pairedUser and displayConfig
    onUpdate: (adminId: string, data: any) => Promise<any>;
};

export function EditUnitModal({ isOpen, onClose, onSuccess, user, onUpdate }: EditUnitModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        adminUsername: user?.username || "",
        displayUsername: user?.pairedUser?.username || "",
        adminPassword: "",
        displayPassword: "",
        marqueeText: user?.displayConfig?.marqueeText || "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(user.id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update unit settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-gradient-to-r from-black to-[#0A0A0A]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Save className="text-[#D4AF37]" size={20} />
                            Edit Unit Authority
                        </h2>
                        <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mt-0.5">ADMIN + DISPLAY PAIRING</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Admin Config */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2 mb-4">
                                <UserIcon size={14} /> Admin Account
                            </h3>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Username</label>
                                <Input
                                    value={formData.adminUsername}
                                    onChange={e => setFormData({ ...formData, adminUsername: e.target.value })}
                                    className="glass-input h-10"
                                    placeholder="e.g. branch_admin"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">New Password (Optional)</label>
                                <Input
                                    type="password"
                                    value={formData.adminPassword}
                                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                    className="glass-input h-10"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>

                        {/* Display Config */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Monitor size={14} /> Display Terminal
                            </h3>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Username</label>
                                <Input
                                    value={formData.displayUsername}
                                    onChange={e => setFormData({ ...formData, displayUsername: e.target.value })}
                                    className="glass-input h-10"
                                    placeholder="e.g. branch_display"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">New Password (Optional)</label>
                                <Input
                                    type="password"
                                    value={formData.displayPassword}
                                    onChange={e => setFormData({ ...formData, displayPassword: e.target.value })}
                                    className="glass-input h-10"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Global Config */}
                    <div className="pt-6 border-t border-[#222] space-y-4">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <MessageSquare size={14} /> Running Text (Marquee)
                        </h3>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Display Message</label>
                            <Input
                                value={formData.marqueeText}
                                onChange={e => setFormData({ ...formData, marqueeText: e.target.value })}
                                className="glass-input h-12"
                                placeholder="Welcome to Jatim Prioritas..."
                            />
                            <p className="text-[10px] text-gray-600 italic">This text scrolls across the top of the paired display.</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                            Update Unit Authority
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
