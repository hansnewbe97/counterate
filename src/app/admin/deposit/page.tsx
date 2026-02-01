import { getDepositRates } from "./actions";
import { DepositManager } from "./deposit-manager";

export default async function DepositPage() {
    const depositRates = await getDepositRates();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Deposito Rates</h1>
                <p className="text-slate-400">Manage interest rates for fixed deposit products across all displays.</p>
            </div>

            <DepositManager initialDeposit={depositRates} />
        </div>
    );
}
