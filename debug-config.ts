import { prisma } from "./src/lib/prisma";

async function checkDisplayConfig() {
    const configs = await prisma.displayConfig.findMany({
        include: { admin: { select: { username: true, role: true } } }
    });
    console.log("Existing DisplayConfigs:", JSON.stringify(configs, null, 2));
}

checkDisplayConfig();
