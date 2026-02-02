"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getDisplayData } from "./actions";
import { socket } from "@/lib/socketClient";
import { AutoScrollList } from "@/components/display/AutoScrollList";
import { getCurrencyDetails } from "@/lib/currency-data";
import { formatCurrency } from "@/lib/utils";

import { signOut } from "next-auth/react";
import { Play, Maximize2 } from "lucide-react";

type Data = Awaited<ReturnType<typeof getDisplayData>>;

export default function DisplayBoard({ initialData }: { initialData: Data }) {
    const [data, setData] = useState(initialData);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log(`[🔍 DisplayBoard] Initial Data:`, initialData);
        console.log(`[🔍 DisplayBoard] Config:`, initialData?.config);
        console.log(`[🔍 DisplayBoard] Video:`, initialData?.video);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        // Socket listener
        socket.on("connect", () => {
            console.log("[DisplayBoard] Socket connected");
        });

        socket.on("data-update", async () => {
            console.log("[DisplayBoard] Socket received data-update");
            const newData = await getDisplayData();
            if (newData) setData(newData);
        });

        socket.on("force-reload", ({ targetId }: { targetId: string }) => {
            if (targetId === data?.userId) window.location.reload();
        });

        socket.on("force-logout", ({ targetId }: { targetId: string }) => {
            if (targetId === data?.userId) signOut({ callbackUrl: "/login" });
        });

        // Polling Fallback (Crucial for Vercel/Serverless where sockets might flaky)
        const pollingInterval = setInterval(async () => {
            // Silently fetch updates
            const newData = await getDisplayData();
            if (newData) {
                setData(prev => {
                    // Simple check to avoid unnecessary re-renders if deep comparison is expensive
                    // For now, just setting it is fine as React handles diffing
                    // Ideally we'd compare hash/timestamps
                    return newData;
                });
            }
        }, 15000); // Check every 15 seconds

        return () => {
            socket.off("connect");
            socket.off("data-update");
            socket.off("force-reload");
            socket.off("force-logout");
            clearInterval(pollingInterval);
        };
    }, [data?.userId]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-[#D4AF37]">
                <div className="text-xl font-serif">Loading Display Data...</div>
            </div>
        );
    }

    const { forex, deposit, video, config } = data;

    // Stable reference for sources to prevent playback resets during polling
    // Stable reference for sources to prevent playback resets during polling
    const activeSources = useMemo(() => {
        return (video?.sources || []).filter((s: any) => s.url);
    }, [JSON.stringify(video?.sources)]);

    const [videoIndex, setVideoIndex] = useState(0);

    const handleVideoEnded = useCallback(() => {
        setVideoIndex((prev) => (prev + 1) % activeSources.length);
    }, [activeSources.length]);

    return (
        <div className="relative flex h-full p-12 gap-12 bg-[#080808] text-gray-100 font-sans overflow-hidden selection:bg-[#D4AF37]/30">
            {/* Ambient Background - Luxury Grid & Glow */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Luxury Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Deep Atmospheric Glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(201,166,78,0.05)_0%,transparent_70%)] pointer-events-none"></div>
            </div>

            {/* Top Bar: Logo & Clock */}
            <div className="absolute top-0 left-0 right-0 px-6 py-3 flex justify-between items-start z-50 bg-gradient-to-b from-black/80 to-transparent">
                {/* Logo Section - Top & Center Aligned relative to text */}
                <div className="flex flex-col animate-fade-in-down">
                    {/* Logo Section - Vertical Stack (Strict Redesign) */}
                    <div className="flex flex-col animate-fade-in-down items-left justify-center pt-1 gap-0">
                        {/* Logo: Top, Centered, White Solid, No Background */}
                        <div className="flex items-center justify-start">
                            {config?.leftLogoUrl ? (
                                <img
                                    src={config.leftLogoUrl}
                                    alt="Logo"
                                    // mix-blend-screen: Removes black box
                                    // grayscale brightness-200: Forces non-white colors to look White Solid
                                    className="h-16 w-auto object-contain mix-blend-screen grayscale brightness-200"
                                />
                            ) : (
                                <div className="h-16 w-16 bg-[#D4AF37] text-black rounded flex items-center justify-center">
                                    <span className="font-bold text-3xl">J</span>
                                </div>
                            )}
                        </div>

                        {/* Text: Bottom, Centered, Split Colors (White/Gold Solid) */}
                        <div>
                            {(() => {
                                const title = config?.leftTitle || "Jatim Prioritas";
                                const parts = title.split(' ');
                                const firstWord = parts[0] || "JATIM";
                                const rest = parts.slice(1).join(' ') || "PRIORITAS";

                                return (
                                    <h1 className="text-lg font-bold tracking-widest uppercase leading-none flex gap-2 items-center justify-start mt-1">
                                        {/* JATIM: Solid White */}
                                        <span className="text-white font-sans">{firstWord}</span>
                                        {/* PRIORITAS: Solid Gold #D4AF37 (No Gradient) */}
                                        <span className="text-[#D4AF37] font-sans">{rest}</span>
                                    </h1>
                                );
                            })()}
                        </div>
                    </div>
                </div>



                {/* Ticker Section - Centered */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[40%] flex items-center justify-center overflow-hidden z-40">
                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") && (
                        <div className="w-full h-full overflow-hidden relative group flex items-center">
                            <style jsx>{`
                            @keyframes marquee-seamless {
                                0% { transform: translate3d(0, 0, 0); }
                                100% { transform: translate3d(-50%, 0, 0); }
                            }
                            .animate-marquee-seamless {
                                animation: marquee-seamless 40s linear infinite;
                                will-change: transform;
                            }
                            .group:hover .animate-marquee-seamless {
                                animation-play-state: paused;
                            }
                        `}</style>
                            <div className="flex w-max animate-marquee-seamless whitespace-nowrap">
                                {/* Render content multiple times with wide spacing for professional look */}
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                                <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-lg inline-block drop-shadow-md px-4 whitespace-nowrap">
                                    {(config?.marqueeText || "Welcome to Jatim Prioritas - Exchange Rate Information Board") + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Clock Section - Global - Moved to Body */}
                <div className="w-[30%]"></div>
            </div>

            {/* Main Content Grid */}
            <div className="relative w-full h-full flex gap-8 pt-16 z-10 pb-4">

                {/* Left Column: Market Quotations */}
                <div className="w-1/2 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Section Header */}
                    <div className="mb-4 pl-2 border-l-2 border-[#D4AF37]">
                        <h2 className="text-3xl font-serif font-bold text-white leading-none mb-1">INFO <span className="text-[#D4AF37]">KURS</span></h2>
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500 text-[9px] uppercase tracking-[0.3em] ml-1">Daily Exchange Rate</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse"></span>
                                <span className="text-[8px] text-[#D4AF37]/80 uppercase tracking-widest">Live Feed</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Container - Minimalist Glass */}
                    <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-lg relative overflow-hidden">
                        {/* Table Headers */}
                        <div className="grid grid-cols-12 px-4 py-3 text-[#888] text-xs font-bold uppercase tracking-[0.15em] border-b border-white/[0.08]">
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                            <div className="col-span-2 -ml-2">Currency</div>
                            <div className="col-span-4 text-center text-[#D4AF37]">Telegraphic Transfer</div>
                            <div className="col-span-4 text-center">Bank Notes</div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-1.5 text-[#555] text-[10px] font-bold uppercase tracking-widest mb-1">
                            <div className="col-span-4 text-right"></div>
                            <div className="col-span-2 text-right text-[#D4AF37]/60">Buy</div>
                            <div className="col-span-2 text-right text-[#D4AF37]/60">Sell</div>
                            <div className="col-span-2 text-right">Buy</div>
                            <div className="col-span-2 text-right">Sell</div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-hidden relative">

                            <AutoScrollList
                                items={forex}
                                speed={0.5}
                                gap={0}
                                className="hide-scrollbar"
                                renderItem={(rate: any, idx: number) => (
                                    <div key={`${rate.id}-${idx}`} className="grid grid-cols-12 items-center px-4 py-2.5 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                        <div className="col-span-1 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] brightness-110">
                                            <Flag code={rate.currency} className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="col-span-1 font-bold text-white/90 font-mono text-base tracking-wide">
                                            {rate.currency}
                                        </div>
                                        <div className="col-span-2 text-[8px] text-gray-500 uppercase tracking-wider font-medium truncate pr-2">
                                            {rate.currencyName}
                                        </div>

                                        {/* TT Rates */}
                                        <div className="col-span-2 flex justify-between items-center px-1 font-semibold text-white tabular-nums text-sm">
                                            <span className="text-white/40 text-[10px] mr-1">Rp</span>
                                            <span>{Number(rate.ttBuy).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-between items-center px-1 font-semibold text-white tabular-nums text-sm">
                                            <span className="text-white/40 text-[10px] mr-1">Rp</span>
                                            <span>{Number(rate.ttSell).toLocaleString('id-ID')}</span>
                                        </div>

                                        {/* Bank Rates */}
                                        <div className="col-span-2 flex justify-between items-center px-1 font-semibold text-[#D4AF37] tabular-nums text-sm">
                                            <span className="text-[#D4AF37]/40 text-[10px] mr-1">Rp</span>
                                            <span>{Number(rate.bankBuy).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-between items-center px-1 font-semibold text-[#D4AF37] tabular-nums text-sm">
                                            <span className="text-[#D4AF37]/40 text-[10px] mr-1">Rp</span>
                                            <span>{Number(rate.bankSell).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Video & Promo */}
                <div className="w-1/2 flex flex-col h-full gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {/* New Clock Position - Acts as Header for Right Column */}
                    <div className="flex justify-between items-end pb-2 border-b-2 border-[#D4AF37]/50 mb-1">
                        <div className="flex flex-col">
                            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-1">Local Time</span>
                            <div className="flex items-center gap-2 text-white/80 text-[10px] uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                System Operational
                            </div>
                        </div>
                        <div className="transform origin-bottom-right scale-75">
                            <Clock />
                        </div>
                    </div>

                    {/* Video Section - Fixed Height for Visibility */}
                    <div className="w-full shrink-0 aspect-video bg-black relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden rounded-sm group">
                        {(() => {
                            if (activeSources.length > 0) {
                                return (
                                    <VideoPlayer
                                        sources={activeSources}
                                        currentIndex={videoIndex % activeSources.length}
                                        onEnded={handleVideoEnded}
                                    />
                                );
                            }

                            return (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0C0C0C]">
                                    <div className="text-[#333] tracking-[0.5em] text-[10px] uppercase font-serif">Video Feed Offline</div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Deposit Tiers - Compact & Professional */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
                            <h3 className="text-lg font-serif text-white uppercase tracking-widest">Investment Yields</h3>
                        </div>

                        <div className="flex-1 overflow-hidden relative bg-white/[0.02] border border-white/10 rounded-lg p-2">
                            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#080808] to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none"></div>

                            <AutoScrollList
                                items={deposit}
                                speed={0.3}
                                gap={12}
                                className="hide-scrollbar"
                                renderItem={(rate: any, idx: number) => (
                                    <div key={`${rate.id}-${idx}`} className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-white/[0.03] to-transparent border-l border-white/10 hover:border-[#D4AF37] transition-all duration-500 group/tier mb-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-serif text-white group-hover/tier:text-[#D4AF37] transition-colors">{rate.tenor}</span>
                                                <span className="text-[10px] font-sans text-gray-400 font-bold uppercase tracking-[0.2em] group-hover/tier:text-[#D4AF37]/80 transition-colors">MONTHS</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-medium mt-1">Deposit Tenure</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-light text-[#D4AF37] font-serif tracking-tighter">
                                                {rate.rate}%
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">p.a.</span>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer ticker or status could go here if needed, keeping it clean for now */}

            {/* Start Display Overlay (Fullscreen Trigger) */}
            {!isFullscreen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-1000">
                    <div className="text-center group cursor-pointer animate-fade-in" onClick={toggleFullscreen}>
                        <div className="w-32 h-32 rounded-full bg-[#D4AF37]/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-[#D4AF37]/15 transition-all duration-700 border border-[#D4AF37]/20 shadow-[0_0_80px_rgba(212,175,55,0.15)] relative overflow-hidden">
                            {/* Inner pulse effect */}
                            <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse" />
                            <Play size={48} className="text-[#D4AF37] fill-[#D4AF37] ml-2 relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-white mb-3 tracking-[0.2em] uppercase">Start Display</h2>
                        <p className="text-[#D4AF37]/40 text-xs tracking-[0.4em] uppercase font-medium group-hover:text-[#D4AF37]/80 transition-colors duration-500">
                            Click to activate full screen monitor
                        </p>
                    </div>
                </div>
            )}
        </div >
    );
}

function Clock() {
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-end">
            {/* Large Time Display */}
            <span className="text-5xl font-light text-white font-mono tracking-wider tabular-nums">
                {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                <span className="text-lg ml-2 text-[#666]">{time.getSeconds().toString().padStart(2, '0')}</span>
            </span>
            {/* Elegant Date */}
            <div className="flex items-center gap-2 mt-1">
                <span className="h-[1px] w-6 bg-[#D4AF37]/50"></span>
                <span className="text-xs text-[#D4AF37] uppercase tracking-[0.3em] font-medium ml-2">
                    {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>
        </div>
    );
}

function VideoPlayer({ sources, currentIndex, onEnded }: { sources: any[], currentIndex: number, onEnded: () => void }) {
    const currentUrl = sources[currentIndex]?.url;

    console.log(`[🔍 VideoPlayer] sources:`, sources);
    console.log(`[🔍 VideoPlayer] currentUrl:`, currentUrl);

    if (!currentUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black border-4 border-red-500">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️ No Video Sources</div>
                    <div className="text-gray-400 text-sm">Upload videos in admin panel</div>
                </div>
            </div>
        );
    }

    // Robust check for YouTube URLs (including normalized embed links)
    const isYouTube = currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be");

    return (
        <div className="w-full h-full relative bg-black group">
            {isYouTube ? (
                <YouTubeEmbed
                    key={`yt-${currentIndex}`} // Force remount on change
                    url={currentUrl}
                    onEnded={onEnded}
                />
            ) : (
                <NativeVideo
                    key={`native-${currentIndex}`} // Force remount on change
                    url={currentUrl}
                    onEnded={onEnded}
                />
            )}

            {/* Overlay Info - Always visible for verification */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-[#D4AF37] opacity-80 z-50">
                v2.1 • CAM {currentIndex + 1} / {sources.length}
            </div>
        </div>
    );
}

function YouTubeEmbed({ url, onEnded }: { url: string, onEnded: () => void }) {
    const videoId = url.match(/embed\/([^?]+)/)?.[1] || url.match(/[?&]v=([^&]+)/)?.[1];
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoId) return;

        // Load YouTube IFrame Player API if not already loaded
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        let player: any;

        const onPlayerReady = (event: any) => {
            event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
                onEnded();
            }
        };

        const initPlayer = () => {
            // Need to target the element provided by ref
            // Note: YT.Player replaces the target element with an Iframe.
            // We must create a child div to be replaced, so the ref container stays intact.
            if (!containerRef.current) return;

            // Create a disposable div for YouTube to replace
            const placeholder = document.createElement('div');
            containerRef.current.appendChild(placeholder);

            player = new (window as any).YT.Player(placeholder, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 0
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                }
            });
        };

        if ((window as any).YT && (window as any).YT.Player) {
            initPlayer();
        } else {
            const previousReady = (window as any).onYouTubeIframeAPIReady;
            (window as any).onYouTubeIframeAPIReady = () => {
                if (previousReady) previousReady();
                initPlayer();
            };
        }

        return () => {
            if (player && player.destroy) {
                try {
                    player.destroy();
                } catch (e) {
                    console.error("Error destroying YT player", e);
                }
            }
            // Ensure container is clean (though React handles the container itself)
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [videoId, onEnded]); // Removed containerId dependency

    if (!videoId) return <div className="w-full h-full flex items-center justify-center text-red-500 text-xs">Invalid YouTube URL</div>;

    return (
        <div className="w-full h-full">
            {/* 
                Wrapper strategy: 
                React controls this outer div (via ref). 
                We manually append a child for YouTube to replace/destroy.
                This keeps React's Virtual DOM in sync with the real DOM structure it expects.
            */}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}

function NativeVideo({ url, onEnded }: { url: string, onEnded: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => console.log("Autoplay prevented:", err));
        }
    }, [url]);

    return (
        <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onEnded={onEnded}
            onError={(e) => console.error("Video load error", e)}
        />
    );
}

function Flag({ code, className }: { code: string; className?: string }) {
    const details = getCurrencyDetails(code);

    if (details.countryCode) {
        return (
            <div className={`relative ${className}`}>
                <div className="absolute inset-0 rounded-full border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] z-10 pointer-events-none" />
                <img
                    src={`https://flagcdn.com/w80/${details.countryCode}.png`}
                    alt={code}
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
        );
    }

    return (
        <span className="text-2xl opacity-80 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            {details.flag || "🏳️"}
        </span>
    );
}

