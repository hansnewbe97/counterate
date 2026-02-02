"use client";

import { useActionState, useState, useEffect } from "react";
import { authenticate } from "./actions";
import { Button, Input } from "@/components/ui/components";
import { Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    const [location, setLocation] = useState<{ lat: string, lng: string } | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                    // Fail silently, fallback to IP
                }
            );
        }
    }, []);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-6 md:p-12">
            {/* Background Ornamental Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C9A64E]/5 rounded-full blur-[100px]" />
                {/* Thin gold line mesh - simulating luxury pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            </div>

            <div className="glass-card w-full max-w-md p-10 animate-fade-in-up relative z-10 border border-[#D4AF37]/20 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                <div className="text-center mb-10 space-y-2">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 animate-fade-in-up relative group">
                        <img src="/hc-logo.jpg" alt="HC Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white animate-fade-in-up animate-delay-100 font-serif">
                        Hans Corporation
                    </h1>
                    <p className="text-[#888888] text-sm animate-fade-in-up animate-delay-200 uppercase tracking-widest text-[10px]">
                        Authorized Personnel Only
                    </p>
                </div>

                <form action={dispatch} className="space-y-8 animate-fade-in-up animate-delay-300">
                    <input type="hidden" name="latitude" value={location?.lat || ""} />
                    <input type="hidden" name="longitude" value={location?.lng || ""} />
                    <div className="space-y-6">
                        <div className="group space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] ml-1">
                                Identity
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors duration-300 w-5 h-5" />
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Enter your ID"
                                    required
                                    className="glass-input pl-12 py-7 text-sm w-full rounded-lg border-white/5 focus:border-[#D4AF37]/50 transition-all font-medium tracking-wide"
                                />
                            </div>
                        </div>

                        <div className="group space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                                    Security Key
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors duration-300 w-5 h-5" />
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="glass-input pl-12 py-7 text-sm w-full rounded-lg border-white/5 focus:border-[#D4AF37]/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        {errorMessage && (
                            <div className="mb-6 p-4 rounded bg-red-900/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#B5902B] hover:from-[#E4C46E] hover:to-[#C9A64E] text-black rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.2)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 font-bold tracking-wider uppercase text-xs group"
                            aria-disabled={isPending}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Authenticate
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-12 text-center border-t border-white/5 pt-6">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        Counterate Systems v2.0
                        <br />
                        Secured by Military-Grade Encryption
                    </p>
                </div>
            </div>
        </main>
    );
}
