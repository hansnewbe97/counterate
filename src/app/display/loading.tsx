export default function Loading() {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-[#D4AF37]">
            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-serif font-bold tracking-widest animate-pulse">LOADING DISPLAY...</h2>
        </div>
    );
}
