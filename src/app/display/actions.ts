"use server";

import { prisma } from "@/lib/prisma";

import { auth } from "@/auth";

export async function getDisplayData() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    // Find the pairing: Display user's paired admin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            pairedWith: true, // If we are the "pairedUser" of an Admin
            pairedUser: true  // If we are the Admin (for testing)
        }
    });

    // Determine the admin context
    // If the user is a DISPLAY, they are 'pairedWith' an ADMIN.
    // If the user is an ADMIN, they are managing their own data.
    const adminId = user?.role === "ADMIN" ? user.id : user?.pairedWith?.id;

    if (!adminId) {
        return { forex: [], deposit: [], video: null, config: null };
    }

    const forex = await prisma.forexRate.findMany({
        where: { active: true, adminId },
        orderBy: { order: 'asc' }
    });

    const deposit = await prisma.depositRate.findMany({
        where: { active: true, adminId },
        orderBy: { tenor: 'asc' }
    });

    const video = await prisma.videoDisplay.findUnique({
        where: { adminId },
        include: {
            sources: {
                orderBy: { order: 'asc' }
            }
        }
    });

    const config = await prisma.displayConfig.findUnique({
        where: { adminId }
    });

    return { forex, deposit, video, config, userId };
}
