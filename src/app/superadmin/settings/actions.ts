"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity-logger";

export async function updateProfile(data: { username?: string; password?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const updateData: any = {};

    if (data.username) {
        // Check uniqueness
        const existing = await prisma.user.findUnique({ where: { username: data.username } });
        if (existing && existing.id !== session.user.id) {
            throw new Error("Username already taken");
        }
        updateData.username = data.username;
    }

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        await logActivity(session.user.id, "UPDATE_PROFILE", "Updated own superadmin profile");
    }

    revalidatePath("/superadmin/settings");
}

export async function createSuperAdmin(data: { username: string; password?: string }) {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const password = data.password || "super123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            username: data.username,
            password: hashedPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            createdBy: session.user.username || "superadmin"
        }
    });

    if (session?.user?.id) {
        await logActivity(session.user.id, "CREATE_SUPER_ADMIN", `Created new superadmin: ${newUser.username}`);
    }

    revalidatePath("/superadmin/settings");
}
