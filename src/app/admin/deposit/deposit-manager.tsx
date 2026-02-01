"use client";

import { useState } from "react";
import { updateDeposit, deleteDeposit } from "./actions";
import { Button, Input } from "@/components/ui/components";
import { Trash2 } from "lucide-react";

export function DepositManager({ initialDeposit }: { initialDeposit: any[] }) {
    const [deposit, setDeposit] = useState(initialDeposit);
    const [tenor, setTenor] = useState("");
    const [rate, setRate] = useState("");

    async function handleAddDeposit() {
        if (!tenor || !rate) return;
        const result = await updateDeposit({
            tenor: parseInt(tenor),
            rate: parseFloat(rate)
        });
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Delete this deposit rate?")) {
            const result = await deleteDeposit(id);
            if (result.success) {
                window.location.reload();
            }
        }
    }

    return (
        <div className="space-y-8">
            <div className="glass-card p-6 border border-[#333]">
                <h2 className="text-xl font-bold text-white mb-6 text-[#D4AF37]">Deposit Rates Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tenor (Months)</label>
                        <Input
                            placeholder="e.g. 12"
                            type="number"
                            value={tenor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTenor(e.target.value)}
                            className="glass-input w-full py-6"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Interest Rate (%)</label>
                        <Input
                            placeholder="e.g. 4.75"
                            type="number"
                            step="0.01"
                            value={rate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRate(e.target.value)}
                            className="glass-input w-full py-6"
                        />
                    </div>
                    <div>
                        <Button onClick={handleAddDeposit} className="w-full bg-[#D4AF37] hover:bg-[#B59530] text-black font-bold h-12 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            Add Rate
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deposit.length > 0 ? deposit.map((item: any) => (
                        <div key={item.id} className="glass-card p-6 border border-[#222] bg-gradient-to-br from-black to-[#0a0a0a] group relative">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                                    {item.tenor}
                                    <span className="text-xs text-slate-500 font-normal uppercase tracking-wider">Months</span>
                                </div>
                                <div className="text-[#D4AF37] font-bold text-2xl bg-[#D4AF37]/10 w-fit px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                                    {item.rate}%
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-slate-500 italic">
                            No deposit rates configured.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
