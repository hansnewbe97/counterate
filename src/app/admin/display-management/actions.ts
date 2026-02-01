
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPairedDisplay() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            pairedUser: true,
            pairedWith: true,
        },
    });

    if (!user) return null;

    // Return the paired user that has the DISPLAY role
    if (user.pairedUser?.role === 'DISPLAY') return user.pairedUser;
    if (user.pairedWith?.role === 'DISPLAY') return user.pairedWith;

    return null;
}

export async function forceReloadDisplay(displayId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // In a real app, you'd target the specific socket room for this display
    // For now, we emit to all, and the client should check if it matches its ID
    const io = (global as any).io;
    if (io) {
        io.emit('force-reload', { targetId: displayId });
        return { success: true };
    }
    return { success: false, error: "Socket server not available" };
}

export async function forceLogoutDisplay(displayId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const io = (global as any).io;
    if (io) {
        io.emit('force-logout', { targetId: displayId });
        return { success: true };
    }
    return { success: false, error: "Socket server not available" };
}

import bcrypt from "bcryptjs";

export async function resetToDefaultPassword(displayId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const defaultPass = "display123";
        const hashedPassword = await bcrypt.hash(defaultPass, 10);
        await prisma.user.update({
            where: { id: displayId },
            data: { password: hashedPassword }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reset password to default" };
    }
}

export async function resetDisplayPassword(displayId: string, newPass: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const hashedPassword = await bcrypt.hash(newPass, 10);
        await prisma.user.update({
            where: { id: displayId },
            data: { password: hashedPassword }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update password" };
    }
}
