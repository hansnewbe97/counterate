"use client";

import { useState } from "react";
import { updateForex, deleteForex } from "./actions";
import { Button, Input } from "@/components/ui/components";
import { getCurrencyDetails } from "@/lib/currency-data";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, X } from "lucide-react";

export function RateManager({ initialForex }: { initialForex: any[] }) {
    const [forex, setForex] = useState(initialForex);

    // Forex Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currency, setCurrency] = useState("");
    const [ttBuy, setTtBuy] = useState("");
    const [ttSell, setTtSell] = useState("");
    const [bankBuy, setBankBuy] = useState("");
    const [bankSell, setBankSell] = useState("");

    const currencyDetails = currency.length >= 2 ? getCurrencyDetails(currency) : null;

    async function handleAddForex() {
        if (!currency || !ttBuy || !ttSell) return;
        await updateForex({
            id: editingId || undefined,
            currency: currency.toUpperCase(),
            ttBuy: parseFloat(ttBuy),
            ttSell: parseFloat(ttSell),
            bankBuy: parseFloat(bankBuy) || 0,
            bankSell: parseFloat(bankSell) || 0,
            active: true
        });
        window.location.reload();
    }

    function handleEdit(item: any) {
        setEditingId(item.id);
        setCurrency(item.currency);
        setTtBuy(item.ttBuy.toString());
        setTtSell(item.ttSell.toString());
        setBankBuy(item.bankBuy.toString());
        setBankSell(item.bankSell.toString());
    }

    function handleCancelEdit() {
        setEditingId(null);
        setCurrency("");
        setTtBuy("");
        setTtSell("");
        setBankBuy("");
        setBankSell("");
    }

    async function handleDeleteForex(id: string) {
        if (confirm("Delete this currency?")) {
            await deleteForex(id);
            window.location.reload();
        }
    }

    return (
        <div className="space-y-8">
            {/* Forex Section */}
            <div className="glass-card p-6 border border-[#333]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <h2 className="text-xl font-bold text-[#D4AF37]">Forex Rates Management</h2>
                        {currencyDetails && (
                            <div className="flex items-center gap-2 text-sm font-normal text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333] w-fit animate-fade-in">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Preview</span>
                                <div className="h-3 w-[1px] bg-[#333]" />
                                {currencyDetails.countryCode ? (
                                    <img
                                        src={`https://flagcdn.com/w40/${currencyDetails.countryCode}.png`}
                                        alt={currencyDetails.name}
                                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                    />
                                ) : (
                                    <span className="text-lg leading-none">{currencyDetails.flag}</span>
                                )}
                                <span className="text-white whitespace-nowrap font-medium">{currencyDetails.name}</span>
                            </div>
                        )}
                    </div>
                    {editingId && (
                        <div className="flex items-center gap-2 text-sm text-[#D4AF37] animate-pulse bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20 w-fit">
                            <Edit size={14} />
                            <span className="font-bold text-xs uppercase tracking-wide">Editing Mode</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 relative">
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block md:hidden">Currency</label>
                        <Input
                            placeholder="USD"
                            value={currency}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                            className="glass-input uppercase w-full"
                            disabled={!!editingId}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block md:hidden">TT Buy</label>
                        <Input
                            placeholder="TT Buy"
                            type="number"
                            value={ttBuy}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTtBuy(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block md:hidden">TT Sell</label>
                        <Input
                            placeholder="TT Sell"
                            type="number"
                            value={ttSell}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTtSell(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block md:hidden">Bank Buy</label>
                        <Input
                            placeholder="Bank Buy"
                            type="number"
                            value={bankBuy}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankBuy(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block md:hidden">Bank Sell</label>
                        <Input
                            placeholder="Bank Sell"
                            type="number"
                            value={bankSell}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankSell(e.target.value)}
                            className="glass-input w-full"
                        />
                    </div>
                    <div className="flex items-end md:items-start col-span-2 md:col-span-1 h-full">
                        <div className="flex items-center gap-2 w-full">
                            <Button
                                onClick={handleAddForex}
                                className={`flex-1 font-bold h-10 ${editingId ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-[#D4AF37] hover:bg-[#B59530] text-black"}`}
                            >
                                {editingId ? "Update" : "Add"}
                            </Button>
                            {editingId && (
                                <Button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 h-10"
                                >
                                    <X size={18} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#222] text-gray-500 text-sm uppercase">
                                <th className="p-3">Flag</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">TT Buy</th>
                                <th className="p-3">TT Sell</th>
                                <th className="p-3">Bank Buy</th>
                                <th className="p-3">Bank Sell</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forex.map((item: any) => {
                                const details = getCurrencyDetails(item.currency);
                                const isEditing = editingId === item.id;
                                return (
                                    <tr key={item.id} className={`border-b border-[#111] transition-colors ${isEditing ? "bg-[#D4AF37]/5 border-l-2 border-l-[#D4AF37]" : "hover:bg-[#111]"}`}>
                                        <td className="p-3">
                                            {details.countryCode ? (
                                                <img
                                                    src={`https://flagcdn.com/w40/${details.countryCode}.png`}
                                                    alt={item.currency}
                                                    className="w-8 h-5 object-cover rounded shadow-sm"
                                                />
                                            ) : (
                                                <span className="text-2xl">{details.flag || "🏳️"}</span>
                                            )}
                                        </td>
                                        <td className="p-3 font-bold text-white">{item.currency}</td>
                                        <td className="p-3 text-[#D4AF37] font-mono">{formatCurrency(item.ttBuy)}</td>
                                        <td className="p-3 text-[#D4AF37] font-mono">{formatCurrency(item.ttSell)}</td>
                                        <td className="p-3 text-gray-400 font-mono">{formatCurrency(item.bankBuy)}</td>
                                        <td className="p-3 text-gray-400 font-mono">{formatCurrency(item.bankSell)}</td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <div className="h-4 w-[1px] bg-[#333]" />
                                                <button
                                                    onClick={() => handleDeleteForex(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

