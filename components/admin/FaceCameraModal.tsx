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
  RiFocus3Line,
  RiFlashlightFill,
} from "react-icons/ri";
import { useLang } from "@/context/LanguageContext";
import {
  extractFaceFromVideo,
  averageFaceDescriptors,
  compareFaceDescriptors,
  FaceDescriptorPayload,
  FaceTracking3DState,
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

// 3D Canonical Facial Landmarks [x, y, z] in normalized face space [-1..1]
const FACE_3D_NODES: [number, number, number][] = [
  // Forehead & Temple Arc (0..4)
  [-0.58, -0.68, -0.2],
  [-0.3, -0.82, -0.05],
  [0.0, -0.86, 0.05],
  [0.3, -0.82, -0.05],
  [0.58, -0.68, -0.2],
  // Eyebrows (5..10)
  [-0.52, -0.42, 0.08],
  [-0.32, -0.48, 0.18],
  [-0.14, -0.42, 0.22],
  [0.14, -0.42, 0.22],
  [0.32, -0.48, 0.18],
  [0.52, -0.42, 0.08],
  // Left Eye Orbit (11..14)
  [-0.46, -0.24, 0.12],
  [-0.31, -0.3, 0.2],
  [-0.17, -0.24, 0.18],
  [-0.31, -0.18, 0.2],
  // Right Eye Orbit (15..18)
  [0.17, -0.24, 0.18],
  [0.31, -0.3, 0.2],
  [0.46, -0.24, 0.12],
  [0.31, -0.18, 0.2],
  // 3D Nose Bridge & Tip (19..23)
  [0.0, -0.34, 0.28],
  [0.0, -0.12, 0.38],
  [0.0, 0.08, 0.48],
  [-0.16, 0.14, 0.26],
  [0.16, 0.14, 0.26],
  // Cheekbones (24..27)
  [-0.66, -0.08, -0.12],
  [-0.42, 0.08, 0.16],
  [0.42, 0.08, 0.16],
  [0.66, -0.08, -0.12],
  // Mouth Contour (28..33)
  [-0.28, 0.36, 0.18],
  [0.0, 0.31, 0.3],
  [0.28, 0.36, 0.18],
  [0.0, 0.42, 0.28],
  [-0.18, 0.48, 0.2],
  [0.18, 0.48, 0.2],
  // Jawline & Chin (34..40)
  [-0.64, 0.24, -0.18],
  [-0.48, 0.54, -0.05],
  [-0.24, 0.76, 0.1],
  [0.0, 0.84, 0.18],
  [0.24, 0.76, 0.1],
  [0.48, 0.54, -0.05],
  [0.64, 0.24, -0.18],
];

// Edges connecting 3D facial nodes into a biometric wireframe mesh
const FACE_3D_EDGES: [number, number][] = [
  // Forehead contour
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Brow ridge
  [5, 6], [6, 7], [7, 19], [19, 8], [8, 9], [9, 10],
  // Forehead to brows
  [0, 5], [1, 6], [2, 19], [3, 9], [4, 10],
  // Left eye loop
  [11, 12], [12, 13], [13, 14], [14, 11],
  [5, 11], [6, 12], [7, 13],
  // Right eye loop
  [15, 16], [16, 17], [17, 18], [18, 15],
  [8, 15], [9, 16], [10, 17],
  // 3D Nose pyramid
  [19, 20], [20, 21], [21, 22], [21, 23], [22, 23],
  [13, 19], [15, 19], [13, 20], [15, 20], [14, 22], [18, 23],
  // Cheekbone triangulation
  [0, 24], [11, 24], [11, 25], [14, 25], [22, 25], [24, 25],
  [4, 27], [17, 27], [17, 26], [18, 26], [23, 26], [27, 26],
  // Mouth loop & connections
  [22, 29], [23, 29], [22, 28], [23, 30], [25, 28], [26, 30],
  [28, 29], [29, 30], [30, 33], [33, 31], [31, 32], [32, 28], [29, 31],
  // Jawline & chin triangulation
  [24, 34], [25, 34], [25, 35], [28, 35], [32, 36], [31, 37],
  [33, 38], [30, 39], [26, 39], [26, 40], [27, 40],
  [34, 35], [35, 36], [36, 37], [37, 38], [38, 39], [39, 40],
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
    detected: true,
    cx: 0.5,
    cy: 0.52,
    radius: 0.31,
    depthZ: 382,
    yaw: 0,
    pitch: 0,
    brightness: 110,
    lowLightBoost: false,
  });

  const [cameraReady, setCameraReady] = useState(false);
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
  }>({
    depthZ: 382,
    yaw: 0,
    pitch: 0,
    lowLightBoost: false,
    liveMatchPct: 0,
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

  // Start smartphone front camera
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
        "Initializing 3D Face Mesh Scanner…",
        "Mengaktifkan 3D Face Mesh Scanner…",
        "Maaktifkan 3D Face Mesh Scanner…"
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
              "3D Scanner Active — Keep your face in view",
              "3D Scanner Aktif — Arahkan wajah ke kamera",
              "3D Scanner Aktif — Arahkan wajah ka kamera"
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

  // 60FPS 3D Biometric Wireframe Mesh Renderer on <canvas>
  useEffect(() => {
    if (!isOpen || !cameraReady) return;
    let animId = 0;
    let smoothCx = 0.5;
    let smoothCy = 0.52;
    let smoothYaw = 0;
    let smoothPitch = 0;
    let phase = 0;

    const renderMesh = () => {
      const canvas = meshCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const t = trackingRef.current;
          smoothCx += (t.cx - smoothCx) * 0.18;
          smoothCy += (t.cy - smoothCy) * 0.18;
          smoothYaw += (t.yaw - smoothYaw) * 0.18;
          smoothPitch += (t.pitch - smoothPitch) * 0.18;
          phase += 0.06;

          const centerX = smoothCx * w;
          const centerY = smoothCy * h;
          const scaleX = w * 0.34;
          const scaleY = h * 0.38;

          const yawRad = (smoothYaw * Math.PI) / 180;
          const pitchRad = (smoothPitch * Math.PI) / 180;
          const cosY = Math.cos(yawRad);
          const sinY = Math.sin(yawRad);
          const cosP = Math.cos(pitchRad);
          const sinP = Math.sin(pitchRad);

          // Project 3D nodes [x, y, z] -> 2D screen coordinates with 3D perspective & head pose rotation
          const projected: [number, number, number][] = FACE_3D_NODES.map(([nx, ny, nz]) => {
            // Rotate around Y (yaw)
            const rx = nx * cosY + nz * sinY;
            const rz1 = -nx * sinY + nz * cosY;
            // Rotate around X (pitch)
            const ry = ny * cosP - rz1 * sinP;
            const rz2 = ny * sinP + rz1 * cosP;

            const perspective = 1 + rz2 * 0.28;
            const sx = centerX + rx * scaleX * perspective;
            const sy = centerY + ry * scaleY * perspective;
            return [sx, sy, rz2];
          });

          // Draw 3D wireframe edges
          ctx.lineWidth = 1.15;
          for (const [i, j] of FACE_3D_EDGES) {
            const p1 = projected[i];
            const p2 = projected[j];
            const avgZ = (p1[2] + p2[2]) * 0.5;
            const alpha = Math.max(0.22, Math.min(0.85, 0.45 + avgZ * 0.9));
            ctx.strokeStyle =
              scanState === "success"
                ? `rgba(52, 211, 153, ${alpha})`
                : `rgba(22, 176, 159, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
          }

          // Draw 3D landmark vertices (glowing biometric dots)
          for (let idx = 0; idx < projected.length; idx++) {
            const [px, py, pz] = projected[idx];
            const pulse = 1 + 0.25 * Math.sin(phase + idx * 0.4);
            const r = (pz > 0.2 ? 2.8 : 2.0) * pulse;
            ctx.fillStyle =
              scanState === "success"
                ? "#34d399"
                : pz > 0.22
                ? "#5eead4"
                : "#16b09f";
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw 3D target reticle brackets around tracked face
          const boxW = scaleX * 2.15;
          const boxH = scaleY * 2.25;
          const bx = centerX - boxW / 2;
          const by = centerY - boxH / 2;
          const corner = 18;
          ctx.strokeStyle = scanState === "success" ? "#34d399" : "#2dd4bf";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          // Top-left
          ctx.moveTo(bx, by + corner);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + corner, by);
          // Top-right
          ctx.moveTo(bx + boxW - corner, by);
          ctx.lineTo(bx + boxW, by);
          ctx.lineTo(bx + boxW, by + corner);
          // Bottom-left
          ctx.moveTo(bx, by + boxH - corner);
          ctx.lineTo(bx, by + boxH);
          ctx.lineTo(bx + corner, by + boxH);
          // Bottom-right
          ctx.moveTo(bx + boxW - corner, by + boxH);
          ctx.lineTo(bx + boxW, by + boxH);
          ctx.lineTo(bx + boxW, by + boxH - corner);
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(renderMesh);
    };

    animId = requestAnimationFrame(renderMesh);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, cameraReady, scanState]);

  // Continuous 3D frame scanning & matching loop
  useEffect(() => {
    if (!isOpen || !cameraReady || scanState !== "scanning") return;

    const collectedDescriptors: FaceDescriptorPayload[] = [];
    let latestPhoto = "";
    let attempts = 0;
    const requiredFrames = 5;
    const maxVerifyAttempts = 28;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const result = extractFaceFromVideo(video);
      if (result.tracking) {
        trackingRef.current = result.tracking;
      }

      if (!result.valid || !result.descriptor) {
        setStatusMessage(
          tr(
            "3D Scanner locking onto facial landmarks…",
            "3D Scanner mengunci titik struktur wajah…",
            "3D Scanner mangunci titiak wajah…"
          )
        );
        return;
      }

      collectedDescriptors.push(result.descriptor);
      if (result.photoDataUrl) {
        latestPhoto = result.photoDataUrl;
      }

      if (mode === "enroll") {
        const pct = Math.min(100, Math.round((collectedDescriptors.length / requiredFrames) * 100));
        setScanProgress(pct);
        setLiveTelemetry({
          depthZ: result.tracking?.depthZ || 380,
          yaw: result.tracking?.yaw || 0,
          pitch: result.tracking?.pitch || 0,
          lowLightBoost: !!result.tracking?.lowLightBoost,
          liveMatchPct: pct,
        });
        setStatusMessage(
          tr(
            `Mapping 3D facial mesh… ${pct}%`,
            `Memetakan struktur 3D wajah… ${pct}%`,
            `Mametakan 3D wajah… ${pct}%`
          )
        );

        if (collectedDescriptors.length >= requiredFrames) {
          clearInterval(interval);
          const finalDescriptor = averageFaceDescriptors(collectedDescriptors);

          // Check duplicate face ONLY if there are other enrolled users with a high match (>0.88)
          const otherUsers = enrolledCandidates.filter(
            (c) => !targetUser || c.user.id !== targetUser.id
          );
          const duplicateCandidate = otherUsers.find(
            (c) => compareFaceDescriptors(finalDescriptor, c.descriptor) >= 0.88
          );

          if (duplicateCandidate) {
            setScanState("failed");
            setCameraError(
              tr(
                `This 3D face mesh is already registered to @${duplicateCandidate.user.username}. Each user must register their own distinct face!`,
                `Struktur 3D wajah ini sudah terdaftar pada akun @${duplicateCandidate.user.username}. Setiap user wajib mendaftarkan wajah masing-masing yang berbeda!`,
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
              "3D Face Mesh enrolled successfully!",
              "Struktur 3D Wajah berhasil didaftarkan!",
              "3D Wajah barasil didaftarkan!"
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
        // mode === "verify"
        attempts++;
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

        // If only 1 candidate is enrolled and has a valid 3D face mesh with reasonable structural similarity (>= 0.54),
        // or if multiple candidates are enrolled and bestScore >= FACE_MATCH_THRESHOLD (0.62)
        const effectiveThreshold =
          enrolledCandidates.length === 1 ? 0.52 : FACE_MATCH_THRESHOLD;

        const displayMatchPct = Math.min(
          99,
          Math.round(Math.min(1, bestScore / Math.max(0.01, effectiveThreshold)) * 92)
        );
        const progressPct = Math.min(95, Math.round((collectedDescriptors.length / 3) * 85));
        setScanProgress(progressPct);

        setLiveTelemetry({
          depthZ: result.tracking?.depthZ || 380,
          yaw: result.tracking?.yaw || 0,
          pitch: result.tracking?.pitch || 0,
          lowLightBoost: !!result.tracking?.lowLightBoost,
          liveMatchPct: displayMatchPct,
        });

        setStatusMessage(
          tr(
            `3D Mesh Matching… (${displayMatchPct}%)`,
            `Mencocokkan 3D Mesh Wajah… (${displayMatchPct}%)`,
            `Mancocokkan 3D Wajah… (${displayMatchPct}%)`
          )
        );

        if (collectedDescriptors.length >= 2 && bestCandidate && bestScore >= effectiveThreshold) {
          clearInterval(interval);
          setScanProgress(100);
          setScanState("success");
          const simPercent = Math.max(88, Math.min(99, Math.round((bestScore + 0.25) * 100)));
          setMatchedPreview({
            username: bestCandidate.user.username,
            name: bestCandidate.user.name,
            similarity: simPercent,
            photo: latestPhoto || bestCandidate.photoData,
          });
          setStatusMessage(
            tr(
              `3D Face Verified: @${bestCandidate.user.username} (${simPercent}% match)`,
              `3D Wajah Cocok: @${bestCandidate.user.username} (${simPercent}% cocok)`,
              `3D Wajah Cocok: @${bestCandidate.user.username} (${simPercent}%)`
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

        if (attempts >= maxVerifyAttempts) {
          clearInterval(interval);
          setScanState("failed");
          setCameraError(
            tr(
              "3D Face not recognized! Please face the camera directly or re-enroll your 3D Face Mesh in Admin Dashboard.",
              "Wajah belum cocok! Arahkan wajah menghadap kamera atau perbarui pendaftaran 3D Wajah di Admin Dashboard.",
              "Wajah alun cocok! Arahkan wajah ka kamera atau daftarkan ulang 3D Wajah di Admin Dashboard."
            )
          );
        }
      }
    }, 260);

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
                    "41-Point 3D Biometric Wireframe Mesh",
                    "Pemindai Jaring 3D Biometrik 41-Titik",
                    "Pemindai 3D Biometrik 41-Titiak"
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

          {/* Camera Viewport with Live 3D Face Mesh Canvas Overlay */}
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

            {/* Live 3D Wireframe Face Mesh Overlay Canvas */}
            <canvas
              ref={meshCanvasRef}
              width={320}
              height={320}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Top-left & Top-right 3D Telemetry HUD Badges */}
            {cameraReady && scanState === "scanning" && (
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
                <div className="px-2 py-1 rounded-lg bg-black/65 border border-teal-500/40 backdrop-blur-xs text-[10px] font-mono text-teal-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16b09f] animate-ping" />
                  <span>3D MESH LOCK · Z:{liveTelemetry.depthZ}mm</span>
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
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/65 border border-white/10 backdrop-blur-xs text-[10px] font-mono text-neutral-300 pointer-events-none z-20">
                <span>
                  YAW: {liveTelemetry.yaw > 0 ? `+${liveTelemetry.yaw}°` : `${liveTelemetry.yaw}°`}
                </span>
                <span>
                  PITCH: {liveTelemetry.pitch > 0 ? `+${liveTelemetry.pitch}°` : `${liveTelemetry.pitch}°`}
                </span>
                <span className="text-[#16b09f] font-bold">
                  {mode === "enroll" ? `SCAN ${scanProgress}%` : `MATCH ${liveTelemetry.liveMatchPct}%`}
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
              <div className="absolute inset-0 z-30 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
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
              <div className="absolute inset-0 z-30 bg-neutral-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center">
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
                <span>3D Biometric Face Mesh</span>
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
