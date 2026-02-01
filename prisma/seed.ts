import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const superAdminPassword = await bcrypt.hash("super123", 10);
    const superAdmin = await prisma.user.upsert({
        where: { username: "superadmin" },
        update: { password: superAdminPassword },
        create: {
            username: "superadmin",
            password: superAdminPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
        },
    });

    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { username: "admin" },
        update: { password: adminPassword },
        create: {
            username: "admin",
            password: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
            createdBy: "superadmin"
        },
    });

    const displayPassword = await bcrypt.hash("display123", 10);
    const display = await prisma.user.upsert({
        where: { username: "display" },
        update: { password: displayPassword },
        create: {
            username: "display",
            password: displayPassword,
            role: "DISPLAY",
            status: "ACTIVE",
        },
    });

    // Clear existing data to avoid duplicates
    await prisma.forexRate.deleteMany({});
    await prisma.depositRate.deleteMany({});
    await prisma.displayConfig.deleteMany({});

    // Seed some rates
    await prisma.forexRate.createMany({
        data: [
            { currency: "USD", ttBuy: 14500, ttSell: 14700, bankBuy: 14400, bankSell: 14800, order: 1 },
            { currency: "SGD", ttBuy: 10800, ttSell: 11000, bankBuy: 10700, bankSell: 11100, order: 2 },
            { currency: "EUR", ttBuy: 15600, ttSell: 15850, bankBuy: 15500, bankSell: 15950, order: 3 },
            { currency: "CNY", ttBuy: 2100, ttSell: 2200, bankBuy: 2000, bankSell: 2300, order: 4 },
        ],
    });

    await prisma.depositRate.createMany({
        data: [
            { tenor: 1, rate: 3.50, order: 1 },
            { tenor: 3, rate: 3.75, order: 2 },
            { tenor: 6, rate: 4.25, order: 3 },
            { tenor: 12, rate: 4.75, order: 4 },
        ]
    });

    // Default Display Config
    await prisma.displayConfig.create({
        data: {
            refreshInterval: 30,
            marqueeText: "Welcome to Counterate Professional Display. Official Exchange Rates.",
            theme: "banking-blue"
        }
    });

    console.log({ superAdmin, admin, display });
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
