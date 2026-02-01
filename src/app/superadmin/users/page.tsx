import { prisma } from "@/lib/prisma";
import { UserManager } from "./user-manager";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function UsersPage() {
    let users: any[] = [];

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
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-0 pt-16 md:pt-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                <p className="text-slate-400">Manage access for Display Terminals. Secure authentication required.</p>
            </div>
            <UserManager initialUsers={users} />
        </div>
    )
}
