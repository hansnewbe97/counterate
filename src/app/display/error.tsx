'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-[#D4AF37]">
            <h2 className="text-2xl font-serif font-bold mb-4">Something went wrong!</h2>
            <p className="mb-6 text-gray-400">Application error: {error.message || "Unknown error"}</p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-6 py-2 border border-[#D4AF37] rounded-md hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
