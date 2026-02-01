import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allUsers = await prisma.user.findMany({
            include: {
                pairedUser: true,
                pairedWith: true
            }
        });

        return NextResponse.json({
            count: allUsers.length,
            users: allUsers.map(u => ({
                id: u.id,
                username: u.username,
                role: u.role,
                status: u.status,
                pairedUserId: u.pairedUser?.id,
                pairedWithId: u.pairedWith?.id
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
