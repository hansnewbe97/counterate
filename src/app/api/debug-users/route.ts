import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Test the exact same logic as getUsers() but with detailed logging
        let step1Result: any = null;
        let step1Error: any = null;

        try {
            step1Result = await prisma.user.findMany({
                where: {
                    role: "ADMIN"
                },
                include: {
                    pairedUser: true,
                },
                orderBy: { username: "asc" }
            });
        } catch (e: any) {
            step1Error = e.message;
        }

        let step2Result: any = null;
        let step2Error: any = null;

        if (step1Result && step1Result.length > 0) {
            try {
                step2Result = await prisma.displayConfig.findMany({
                    where: { adminId: { in: step1Result.map((u: any) => u.id) } }
                });
            } catch (e: any) {
                step2Error = e.message;
            }
        }

        return NextResponse.json({
            step1_findAdmins: {
                error: step1Error,
                count: step1Result?.length || 0,
                users: step1Result || []
            },
            step2_findConfigs: {
                error: step2Error,
                count: step2Result?.length || 0,
                configs: step2Result || []
            },
            prismaEnumValues: {
                hint: "Check if Prisma enum matches database values"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
