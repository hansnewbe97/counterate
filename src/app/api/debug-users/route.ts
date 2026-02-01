import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUsers } from "@/app/superadmin/users/actions";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Test 1: Raw query - all users
        const allUsers = await prisma.user.findMany({
            include: {
                pairedUser: true,
                pairedWith: true
            }
        });

        // Test 2: Call getUsers() function
        let getUsersResult: any = null;
        let getUsersError: any = null;
        try {
            getUsersResult = await getUsers();
        } catch (e: any) {
            getUsersError = e.message;
        }

        return NextResponse.json({
            rawQuery: {
                count: allUsers.length,
                users: allUsers.map(u => ({
                    id: u.id,
                    username: u.username,
                    role: u.role,
                    status: u.status,
                    pairedUserId: u.pairedUser?.id,
                    pairedWithId: u.pairedWith?.id
                }))
            },
            getUsersFunction: {
                error: getUsersError,
                count: getUsersResult?.length || 0,
                users: getUsersResult || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
