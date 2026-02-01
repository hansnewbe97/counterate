"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrencyDetails } from "@/lib/currency-data";
import { auth } from "@/auth";

// Type definitions
type ForexData = {
    id?: string;
    currency: string;
    ttBuy: number;
    ttSell: number;
    bankBuy: number;
    bankSell: number;
    active: boolean;
};

// Helper to emit socket event
const emitUpdate = () => {
    // We try to access the global IO instance
    const io = (global as any).io;
    if (io) {
        io.emit("data-update", { type: "ALL" }); // Simple trigger for clients to refetch or send payload
    }
};

export async function updateForex(data: ForexData) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) throw new Error("Unauthorized");

        const details = getCurrencyDetails(data.currency);

        if (data.id) {
            await prisma.forexRate.update({
                where: { id: data.id, adminId },
                data: {
                    currency: data.currency,
                    currencyName: details.name,
                    ttBuy: data.ttBuy,
                    ttSell: data.ttSell,
                    bankBuy: data.bankBuy,
                    bankSell: data.bankSell,
                    active: data.active,
                },
            });
        } else {
            await prisma.forexRate.create({
                data: {
                    adminId,
                    currency: data.currency,
                    currencyName: details.name,
                    ttBuy: data.ttBuy,
                    ttSell: data.ttSell,
                    bankBuy: data.bankBuy,
                    bankSell: data.bankSell,
                    active: data.active,
                },
            });
        }
        emitUpdate();
        revalidatePath("/admin/rates");
        revalidatePath("/display");
        return { success: true };
    } catch (error) {
        console.error("Failed to update forex:", error);
        return { success: false, error: "Failed to update forex rate" };
    }
}

export async function deleteForex(id: string) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) throw new Error("Unauthorized");

        await prisma.forexRate.delete({
            where: { id, adminId } // Prevent deleting other admin's rates
        });
        emitUpdate();
        revalidatePath("/admin/rates");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete forex:", error);
        return { success: false, error: "Failed to delete forex rate" };
    }
}

export async function getRates() {
    const session = await auth();
    const adminId = session?.user?.id;

    const forex = await prisma.forexRate.findMany({
        where: { adminId },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            currency: true,
            currencyName: true,
            ttBuy: true,
            ttSell: true,
            bankBuy: true,
            bankSell: true,
            active: true,
            order: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return { forex };
}
