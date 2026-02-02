import { prisma } from "./src/lib/prisma";

async function fixPairing() {
    try {
        console.log("Starting Auto-Repair...");

        // 1. Find the logged-in Display User (BJTM002)
        // We use the ID from the error log confirmation
        const displayUser = await prisma.user.findFirst({
            where: { username: "BJTM002" }
        });

        if (!displayUser) {
            console.error("❌ user BJTM002 not found!");
            return;
        }
        console.log("✅ Found Display User:", displayUser.username, displayUser.id);

        // 2. Find the Admin
        const adminUser = await prisma.user.findFirst({
            where: {
                role: { in: ["ADMIN", "SUPER_ADMIN"] }
            }
        });

        if (!adminUser) {
            console.error("❌ No ADMIN found!");
            return;
        }
        console.log("✅ Found Admin User:", adminUser.username, adminUser.id);

        // 3. FORCE PAIRING
        // Disconnect anyone currently paired to this Admin (to be safe, or just overwrite)
        // And connect BJTM002

        // First, clear any existing bad pairing for BJTM002
        await prisma.user.update({
            where: { id: displayUser.id },
            data: { pairedUserId: null }
        });

        // Now connect Admin -> Display
        // Admin's `pairedUserId` should point to BJTM002
        // OR Display's `pairedUserId` should point to Admin?
        // Let's check schema: 
        // model User { ... pairedUserId String? @unique ... pairedUser User? @relation("UserPairing", ... }
        // Usually logic is: One controls the other.
        // In actions.ts: `user.pairedUser` (The one I am paired TO).
        // If BJTM002 is Display, it should likely be referenced BY Admin or reference Admin.

        // Schema relation: 
        // pairedUserId references User.id.
        // If Admin pairs with Display: Admin.pairedUserId = Display.id

        console.log("🔗 Connecting Admin to Display...");

        await prisma.user.update({
            where: { id: adminUser.id },
            data: { pairedUserId: displayUser.id }
        });

        console.log("✅ REPAIR COMPLETE. Admin is now paired with BJTM002.");

    } catch (e) {
        console.error("Error:", e);
    }
}

fixPairing();
