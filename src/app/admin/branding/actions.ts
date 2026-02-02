"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

async function saveFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/branding");

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);
    return `/uploads/branding/${filename}`;
}

export async function getBrandingConfig() {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) return null;

    return await prisma.displayConfig.findUnique({ where: { adminId } })
        || await prisma.displayConfig.create({ data: { adminId } });
}

export async function updateBrandingConfig(formData: FormData) {
    const leftLogo = formData.get("leftLogo") as File | null;
    const rightLogo = formData.get("rightLogo") as File | null;

    const leftTitle = formData.get("leftTitle") as string;
    const rightTitle = formData.get("rightTitle") as string;
    const marqueeText = formData.get("marqueeText") as string;
    const showClock = formData.get("showClock") === "on";

    const config = await getBrandingConfig();
    if (!config) return { success: false, error: "Branding configuration not found" };

    const updateData: any = {
        leftTitle,
        rightTitle,
        marqueeText,
        showClock
    };

    if (leftLogo && leftLogo.size > 0) {
        updateData.leftLogoUrl = await saveFile(leftLogo);
    }

    if (rightLogo && rightLogo.size > 0) {
        updateData.rightLogoUrl = await saveFile(rightLogo);
    }

    try {
        await prisma.displayConfig.update({
            where: { id: config.id },
            data: updateData
        });

        // Revalidate both admin and display pages
        revalidatePath("/admin/branding");
        revalidatePath("/display");

        // Emit socket event for real-time update
        const io = (global as any).io;
        if (io) io.emit("data-update", { type: "BRANDING" });

        return { success: true };
    } catch (error) {
        console.error("Failed to update branding:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}
