'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black text-[#D4AF37] flex flex-col items-center justify-center h-screen w-screen p-4 text-center font-sans">
                <h2 className="text-3xl font-bold mb-4">Critical System Error</h2>
                <p className="mb-8 text-gray-400 max-w-md">
                    The application encountered a critical error and could not load.
                    This is usually due to a server configuration issue.
                </p>
                <div className="bg-white/10 p-4 rounded mb-8 text-left overflow-auto max-w-full max-h-[200px] text-xs font-mono text-red-400">
                    {error.message || "Unknown error"}
                </div>
                <button
                    onClick={() => reset()}
                    className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#b08d2b] transition-colors"
                >
                    Attempt Recovery
                </button>
            </body>
        </html>
    );
}
