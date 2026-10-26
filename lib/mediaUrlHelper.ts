/**
 * Media URL Helper — Google Drive, YouTube, & Direct Storage Support
 * Automatically transforms Google Drive & YouTube links into direct high-res image thumbnails.
 */

export interface ParsedMediaUrl {
  type: "gdrive" | "youtube" | "direct" | "empty";
  originalUrl: string;
  resolvedThumbnailUrl: string;
  driveId?: string;
  youtubeId?: string;
  watchUrl?: string;
}

/**
 * Extracts Google Drive file ID from various sharing link formats
 * e.g.
 * - https://drive.google.com/file/d/1X-abcDEF12345/view?usp=sharing
 * - https://drive.google.com/open?id=1X-abcDEF12345
 * - https://drive.google.com/uc?id=1X-abcDEF12345
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("drive.google.com") && !url.includes("docs.google.com")) return null;

  const matchFile = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) return matchFile[1];

  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  return null;
}

/**
 * Extracts YouTube Video ID from watch, share, short, or embed links
 * e.g.
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Parses any URL into structured media info and resolves the best direct thumbnail URL
 */
export function parseMediaUrl(url: string): ParsedMediaUrl {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return {
      type: "empty",
      originalUrl: "",
      resolvedThumbnailUrl: "",
    };
  }

  // 1. Check Google Drive Link
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: "gdrive",
      originalUrl: trimmed,
      // Google's direct CDN image display:
      resolvedThumbnailUrl: `https://lh3.googleusercontent.com/d/${driveId}`,
      driveId,
    };
  }

  // 2. Check YouTube Video Link
  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      type: "youtube",
      originalUrl: trimmed,
      resolvedThumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      youtubeId,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    };
  }

  // 3. Direct Image URL (HTTPS, Unsplash, Supabase, etc.)
  return {
    type: "direct",
    originalUrl: trimmed,
    resolvedThumbnailUrl: trimmed,
  };
}

/**
 * Helper to ensure a thumbnail URL is resolved to a displayable image URL
 */
export function resolveThumbnailUrl(url?: string | null): string {
  if (!url) return "";
  const parsed = parseMediaUrl(url);
  return parsed.resolvedThumbnailUrl;
}
