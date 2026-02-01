"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const username = formData.get("username");
        console.log("Attempting login for:", username);

        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/",
        });
    } catch (error) {
        console.error("Login Action Error:", error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}
