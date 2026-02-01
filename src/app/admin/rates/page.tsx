import { getRates } from "./actions";
import { RateManager } from "./rate-manager";

export default async function RatesPage() {
    const { forex } = await getRates();
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Market Rates</h1>
                <p className="text-slate-400">Manage real-time foreign exchange and banking rates.</p>
            </div>
            <RateManager initialForex={forex} />
        </div>
    )
}
