import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // Check current counts
        const logCount = await prisma.activityLog.count();
        console.log(`Current activity logs: ${logCount}`);

        if (logCount > 0) {
            // Delete Activity Logs
            const deletedLogs = await prisma.activityLog.deleteMany({});
            console.log(`Successfully deleted ${deletedLogs.count} activity logs.`);
        } else {
            console.log("No activity logs to delete.");
        }

        // Verify users are only the allowed ones
        const allowedUsers = ["superadmin", "admin", "display"];
        const unknownUserCount = await prisma.user.count({
            where: { username: { notIn: allowedUsers } }
        });

        if (unknownUserCount > 0) {
            const deletedUsers = await prisma.user.deleteMany({
                where: {
                    username: { notIn: allowedUsers }
                }
            });
            console.log(`Deleted ${deletedUsers.count} unknown users.`);
        } else {
            console.log("No unknown users found.");
        }

    } catch (e) {
        console.error("Error cleaning up:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
