"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-logger";

export async function getUsers() {
    const users = await prisma.user.findMany({
        where: {
            role: "ADMIN"
        },
        include: {
            pairedUser: true,
        },
        orderBy: { username: "asc" }
    });

    const configs = await prisma.displayConfig.findMany({
        where: { adminId: { in: users.map(u => u.id) } }
    });

    return users.map(user => ({
        ...user,
        displayConfig: configs.find(c => c.adminId === user.id)
    })) as any[];
}

export async function createUser(
    username: string,
    role: "ADMIN" | "DISPLAY",
    password?: string,
    displayUsername?: string,
    displayPassword?: string,
    marqueeText?: string
) {
    const adminDefault = "admin123";
    const displayDefault = "display123";

    const mainPassword = password || (role === "ADMIN" ? adminDefault : displayDefault);
    const hashedPassword = await bcrypt.hash(mainPassword, 10);

    // For paired display
    const finalDisplayPassword = displayPassword || displayDefault;
    const hashedDisplayPassword = await bcrypt.hash(finalDisplayPassword, 10);

    if (role === "ADMIN") {
        const finalDisplayUsername = displayUsername || `display_${username}`;

        const admin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                createdBy: "superadmin",
                pairedUser: {
                    create: {
                        username: finalDisplayUsername,
                        password: hashedDisplayPassword,
                        role: "DISPLAY",
                        status: "ACTIVE",
                        createdBy: "superadmin",
                    }
                }
            }
        });

        // Initialize DisplayConfig with marquee text
        await prisma.displayConfig.create({
            data: {
                adminId: admin.id,
                marqueeText: marqueeText || "Welcome to Our Branch",
                showClock: true
            }
        });
    } else {
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                status: "ACTIVE",
                createdBy: "superadmin"
            }
        });
    }

    const session = await auth();
    if (session?.user?.id) {
        await logActivity(session.user.id, "CREATE_UNIT", `Created unit: ${username} (${role})`);
    }

    revalidatePath("/superadmin/users");
}

export async function updateUserStatus(id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") {
    // Also toggle paired users
    const user = await prisma.user.findUnique({
        where: { id },
        include: { pairedUser: true, pairedWith: true }
    });

    await prisma.user.update({
        where: { id },
        data: { status }
    });

    if (user?.pairedUser) {
        await prisma.user.update({ where: { id: user.pairedUser.id }, data: { status } });
    }
    if (user?.pairedWith) {
        await prisma.user.update({ where: { id: user.pairedWith.id }, data: { status } });
    }

    revalidatePath("/superadmin/users");

    const sessionStatus = await auth();
    if (sessionStatus?.user?.id) {
        await logActivity(sessionStatus.user.id, "UPDATE_STATUS", `Updated status for ${id} to ${status}`);
    }
}

export async function deleteUser(id: string) {
    // Delete paired as well
    const user = await prisma.user.findUnique({
        where: { id },
        include: { pairedUser: true }
    });

    if (!user) return;

    // Delete the main user first.
    // If this is an Admin (who holds the pairing reference), deleting it first prevents 
    // the "Record to delete does not exist" error that occurs if we delete the paired 
    // Display user first (which causes the Admin to be cascade-deleted).
    await prisma.user.delete({ where: { id } });

    if (user.pairedUser) {
        await prisma.user.delete({ where: { id: user.pairedUser.id } });
    }

    const session = await auth();
    if (session?.user?.id) {
        await logActivity(session.user.id, "DELETE_UNIT", `Deleted unit: ${id}`);
    }

    revalidatePath("/superadmin/users");
}

export async function resetPassword(id: string, newPassword?: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { pairedUser: true }
    });

    if (!user) return;

    // Determine defaults based on role
    const adminDefault = "admin123";
    const displayDefault = "display123";

    // Hash primary account password
    const primaryPwd = newPassword || (user.role === "ADMIN" ? adminDefault : displayDefault);
    const hashedPrimary = await bcrypt.hash(primaryPwd, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPrimary }
    });

    // If it's a unit (Admin), reset the paired display too with its specific default
    if (user.pairedUser) {
        const displayPwd = newPassword || displayDefault;
        const hashedDisplay = await bcrypt.hash(displayPwd, 10);
        await prisma.user.update({
            where: { id: user.pairedUser.id },
            data: { password: hashedDisplay }
        });
    }

    revalidatePath("/superadmin/users");

    const session = await auth();
    if (session?.user?.id) {
        await logActivity(session.user.id, "RESET_PASSWORD", `Reset password for unit: ${id}`);
    }
}

export async function updateUnit(
    adminId: string,
    data: {
        adminUsername?: string;
        displayUsername?: string;
        adminPassword?: string;
        displayPassword?: string;
        marqueeText?: string;
        status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    }
) {
    const user = await prisma.user.findUnique({
        where: { id: adminId },
        include: { pairedUser: true }
    });

    if (!user) throw new Error("User not found");

    // Update Admin
    if (data.adminUsername || data.adminPassword || data.status) {
        const updateData: any = {};
        if (data.adminUsername) updateData.username = data.adminUsername;
        if (data.adminPassword) updateData.password = await bcrypt.hash(data.adminPassword, 10);
        if (data.status) updateData.status = data.status;

        await prisma.user.update({
            where: { id: adminId },
            data: updateData
        });
    }

    // Update Display
    if (user.pairedUser && (data.displayUsername || data.displayPassword || data.status)) {
        const updateData: any = {};
        if (data.displayUsername) updateData.username = data.displayUsername;
        if (data.displayPassword) updateData.password = await bcrypt.hash(data.displayPassword, 10);
        if (data.status) updateData.status = data.status;

        await prisma.user.update({
            where: { id: user.pairedUser.id },
            data: updateData
        });
    }

    // Update Marquee Text in DisplayConfig
    if (data.marqueeText !== undefined) {
        await prisma.displayConfig.upsert({
            where: { adminId: adminId },
            create: { adminId: adminId, marqueeText: data.marqueeText },
            update: { marqueeText: data.marqueeText }
        });
    }

    revalidatePath("/superadmin/users");
    revalidatePath("/display");

    const session = await auth();
    if (session?.user?.id) {
        await logActivity(session.user.id, "UPDATE_UNIT", `Updated unit details for: ${adminId}`);
    }
}
