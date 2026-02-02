import { Sidebar } from "@/components/admin/Sidebar";
import { auth } from "@/auth";

import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session = null;
    try {
        session = await auth();
        // Check for session expiry error from auth.ts
        if (!session || (session as any).error === "SessionExpired") {
            redirect("/login");
        }
    } catch (e) {
        // If redirect throws (which it does in Next.js), let it bubble up
        if ((e as any)?.digest?.includes("NEXT_REDIRECT")) {
            throw e;
        }
        console.error("Auth check failed in admin layout:", e);
        // Fail safe redirect on error
        redirect("/login");
    }

    return (
        <div className="flex h-[100dvh] bg-black font-sans text-gray-100 overflow-hidden">
            <Sidebar role={session?.user?.role} />
            <div className="flex-1 flex flex-col min-w-0 glass-effect relative bg-[#050505]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

                {/* Top Header */}
                <header className="h-auto py-6 md:h-24 md:py-0 border-b border-[#333] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between px-6 md:px-10 bg-black/50 backdrop-blur-md z-10 pt-20 md:pt-0">
                    <div>
                        <h2 className="text-3xl font-bold text-[#D4AF37] font-serif tracking-tight drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">Executive Dashboard</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-px w-8 bg-[#D4AF37]/50" />
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">Hans Corporation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 w-full md:w-auto justify-center md:justify-start">
                            <div className="h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-pulse" />
                            <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">System Live</div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-10 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
