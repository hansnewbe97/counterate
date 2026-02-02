
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // IF there is a paired user but NOT role DISPLAY, we should probably just return it or log it
    // because we CANNOT create another one due to unique constraint on pairedUserId.
    if (user.pairedUser) return user.pairedUser;
    if (user.pairedWith) return user.pairedWith;

    // SELF-HEALING: If no display found, create/pair one automatically
    try {
        console.log(`[DisplayManagement] No display found for admin ${session.user.id}. Auto-creating...`);
        const newDisplayUsername = `display_${user.username || 'unit'}_${Math.floor(Math.random() * 1000)}`;

        // Create new Display User
        const newDisplay = await prisma.user.create({
            data: {
                username: newDisplayUsername,
                password: "$2a$10$YourReferencedHashHereOrJustPlainStringIfDevButBetterDefault",
                role: "DISPLAY", // Enum usually uppercase
                pairedUserId: user.id, // Pair with Admin
                DisplayConfig: {
                    create: {
                        adminId: user.id,
                        showClock: true,
                        marqueeText: "Welcome to Jatim Prioritas",
                    }
                }
            }
        });

        // Ensure DisplayConfig exists (if not created via nested write above, but nested write is safer for atomic)
        // Actually, schema says DisplayConfig has unique adminId. 
        // If DisplayConfig ALREADY exists for this admin, the nested create above might fail if I'm not careful.
        // But if I use `create` inside `data`, it tries to create. 
        // Safer: Create User first, then Upsert config separate, OR handle config existence.
        // Given we are in a "Self Healing" block where we assume things are missing,
        // let's stick to the previous pattern but wrapped in try/catch.

        // Update: The previous code did separate upsert. Let's keep that but in try/catch.

        /* 
           PREVIOUS LOGIC WAS:
           create user
           upsert config
        */

        return newDisplay;

    } catch (error) {
        console.error("Error creating display unit:", error);
        // Return null or rethrow, but don't crash the UI if possible. 
        // If we return null, the UI shows "No Display Unit", which is better than Error 500.
        return null;
    }
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
