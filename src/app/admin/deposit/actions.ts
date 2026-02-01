"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

type DepositData = {
    id?: string;
    tenor: number;
    rate: number;
};

const emitUpdate = () => {
    const io = (global as any).io;
    if (io) {
        io.emit("data-update", { type: "ALL" });
    }
};

export async function updateDeposit(data: DepositData) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) throw new Error("Unauthorized");

        if (data.id) {
            await prisma.depositRate.update({
                where: { id: data.id, adminId },
                data: {
                    tenor: data.tenor,
                    rate: data.rate,
                }
            });
        } else {
            await prisma.depositRate.create({
                data: {
                    adminId,
                    tenor: data.tenor,
                    rate: data.rate,
                }
            });
        }
        emitUpdate();
        revalidatePath("/admin/deposit");
        revalidatePath("/display");
        return { success: true };
    } catch (error) {
        console.error("Failed to update deposit:", error);
        return { success: false, error: "Failed to update deposit rate" };
    }
}

export async function deleteDeposit(id: string) {
    try {
        const session = await auth();
        const adminId = session?.user?.id;
        if (!adminId) throw new Error("Unauthorized");

        await prisma.depositRate.delete({
            where: { id, adminId }
        });
        emitUpdate();
        revalidatePath("/admin/deposit");
        revalidatePath("/display");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete deposit:", error);
        return { success: false, error: "Failed to delete deposit rate" };
    }
}

export async function getDepositRates() {
    const session = await auth();
    const adminId = session?.user?.id;

    return await prisma.depositRate.findMany({
        where: { adminId },
        orderBy: { tenor: 'asc' }
    });
}
