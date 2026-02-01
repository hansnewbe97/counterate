import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // Delete Activity Logs
        const deletedLogs = await prisma.activityLog.deleteMany({});
        console.log(`Deleted ${deletedLogs.count} activity logs.`);

        // Verify users are only the allowed ones
        const allowedUsers = ["superadmin", "admin", "display"];
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                username: { notIn: allowedUsers }
            }
        });
        console.log(`Deleted ${deletedUsers.count} unknown users.`);

    } catch (e) {
        console.error("Error cleaning up:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
