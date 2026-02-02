"use client";

import { useEffect, useState } from "react";
import { checkPendingCommand } from "@/app/display/actions";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

export function DisplayClientListener({ displayId }: { displayId: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [lastCheck, setLastCheck] = useState(Date.now());

    // Auto-logout for passive display
    useEffect(() => {
        const sessionError = (session as any)?.error;
        if (sessionError === "SessionExpired") {
            console.log("[Display] Session expired, redirecting to login...");
            window.location.href = "/login";
        }
    }, [session]);

    useEffect(() => {
        if (!displayId) return;

        const interval = setInterval(async () => {
            try {
                const command = await checkPendingCommand(displayId);
                if (command) {
                    console.log("Received command:", command);
                    if (command === "RELOAD") {
                        window.location.reload();
                    } else if (command === "LOGOUT") {
                        // Redirect to login or perform logout
                        window.location.href = "/login";
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
            setLastCheck(Date.now());
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [displayId, router]);

    return null; // Invisible component
}
