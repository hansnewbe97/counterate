import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const configCount = await prisma.displayConfig.count();
        const forexCount = await prisma.forexRate.count();
        const depositCount = await prisma.depositRate.count();
        const logCount = await prisma.activityLog.count();
        const videoCount = await prisma.videoDisplay.count();

        console.log("Database Counts:");
        console.log(`- Users: ${userCount}`);
        console.log(`- DisplayConfig: ${configCount}`);
        console.log(`- ForexRates: ${forexCount}`);
        console.log(`- DepositRates: ${depositCount}`);
        console.log(`- ActivityLogs: ${logCount}`);
        console.log(`- VideoDisplays: ${videoCount}`);

        // Check specific usernames
        const users = await prisma.user.findMany({ select: { username: true } });
        console.log("Usernames:", users.map(u => u.username).join(", "));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
