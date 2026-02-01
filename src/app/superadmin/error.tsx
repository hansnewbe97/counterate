'use client';

export default function SuperAdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Terjadi Kesalahan</h2>
            <p className="mb-4 text-slate-400 max-w-md">
                Halaman admin tidak dapat dimuat. Kemungkinan ada masalah koneksi ke server database.
            </p>
            <div className="bg-black/50 p-4 rounded mb-6 text-left overflow-auto max-w-full max-h-[150px] text-xs font-mono text-red-400">
                {error.message || "Unknown error"}
            </div>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#b08d2b] transition-colors"
            >
                Coba Lagi
            </button>
        </div>
    );
}
