import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        console.log("Force seeding superadmin...");

        const superAdminPassword = await bcrypt.hash("super123", 10);
        const superAdmin = await prisma.user.upsert({
            where: { username: "superadmin" },
            update: { password: superAdminPassword },
            create: {
                username: "superadmin",
                password: superAdminPassword,
                role: "SUPER_ADMIN",
                status: "ACTIVE",
            },
        });

        return NextResponse.json({ success: true, message: "Superadmin seeded", user: superAdmin });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
