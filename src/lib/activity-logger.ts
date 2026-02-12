
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logActivity(
    userId: string,
    action: string,
    details?: string,
    manualLocation?: string
) {
    try {
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "::1";

        // Use manual location (e.g. from GPS) if provided, otherwise fetch from IP-API
        let location = manualLocation || "Unknown Location";

        if (!manualLocation) {
            try {
                // If localhost, query the API without an IP to get the server's public location (Self-lookup)
                // If remote, query with the specific IP
                const queryIp = (ip === "::1" || ip === "127.0.0.1") ? "" : ip;
                const apiUrl = `http://ip-api.com/json/${queryIp}?fields=city,regionName,status`;

                const res = await fetch(apiUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "success" && data.city) {
                        location = `${data.city}, ${data.regionName}`;
                    } else if (ip === "::1" || ip === "127.0.0.1") {
                        // Fallback if API fails on localhost
                        location = "Localhost (Server)";
                    }
                }
            } catch (e) {
                // Fail silently
                if (ip === "::1" || ip === "127.0.0.1") location = "Localhost (Server)";
            }
        }

        await prisma.activityLog.create({
            data: {
                userId,
                action,
                details: details || "",
                ipAddress: ip,
                location
            }
        });

        // Auto-cleanup: Keep database lean for free tier
        // Delete logs older than 3 days
        try {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            await prisma.activityLog.deleteMany({
                where: {
                    createdAt: {
                        lt: threeDaysAgo
                    }
                }
            });
        } catch (cleanupError) {
            console.error("Auto-cleanup failed:", cleanupError);
        }

    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't crash the app if logging fails
    }
}
