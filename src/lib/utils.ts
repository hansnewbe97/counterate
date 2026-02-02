import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number): string {
    if (amount === null || amount === undefined || amount === "") return "-";

    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(num)) return amount.toString();

    // Use Indonesian locale for formatting (dots for thousands, commas for decimals)
    // We want to keep the original precision if possible, but standard Intl.NumberFormat
    // might round. Let's start with standard options for "currency" style but manual handling/overriding
    // might be better if we want strict control. 
    // However, usually "Rp 14.500" is standard. If decimal, "Rp 14.500,50".

    // Check if it has decimals
    const hasDecimal = num % 1 !== 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: hasDecimal ? 2 : 0,
        maximumFractionDigits: 4, // Allow up to 4 decimal places for precise forex rates
    }).format(num);
}
