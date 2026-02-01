import Link from "next/link";
import { ArrowRight, ShieldCheck, BarChart3, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-[#D4AF37] selection:text-black">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C9A64E]/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            {/* Navigation / Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8C7324] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        <span className="text-black font-bold text-xl">C</span>
                    </div>
                    <span className="text-xl font-bold tracking-wide text-white">COUNTERATE</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all">
                            Login
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium uppercase tracking-widest mb-8 animate-fade-in-up">
                    <ShieldCheck size={14} />
                    <span>Secure Banking Grade System</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent animate-fade-in-up animate-delay-100">
                    Professional Exchange <br />
                    <span className="text-[#D4AF37]">Rate Display System</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 animate-fade-in-up animate-delay-200 leading-relaxed">
                    The ultimate solution for modern money changers and banks.
                    Real-time updates, premium aesthetics, and complete control over your digital signage.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
                    <Link href="/login">
                        <Button className="h-14 px-8 bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all hover:scale-105 flex items-center gap-2">
                            Enter System <ArrowRight size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full animate-fade-in-up animate-delay-400">
                    <div className="glass-card p-8 border border-[#333] hover:border-[#D4AF37]/50 transition-colors group text-left">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                            <Monitor size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">4K Digital Display</h3>
                        <p className="text-gray-400">Optimized for large screens with smooth auto-scrolling and crystal clear typography.</p>
                    </div>

                    <div className="glass-card p-8 border border-[#333] hover:border-[#D4AF37]/50 transition-colors group text-left">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Real-time Updates</h3>
                        <p className="text-gray-400">Instant rate propagation from Admin dashboard to all connected displays via WebSocket.</p>
                    </div>

                    <div className="glass-card p-8 border border-[#333] hover:border-[#D4AF37]/50 transition-colors group text-left">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Role-Based Access</h3>
                        <p className="text-gray-400">Strict separation between Super Admin, Admin, and Display units for maximum security.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#222] py-8 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} Counterate Systems v2.0. All rights reserved.</p>
            </footer>
        </main>
    );
}
