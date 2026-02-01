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

    useEffect(() => {
        if (!shouldScroll || !containerRef.current) return;

        const container = containerRef.current;
        let animationFrameId: number;
        let scrollTop = 0;

        const scroll = () => {
            scrollTop += speed;

            // If we've scrolled past the first set of items (half the total scroll height), reset to 0
            // The content is [Items] [Items], so scrollHeight/2 is the height of one set.
            if (scrollTop >= container.scrollHeight / 2) {
                scrollTop = 0;
            }

            container.scrollTop = scrollTop;
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => cancelAnimationFrame(animationFrameId);
    }, [shouldScroll, speed]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden relative ${className}`}
            style={{ height: '100%' }}
        >
            {/* 
                We render the items twice to create a seamless loop.
                When the first set scrolls out of view, we reset to the top.
            */}
            <div ref={contentRef} className="flex flex-col" style={{ gap }}>
                {items.map((item, index) => renderItem(item, index))}
                {shouldScroll && items.map((item, index) => renderItem(item, index + items.length))}
            </div>

            {/* Gradient Mask for top/bottom fading only if scrolling */}
            {shouldScroll && (
                <>
                    {/* Gradients removed for visibility */}
                </>
            )}
        </div>
    );
}
