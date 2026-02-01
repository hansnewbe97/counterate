
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Upserting admin and display users...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const displayPassword = await bcrypt.hash("display123", 10);

    // 1. Ensure Display User Exists
    const displayUser = await prisma.user.upsert({
        where: { username: "display" },
        update: {
            password: displayPassword,
            role: "DISPLAY",
            status: "ACTIVE"
        },
        create: {
            username: "display",
            password: displayPassword,
            role: "DISPLAY",
            status: "ACTIVE",
            createdBy: "system"
        },
    });
    console.log("Display user ready:", displayUser.id);

    // 2. Ensure Admin User Exists and is PAIRED to Display
    const adminUser = await prisma.user.upsert({
        where: { username: "admin" },
        update: {
            password: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
            pairedUserId: displayUser.id // Pair them!
        },
        create: {
            username: "admin",
            password: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
            createdBy: "system",
            pairedUserId: displayUser.id // Pair them!
        },
    });
    console.log("Admin user ready and paired:", adminUser.id);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
