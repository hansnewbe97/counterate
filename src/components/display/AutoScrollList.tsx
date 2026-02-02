"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface AutoScrollListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    speed?: number; // Pixels per frame (approx 60fps), e.g., 0.5 is slow
    className?: string;
    gap?: number;
}

export function AutoScrollList<T extends { id?: string }>({
    items,
    renderItem,
    speed = 0.5,
    className = "",
    gap = 0
}: AutoScrollListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (containerRef.current && contentRef.current) {
                // If content height > container height, enable scroll
                setShouldScroll(contentRef.current.scrollHeight > containerRef.current.clientHeight);
            }
        };

        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [items]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden relative ${className}`}
            style={{ height: '100%' }}
        >
            {shouldScroll ? (
                // CSS Animation Wrapper
                <div
                    className="flex flex-col animate-scroll-vertical"
                    style={{
                        gap,
                        // Calculate duration based on item count to maintain consistent speed
                        // Base speed: 5 seconds per item roughly, adjust as needed or use pure speed prop
                        animationDuration: `${items.length * (10 / speed)}s`
                    }}
                >
                    <style jsx global>{`
                        @keyframes scroll-vertical {
                            0% { transform: translate3d(0, 0, 0); }
                            100% { transform: translate3d(0, -50%, 0); }
                        }
                        .animate-scroll-vertical {
                            animation: scroll-vertical linear infinite;
                            will-change: transform;
                        }
                    `}</style>
                    {/* Render items twice for seamless loop */}
                    {items.map((item, index) => renderItem(item, index))}
                    {items.map((item, index) => renderItem(item, index + items.length))}
                </div>
            ) : (
                // Static List if no scroll needed
                <div className="flex flex-col" style={{ gap }}>
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            )}
        </div>
    );
}
