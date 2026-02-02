import { prisma } from "@/lib/prisma";
import { UserManager } from "./user-manager";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function UsersPage() {
    let users: any[] = [];
    let debugTotalUsers = 0;
    let debugAdminUsers = 0;
    let debugError = null;

    try {
        // BYPASS getUsers() completely - direct database query
        const allUsers = await prisma.user.findMany({
            include: {
                pairedUser: true,
            },
            orderBy: { username: "asc" }
        });

        // Filter ADMIN in JS
        const adminUsers = allUsers.filter((u: any) => u.role === "ADMIN");

        debugTotalUsers = allUsers.length;
        debugAdminUsers = adminUsers.length;

        console.log(`[UsersPage DIRECT] Total: ${allUsers.length}, Admins: ${adminUsers.length}`);

        // Get configs
        const configs = await prisma.displayConfig.findMany({
            where: { adminId: { in: adminUsers.map((u: any) => u.id) } }
        });

        users = adminUsers.map((user: any) => ({
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
                                {allUsers.map((u: any) => `${u.username} [${u.role}]`).join(', ')}
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
