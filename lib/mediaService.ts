/**
 * Media Service — Utilities for parsing, normalizing, and resolving media URLs
 * including comprehensive Google Drive direct image conversion and multi-tier fallbacks.
 */

/**
 * Extracts the file ID from various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://docs.google.com/uc?id=FILE_ID
 * - Standalone Google Drive file ID (25-60 chars)
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=([a-zA-Z0-9_-]+)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: googleusercontent.com/d/([a-zA-Z0-9_-]+)
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  // Pattern 4: /d/([a-zA-Z0-9_-]{20,})
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 5: standalone Google Drive ID (typically 25+ alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Checks if a string is a Google Drive link or file ID.
 */
export function isGoogleDriveUrl(url: string): boolean {
  return extractGoogleDriveFileId(url) !== null;
}

/**
 * Robust YouTube video ID parser for various URL structures
 */
export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId || typeof urlOrId !== "string") return "";
  const trimmed = urlOrId.trim();

  // If already an 11-char ID with valid characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Check img.youtube.com or i.ytimg.com/vi/{ID}
  const thumbMatch = trimmed.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
  if (thumbMatch && thumbMatch[1]) {
    return thumbMatch[1];
  }

  // Matches youtube.com/shorts/{ID}
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  // Matches youtu.be/{ID}
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // Matches ?v={ID} or &v={ID}
  const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vParamMatch && vParamMatch[1]) {
    return vParamMatch[1];
  }

  // Matches /embed/{ID} or /v/{ID} or /live/{ID}
  const pathMatch = trimmed.match(/\/(?:embed|v|live)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  return "";
}

/**
 * Converts any Google Drive link, YouTube video URL, or media URL into a high-speed direct image URL.
 * Defaults to Google's global CDN endpoint: https://lh3.googleusercontent.com/d/{ID}
 * Defaults to YouTube's global CDN endpoint: https://i.ytimg.com/vi/{ID}/hqdefault.jpg
 */
export function normalizeMediaUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    // '=s0' forces Google's CDN to deliver the 100% full original resolution instead of the default 512px downscaled thumbnail
    return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
  }
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  }
  return trimmed;
}

/**
 * Returns ordered fallback URLs for an image to ensure it displays without errors.
 */
export function getMediaFallbackUrls(url: string): string[] {
  if (!url || typeof url !== "string") return [];
  const trimmed = url.trim();
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return [
      `https://lh3.googleusercontent.com/d/${fileId}=s0`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w3840`,
      `https://lh3.googleusercontent.com/d/${fileId}=w3840`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/uc?id=${fileId}`,
    ];
  }
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return [
      `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${ytId}/0.jpg`,
    ];
  }
  return [trimmed];
}
