"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { normalizeVideoUrl } from "@/lib/video-utils";

const emitUpdate = () => {
    const io = (global as any).io;
    if (io) io.emit("data-update", { type: "VIDEO" });
};

export async function getVideo() {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) return null;

    return prisma.videoDisplay.findUnique({
        where: { adminId },
        include: {
            sources: {
                orderBy: { order: 'asc' }
            }
        }
    });
}


export async function setVideos(urls: string[]) {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("Unauthorized");

    // Upsert the main VideoDisplay record first
    const display = await prisma.videoDisplay.upsert({
        where: { adminId },
        update: { active: true },
        create: { adminId, active: true }
    });

    // Strategy: Delete existing sources and recreate them to ensure order and clean state
    await prisma.videoSource.deleteMany({
        where: { videoDisplayId: display.id }
    });

    // Create new sources for non-empty URLs
    const sourcesToCreate = urls
        .filter(url => url.trim() !== "")
        .map((url, index) => ({
            videoDisplayId: display.id,
            url: normalizeVideoUrl(url),
            order: index
        }));

    if (sourcesToCreate.length > 0) {
        await prisma.videoSource.createMany({
            data: sourcesToCreate
        });
    }

    emitUpdate();
    revalidatePath("/admin/video");
    return { success: true };
}
