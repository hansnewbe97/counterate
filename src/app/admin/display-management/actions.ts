
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

    try {
        // Find the config associated with this display user
        // The displayId is the User ID. The Config is linked via adminId usually, 
        // but here we need to find the specific config.
        // Wait, DisplayConfig is linked to Admin. The Display User is paired to Admin.
        // We need to send the command to the DisplayConfig that the Display User is watching?
        // OR, simply add the command to the Display User's record?
        // The Schema added `pendingCommand` to `DisplayConfig`.
        // We need to find the DisplayConfig for the Admin who owns this Display User.

        const displayUser = await prisma.user.findUnique({
            where: { id: displayId },
            include: {
                pairedUser: { // If displayId is the Display User, pairedUser is likely the Admin
                    include: { displayConfig: true }
                },
                pairedWith: { // Or pairedWith
                    include: { displayConfig: true }
                }
            }
        });

        const admin = displayUser?.pairedUser?.role === 'ADMIN' || displayUser?.pairedUser?.role === 'SUPER_ADMIN'
            ? displayUser.pairedUser
            : displayUser?.pairedWith;

        if (!admin?.displayConfig) {
            return { success: false, error: "No display configuration found" };
        }

        await prisma.displayConfig.update({
            where: { id: admin.displayConfig.id },
            data: {
                pendingCommand: "RELOAD",
                lastCommandAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Force reload error:", error);
        return { success: false, error: "Failed to send reload command" };
    }
}

export async function forceLogoutDisplay(displayId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const displayUser = await prisma.user.findUnique({
            where: { id: displayId },
            include: {
                pairedUser: { include: { displayConfig: true } },
                pairedWith: { include: { displayConfig: true } }
            }
        });

        const admin = displayUser?.pairedUser?.role === 'ADMIN' || displayUser?.pairedUser?.role === 'SUPER_ADMIN'
            ? displayUser.pairedUser
            : displayUser?.pairedWith;

        if (!admin?.displayConfig) {
            return { success: false, error: "No display configuration found" };
        }

        await prisma.displayConfig.update({
            where: { id: admin.displayConfig.id },
            data: {
                pendingCommand: "LOGOUT",
                lastCommandAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to send logout command" };
    }
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
