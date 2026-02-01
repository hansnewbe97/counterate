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

                        await logActivity(user.id, "LOGIN", "User logged in via credentials");

                        return {
                            id: user.id,
                            username: user.username,
                            role: user.role,
                            status: user.status,
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
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id ?? "";
                token.username = user.username ?? "";
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "DISPLAY";
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
