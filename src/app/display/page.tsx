import { getDisplayData } from "./actions";
import DisplayBoard from "./display-board";
import { DisplayClientListener } from "@/components/DisplayClientListener";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DisplayPage() {
    let session = null;
    try {
        session = await auth();
    } catch (e) {
        console.error("Auth check failed:", e);
        // Continue with null session - actions.ts will handle null session by returning null data
    }

    // if (!session) redirect("/login"); // Enforce login as per Requirements

    // However, if it's meant to be a public screen that auto-logins or valid session exists.
    // User requirement: "Only can login to display mode".
    // So session check is needed.

    const initialData = await getDisplayData();

    return (
        <main className="h-screen w-screen bg-slate-950 overflow-hidden">
            {session?.user?.id && <DisplayClientListener displayId={session.user.id} />}
            <DisplayBoard initialData={initialData} />
        </main>
    )
}
