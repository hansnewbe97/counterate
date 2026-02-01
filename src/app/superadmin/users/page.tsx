import { getUsers } from "./actions";
import { UserManager } from "./user-manager";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function UsersPage() {
    let users: any[] = [];
    try {
        users = await getUsers();
        console.log("getUsers returned:", users.length, "users");
    } catch (e) {
        console.error("Error in UsersPage getUsers:", e);
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

