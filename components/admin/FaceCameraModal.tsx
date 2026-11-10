"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCheckFill,
  RiAlertFill,
  RiRefreshLine,
  RiShieldCheckFill,
  RiFocus3Line,
  RiFlashlightFill,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import {
  ensureFaceRecognitionModelsLoaded,
  extractFaceFromVideoAsync,
  averageFaceDescriptors,
  compareFaceDescriptors,
  computeFaceEuclideanDistance,
  FaceDescriptorPayload,
  FaceTracking3DState,
  FACE_MATCH_THRESHOLD,
  FACENET_MAX_DISTANCE,
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

// 68-Landmark Triangulation & Contour Connections for Real-Time 3D Biometric Mesh
const LANDMARK_68_EDGES: [number, number][] = [
  // Jawline contour (0..16)
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16],
  // Left eyebrow (17..21)
  [17, 18], [18, 19], [19, 20], [20, 21],
  // Right eyebrow (22..26)
  [22, 23], [23, 24], [24, 25], [25, 26],
  // Nose bridge & tip (27..35)
  [27, 28], [28, 29], [29, 30], [30, 31], [30, 33], [30, 35],
  [31, 32], [32, 33], [33, 34], [34, 35], [27, 31], [27, 35],
  // Left eye orbit (36..41)
  [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 36],
  // Right eye orbit (42..47)
  [42, 43], [43, 44], [44, 45], [45, 46], [46, 47], [47, 42],
  // Outer mouth contour (48..59)
  [48, 49], [49, 50], [50, 51], [51, 52], [52, 53], [53, 54],
  [54, 55], [55, 56], [56, 57], [57, 58], [58, 59], [59, 48],
  // 3D Structural Cross-Triangulation (Brows -> Eyes -> Nose -> Cheeks -> Mouth -> Jaw)
  [21, 27], [22, 27], [17, 36], [19, 37], [21, 39],
  [22, 42], [24, 44], [26, 45], [39, 27], [42, 27],
  [39, 31], [42, 35], [36, 0], [45, 16], [41, 31], [46, 35],
  [31, 48], [33, 51], [35, 54], [36, 2], [45, 14],
  [48, 4], [54, 12], [57, 8], [48, 6], [54, 10],
];

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
  const meshCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackingRef = useRef<FaceTracking3DState>({
    detected: false,
    cx: 0.5,
    cy: 0.5,
    radius: 0.28,
    depthZ: 380,
    yaw: 0,
    pitch: 0,
    brightness: 110,
    lowLightBoost: false,
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanState, setScanState] = useState<"scanning" | "success" | "failed">("scanning");
  const [liveTelemetry, setLiveTelemetry] = useState<{
    depthZ: number;
    yaw: number;
    pitch: number;
    lowLightBoost: boolean;
    liveMatchPct: number;
    euclidDist: number | null;
    isStrangerWarning: boolean;
  }>({
    depthZ: 380,
    yaw: 0,
    pitch: 0,
    lowLightBoost: false,
    liveMatchPct: 0,
    euclidDist: null,
    isStrangerWarning: false,
  });
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

  // Start smartphone front camera & load Neural FaceNet 128-D models
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
    setLiveTelemetry({
      depthZ: 380,
      yaw: 0,
      pitch: 0,
      lowLightBoost: false,
      liveMatchPct: 0,
      euclidDist: null,
      isStrangerWarning: false,
    });
    setStatusMessage(
      tr(
        "Loading Neural 3D FaceNet AI & opening camera…",
        "Memuat AI Neural 3D FaceNet & membuka kamera…",
        "Mamuat AI Neural 3D FaceNet & mambukak kamera…"
      )
    );

    const initScanner = async () => {
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

        const [stream, aiLoaded] = await Promise.all([
          navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 640 },
            },
            audio: false,
          }),
          ensureFaceRecognitionModelsLoaded(),
        ]);

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (!aiLoaded) {
          stream.getTracks().forEach((t) => t.stop());
          setCameraError(
            tr(
              "Failed to load Neural 3D FaceNet models. Please check your internet connection and try again.",
              "Gagal memuat model AI Neural 3D FaceNet. Periksa koneksi internet Anda lalu coba lagi.",
              "Gagal mamuat model AI Neural 3D FaceNet. Parikso koneksi internet Sanak."
            )
          );
          setScanState("failed");
          return;
        }

        setModelsReady(true);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setCameraReady(true);
          setStatusMessage(
            tr(
              "Look straight at the camera for 3D Neural Scan",
              "Tatap lurus ke kamera untuk pemindaian 3D Neural",
              "Tatap luruih ka kamera untuak pindaian 3D Neural"
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

    initScanner();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, retryCount]);

  // 60FPS Real 68-Landmark 3D Wireframe Mesh Renderer on <canvas>
  useEffect(() => {
    if (!isOpen || !cameraReady) return;
    let animId = 0;
    let phase = 0;

    const renderMesh = () => {
      const canvas = meshCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          phase += 0.08;

          const t = trackingRef.current;
          const pts = t.landmarks68;

          if (t.detected && pts && pts.length === 68) {
            const isWarning = liveTelemetry.isStrangerWarning && mode === "verify";
            const strokeBase =
              scanState === "success"
                ? "rgba(52, 211, 153, 0.72)"
                : isWarning
                ? "rgba(244, 63, 94, 0.72)"
                : "rgba(22, 176, 159, 0.68)";

            // Draw triangulated 68-point anatomical wireframe edges
            ctx.lineWidth = 1.15;
            ctx.strokeStyle = strokeBase;
            for (const [i, j] of LANDMARK_68_EDGES) {
              const p1 = pts[i];
              const p2 = pts[j];
              if (!p1 || !p2) continue;
              ctx.beginPath();
              ctx.moveTo(p1.x * w, p1.y * h);
              ctx.lineTo(p2.x * w, p2.y * h);
              ctx.stroke();
            }

            // Draw 68 anatomical landmark nodes
            for (let idx = 0; idx < pts.length; idx++) {
              const p = pts[idx];
              const isKeyFeature =
                idx === 30 || idx === 36 || idx === 39 || idx === 42 || idx === 45 || idx === 48 || idx === 54 || idx === 8;
              const pulse = isKeyFeature ? 1 + 0.25 * Math.sin(phase + idx) : 1;
              const r = (isKeyFeature ? 2.6 : 1.7) * pulse;
              ctx.fillStyle =
                scanState === "success"
                  ? "#34d399"
                  : isWarning
                  ? "#fb7185"
                  : isKeyFeature
                  ? "#5eead4"
                  : "#16b09f";
              ctx.beginPath();
              ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
              ctx.fill();
            }

            // Draw 3D target reticle brackets around detected face
            const centerX = t.cx * w;
            const centerY = t.cy * h;
            const boxW = Math.max(95, t.radius * w * 2.1);
            const boxH = Math.max(115, t.radius * h * 2.4);
            const bx = centerX - boxW / 2;
            const by = centerY - boxH / 2;
            const corner = 18;
            ctx.strokeStyle =
              scanState === "success"
                ? "#34d399"
                : isWarning
                ? "#f43f5e"
                : "#2dd4bf";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(bx, by + corner);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + corner, by);
            ctx.moveTo(bx + boxW - corner, by);
            ctx.lineTo(bx + boxW, by);
            ctx.lineTo(bx + boxW, by + corner);
            ctx.moveTo(bx, by + boxH - corner);
            ctx.lineTo(bx, by + boxH);
            ctx.lineTo(bx + corner, by + boxH);
            ctx.moveTo(bx + boxW - corner, by + boxH);
            ctx.lineTo(bx + boxW, by + boxH);
            ctx.lineTo(bx + boxW, by + boxH - corner);
            ctx.stroke();
          } else {
            // Guide oval when waiting for a face to enter the camera frame
            ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w * 0.28, h * 0.36, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      animId = requestAnimationFrame(renderMesh);
    };

    animId = requestAnimationFrame(renderMesh);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, cameraReady, scanState, liveTelemetry.isStrangerWarning, mode]);

  // Continuous Neural 128-D FaceNet scanning & strict identity matching loop
  useEffect(() => {
    if (!isOpen || !cameraReady || !modelsReady || scanState !== "scanning") return;

    let isBusy = false;
    let cancelled = false;
    const collectedDescriptors: FaceDescriptorPayload[] = [];
    let latestPhoto = "";
    let verifyFaceFrames = 0;
    let consecutiveMatchFrames = 0;
    let lastMatchedUserId: string | null = null;
    const requiredEnrollFrames = 5;
    const requiredVerifyMatchFrames = 3;
    const maxVerifyFaceFrames = 10;

    const interval = setInterval(async () => {
      if (isBusy || cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      isBusy = true;
      try {
        const result = await extractFaceFromVideoAsync(video);
        if (cancelled) return;

        if (result.tracking) {
          trackingRef.current = result.tracking;
        }

        if (!result.valid || !result.descriptor) {
          if (result.reason === "low_symmetry") {
            setStatusMessage(
              tr(
                "Please look straight at the camera (do not turn sideways)",
                "Arahkan wajah lurus ke depan kamera (jangan miring)",
                "Arahkan wajah luruih ka muko kamera"
              )
            );
          } else if (result.reason === "too_dark") {
            setStatusMessage(
              tr(
                "Room is too dark. Please add more light.",
                "Ruangan terlalu gelap. Tambah pencahayaan.",
                "Ruangan talalu kalam."
              )
            );
          } else {
            setStatusMessage(
              tr(
                "Position your face clearly inside the camera frame…",
                "Posisikan wajah Anda dengan jelas di depan kamera…",
                "Posisikan wajah Sanak di muko kamera…"
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
          const pct = Math.min(
            100,
            Math.round((collectedDescriptors.length / requiredEnrollFrames) * 100)
          );
          setScanProgress(pct);
          setLiveTelemetry({
            depthZ: result.tracking?.depthZ || 380,
            yaw: result.tracking?.yaw || 0,
            pitch: result.tracking?.pitch || 0,
            lowLightBoost: !!result.tracking?.lowLightBoost,
            liveMatchPct: pct,
            euclidDist: 0,
            isStrangerWarning: false,
          });
          setStatusMessage(
            tr(
              `Scanning 128-D Neural FaceNet signature… ${pct}%`,
              `Memindai tanda tangan wajah 128-D Neural… ${pct}%`,
              `Mamindai wajah 128-D Neural… ${pct}%`
            )
          );

          if (collectedDescriptors.length >= requiredEnrollFrames) {
            clearInterval(interval);
            const finalDescriptor = averageFaceDescriptors(collectedDescriptors);

            // Prevent two different admin accounts from enrolling the same person's face!
            const otherUsers = enrolledCandidates.filter(
              (c) => !targetUser || c.user.id !== targetUser.id
            );
            const duplicateCandidate = otherUsers.find(
              (c) => computeFaceEuclideanDistance(finalDescriptor, c.descriptor) <= 0.46
            );

            if (duplicateCandidate) {
              setScanState("failed");
              setCameraError(
                tr(
                  `This face is already registered to @${duplicateCandidate.user.username}. Each admin user must register their own distinct face!`,
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
                "128-D Neural Face ID enrolled!",
                "Wajah 128-D Neural berhasil didaftarkan!",
                "Wajah 128-D Neural barasil didaftarkan!"
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
            }, 850);
          }
        } else {
          // mode === "verify": Strict 128-D Neural FaceNet Identity Verification
          verifyFaceFrames++;
          const liveAvg = averageFaceDescriptors(collectedDescriptors.slice(-3));

          let bestCandidate: EnrolledFaceCandidate | null = null;
          let bestScore = 0;
          let bestDist = Infinity;

          for (const cand of enrolledCandidates) {
            const dist = computeFaceEuclideanDistance(liveAvg, cand.descriptor);
            const score = compareFaceDescriptors(liveAvg, cand.descriptor);
            if (dist < bestDist) {
              bestDist = dist;
              bestScore = score;
              bestCandidate = cand;
            }
          }

          // Strict identity check: Euclidean distance MUST be <= FACENET_MAX_DISTANCE (0.43)
          // and score >= FACE_MATCH_THRESHOLD (0.76) — NEVER relaxed for single user!
          const isMatchFrame =
            !!bestCandidate &&
            bestDist <= FACENET_MAX_DISTANCE &&
            bestScore >= FACE_MATCH_THRESHOLD;

          if (isMatchFrame && bestCandidate) {
            if (lastMatchedUserId === bestCandidate.user.id) {
              consecutiveMatchFrames++;
            } else {
              lastMatchedUserId = bestCandidate.user.id;
              consecutiveMatchFrames = 1;
            }
          } else {
            consecutiveMatchFrames = 0;
            lastMatchedUserId = null;
          }

          const simPercent = Math.round(bestScore * 100);
          const progressPct = isMatchFrame
            ? Math.min(98, Math.round((consecutiveMatchFrames / requiredVerifyMatchFrames) * 100))
            : Math.min(95, Math.round((verifyFaceFrames / maxVerifyFaceFrames) * 100));

          setScanProgress(progressPct);
          setLiveTelemetry({
            depthZ: result.tracking?.depthZ || 380,
            yaw: result.tracking?.yaw || 0,
            pitch: result.tracking?.pitch || 0,
            lowLightBoost: !!result.tracking?.lowLightBoost,
            liveMatchPct: simPercent,
            euclidDist: Number.isFinite(bestDist) ? Number(bestDist.toFixed(2)) : null,
            isStrangerWarning: !isMatchFrame,
          });

          if (isMatchFrame && bestCandidate) {
            setStatusMessage(
              tr(
                `Verifying @${bestCandidate.user.username}… (${consecutiveMatchFrames}/${requiredVerifyMatchFrames})`,
                `Memverifikasi @${bestCandidate.user.username}… (${consecutiveMatchFrames}/${requiredVerifyMatchFrames})`,
                `Mamverifikasi @${bestCandidate.user.username}… (${consecutiveMatchFrames}/${requiredVerifyMatchFrames})`
              )
            );
          } else {
            setStatusMessage(
              tr(
                `Unregistered face detected (${simPercent}% match — min 76% required)`,
                `Wajah tidak cocok (${simPercent}% — minimal 76% untuk login)`,
                `Wajah indak cocok (${simPercent}% — minimal 76%)`
              )
            );
          }

          // Require 3 consecutive frames matching the exact same enrolled user within Euclidean distance <= 0.43
          if (consecutiveMatchFrames >= requiredVerifyMatchFrames && bestCandidate) {
            clearInterval(interval);
            setScanProgress(100);
            setScanState("success");
            setMatchedPreview({
              username: bestCandidate.user.username,
              name: bestCandidate.user.name,
              similarity: simPercent,
              photo: latestPhoto || bestCandidate.photoData,
            });
            setStatusMessage(
              tr(
                `Identity Verified: @${bestCandidate.user.username} (${simPercent}% match)`,
                `Identitas Wajah Cocok: @${bestCandidate.user.username} (${simPercent}%)`,
                `Identitas Wajah Cocok: @${bestCandidate.user.username} (${simPercent}%)`
              )
            );

            const winner = bestCandidate.user;
            setTimeout(() => {
              stopCamera();
              if (onVerifySuccess) {
                onVerifySuccess({ matchedUser: winner, similarity: simPercent });
              }
            }, 800);
            return;
          }

          if (verifyFaceFrames >= maxVerifyFaceFrames) {
            clearInterval(interval);
            setScanState("failed");
            setCameraError(
              tr(
                `Access Denied! Unregistered Face (${simPercent}% similarity, distance d=${Number.isFinite(bestDist) ? bestDist.toFixed(2) : "N/A"} > ${FACENET_MAX_DISTANCE}). Only registered admin faces can log in!`,
                `Akses Ditolak! Wajah Tidak Terdaftar (Kemiripan hanya ${simPercent}%, jarak biometrik d=${Number.isFinite(bestDist) ? bestDist.toFixed(2) : "N/A"} > ${FACENET_MAX_DISTANCE}). Wajah orang lain tidak diizinkan login ke Admin Dashboard!`,
                `Akses Ditolak! Wajah Indak Tadaftar (Kamiripan hanyo ${simPercent}%). Wajah urang lain indak buliah login!`
              )
            );
          }
        }
      } finally {
        isBusy = false;
      }
    }, 280);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, cameraReady, modelsReady, scanState, mode, targetUser, enrolledCandidates]);

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
          <div className="flex items-center justify-between mb-3.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#16b09f]/15 border border-[#16b09f]/40 text-[#16b09f] flex items-center justify-center">
                <RiFocus3Line className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white">
                  {mode === "enroll"
                    ? tr(
                        `3D Face Scanner: @${targetUser?.username || "admin"}`,
                        `3D Face Scanner: @${targetUser?.username || "admin"}`,
                        `3D Face Scanner: @${targetUser?.username || "admin"}`
                      )
                    : targetUser
                    ? tr(
                        `3D Face Test: @${targetUser.username}`,
                        `Uji 3D Wajah: @${targetUser.username}`,
                        `Uji 3D Wajah: @${targetUser.username}`
                      )
                    : tr(
                        "3D Face Recognition Login",
                        "Login 3D Face Scanner",
                        "Login 3D Face Scanner"
                      )}
                </h3>
                <p className="text-[11px] font-mono text-teal-400">
                  {tr(
                    "68-Landmark 3D Mesh · 128-D Neural FaceNet",
                    "Jaring 3D 68-Titik · AI Neural 128-D FaceNet",
                    "Jaring 3D 68-Titiak · AI Neural 128-D"
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

          {/* Camera Viewport with Live 68-Landmark 3D Face Mesh Canvas Overlay */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-teal-500/30 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
                liveTelemetry.lowLightBoost ? "brightness-135 contrast-110" : ""
              }`}
            />

            {/* Live 68-Point 3D Wireframe Face Mesh Overlay Canvas */}
            <canvas
              ref={meshCanvasRef}
              width={320}
              height={320}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Top-left & Top-right 3D Telemetry HUD Badges */}
            {cameraReady && scanState === "scanning" && (
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
                <div
                  className={`px-2 py-1 rounded-lg bg-black/70 border backdrop-blur-xs text-[10px] font-mono flex items-center gap-1.5 ${
                    liveTelemetry.isStrangerWarning && mode === "verify"
                      ? "border-rose-500/60 text-rose-300"
                      : "border-teal-500/40 text-teal-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-ping ${
                      liveTelemetry.isStrangerWarning && mode === "verify"
                        ? "bg-rose-500"
                        : "bg-[#16b09f]"
                    }`}
                  />
                  <span>
                    {liveTelemetry.euclidDist !== null && mode === "verify"
                      ? `d=${liveTelemetry.euclidDist} (max ${FACENET_MAX_DISTANCE})`
                      : `3D MESH · Z:${liveTelemetry.depthZ}mm`}
                  </span>
                </div>

                {liveTelemetry.lowLightBoost && (
                  <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 backdrop-blur-xs text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <RiFlashlightFill className="w-3 h-3 text-amber-300" />
                    <span>NIGHT BOOST</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom 3D Pose Telemetry Bar */}
            {cameraReady && scanState === "scanning" && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-xs text-[10px] font-mono text-neutral-300 pointer-events-none z-20">
                <span>
                  YAW: {liveTelemetry.yaw > 0 ? `+${liveTelemetry.yaw}°` : `${liveTelemetry.yaw}°`}
                </span>
                <span>
                  PITCH: {liveTelemetry.pitch > 0 ? `+${liveTelemetry.pitch}°` : `${liveTelemetry.pitch}°`}
                </span>
                <span
                  className={`font-bold ${
                    liveTelemetry.isStrangerWarning && mode === "verify"
                      ? "text-rose-400"
                      : "text-[#16b09f]"
                  }`}
                >
                  {mode === "enroll"
                    ? `SCAN ${scanProgress}%`
                    : `MATCH ${liveTelemetry.liveMatchPct}%`}
                </span>
              </div>
            )}

            {/* Animated Laser Scan Plane */}
            {cameraReady && scanState === "scanning" && (
              <motion.div
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#16b09f] to-transparent shadow-[0_0_14px_#16b09f] pointer-events-none z-20"
              />
            )}

            {/* Success Overlay */}
            {scanState === "success" && (
              <div className="absolute inset-0 z-30 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
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
              <div className="absolute inset-0 z-30 bg-neutral-950/92 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center">
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
                  scanState === "failed" || (liveTelemetry.isStrangerWarning && mode === "verify")
                    ? "bg-rose-500"
                    : scanState === "success"
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-[#0d9488] to-[#16b09f]"
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span
                className={`truncate pr-2 ${
                  liveTelemetry.isStrangerWarning && mode === "verify"
                    ? "text-rose-300"
                    : "text-neutral-300"
                }`}
              >
                {statusMessage}
              </span>
              <span className="text-[#16b09f] font-bold shrink-0">{scanProgress}%</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1 text-teal-400">
                <RiShieldCheckFill className="w-3.5 h-3.5" />
                <span>Strict 128-D FaceNet Security</span>
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
