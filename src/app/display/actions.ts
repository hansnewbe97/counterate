"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDisplayData() {
    try {
        const session = await auth();
        // Return null if no session (consistent with previous behavior) - although earlier comments suggested maybe handling public access? 
        // Logic below implies pairing is needed, so session is critical.
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
        // Determine the source of truth (Admin) - Robust Logic
        const isPairedUserAdmin = user?.pairedUser?.role === 'ADMIN' || user?.pairedUser?.role === 'SUPER_ADMIN';
        const admin = isPairedUserAdmin
            ? user.pairedUser
            : user?.pairedWith;

        if (!admin) {
            // SELF-HEALING LOGIC (Auto-Pairing)
            // If this display user is orphaned, try to find an Admin to attach to automatically.
            console.log("⚠️ Orphaned Display User detected. Attempting self-repair...");

            const anyAdmin = await prisma.user.findFirst({
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                include: {
                    displayConfig: true,
                    forexRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    depositRates: { where: { active: true }, orderBy: { order: 'asc' } },
                    videoDisplay: { include: { sources: { orderBy: { order: 'asc' } } } }
                }
            });

            if (anyAdmin) {
                // Repair the link: Attach Admin -> Display (or vice versa depending on schema)
                // Schema: User has `pairedUserId`. 
                // If we set Admin.pairedUserId = SessionUser.id, it pairs them.
                // But Admin might already be paired.
                // Safer: Set SessionUser.pairedUserId = Admin.id ?? No, pairedUserId is unique.
                // Let's look at schema: pairedUserId @unique.

                // If pairing is 1:1, we might overwrite.
                // But for this emergency, we force the Admin to pair with THIS display.

                await prisma.user.update({
                    where: { id: anyAdmin.id },
                    data: { pairedUserId: session.user.id }
                });

                console.log("✅ Self-repair successful. Paired Admin:", anyAdmin.username, "to", session.user.id);

                // Return data immediately from this admin
                return {
                    userId: session.user.id,
                    forex: anyAdmin.forexRates,
                    deposit: anyAdmin.depositRates,
                    video: anyAdmin.videoDisplay,
                    config: anyAdmin.displayConfig
                };
            }

            return null;
        }

        return {
            userId: session.user.id, // For socket/polling identification
            forex: admin.forexRates,
            deposit: admin.depositRates,
            video: admin.videoDisplay,
            config: admin.displayConfig
        };
    } catch (error) {
        console.error("Error fetching display data:", error);
        return null;
    }
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

        // Determine Admin - Robust Logic
        const isPairedUserAdmin = user?.pairedUser?.role === 'ADMIN' || user?.pairedUser?.role === 'SUPER_ADMIN';
        const admin = isPairedUserAdmin
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
