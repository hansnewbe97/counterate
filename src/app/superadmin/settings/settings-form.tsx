"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui/components";
import { updateProfile, createSuperAdmin } from "./actions";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface SettingsFormProps {
    currentUser?: any;
    mode: "profile" | "create";
}

export function SettingsForm({ currentUser, mode }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            if (mode === "profile") {
                await updateProfile({
                    username: username || undefined,
                    password: password || undefined
                });
                setMessage({ type: "success", text: "Profile updated successfully." });
            } else {
                if (!username || !password) throw new Error("Username and password required");
                await createSuperAdmin({ username, password });
                setMessage({ type: "success", text: "New Super Admin created successfully." });
                // Reset form manually if needed, but for now simple feedback covers it
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Something went wrong" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {mode === "profile" ? "Username" : "New Admin Username"}
                </label>
                <Input
                    name="username"
                    defaultValue={mode === "profile" ? currentUser?.username : ""}
                    placeholder="Enter username"
                    className="bg-[#111] border-[#333] focus:border-[#D4AF37]"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {mode === "profile" ? "New Password" : "Password"}
                </label>
                <Input
                    name="password"
                    type="password"
                    placeholder={mode === "profile" ? "Leave blank to keep current" : "Enter password"}
                    className="bg-[#111] border-[#333] focus:border-[#D4AF37]"
                />
            </div>

            {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}>
                    {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : (mode === "profile" ? "Save Changes" : "Create Administrator")}
            </Button>
        </form>
    );
}
