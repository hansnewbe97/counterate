
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Calendar, MapPin, Search } from "lucide-react";

export default async function ActivityLogPage() {

    // Auto-cleanup happens on Dashboard load, but we can also ensure we just fetch valid data here.
    // Ideally use a cron, but for now relies on dashboard visits which is fine.

    const logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100, // Show last 100 for performance, or add pagination later
        include: {
            user: {
                select: { username: true, role: true }
            }
        }
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-0 pt-16 md:pt-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-[#D4AF37]" size={32} />
                    System Activity Logs
                </h1>
                <p className="text-slate-400"> comprehensive audit trail of all system actions. Data is automatically reset every 24 hours.</p>
            </div>

            <div className="glass-card border border-[#222] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#111] border-b border-[#222]">
                            <tr>
                                <th className="p-4 pl-6 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Time</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">User</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Action</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Details</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222]">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                                        No activity logs found for the last 24 hours.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    // Use log.id + unique key to avoid conflicts
                                    <tr key={log.id} className="group hover:bg-[#D4AF37]/5 transition-colors">
                                        <td className="p-4 pl-6 text-sm text-slate-400 font-mono whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-600" />
                                                {log.createdAt.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{log.user.username}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">{log.user.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${log.action === "LOGIN" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                    log.action.includes("DELETE") ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"}
                                            `}>
                                                {log.action.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-300 max-w-xs truncate" title={log.details || ""}>
                                            {log.details || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 font-mono">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} className="text-slate-600" />
                                                {log.location || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-slate-600 ml-5">{log.ipAddress}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
