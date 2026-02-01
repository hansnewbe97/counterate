/**
 * Normalizes various YouTube URL formats into a standard embed URL.
 * Supports:
 * - youtu.be/VIDEO_ID (Share links)
 * - youtube.com/watch?v=VIDEO_ID (Standard links)
 * - youtube.com/shorts/VIDEO_ID (Shorts)
 * - youtube.com/live/VIDEO_ID (Live streams)
 * - youtube.com/embed/VIDEO_ID (Embed links)
 */
export function normalizeVideoUrl(url: string): string {
    if (!url) return "";

    // Trim whitespace
    const trimmedUrl = url.trim();

    // 1. Handle youtu.be/VIDEO_ID
    const shortMatch = trimmedUrl.match(/youtu\.be\/([^?&#/]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // 2. Handle youtube.com/watch?v=VIDEO_ID
    const longMatch = trimmedUrl.match(/[?&]v=([^?&#/]+)/);
    if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

    // 3. Handle youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmedUrl.match(/youtube\.com\/shorts\/([^?&#/]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    // 4. Handle youtube.com/live/VIDEO_ID
    const liveMatch = trimmedUrl.match(/youtube\.com\/live\/([^?&#/]+)/);
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;

    // 5. Handle youtube.com/embed/VIDEO_ID (Already normalized)
    const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([^?&#/]+)/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

    // 6. Return as is if it's already an embed link format or a direct MP4/other link
    return trimmedUrl;
}
