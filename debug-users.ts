import { prisma } from "./src/lib/prisma";

async function checkUsers() {
    const id1 = "cml411g5x0001la044cuts4lr"; // ID from screenshot
    const id2 = "cml411g5v00001a04v3zn3twb"; // ID from error log

    const user1 = await prisma.user.findUnique({ where: { id: id1 } });
    const user2 = await prisma.user.findUnique({ where: { id: id2 } });

    console.log("User from Screenshot (Paired in Admin):", user1);
    console.log("User from Error Log (Logged in on TV):", user2);
}

checkUsers();
