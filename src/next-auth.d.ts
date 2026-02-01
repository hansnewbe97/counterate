import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User {
        role: "SUPER_ADMIN" | "ADMIN" | "DISPLAY";
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
        username: string;
    }

    interface Session {
        user: {
            role: "SUPER_ADMIN" | "ADMIN" | "DISPLAY";
            id: string;
            username: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "SUPER_ADMIN" | "ADMIN" | "DISPLAY";
        id: string;
        username: string;
    }
}
