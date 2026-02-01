import { PrismaClient } from "@prisma/client";

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    console.error("Please set DATABASE_URL in Vercel Environment Variables.");
    console.error("Example: mysql://user:password@host:port/database");

    // In development, provide helpful message
    if (process.env.NODE_ENV === "development") {
        console.error("\n💡 For local development, add to .env file:");
        console.error('DATABASE_URL="mysql://root:password@localhost:3306/counterate"');
    }
}

const prismaClientSingleton = () => {
    try {
        return new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
            errorFormat: "pretty",
        });
    } catch (error) {
        console.error("❌ Failed to initialize Prisma Client:", error);
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
