"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Helper to convert file to base64 data URI
async function fileToBase64(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    return `data:${file.type};base64,${base64}`;
}

export async function getBrandingConfig() {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) return null;

    // Use upsert to handle race conditions and ensure existence
    return await prisma.displayConfig.upsert({
        where: { adminId },
        create: { adminId },
        update: {}
    });
}

export async function updateBrandingConfig(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const leftLogo = formData.get("leftLogo") as File | null;
    const rightLogo = formData.get("rightLogo") as File | null;

    const leftTitle = formData.get("leftTitle") as string;
    const rightTitle = formData.get("rightTitle") as string;
    const marqueeText = formData.get("marqueeText") as string;
    const showClock = formData.get("showClock") === "on";

    try {
        const config = await getBrandingConfig();
        if (!config) return { success: false, error: "Branding configuration not found" };

        const updateData: any = {
            leftTitle,
            rightTitle,
            marqueeText,
            showClock
        };

        // Store as Base64 (Vercel compatible without S3)
        if (leftLogo && leftLogo.size > 0) {
            updateData.leftLogoUrl = await fileToBase64(leftLogo);
        }

        if (rightLogo && rightLogo.size > 0) {
            updateData.rightLogoUrl = await fileToBase64(rightLogo);
        }

        await prisma.displayConfig.update({
            where: { id: config.id },
            data: updateData
        });

        // Revalidate both admin and display pages
        revalidatePath("/admin/branding");
        revalidatePath("/display");

        // Emit socket event for real-time update
        // Note: Socket.io instance might not be globally available in serverless actions this way
        // Ideally use a dedicated meaningful emitter if needed.
        // For now, revalidatePath handles the static props refresh.

        return { success: true };
    } catch (error) {
        console.error("Failed to update branding:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}
