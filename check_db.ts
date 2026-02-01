import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`- ${u.username} (${u.role}) Status: ${u.status}`);
        });
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
