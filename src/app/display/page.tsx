import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DisplayBoard from "./display-board";
import { DisplayClientListener } from "@/components/DisplayClientListener";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DisplayPage() {
    let session = null;
    try {
        session = await auth();
        if (!session) {
            // Automatically redirect to login if session is invalid
            // This prevents the "Display Data Loading Failed" error screen for unauthenticated users
            redirect("/login");
        }
    } catch (e) {
        console.error("Auth check failed:", e);
    }

    let initialData: any = null;
    const debugLog: any = {
        step: "Start",
        sessionUser: session?.user?.username || "None",
        userId: session?.user?.id || "None",
    };

    if (session?.user?.id) {
        try {
            debugLog.step = "Querying DB";
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

            debugLog.pairingInfo = {
                pairedUser: user?.pairedUser ? { id: user.pairedUser.id, role: user.pairedUser.role } : "None",
                pairedWith: user?.pairedWith ? { id: user.pairedWith.id, role: user?.pairedWith?.role } : "None",
                isPairedUserAdmin,
                adminFound: !!admin
            };

            if (admin) {
                initialData = {
                    userId: session.user.id,
                    forex: admin.forexRates || [],
                    deposit: admin.depositRates || [],
                    video: admin.videoDisplay || null,
                    config: admin.displayConfig || null
                };
                console.log(`[🔍 DisplayPage] Loaded data for user ${session.user.username}`);
                console.log(`[🔍 DisplayPage] Config:`, JSON.stringify(admin.displayConfig, null, 2));
                console.log(`[🔍 DisplayPage] Video:`, JSON.stringify(admin.videoDisplay, null, 2));
            } else {
                console.warn(`[DisplayPage] No admin found for user ${session.user.username}`);
            }
        } catch (error: any) {
            console.error("[DisplayPage] Direct Query Error:", error);
            debugLog.error = error.message;
        }
    } else {
        debugLog.status = "No Session or No User ID";
    }

    if (!initialData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-8 font-mono">
                <h1 className="text-xl font-bold text-red-500 mb-4">Display Data Loading Failed</h1>
                <div className="bg-black/50 p-6 rounded border border-gray-800 max-w-2xl w-full">
                    <pre className="whitespace-pre-wrap text-xs text-gray-300">
                        {JSON.stringify(debugLog, null, 2)}
                    </pre>
                </div>
                <p className="mt-8 text-gray-500 animate-pulse">Waiting for valid configuration...</p>
                {/* Still attempt to render listener in case it can receive force-reload */}
                {session?.user?.id && <DisplayClientListener displayId={session.user.id} />}
            </div>
        )
    }

    return (
        <main className="h-screen w-screen bg-slate-950 overflow-hidden">
            {session?.user?.id && <DisplayClientListener displayId={session.user.id} />}
            <DisplayBoard initialData={initialData} />
        </main>
    )
}
