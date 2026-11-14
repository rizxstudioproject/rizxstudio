"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiArrowTopRightOnSquare, HiExclamationTriangle, HiLockClosed } from "react-icons/hi2";
import { extractGoogleDriveFileId, getMediaFallbackUrls } from "@/lib/mediaService";

interface CanvasMediaImageProps {
  src: string;
  alt?: string;
  title?: string;
  gdriveUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  isAdmin?: boolean;
  isLight?: boolean;
  onImageLoad?: (naturalWidth: number, naturalHeight: number) => void;
  onContextMenu?: React.MouseEventHandler<HTMLImageElement>;
}

/**
 * Renders a canvas image with no-referrer loading, multi-tier Google Drive URL fallbacks,
 * and a visible placeholder card if all media endpoints fail (e.g. restricted Drive permissions).
 */
export default function CanvasMediaImage({
  src,
  alt = "Image",
  title,
  gdriveUrl,
  className = "w-full h-full object-cover pointer-events-none select-none",
  style,
  isAdmin = false,
  isLight = false,
  onImageLoad,
  onContextMenu,
}: CanvasMediaImageProps) {
  const candidateUrls = useMemo(() => {
    const trimmed = (src || "").trim();
    if (!trimmed) return [];
    const fallbacks = getMediaFallbackUrls(trimmed);
    // Keep the exact incoming src first if it isn't already the first fallback
    return Array.from(new Set([trimmed, ...fallbacks]));
  }, [src]);

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setAttemptIndex(0);
    setHasFailed(false);
  }, [src]);

  const activeSrc = candidateUrls[attemptIndex] || "";
  const driveId = useMemo(
    () => extractGoogleDriveFileId(gdriveUrl || src || ""),
    [gdriveUrl, src]
  );
  const resolvedDriveOpenUrl =
    gdriveUrl || (driveId ? `https://drive.google.com/file/d/${driveId}/view` : "");

  if (!activeSrc || hasFailed) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 text-center select-none border ${
          isLight
            ? "bg-slate-100/95 border-slate-300 text-slate-700"
            : "bg-[#181a22]/95 border-amber-500/35 text-neutral-200"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 border ${
            driveId
              ? "bg-amber-500/15 border-amber-400/30 text-amber-400"
              : "bg-rose-500/15 border-rose-400/30 text-rose-400"
          }`}
        >
          {driveId ? (
            <HiLockClosed className="w-5 h-5" />
          ) : (
            <HiExclamationTriangle className="w-5 h-5" />
          )}
        </div>
        <p className="text-xs font-bold line-clamp-2 max-w-[90%]">
          {title || alt || "Media"}
        </p>
        <p
          className={`text-[10px] mt-1 leading-relaxed max-w-[260px] ${
            isLight ? "text-slate-500" : "text-neutral-400"
          }`}
        >
          {driveId
            ? isAdmin
              ? 'Gambar Google Drive terkunci / belum publik. Ubah izin share ke "Anyone with the link".'
              : "Media Google Drive tidak dapat diakses publik."
            : "Gambar gagal dimuat."}
        </p>
        {isAdmin && resolvedDriveOpenUrl && (
          <a
            href={resolvedDriveOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-semibold pointer-events-auto cursor-pointer transition-colors"
          >
            <span>Cek Izin Drive</span>
            <HiArrowTopRightOnSquare className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      draggable={false}
      decoding="sync"
      loading="eager"
      referrerPolicy="no-referrer"
      onContextMenu={onContextMenu}
      onLoad={(e) => {
        const target = e.currentTarget;
        if (target.naturalWidth && target.naturalHeight) {
          onImageLoad?.(target.naturalWidth, target.naturalHeight);
        }
      }}
      onError={() => {
        if (attemptIndex + 1 < candidateUrls.length) {
          setAttemptIndex((prev) => prev + 1);
        } else {
          setHasFailed(true);
        }
      }}
      className={className}
      style={style}
    />
  );
}
