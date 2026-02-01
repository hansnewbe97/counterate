"use client";

import { useState } from "react";
import { createUser, deleteUser, resetPassword, updateUserStatus, updateUnit } from "./actions";
import { Search, Plus, Trash2, Key, Ban, CheckCircle, Edit, Shield, Monitor } from "lucide-react";
import { Button, Input } from "@/components/ui/components";
import { CreateUserModal } from "./create-user-modal";
import { EditUnitModal } from "./edit-unit-modal";
import { ConfirmDialog, AlertDialog } from "@/components/ui/custom-dialogs";

export type User = {
    id: string;
    username: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    role: "ADMIN" | "DISPLAY";
    pairedUser?: { id: string, username: string };
    displayConfig?: { marqueeText: string };
};

export function UserManager({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Dialog States
    const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
    const [confirmReset, setConfirmReset] = useState<{ id: string } | null>(null);
    const [confirmStatus, setConfirmStatus] = useState<{ id: string, status: string } | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ title: string, desc: string } | null>(null);

    const filteredUsers = users.filter((u: any) => u.username.toLowerCase().includes(search.toLowerCase()));

    async function handleDeleteConfirmed() {
        if (!confirmDelete) return;
        await deleteUser(confirmDelete.id);
        window.location.reload();
    }

    async function handleResetConfirmed() {
        if (!confirmReset) return;
        await resetPassword(confirmReset.id);
        setAlertMessage({
            title: "Access Restored",
            desc: "The authentication keys for this unit have been reset to their default values (admin123 & display123)."
        });
    }

    async function handleStatusConfirmed() {
        if (!confirmStatus) return;
        const newStatus = confirmStatus.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        await updateUserStatus(confirmStatus.id, newStatus);
        window.location.reload();
    }

    return (
        <div className="space-y-6">
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => window.location.reload()}
                onCreate={createUser}
            />

            {editingUser && (
                <EditUnitModal
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => window.location.reload()}
                    user={editingUser}
                    onUpdate={updateUnit}
                />
            )}

            {/* Premium Dialogs */}
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirmed}
                title="Terminate Authority?"
                description="This will permanently revoke all access for both the Admin and Display terminals within this unit. This action is irreversible."
                variant="danger"
                confirmText="Terminate Unit"
            />

            <ConfirmDialog
                isOpen={!!confirmReset}
                onClose={() => setConfirmReset(null)}
                onConfirm={handleResetConfirmed}
                title="Reset Unit Security?"
                description="This will reset the authentication keys for the entire branch unit to their role-specific defaults (admin123 & display123)."
                variant="warning"
                confirmText="Reset Security"
            />

            <ConfirmDialog
                isOpen={!!confirmStatus}
                onClose={() => setConfirmStatus(null)}
                onConfirm={handleStatusConfirmed}
                title={confirmStatus?.status === "ACTIVE" ? "Suspend Operations?" : "Restore Operations?"}
                description={confirmStatus?.status === "ACTIVE"
                    ? "Suspending this unit will temporarily block all administrative and display terminal access across the network."
                    : "Restoring this unit will immediately re-enable all terminal services."}
                variant={confirmStatus?.status === "ACTIVE" ? "warning" : "success"}
                confirmText={confirmStatus?.status === "ACTIVE" ? "Suspend Unit" : "Restore Unit"}
            />

            <AlertDialog
                isOpen={!!alertMessage}
                onClose={() => setAlertMessage(null)}
                title={alertMessage?.title || "Notification"}
                description={alertMessage?.desc || ""}
                variant="success"
            />

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#050505] p-5 rounded-2xl border border-[#1A1A1A] shadow-xl">
                <div className="relative w-full lg:w-80 group order-2 lg:order-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                    <Input
                        placeholder="Search system units..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-12 bg-[#0A0A0A] border-[#1A1A1A] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-12 rounded-xl transition-all w-full"
                    />
                </div>

                <Button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold h-12 px-8 rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] order-1 lg:order-2">
                    <Plus size={20} className="mr-2" />
                    Initialize Unit Pair
                </Button>
            </div>

            {/* Data Grid */}
            <div className="rounded-2xl border border-[#1A1A1A] overflow-hidden bg-[#020202] shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#0A0A0A] text-[#444] text-[10px] uppercase tracking-[0.2em] border-b border-[#111]">
                                <th className="p-6 font-bold w-20 text-center">UID</th>
                                <th className="p-6 font-bold">Administrative Authority</th>
                                <th className="p-6 font-bold">Paired Display Unit</th>
                                <th className="p-6 font-bold">Network Status</th>
                                <th className="p-6 font-bold text-center">System Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0A0A0A]">
                            {filteredUsers.map((user: any, index: number) => (
                                <tr key={user.id} className="group hover:bg-[#050505] transition-all duration-300">
                                    <td className="p-6 text-center text-gray-700 font-mono text-[10px] tracking-tighter">
                                        {user.id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] text-[#D4AF37] border border-[#1A1A1A] group-hover:border-[#D4AF37]/30 flex items-center justify-center text-sm font-bold shadow-inner transition-colors">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white tracking-tight text-base">{user.username}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Shield size={10} className="text-[#D4AF37]" />
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Identity: ADMIN</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#020202] text-blue-500/70 border border-[#111] group-hover:border-blue-500/20 flex items-center justify-center text-sm font-bold transition-colors">
                                                {user.pairedUser?.username?.[0].toUpperCase() || 'D'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-400 tracking-tight">{user.pairedUser?.username || "---"}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Monitor size={10} className="text-blue-500/50" />
                                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Identity: DISPLAY</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center gap-2 text-[10px] font-black tracking-[0.1em] uppercase px-3 py-1 rounded-full border ${user.status === "ACTIVE"
                                            ? "text-green-500 border-green-500/10 bg-green-500/5"
                                            : user.status === "SUSPENDED"
                                                ? "text-red-500 border-red-500/10 bg-red-500/5"
                                                : "text-yellow-500 border-yellow-500/10 bg-yellow-500/5"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${user.status === "ACTIVE" ? "bg-green-500" : (user.status === "SUSPENDED" ? "bg-red-500" : "bg-yellow-500")
                                                }`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/20 border border-transparent rounded-xl transition-all" title="Edit Unit Authority" onClick={() => setEditingUser(user)}>
                                                <Edit size={16} />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-600 hover:text-white hover:bg-[#222] border border-transparent hover:border-[#333] rounded-xl transition-all" title="Reset Unit Passwords" onClick={() => setConfirmReset({ id: user.id })}>
                                                <Key size={16} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className={`h-10 w-10 rounded-xl border border-transparent transition-all ${user.status === "ACTIVE" ? "text-gray-600 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20" : "text-green-500 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20"}`}
                                                title={user.status === "ACTIVE" ? "Suspend Unit" : "Restore Unit"}
                                                onClick={() => setConfirmStatus({ id: user.id, status: user.status })}
                                            >
                                                {user.status === "ACTIVE" ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-600 hover:text-red-600 hover:bg-red-600/10 hover:border-red-600/20 border border-transparent rounded-xl transition-all" title="Terminate Unit" onClick={() => setConfirmDelete({ id: user.id })}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
