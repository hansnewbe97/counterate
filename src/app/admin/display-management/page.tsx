
import React from 'react';
import { getPairedDisplay } from './actions';
import { Monitor, RefreshCcw, LogOut, Lock } from 'lucide-react';
import DisplayControls from './DisplayControls';

export default async function DisplayManagementPage() {
    const displayUser = await getPairedDisplay();

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Display Management</h1>
                <p className="text-gray-400">Manage your connected display unit and security settings.</p>
            </div>

            {displayUser ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Display Unit Card */}
                    <div className="col-span-full lg:col-span-2 bg-[#111] border border-[#222] rounded-2xl p-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Monitor size={120} />
                        </div>

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${displayUser.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                                    <span className="text-sm font-medium text-gray-400 tracking-wider">STATUS: {displayUser.status}</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-1">{displayUser.username}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">ID: {displayUser.id}</p>
                            </div>
                        </div>

                        <DisplayControls displayUser={displayUser} />
                    </div>
                </div>
            ) : (
                <div className="bg-[#111] border border-[#222] rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <Monitor size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Display Unit Found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        This admin account is not currently paired with any display unit. Please contact a Super Admin to assign a display.
                    </p>
                </div>
            )}
        </div>
    );
}
