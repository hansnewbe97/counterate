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
    // Always scroll if we have items, regardless of height, to ensure "Live" feel
    // unless explicitly disabled or empty
    const shouldScroll = items.length > 0;

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
                        // Fix speed: e.g. 50px per second. Total height = items * height.
                        // Let's approximate: 3s per item? 
                        // If speed is 0.5 (from props), previously it was pixels/frame. 
                        // Now let's try a standard duration based on list length.
                        animationDuration: `${items.length * 5}s`
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
                        /* Pause on hover for readability */
                        .animate-scroll-vertical:hover {
                            animation-play-state: paused;
                        }
                    `}</style>
                    {/* Render items twice for seamless loop */}
                    {items.map((item, index) => renderItem(item, index))}
                    {items.map((item, index) => renderItem(item, index + items.length))}
                </div>
            ) : (
                <div className="flex flex-col" style={{ gap }}>
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            )}
        </div>
    );
}
