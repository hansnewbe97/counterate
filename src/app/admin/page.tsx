import { auth } from "@/auth";
import { Calculator, BarChart3, Video, Palette, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await auth();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Market Operations</h1>
                <p className="text-slate-400">Manage real-time market rates and digital media distribution.</p>
            </div>

            {/* Unified Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Forex Section */}
                <div className="glass-card overflow-hidden border border-[#222] group flex flex-col h-full">
                    <div className="p-10 flex-1">
                        <div className="w-16 h-16 bg-[#D4AF37]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]/60 mb-8 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <Calculator size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Forex & Market Rates</h2>
                        <p className="text-slate-400 font-light leading-relaxed text-sm">
                            Control the official buying and selling rates for international currencies.
                            Updates are pushed instantly to all display units.
                        </p>
                    </div>
                    <Link href="/admin/rates" className="p-8 bg-[#D4AF37]/5 border-t border-[#222] flex items-center justify-between text-[#D4AF37]/60 font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all group/btn">
                        Enter Market Console
                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                {/* Media Section */}
                <div className="glass-card overflow-hidden border border-[#222] group flex flex-col h-full">
                    <div className="p-10 flex-1">
                        <div className="w-16 h-16 bg-[#D4AF37]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]/60 mb-8 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <Video size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Digital Media Distribution</h2>
                        <p className="text-slate-400 font-light leading-relaxed text-sm">
                            Curate the video playlist for your branch. Manage promotions,
                            news, and informational content displayed to customers.
                        </p>
                    </div>
                    <Link href="/admin/video" className="p-8 bg-[#D4AF37]/5 border-t border-[#222] flex items-center justify-between text-[#D4AF37]/60 font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all group/btn">
                        Manage Video Playlist
                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                {/* Deposito Section */}
                <div className="glass-card overflow-hidden border border-[#222] group flex flex-col h-full">
                    <div className="p-10 flex-1">
                        <div className="w-16 h-16 bg-[#D4AF37]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]/60 mb-8 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <BarChart3 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Deposito Rates</h2>
                        <p className="text-slate-400 font-light leading-relaxed text-sm">
                            Manage fixed income investment yields and interest rates for
                            various deposit tenures.
                        </p>
                    </div>
                    <Link href="/admin/deposit" className="p-8 bg-[#D4AF37]/5 border-t border-[#222] flex items-center justify-between text-[#D4AF37]/60 font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all group/btn">
                        Configure Yields
                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                {/* Branding Section */}
                <div className="glass-card overflow-hidden border border-[#222] group flex flex-col h-full">
                    <div className="p-10 flex-1">
                        <div className="w-16 h-16 bg-[#D4AF37]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]/60 mb-8 group-hover:scale-110 group-hover:text-[#D4AF37] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <Palette size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Identity & Brand</h2>
                        <p className="text-slate-400 font-light leading-relaxed text-sm">
                            Customize branch logos, dashboard titles, and global interface
                            settings to maintain brand consistency.
                        </p>
                    </div>
                    <Link href="/admin/branding" className="p-8 bg-[#D4AF37]/5 border-t border-[#222] flex items-center justify-between text-[#D4AF37]/60 font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all group/btn">
                        Update Brand ID
                        <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
