"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDisplayData() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            pairedUser: {
                include: {
                    displayConfig: true,
                    forexRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    depositRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    videoDisplay: { include: { sources: { orderBy: { order: 'asc' } } } }
                }
            },
            pairedWith: {
                include: {
                    displayConfig: true,
                    forexRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    depositRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    videoDisplay: { include: { sources: { orderBy: { order: 'asc' } } } }
                }
            }
        }
    });

    // Determine the source of truth (Admin)
    const admin = user?.pairedUser?.role === 'ADMIN' || user?.pairedUser?.role === 'SUPER_ADMIN'
        ? user.pairedUser
        : user?.pairedWith;

    if (!admin) return null;

    return {
        userId: session.user.id, // For socket/polling identification
        forex: admin.forexRates,
        deposit: admin.depositRates,
        video: admin.videoDisplay,
        config: admin.displayConfig
    };
}

export async function checkPendingCommand(displayId: string) {
    if (!displayId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: displayId },
            include: {
                pairedUser: { include: { displayConfig: true } },
                pairedWith: { include: { displayConfig: true } }
            }
        });

        const admin = user?.pairedUser?.role === 'ADMIN' || user?.pairedUser?.role === 'SUPER_ADMIN'
            ? user.pairedUser
            : user?.pairedWith;

        if (!admin?.displayConfig) return null;

        const config = admin.displayConfig;

        if (config.pendingCommand) {
            // Clear the command after reading it
            await prisma.displayConfig.update({
                where: { id: config.id },
                data: { pendingCommand: null, lastCommandAt: new Date() }
            });
            return config.pendingCommand;
        }

        return null;
    } catch (error) {
        console.error("Error checking command:", error);
        return null;
    }
}
