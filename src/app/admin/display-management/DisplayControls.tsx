
'use client';

import React, { useState, useTransition } from 'react';
import { Monitor, RefreshCcw, LogOut, Lock, CheckCircle, AlertTriangle, X, Edit } from 'lucide-react';
import { forceReloadDisplay, forceLogoutDisplay, resetToDefaultPassword, resetDisplayPassword, renameDisplayUser } from './actions';

interface DisplayControlsProps {
    displayUser: any;
}

export default function DisplayControls({ displayUser }: DisplayControlsProps) {
    const [isPending, startTransition] = useTransition();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showRenameForm, setShowRenameForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        actionName: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        actionName: '',
        onConfirm: () => { },
    });

    const handleAction = (actionName: string, actionFn: (id: string) => Promise<any>) => {
        setConfirmModal({
            isOpen: true,
            title: `Are you sure you want to ${actionName}?`,
            actionName,
            onConfirm: () => {
                startTransition(async () => {
                    try {
                        const result = await actionFn(displayUser.id);
                        if (result.success) {
                            setFeedback({ type: 'success', message: `${actionName} command sent successfully.` });
                        } else {
                            setFeedback({ type: 'error', message: result.error || 'Action failed' });
                        }
                    } catch (err) {
                        setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
                    }
                    setTimeout(() => setFeedback(null), 3000);
                });
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await resetDisplayPassword(displayUser.id, newPassword);
            if (result.success) {
                setFeedback({ type: 'success', message: 'Password updated successfully.' });
                setShowPasswordForm(false);
                setNewPassword('');
            } else {
                setFeedback({ type: 'error', message: result.error || 'Failed to update password' });
            }
            setTimeout(() => setFeedback(null), 3000);
        });
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await renameDisplayUser(displayUser.id, newUsername);
            if (result.success) {
                setFeedback({ type: 'success', message: 'Display renamed successfully. Refreshing...' });
                setShowRenameForm(false);
                setTimeout(() => window.location.reload(), 1000); // Reload to reflect changes
            } else {
                setFeedback({ type: 'error', message: result.error || 'Failed to rename display' });
            }
            setTimeout(() => setFeedback(null), 3000);
        });
    };

    return (
        <div className="mt-8 space-y-4">
            {feedback && (
                <div className={`p-3 rounded-lg flex items-center gap-2 animate-fade-in ${feedback.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    <span className="text-sm font-medium">{feedback.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleAction('Force Reload', forceReloadDisplay)}
                    disabled={isPending}
                    className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#222] hover:bg-[#333] transition-colors group/btn border border-white/5 disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={`text-blue-400 ${isPending ? 'animate-spin' : 'group-hover/btn:rotate-180'} transition-transform duration-500`} />
                    <span className="font-medium text-gray-200">Force Reload</span>
                </button>

                <button
                    onClick={() => handleAction('Force Logout', forceLogoutDisplay)}
                    disabled={isPending}
                    className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#222] hover:bg-red-500/10 transition-colors group/btn border border-white/5 border-red-500/20 disabled:opacity-50"
                >
                    <LogOut size={18} className="text-red-400" />
                    <span className="font-medium text-red-400">Force Logout</span>
                </button>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!showPasswordForm && !showRenameForm ? (
                        <>
                            <button
                                onClick={() => handleAction('Reset to Default Password', resetToDefaultPassword)}
                                disabled={isPending}
                                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#222] hover:bg-yellow-500/10 transition-colors group/btn border border-white/5 border-yellow-500/20"
                            >
                                <RefreshCcw size={18} className="text-yellow-400" />
                                <span className="font-medium text-yellow-400">Reset to Default</span>
                            </button>
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                disabled={isPending}
                                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#222] hover:bg-blue-500/10 transition-colors group/btn border border-white/5 border-blue-500/20"
                            >
                                <Lock size={18} className="text-blue-400" />
                                <span className="font-medium text-blue-400">Set New Password</span>
                            </button>
                            <button
                                onClick={() => {
                                    setNewUsername(displayUser.username);
                                    setShowRenameForm(true);
                                }}
                                disabled={isPending}
                                className="md:col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl bg-[#222] hover:bg-purple-500/10 transition-colors group/btn border border-white/5 border-purple-500/20"
                            >
                                <Edit size={18} className="text-purple-400" />
                                <span className="font-medium text-purple-400">Rename Display Unit</span>
                            </button>
                        </>
                    ) : showPasswordForm ? (
                        <form onSubmit={handlePasswordReset} className="md:col-span-2 bg-[#1a1a1a] p-4 rounded-xl border border-blue-500/20 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Set New Password</h4>
                                <button type="button" onClick={() => setShowPasswordForm(false)} className="text-gray-500 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password..."
                                    className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                    minLength={4}
                                />
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-6 py-2 rounded-lg font-medium transition-colors border border-blue-500/20"
                                >
                                    {isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRename} className="md:col-span-2 bg-[#1a1a1a] p-4 rounded-xl border border-purple-500/20 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Rename Display Unit</h4>
                                <button type="button" onClick={() => setShowRenameForm(false)} className="text-gray-500 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Enter new username (e.g. 002)..."
                                    className="flex-1 bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    required
                                    minLength={2}
                                />
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-6 py-2 rounded-lg font-medium transition-colors border border-purple-500/20"
                                >
                                    {isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                        onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    />
                    <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-zoom-in overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-3xl" />

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Verification</h3>
                                <p className="text-sm text-gray-400">Please confirm your action</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-8 leading-relaxed">
                            {confirmModal.title}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-3 rounded-xl bg-[#222] hover:bg-[#333] text-gray-300 font-medium transition-colors border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
