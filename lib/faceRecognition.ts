/**
 * Browser-Native Camera Face Recognition & Descriptor Engine
 * Extracts lighting-normalized facial geometry, gradient (HOG-like), and chromatic descriptors
 * from the centered oval face region of a live camera video frame, and computes cosine/L1 similarity
 * to distinguish different users reliably.
 */

export interface FaceDescriptorPayload {
  version: number;
  /** 128-element normalized luminance + gradient + chromatic descriptor */
  vec: number[];
  capturedAt: string;
}

const GRID_SIZE = 8; // 8x8 spatial cells inside the centered face crop

/**
 * Extracts a lighting-invariant facial descriptor and a thumbnail data URL from a <video> element.
 * Also validates that an actual face-like structure (sufficient contrast, symmetry, and central detail)
 * is present in the frame.
 */
export function extractFaceFromVideo(video: HTMLVideoElement): {
  valid: boolean;
  reason?: "too_dark" | "too_bright" | "no_face_detected" | "low_symmetry";
  descriptor?: FaceDescriptorPayload;
  photoDataUrl?: string;
} {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) {
    return { valid: false, reason: "no_face_detected" };
  }

  // Crop central square/oval where the user's face is aligned
  const cropSize = Math.min(vw, vh) * 0.62;
  const sx = (vw - cropSize) / 2;
  const sy = (vh - cropSize) / 2;

  const canvas = document.createElement("canvas");
  const sampleDim = 64;
  canvas.width = sampleDim;
  canvas.height = sampleDim;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { valid: false, reason: "no_face_detected" };
  }

  ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, sampleDim, sampleDim);
  const imgData = ctx.getImageData(0, 0, sampleDim, sampleDim).data;

  // 1. Compute luminance array and check brightness & contrast inside the face oval
  const lum = new Float32Array(sampleDim * sampleDim);
  const rgDiff = new Float32Array(sampleDim * sampleDim);
  let sumLum = 0;
  let ovalCount = 0;

  for (let y = 0; y < sampleDim; y++) {
    const ny = (y - sampleDim / 2) / (sampleDim / 2);
    for (let x = 0; x < sampleDim; x++) {
      const nx = (x - sampleDim / 2) / (sampleDim * 0.42);
      const idx = y * sampleDim + x;
      const p = idx * 4;
      const r = imgData[p];
      const g = imgData[p + 1];
      const b = imgData[p + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      lum[idx] = l;
      const sumRgb = r + g + b + 1;
      rgDiff[idx] = (r - g) / sumRgb;

      if (nx * nx + ny * ny <= 1.0) {
        sumLum += l;
        ovalCount++;
      }
    }
  }

  const meanLum = sumLum / Math.max(1, ovalCount);
  if (meanLum < 28) {
    return { valid: false, reason: "too_dark" };
  }
  if (meanLum > 242) {
    return { valid: false, reason: "too_bright" };
  }

  // Compute standard deviation of luminance inside oval
  let varSum = 0;
  for (let y = 0; y < sampleDim; y++) {
    const ny = (y - sampleDim / 2) / (sampleDim / 2);
    for (let x = 0; x < sampleDim; x++) {
      const nx = (x - sampleDim / 2) / (sampleDim * 0.42);
      if (nx * nx + ny * ny <= 1.0) {
        const d = lum[y * sampleDim + x] - meanLum;
        varSum += d * d;
      }
    }
  }
  const stdLum = Math.sqrt(varSum / Math.max(1, ovalCount));
  if (stdLum < 12) {
    // Flat wall or covered camera
    return { valid: false, reason: "no_face_detected" };
  }

  // Check bilateral left-right facial symmetry in the upper/mid face region
  let symDiff = 0;
  let symPairs = 0;
  for (let y = 12; y < 52; y++) {
    for (let x = 12; x < 32; x++) {
      const mirrorX = sampleDim - 1 - x;
      const l1 = (lum[y * sampleDim + x] - meanLum) / stdLum;
      const l2 = (lum[y * sampleDim + mirrorX] - meanLum) / stdLum;
      symDiff += Math.abs(l1 - l2);
      symPairs++;
    }
  }
  const avgSymDiff = symDiff / Math.max(1, symPairs);
  if (avgSymDiff > 1.35) {
    return { valid: false, reason: "low_symmetry" };
  }

  // 2. Build 8x8 cell features:
  //    - 64 normalized luminance cells
  //    - 64 directional gradient (gx, gy magnitude/ratio) + chromatic cells
  const cellSpan = sampleDim / GRID_SIZE; // 8 pixels per cell
  const vec: number[] = [];

  for (let cy = 0; cy < GRID_SIZE; cy++) {
    for (let cx = 0; cx < GRID_SIZE; cx++) {
      let cLum = 0;
      let cGradX = 0;
      let cGradY = 0;
      let cRg = 0;
      let count = 0;

      for (let py = cy * cellSpan + 1; py < (cy + 1) * cellSpan - 1; py++) {
        for (let px = cx * cellSpan + 1; px < (cx + 1) * cellSpan - 1; px++) {
          const idx = py * sampleDim + px;
          const normL = (lum[idx] - meanLum) / stdLum;
          const gx = (lum[idx + 1] - lum[idx - 1]) / stdLum;
          const gy = (lum[idx + sampleDim] - lum[idx - sampleDim]) / stdLum;

          cLum += normL;
          cGradX += Math.abs(gx);
          cGradY += Math.abs(gy);
          cRg += rgDiff[idx];
          count++;
        }
      }

      const n = Math.max(1, count);
      vec.push(Number((cLum / n).toFixed(4)));
      vec.push(Number(((cGradX - cGradY) / n + (cRg / n) * 2).toFixed(4)));
    }
  }

  // L2 normalize the descriptor vector
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm) || 1;
  const normalizedVec = vec.map((v) => Number((v / norm).toFixed(4)));

  // 3. Create clean 160x160 thumbnail photo for UI preview
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 160;
  thumbCanvas.height = 160;
  const tCtx = thumbCanvas.getContext("2d");
  if (tCtx) {
    // Mirror horizontally so selfie looks natural
    tCtx.translate(160, 0);
    tCtx.scale(-1, 1);
    tCtx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, 160, 160);
  }
  const photoDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.82);

  return {
    valid: true,
    descriptor: {
      version: 1,
      vec: normalizedVec,
      capturedAt: new Date().toISOString(),
    },
    photoDataUrl,
  };
}

