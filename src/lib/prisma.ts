import { PrismaClient } from "@prisma/client";

// Check if we're in build phase to skip database connections
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const prismaClientSingleton = () => {
    // Skip Prisma initialization during build to prevent connection errors
    if (isBuildPhase) {
        return null as any;
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production" && !isBuildPhase) {
    globalForPrisma.prisma = prisma;
}
