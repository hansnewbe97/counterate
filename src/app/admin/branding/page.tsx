"use client";

import { useState, useEffect } from "react";
import { getBrandingConfig, updateBrandingConfig } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Monitor, Upload, CheckCircle, XCircle } from "lucide-react";

import { socket } from "@/lib/socketClient";

export default function BrandingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        const data = await getBrandingConfig();
        setConfig(data);
        setLoading(false);
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await updateBrandingConfig(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Branding berhasil disimpan!' });

                // Emit event to update displays immediately
                socket.emit("admin-update");

                await loadConfig();
                setSelectedLogo(null);
                setLogoPreview(null);
            } else {
                setMessage({ type: 'error', text: result.error || 'Gagal menyimpan' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
        }

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

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in-up ${message.type === 'success'
                    ? 'bg-green-900/20 border-green-500/30 text-green-400'
                    : 'bg-red-900/20 border-red-500/30 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

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
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    {/* Current Logo Preview */}
                                    {(logoPreview || config?.leftLogoUrl) && (
                                        <div className="w-20 h-20 bg-black/50 border border-[#333] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                            <img
                                                src={logoPreview || config.leftLogoUrl}
                                                alt="Logo Preview"
                                                className="w-full h-full object-contain p-2"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                name="leftLogo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="glass-input text-gray-400 file:text-[#D4AF37] file:bg-transparent file:border-0 file:font-medium file:cursor-pointer cursor-pointer"
                                            />
                                        </div>
                                        {selectedLogo && (
                                            <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
                                                <Upload size={16} />
                                                <span className="truncate">{selectedLogo.name}</span>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">Recommended: Square PNG/SVG with transparency.</p>
                                    </div>
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