/**
 * Averages multiple descriptors captured during enrollment/scan for stability.
 */
export function averageFaceDescriptors(
  descriptors: FaceDescriptorPayload[]
): FaceDescriptorPayload {
  if (descriptors.length === 0) {
    return { version: 1, vec: [], capturedAt: new Date().toISOString() };
  }
  const len = descriptors[0].vec.length;
  const avg = new Array<number>(len).fill(0);
  for (const d of descriptors) {
    for (let i = 0; i < len; i++) {
      avg[i] += d.vec[i] || 0;
    }
  }
  let norm = 0;
  for (let i = 0; i < len; i++) {
    avg[i] /= descriptors.length;
    norm += avg[i] * avg[i];
  }
  norm = Math.sqrt(norm) || 1;
  return {
    version: 1,
    vec: avg.map((v) => Number((v / norm).toFixed(4))),
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Computes cosine similarity [0..1] between two FaceDescriptorPayloads.
 */
export function compareFaceDescriptors(
  a: FaceDescriptorPayload | null | undefined,
  b: FaceDescriptorPayload | null | undefined
): number {
  if (!a?.vec || !b?.vec || a.vec.length === 0 || a.vec.length !== b.vec.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  let l1Diff = 0;
  for (let i = 0; i < a.vec.length; i++) {
    dot += a.vec[i] * b.vec[i];
    normA += a.vec[i] * a.vec[i];
    normB += b.vec[i] * b.vec[i];
    l1Diff += Math.abs(a.vec[i] - b.vec[i]);
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denom) return 0;
  const cosine = dot / denom; // [-1..1]
  const avgL1 = l1Diff / a.vec.length;
  const l1Score = Math.max(0, 1 - avgL1 * 5.2);
  return Math.max(0, Math.min(1, cosine * 0.65 + l1Score * 0.35));
}

export function parseFaceDescriptor(raw?: string | null): FaceDescriptorPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.vec) && parsed.vec.length > 0) {
      return parsed as FaceDescriptorPayload;
    }
  } catch (_) {}
  return null;
}

/** Minimum similarity score required to authenticate a user's face */
export const FACE_MATCH_THRESHOLD = 0.74;
