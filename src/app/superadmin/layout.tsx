import { Sidebar } from "@/components/admin/Sidebar";
import { auth } from "@/auth";

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-[#050505] overflow-hidden">
            <Sidebar role={session?.user?.role} />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {/* Ambient background effect */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                {children}
            </main>
        </div>
    );
}
