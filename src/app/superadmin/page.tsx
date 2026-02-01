import { auth } from "@/auth";
import { ShieldCheck, Users, Activity, Terminal } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function SuperAdminDashboard() {
    const session = await auth();

    // Auto-cleanup logs older than 24 hours
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    await prisma.activityLog.deleteMany({
        where: { createdAt: { lt: yesterday } }
    });

    // Fetch real stats
    const [totalAdmins, totalDisplays, inactiveUsers, totalLogs, recentActivity] = await Promise.all([
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "DISPLAY" } }),
        prisma.user.count({ where: { status: "INACTIVE" } }),
        prisma.activityLog.count(),
        prisma.activityLog.findMany({
            take: 2,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { username: true, role: true } } }
        })
    ]);

    const systemHealth = inactiveUsers > 0 ? "Warning" : "Optimal";

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-0 pt-16 md:pt-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">System Intelligence</h1>
                <p className="text-slate-400">Total system overview and administrative control center.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border border-[#222] hover:border-[#D4AF37]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Admins</p>
                            <h3 className="text-2xl font-bold text-white">{totalAdmins}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border border-[#222] hover:border-[#D4AF37]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active Displays</p>
                            <h3 className="text-2xl font-bold text-white">{totalDisplays}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border border-[#222] hover:border-[#D4AF37]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">System Status</p>
                            <h3 className={cn(
                                "text-2xl font-bold",
                                systemHealth === "Optimal" ? "text-green-500" : "text-yellow-500"
                            )}>{systemHealth}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border border-[#222] hover:border-[#D4AF37]/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Logs</p>
                            <h3 className="text-2xl font-bold text-white">{totalLogs}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link href="/superadmin/users" className="glass-card p-8 border border-[#222] hover:border-[#D4AF37]/50 transition-all group bg-gradient-to-br from-black to-[#111]">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Users className="text-[#D4AF37]" />
                        Manage Access Control
                    </h3>
                    <p className="text-slate-400 mb-6 font-light">Create, monitor, and regulate administrative and display user accounts across the network.</p>
                    <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">Manage Users &rarr;</span>
                </Link>

                <div className="glass-card p-8 border border-[#222] group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="text-purple-500" />
                            Recent Activity
                        </h3>
                        <Link href="/superadmin/activity" className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold hover:underline">
                            View All Logs &rarr;
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-slate-500 text-sm">No recent activity detected.</p>
                        ) : (
                            recentActivity.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#111]/50 border border-[#222]">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-1.5",
                                        log.action === "LOGIN" ? "bg-green-500" :
                                            log.action.includes("DELETE") ? "bg-red-500" :
                                                "bg-blue-500"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-400 font-mono mb-0.5">
                                            {log.createdAt.toLocaleString()} • <span className="text-slate-300">{log.location || "Unknown Location"}</span>
                                        </p>
                                        <p className="text-sm text-white font-medium truncate">
                                            <span className="text-[#D4AF37]">{log.user.username}</span> {log.action.replace("_", " ")}
                                        </p>
                                        {log.details && (
                                            <p className="text-xs text-slate-500 mt-1 truncate">{log.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Monitor({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>;
}
