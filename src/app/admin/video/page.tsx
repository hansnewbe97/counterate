"use client";

import { useState, useEffect } from "react";
import { getVideo, setVideos } from "./actions";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/components";
import { PlayCircle, Save, Video, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { normalizeVideoUrl } from "@/lib/video-utils";

export default function VideoPage() {
    const [urls, setUrls] = useState<string[]>(["", "", "", ""]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        getVideo().then(v => {
            if (v && v.sources.length > 0) {
                const newUrls = ["", "", "", ""];
                v.sources.forEach((s: any, i: number) => {
                    if (i < 4) newUrls[i] = s.url;
                });
                setUrls(newUrls);
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await setVideos(urls);
            if (result.success) {
                setFeedback({ type: 'success', message: "Videos updated successfully" });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: "Failed to update videos" });
        } finally {
            setSaving(false);
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const updateUrl = (index: number, val: string) => {
        const newUrls = [...urls];
        newUrls[index] = val;
        setUrls(newUrls);
    };

    const clearUrl = (index: number) => {
        updateUrl(index, "");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Video Distribution</h1>
                    <p className="text-slate-400 font-light">Manage the cinematic content playlist for your display units.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold px-8 h-12 rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                >
                    {saving ? (
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                    ) : <Save size={18} className="mr-2" />}
                    Save Playlist
                </Button>
            </div>

            {feedback && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${feedback.type === 'success'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{feedback.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Inputs Grid */}
                <div className="xl:col-span-3 space-y-6">
                    <Card className="bg-[#111] border-[#222] shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-[#222] bg-white/5 p-6">
                            <CardTitle className="text-[#D4AF37] text-lg flex items-center gap-2">
                                <Video size={20} />
                                Content Playlist (Max 4)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {urls.map((url: string, index: number) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Video Slot {index + 1}
                                        </label>
                                        {url && (
                                            <button
                                                onClick={() => clearUrl(index)}
                                                className="text-slate-600 hover:text-red-500 transition-colors"
                                                title="Clear Slot"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            value={url}
                                            onChange={e => updateUrl(index, e.target.value)}
                                            placeholder="Standard, Share, Shorts, or Live YouTube link..."
                                            className="bg-black/50 border-[#333] h-14 pl-4 pr-12 text-slate-200 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all rounded-xl"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                                            <PlayCircle size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 p-4 bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/10 flex gap-4 items-start">
                                <div className="text-[#D4AF37] mt-0.5"><Save size={16} /></div>
                                <p className="text-xs text-[#D4AF37]/70 leading-relaxed">
                                    Videos will cycle automatically on the display board. Supports YouTube links and direct MP4 URLs.
                                    Leave slots empty to skip them.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Previews Sidebar */}
                <div className="xl:col-span-2 space-y-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Live Previews</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {urls.map((url: string, index: number) => (
                            <Card key={index} className="bg-[#111] border-[#222] overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                                <div className="aspect-video bg-black relative">
                                    {url ? (
                                        <iframe
                                            src={normalizeVideoUrl(url)}
                                            className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        ></iframe>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-800 gap-2">
                                            <PlayCircle size={32} />
                                            <span className="text-[10px] uppercase tracking-tighter font-bold">Slot {index + 1} Empty</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-[10px] font-bold text-[#D4AF37] rounded border border-[#D4AF37]/20">
                                        Slot {index + 1}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
