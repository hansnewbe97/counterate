
import { auth } from "@/auth";
import { Settings, User, Shield, Lock, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function SettingsPage() {
    const session = await auth();
    const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-0 pt-16 md:pt-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Settings className="text-[#D4AF37]" size={32} />
                    System Settings
                </h1>
                <p className="text-slate-400">Manage your administrative profile and system access.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Profile Settings */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border border-[#222]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">My Profile</h2>
                                <p className="text-sm text-slate-500">Update your credentials</p>
                            </div>
                        </div>

                        <SettingsForm
                            currentUser={session?.user}
                            mode="profile"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
