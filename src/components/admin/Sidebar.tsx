"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calculator, LogOut, Settings, Video, Palette, Monitor, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar({ role: initialRole }: { role?: string }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // Use prop if available (server-side pass-down), otherwise use session
    const role = initialRole || session?.user?.role;

    // Only show "Operations" if we definitely know we are NOT a superadmin
    const isSuperAdmin = role === "SUPER_ADMIN";

    // If we don't know the role yet and no prop was passed, we can show a placeholder or nothing
    // But for better UX, if on a /superadmin route, we can assume superadmin during loading
    const effectivelySuperAdmin = isSuperAdmin || (status === "loading" && pathname.startsWith("/superadmin"));

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header (Premium Glassmorphism) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-[#222] flex items-center justify-between px-4 z-40 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#D4AF37] rounded-lg shadow-[0_0_10px_rgba(212,175,55,0.2)] flex items-center justify-center">
                        <span className="text-black font-bold text-lg">C</span>
                    </div>
                    <span className="text-white font-bold text-sm tracking-widest uppercase">Counterate</span>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                >
                    <div className="flex flex-col gap-1.5 w-6 items-end">
                        <span className="h-0.5 w-full bg-current rounded-full" />
                        <span className="h-0.5 w-3/4 bg-current rounded-full" />
                        <span className="h-0.5 w-full bg-current rounded-full" />
                    </div>
                </button>
            </header>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "bg-[#050505] border-r border-[#222] flex flex-col h-[100dvh] transition-all duration-300 ease-in-out z-50",
                "fixed md:relative inset-y-0 left-0 w-64",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Section */}
                <div className="p-8 border-b border-[#222] flex justify-between items-center">
                    <Link
                        href={effectivelySuperAdmin ? "/superadmin" : "/admin"}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-10 h-10 bg-[#D4AF37] rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-black font-bold text-xl">C</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg tracking-wide uppercase">Counterate</h1>
                            <p className="text-[#666] text-[10px] uppercase tracking-widest font-bold">
                                {effectivelySuperAdmin ? "Intelligence" : "Admin"}
                            </p>
                        </div>
                    </Link>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-gray-500 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {effectivelySuperAdmin ? (
                        <>
                            <SidebarLink
                                href="/superadmin"
                                icon={<LayoutDashboard size={20} />}
                                label="Intelligence"
                                active={pathname === "/superadmin"}
                                onClick={() => setIsOpen(false)}
                            />
                            <SidebarLink
                                href="/superadmin/users"
                                icon={<Users size={20} />}
                                label="User Management"
                                active={pathname.startsWith("/superadmin/users")}
                                onClick={() => setIsOpen(false)}
                            />
                            <SidebarLink
                                href="/superadmin/activity"
                                icon={<ShieldCheck size={20} />}
                                label="Recent Activity"
                                active={pathname.startsWith("/superadmin/activity")}
                                onClick={() => setIsOpen(false)}
                            />
                            <SidebarLink
                                href="/superadmin/settings"
                                icon={<Settings size={20} />}
                                label="Settings"
                                active={pathname.startsWith("/superadmin/settings")}
                                onClick={() => setIsOpen(false)}
                            />
                        </>
                    ) : (
                        <>
                            <>
                                {/* Market Controls Header Removed */}
                                <SidebarLink
                                    href="/admin/rates"
                                    icon={<Calculator size={20} />}
                                    label="Forex Rates"
                                    active={pathname.startsWith("/admin/rates")}
                                    onClick={() => setIsOpen(false)}
                                />
                                <SidebarLink
                                    href="/admin/deposit"
                                    icon={<BarChart3 size={20} />}
                                    label="Deposito"
                                    active={pathname.startsWith("/admin/deposit")}
                                    onClick={() => setIsOpen(false)}
                                />

                                {/* Media & Identity Header Removed */}
                                <SidebarLink
                                    href="/admin/video"
                                    icon={<Video size={20} />}
                                    label="Video Management"
                                    active={pathname.startsWith("/admin/video")}
                                    onClick={() => setIsOpen(false)}
                                />
                                <SidebarLink
                                    href="/admin/branding"
                                    icon={<Palette size={20} />}
                                    label="Branding & Logos"
                                    active={pathname.startsWith("/admin/branding")}
                                    onClick={() => setIsOpen(false)}
                                />
                                <SidebarLink
                                    href="/admin/display-management"
                                    icon={<Monitor size={20} />}
                                    label="Display Management"
                                    active={pathname.startsWith("/admin/display-management")}
                                    onClick={() => setIsOpen(false)}
                                />
                            </>
                        </>
                    )}
                </nav>

                {/* Bottom Section */}
                <div className="p-6 border-t border-[#222] space-y-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 p-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all group"
                    >
                        <LogOut size={20} />
                        <span className="font-medium tracking-wide">Exit System</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group border border-transparent",
                active
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                    : "text-gray-400 hover:text-white hover:bg-[#111]"
            )}
        >
            <div className={cn("transition-colors", active ? "text-[#D4AF37]" : "group-hover:text-white")}>
                {icon}
            </div>
            <span className="font-medium tracking-wide flex-1">{label}</span>
            {active && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />}
        </Link>
    );
}

function BarChart3({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>;
}
