import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DisplayBoard from "./display-board";
import { DisplayClientListener } from "@/components/DisplayClientListener";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DisplayPage() {
    let session = null;
    try {
        session = await auth();
    } catch (e) {
        console.error("Auth check failed:", e);
    }

    let initialData: any = null;

    if (session?.user?.id) {
        try {
            // Optimization: Direct DB Query to ensure data availability on page load
            // Bypasses any Server Action middleware/context issues
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

            // Logic to determine Admin source
            const isPairedUserAdmin = user?.pairedUser?.role === 'ADMIN' || user?.pairedUser?.role === 'SUPER_ADMIN';
            const admin = isPairedUserAdmin ? user?.pairedUser : user?.pairedWith;

            if (admin) {
                initialData = {
                    userId: session.user.id,
                    forex: admin.forexRates || [],
                    deposit: admin.depositRates || [],
                    video: admin.videoDisplay || null,
                    config: admin.displayConfig || null
                };
                console.log(`[DisplayPage] Loaded data for user ${session.user.username}`);
            } else {
                console.warn(`[DisplayPage] No admin found for user ${session.user.username}`);
            }
        } catch (error) {
            console.error("[DisplayPage] Direct Query Error:", error);
        }
    }

    return (
        <main className="h-screen w-screen bg-slate-950 overflow-hidden">
            {session?.user?.id && <DisplayClientListener displayId={session.user.id} />}
            <DisplayBoard initialData={initialData} />
        </main>
    )
}
