"use server";

import { auth } from "@/auth";

export async function verifySession() {
    const session = await auth();
    // Return false if no session or if session has error (e.g. SessionExpired)
    if (!session || (session as any).error === "SessionExpired") {
        return false;
    }
    return true;
}
