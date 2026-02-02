import { prisma } from "@/lib/prisma";
import { UserManager } from "./user-manager";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function UsersPage() {
    let users: any[] = [];
    let debugTotalUsers = 0;
    let debugAdminUsers = 0;
    let debugError = null;
    let debugDump = "";

    try {
        // BYPASS getUsers() completely - direct database query
        const allUsers = await prisma.user.findMany({
            include: {
                pairedUser: true,
            },
            orderBy: { username: "asc" }
        });

        // Filter out SUPER_ADMIN, show everything else (ADMIN and DISPLAY)
        // This ensures we see orphan displays too
        const adminUsers = allUsers.filter((u: any) => u.role !== "SUPER_ADMIN" && u.role !== "ADMIN");
        // Actually, the original logic expected ADMINs as the "Primary" unit.
        // But the DB Dump shows only DISPLAY users. 
        // Let's show ALL users (except self/superadmin) so we can debug/manage them.
        const visibleUsers = allUsers.filter((u: any) => u.role !== "SUPER_ADMIN");

        debugTotalUsers = allUsers.length;
        debugAdminUsers = visibleUsers.length;
        debugDump = allUsers.map((u: any) => `${u.username} [${u.role}]`).join(', ');

        console.log(`[UsersPage DIRECT] Total: ${allUsers.length}, Visible: ${visibleUsers.length}`);

        // Get configs
        const configs = await prisma.displayConfig.findMany({
            where: { adminId: { in: visibleUsers.map((u: any) => u.id) } }
        });

        users = visibleUsers.map((user: any) => ({
            ...user,
            displayConfig: configs.find((c: any) => c.adminId === user.id)
        }));

    } catch (e: any) {
        console.error("ERROR in UsersPage:", e.message);
        debugError = e.message;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-0 pt-16 md:pt-0">
            {users.length === 0 && (
                <div className="bg-red-900/50 border border-red-500 p-4 rounded text-white mb-4 font-mono text-sm max-w-3xl">
                    <h3 className="font-bold text-lg mb-2">⚠️ DEBUG INFO (Users List is Empty)</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div>Total Users in DB: <span className="font-bold">{debugTotalUsers}</span></div>
                        <div>Admin Users found: <span className="font-bold">{debugAdminUsers}</span></div>
                        <div className="col-span-2">Error: <span className="text-red-300">{debugError || "None"}</span></div>
                        <div className="col-span-2 mt-2 border-t border-red-500/30 pt-2">
                            <p className="font-bold text-xs mb-1">DB Dump:</p>
                            <div className="text-xs font-mono break-all">
                                {debugDump}
                            </div>
                        </div>
                        <div className="col-span-2 text-xs text-slate-400 mt-1">Timestamp: {new Date().toISOString()}</div>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                <p className="text-slate-400">Manage access for Display Terminals. Secure authentication required.</p>
            </div>
            <UserManager initialUsers={users} />
        </div>
    )
}
