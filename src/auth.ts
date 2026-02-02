import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { logActivity } from "@/lib/activity-logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.AUTH_SECRET || "secret", // Fallback ensuring secret is present
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("Authorize callback triggered...");
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const cleanedUsername = username.trim();
                    const cleanedPassword = password.trim();

                    console.log("Looking up user:", cleanedUsername);

                    const user = await prisma.user.findUnique({
                        where: { username: cleanedUsername },
                    });

                    if (!user) {
                        console.log("User not found:", username);
                        return null;
                    }

                    if (!user.password) {
                        console.log("User has no password set:", username);
                        return null;
                    }

                    if (user.status !== "ACTIVE") {
                        console.log("User is not ACTIVE:", username, user.status);
                        return null;
                    }

                    console.log("Comparing passwords...");
                    const passwordsMatch = await bcrypt.compare(cleanedPassword, user.password);

                    if (passwordsMatch) {
                        console.log("Login successful for:", username);

                        // Increment session version to invalidate other sessions
                        const updatedUser = await prisma.user.update({
                            where: { id: user.id },
                            data: { sessionVersion: { increment: 1 } }
                        });

                        // Handle Geolocation if provided
                        const creds = credentials as any;
                        let deviceLocation = "";
                        if (creds.latitude && creds.longitude) {
                            try {
                                const lat = creds.latitude as string;
                                const lon = creds.longitude as string;
                                // Use Agent header as required by OSM usage policy
                                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                                    headers: { 'User-Agent': 'CounterateApp/1.0' }
                                });
                                if (geoRes.ok) {
                                    const geoData = await geoRes.json();
                                    const addr = geoData.address;
                                    // Construct location string: e.g. "Jember, East Java"
                                    const city = addr.city || addr.town || addr.village || addr.county || "Unknown City";
                                    const state = addr.state || addr.region || "";
                                    deviceLocation = state ? `${city}, ${state}` : city;
                                    console.log("Device Location Resolved:", deviceLocation);
                                }
                            } catch (error) {
                                console.error("Geocoding failed:", error);
                            }
                        }

                        await logActivity(user.id, "LOGIN", "User logged in via credentials", deviceLocation);

                        return {
                            id: user.id,
                            username: user.username,
                            role: user.role,
                            status: user.status,
                            sessionVersion: updatedUser.sessionVersion // Pass new version to token
                        };
                    } else {
                        console.log("Password mismatch for:", username);
                    }
                } else {
                    console.log("Invalid credential format provided");
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id ?? "";
                token.username = user.username ?? "";
                token.sessionVersion = (user as any).sessionVersion;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Verify session version from DB
                // This ensures we check if the session is still valid
                if (token.id) {
                    const latestUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { sessionVersion: true, role: true } // Also fetch role for real-time update
                    });

                    // If user is deleted or session version doesn't match, invalidate
                    // In next-auth, returning null or empty object usually doesn't force logout immediately on client in all strategies,
                    // but it prevents access to protected resources.
                    // Ideally we should handle this. 

                    if (!latestUser || latestUser.sessionVersion !== token.sessionVersion) {
                        // Returning null/modified session to indicate invalid
                        return { ...session, user: null, error: "SessionExpired" } as any;
                    }

                    session.user.role = latestUser.role as "SUPER_ADMIN" | "ADMIN" | "DISPLAY";
                }

                session.user.id = token.id as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
