"use client";

import { useState, useEffect } from "react";
import { getBrandingConfig, updateBrandingConfig } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Monitor } from "lucide-react";

export default function BrandingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        const data = await getBrandingConfig();
        setConfig(data);
        setLoading(false);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        const formData = new FormData(event.currentTarget);

        await updateBrandingConfig(formData);
        await loadConfig(); // Reload to see new image URLs
        setSaving(false);
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-[#D4AF37]"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37] shrink-0"></span>
                        <span className="whitespace-nowrap">Branding & Identity</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Customize the display board header and marquee text.</p>
                </div>
                <div className="flex gap-4">
                    <a href="/display" target="_blank" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111] text-[#D4AF37] border border-[#333] hover:bg-[#222] transition-colors text-sm font-medium shadow-lg hover:border-[#D4AF37]/30">
                        <Monitor size={18} />
                        View Display
                    </a>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Branding Section */}
                <div className="glass-card p-6 border border-[#333] rounded-xl bg-[#0A0A0A]">
                    <h2 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
                        Header Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-gray-300">Brand Name (Display Header)</Label>
                            <Input
                                name="leftTitle"
                                defaultValue={config?.leftTitle}
                                className="glass-input"
                                placeholder="COUNTERATE"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-gray-300">Brand Logo (Icon)</Label>
                            <div className="flex items-start gap-4">
                                {config?.leftLogoUrl && (
                                    <div className="w-16 h-16 bg-black/50 border border-[#333] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                        <img src={config.leftLogoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input type="file" name="leftLogo" accept="image/*" className="glass-input text-gray-400 file:text-[#D4AF37] file:bg-transparent file:border-0" />
                                    <p className="text-xs text-gray-500 mt-2">Recommended: Square PNG/SVG with transparency.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marquee / Running Text Section */}
                <div className="glass-card p-6 border border-[#333] rounded-xl bg-[#0A0A0A]">
                    <h2 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
                        Running Text (Marquee)
                    </h2>

                    <div className="space-y-4">
                        <Label className="text-gray-300">Display Message</Label>
                        <Input
                            name="marqueeText"
                            defaultValue={config?.marqueeText}
                            className="glass-input"
                            placeholder="Welcome to Jatim Prioritas - Official Display Board"
                        />
                        <p className="text-xs text-gray-500">
                            This message flows horizontally across the top of the display board.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#F2D06B] font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-105 active:scale-95">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-5 w-5" />
                                Save Identity
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
