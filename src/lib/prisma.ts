import { PrismaClient } from "@prisma/client";

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.error("Please set DATABASE_URL in Vercel Environment Variables.");
    console.error("For Neon: postgres://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require");

    // In development, provide helpful message
    if (process.env.NODE_ENV === "development") {
        console.error("\n💡 For local development, add to .env file:");
        console.error('DATABASE_URL="your-neon-connection-string"');
    }
}

const prismaClientSingleton = () => {
    try {
        return new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
            errorFormat: "pretty",
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    } catch (error) {
        console.error("❌ Failed to initialize Prisma Client:", error);
        console.error("DATABASE_URL:", process.env.DATABASE_URL ? "is set" : "is NOT set");
        throw error;
    }
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
