"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCameraLensLine,
  RiCheckFill,
  RiAlertFill,
  RiRefreshLine,
  RiShieldCheckFill,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import {
  extractFaceFromVideo,
  averageFaceDescriptors,
  compareFaceDescriptors,
  parseFaceDescriptor,
  FaceDescriptorPayload,
  FACE_MATCH_THRESHOLD,
} from "@/lib/faceRecognition";
import { AdminUserItem } from "@/lib/adminAuth";

export interface EnrolledFaceCandidate {
  user: AdminUserItem;
  descriptor: FaceDescriptorPayload;
  photoData?: string;
}

interface FaceCameraModalProps {
  isOpen: boolean;
  mode: "enroll" | "verify";
  targetUser?: AdminUserItem | null;
  enrolledCandidates?: EnrolledFaceCandidate[];
  onClose: () => void;
  onEnrollSuccess?: (result: { descriptorJson: string; photoDataUrl: string }) => void;
  onVerifySuccess?: (result: { matchedUser: AdminUserItem; similarity: number }) => void;
}

export default function FaceCameraModal({
  isOpen,
  mode,
  targetUser,
  enrolledCandidates = [],
  onClose,
  onEnrollSuccess,
  onVerifySuccess,
}: FaceCameraModalProps) {
  const { tr } = useLang();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanState, setScanState] = useState<"scanning" | "success" | "failed">("scanning");
  const [matchedPreview, setMatchedPreview] = useState<{
    username: string;
    name?: string;
    similarity: number;
    photo?: string;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let cancelled = false;
    setCameraError("");
    setScanProgress(0);
    setScanState("scanning");
    setMatchedPreview(null);
    setStatusMessage(
      tr(
        "Opening front camera…",
        "Membuka kamera depan…",
        "Mambukak kamera muko…"
      )
    );

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError(
            tr(
              "Camera API is not supported on this browser or connection is not HTTPS.",
              "Kamera tidak didukung di browser ini atau koneksi belum HTTPS.",
              "Kamera indak didukuang di browser ko."
            )
          );
          setScanState("failed");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setCameraReady(true);
          setStatusMessage(
            tr(
              "Position your face inside the oval frame",
              "Posisikan wajah Anda tepat di dalam bingkai oval",
              "Posisikan wajah Sanak di dalam bingkai oval"
            )
          );
        }
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        setCameraError(
          e?.name === "NotAllowedError"
            ? tr(
                "Camera permission denied. Please allow camera access in your browser settings.",
                "Izin kamera ditolak. Silakan izinkan akses kamera pada pengaturan browser HP Anda.",
                "Izin kamera ditolak. Izinkan akses kamera di browser HP Sanak."
              )
            : e?.message ||
                tr(
                  "Failed to open smartphone front camera.",
                  "Gagal membuka kamera depan smartphone.",
                  "Gagal mambukak kamera muko."
                )
        );
        setScanState("failed");
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, retryCount]);

  // Continuous frame scanning loop once camera is ready
  useEffect(() => {
    if (!isOpen || !cameraReady || scanState !== "scanning") return;

    const collectedDescriptors: FaceDescriptorPayload[] = [];
    let latestPhoto = "";
    let attempts = 0;
    const requiredFrames = 5;
    const maxVerifyAttempts = 22;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const result = extractFaceFromVideo(video);
      if (!result.valid || !result.descriptor) {
        if (result.reason === "too_dark") {
          setStatusMessage(
            tr(
              "Lighting is too dark. Move to a brighter area.",
              "Cahaya terlalu gelap. Pindah ke tempat yang lebih terang.",
              "Cahayo talalu kalam. Cari tampek nan tarang."
            )
          );
        } else if (result.reason === "too_bright") {
          setStatusMessage(
            tr(
              "Too much glare. Avoid direct backlight.",
              "Cahaya terlalu silau. Hindari cahaya langsung dari belakang.",
              "Cahayo talalu silau."
            )
          );
        } else {
          setStatusMessage(
            tr(
              "Center your face straight toward the camera…",
              "Arahkan wajah lurus ke tengah bingkai kamera…",
              "Arahkan wajah luruih ka tangah kamera…"
            )
          );
        }
        return;
      }

      collectedDescriptors.push(result.descriptor);
      if (result.photoDataUrl) {
        latestPhoto = result.photoDataUrl;
      }

      if (mode === "enroll") {
        const pct = Math.min(100, Math.round((collectedDescriptors.length / requiredFrames) * 100));
        setScanProgress(pct);
        setStatusMessage(
          tr(
            `Scanning facial features… ${pct}%`,
            `Memindai struktur wajah… ${pct}%`,
            `Mamindai wajah… ${pct}%`
          )
        );

        if (collectedDescriptors.length >= requiredFrames) {
          clearInterval(interval);
          const finalDescriptor = averageFaceDescriptors(collectedDescriptors);

          // Ensure this face is not already registered to a DIFFERENT user!
          const otherUsers = enrolledCandidates.filter(
            (c) => !targetUser || c.user.id !== targetUser.id
          );
          const duplicateCandidate = otherUsers.find(
            (c) => compareFaceDescriptors(finalDescriptor, c.descriptor) >= 0.84
          );

          if (duplicateCandidate) {
            setScanState("failed");
            setCameraError(
              tr(
                `This face is already registered to @${duplicateCandidate.user.username}. Each user must register their own distinct face!`,
                `Wajah ini sudah terdaftar pada akun @${duplicateCandidate.user.username}. Setiap user wajib mendaftarkan wajah masing-masing yang berbeda!`,
                `Wajah ko lah tadaftar di akun @${duplicateCandidate.user.username}. Satiap user wajib pakai wajah surang-surang!`
              )
            );
            return;
          }

          setScanState("success");
          setMatchedPreview({
            username: targetUser?.username || "admin",
            name: targetUser?.name,
            similarity: 100,
            photo: latestPhoto,
          });
          setStatusMessage(
            tr(
              "Face enrolled successfully!",
              "Wajah berhasil didaftarkan!",
              "Wajah barasil didaftarkan!"
            )
          );

          setTimeout(() => {
            stopCamera();
            if (onEnrollSuccess) {
              onEnrollSuccess({
                descriptorJson: JSON.stringify(finalDescriptor),
                photoDataUrl: latestPhoto,
              });
            }
          }, 900);
        }
      } else {
        // mode === "verify"
        attempts++;
        const pct = Math.min(95, Math.round((collectedDescriptors.length / 4) * 100));
        setScanProgress(pct);
        setStatusMessage(
          tr(
            "Matching face with registered admin accounts…",
            "Mencocokkan wajah dengan akun admin terdaftar…",
            "Mancocokkan wajah jo akun admin tadaftar…"
          )
        );

        if (collectedDescriptors.length >= 3) {
          const liveAvg = averageFaceDescriptors(collectedDescriptors.slice(-3));

          let bestCandidate: EnrolledFaceCandidate | null = null;
          let bestScore = 0;

          for (const cand of enrolledCandidates) {
            const score = compareFaceDescriptors(liveAvg, cand.descriptor);
            if (score > bestScore) {
              bestScore = score;
              bestCandidate = cand;
            }
          }

          if (bestCandidate && bestScore >= FACE_MATCH_THRESHOLD) {
            clearInterval(interval);
            setScanProgress(100);
            setScanState("success");
            const simPercent = Math.min(99, Math.round(bestScore * 100));
            setMatchedPreview({
              username: bestCandidate.user.username,
              name: bestCandidate.user.name,
              similarity: simPercent,
              photo: latestPhoto || bestCandidate.photoData,
            });
            setStatusMessage(
              tr(
                `Face verified: @${bestCandidate.user.username} (${simPercent}% match)`,
                `Wajah cocok: @${bestCandidate.user.username} (${simPercent}% cocok)`,
                `Wajah cocok: @${bestCandidate.user.username} (${simPercent}%)`
              )
            );

            const winner = bestCandidate.user;
            setTimeout(() => {
              stopCamera();
              if (onVerifySuccess) {
                onVerifySuccess({ matchedUser: winner, similarity: simPercent });
              }
            }, 850);
            return;
          }

          if (attempts >= maxVerifyAttempts) {
            clearInterval(interval);
            setScanState("failed");
            setCameraError(
              tr(
                "Face not recognized! Your face does not match any registered admin user.",
                "Wajah tidak dikenali! Wajah Anda tidak cocok dengan akun admin yang terdaftar.",
                "Wajah indak dikanali! Wajah Sanak indak cocok jo akun admin nan tadaftar."
              )
            );
          }
        }
      }
    }, 320);

    return () => clearInterval(interval);
  }, [isOpen, cameraReady, scanState, mode, targetUser, enrolledCandidates]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-sm rounded-3xl bg-[#0b0f14] border border-teal-500/30 text-white p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Ambient Top Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 rounded-full bg-[#16b09f]/20 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#16b09f]/15 border border-[#16b09f]/40 text-[#16b09f] flex items-center justify-center">
                <RiCameraLensLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  {mode === "enroll"
                    ? tr(
                        `Enroll Face: @${targetUser?.username || "admin"}`,
                        `Daftarkan Wajah: @${targetUser?.username || "admin"}`,
                        `Daftarkan Wajah: @${targetUser?.username || "admin"}`
                      )
                    : targetUser
                    ? tr(
                        `Verify Face: @${targetUser.username}`,
                        `Uji Wajah: @${targetUser.username}`,
                        `Uji Wajah: @${targetUser.username}`
                      )
                    : tr(
                        "Face Recognition Login",
                        "Login Pengenalan Wajah",
                        "Login Pangenalan Wajah"
                      )}
                </h3>
                <p className="text-[11px] font-mono text-teal-400">
                  {mode === "enroll"
                    ? tr(
                        "1 User = 1 Unique Face Signature",
                        "1 Akun = 1 Wajah Berbeda",
                        "1 Akun = 1 Wajah Babeda"
                      )
                    : tr(
                        "Live Front Camera Verification",
                        "Verifikasi Kamera Depan Langsung",
                        "Verifikasi Kamera Muko"
                      )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close camera"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Viewport with Oval Face Guide */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Darkened Vignette outside Face Oval */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 37% 46% at 50% 50%, transparent 96%, rgba(8, 12, 18, 0.78) 100%)",
              }}
            />

            {/* Oval Face Alignment Ring */}
            <div
              className={`w-[68%] h-[82%] rounded-full border-2 transition-colors duration-300 relative pointer-events-none ${
                scanState === "success"
                  ? "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  : scanState === "failed"
                  ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                  : "border-[#16b09f] shadow-[0_0_25px_rgba(22,176,159,0.35)]"
              }`}
            >
              {/* Animated Laser Line during scanning */}
              {cameraReady && scanState === "scanning" && (
                <motion.div
                  animate={{ top: ["12%", "88%", "12%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-[#16b09f] to-transparent shadow-[0_0_12px_#16b09f]"
                />
              )}
            </div>

            {/* Success Overlay */}
            {scanState === "success" && (
              <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                {matchedPreview?.photo && (
                  <img
                    src={matchedPreview.photo}
                    alt={matchedPreview.username}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-lg mb-2.5"
                  />
                )}
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg mb-2">
                  <RiCheckFill className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  @{matchedPreview?.username}
                </p>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  {statusMessage}
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {scanState === "failed" && (
              <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-3">
                  <RiAlertFill className="w-6 h-6" />
                </div>
                <p className="text-xs text-rose-300 font-mono leading-relaxed">
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#16b09f] hover:bg-[#0d9488] text-black font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <RiRefreshLine className="w-4 h-4" />
                  <span>{tr("Try Again", "Coba Lagi", "Cubo Lai")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar & Status Footer */}
          <div className="mt-4 space-y-2.5">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  scanState === "failed"
                    ? "bg-rose-500"
                    : scanState === "success"
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-[#0d9488] to-[#16b09f]"
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 truncate pr-2">{statusMessage}</span>
              <span className="text-[#16b09f] font-bold shrink-0">{scanProgress}%</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1 text-teal-400">
                <RiShieldCheckFill className="w-3.5 h-3.5" />
                <span>Biometric Face Scanner</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="text-neutral-400 hover:text-white underline cursor-pointer"
              >
                {tr("Cancel", "Batal", "Batal")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
