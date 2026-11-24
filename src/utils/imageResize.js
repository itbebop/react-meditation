// 이미지를 올리기 전에 관리자 컴퓨터(브라우저)에서 알맞은 크기로 줄이는 기능
//
// 규칙 (2026-11-24 사용자 확인: 추천안)
// - 크기: maxLongSide(긴 변 최대) 또는 maxWidth(가로 최대, 세로 제한 없음) 중 하나로 맞춤. 작은 이미지는 키우지 않음
// - 형식: 사진(JPEG)은 JPEG(품질 0.85), 그 외(PNG·WebP)는 WebP(품질 0.9).
//         브라우저가 WebP로 저장하지 못하면 PNG로 저장
// - 움직이는 GIF는 움직임이 사라지므로 줄이지 않음
// - 줄인 결과가 원본보다 크면 원본을 그대로 사용
// - 휴대폰 사진의 방향 정보(EXIF)를 반영해서 똑바로 저장
// - 브라우저가 한 번에 처리할 수 있는 화소 수(약 1,600만)를 넘지 않도록 더 줄임
// - 올릴 수 있는 원본은 20MB까지, 최종 파일은 5MB까지

export const RAW_MAX_BYTES = 20 * 1024 * 1024;
export const FINAL_MAX_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const MAX_CANVAS_PIXELS = 16_000_000;

// 화면에 보여 줄 용량 표시 (예: 3.2MB, 450KB)
export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

// 관리자에게 보여 줄 쉬운 오류
export class ImageUploadError extends Error {}

async function decode(file) {
  // createImageBitmap은 방향 정보를 반영하고 메모리를 적게 씀
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
    } catch {
      // 아래 방법으로 다시 시도
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// 크게 줄일 때 한 번에 줄이면 화질이 거칠어져서 절반씩 나눠 줄임
function drawScaled(source, srcW, srcH, dstW, dstH, fillWhite) {
  let canvas = document.createElement("canvas");
  let w = srcW;
  let h = srcH;
  let current = source;
  while (w / 2 >= dstW && h / 2 >= dstH) {
    const next = document.createElement("canvas");
    next.width = Math.round(w / 2);
    next.height = Math.round(h / 2);
    const g = next.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.drawImage(current, 0, 0, next.width, next.height);
    current = next;
    w = next.width;
    h = next.height;
  }
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext("2d");
  if (fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dstW, dstH);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(current, 0, 0, dstW, dstH);
  return canvas;
}

function renameFile(name, ext) {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

/**
 * 올리기 전에 이미지를 알맞은 크기로 줄입니다.
 *
 * @param {File} file
 * @param {{maxLongSide?: number, maxWidth?: number}} options
 * @returns {Promise<{file: File, resized: boolean, originalBytes: number, finalBytes: number, width?: number, height?: number}>}
 * @throws {ImageUploadError} 관리자에게 그대로 보여 줄 수 있는 쉬운 문장
 */
export async function prepareImageForUpload(file, { maxLongSide, maxWidth } = {}) {
  if (!file) throw new ImageUploadError("사진을 먼저 골라 주세요.");
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageUploadError("사진 파일(jpg, png, gif, webp)만 올릴 수 있습니다.");
  }
  if (file.size > RAW_MAX_BYTES) {
    throw new ImageUploadError(
      `사진이 너무 큽니다(${formatBytes(file.size)}). 20MB 이하의 사진을 골라 주세요.`
    );
  }

  const keepOriginal = (extra = {}) => {
    if (file.size > FINAL_MAX_BYTES) {
      throw new ImageUploadError(
        `이 사진은 크기를 줄일 수 없어서 올릴 수 없습니다(${formatBytes(file.size)}). 5MB 이하의 사진을 골라 주세요.`
      );
    }
    return { file, resized: false, originalBytes: file.size, finalBytes: file.size, ...extra };
  };

  // 움직이는 그림(GIF)은 줄이면 움직임이 사라지므로 그대로
  if (file.type === "image/gif") return keepOriginal();

  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    return keepOriginal();
  }

  try {
    const { width, height } = decoded;
    let scale = 1;
    if (maxLongSide) scale = Math.min(scale, maxLongSide / Math.max(width, height));
    if (maxWidth) scale = Math.min(scale, maxWidth / width);
    if (width * height * scale * scale > MAX_CANVAS_PIXELS) {
      scale = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
    }
    const dstW = Math.max(1, Math.round(width * scale));
    const dstH = Math.max(1, Math.round(height * scale));

    const isPhoto = file.type === "image/jpeg";
    const canvas = drawScaled(decoded.source, width, height, dstW, dstH, isPhoto);

    let blob;
    let ext;
    if (isPhoto) {
      blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
      ext = "jpg";
    } else {
      blob = await canvasToBlob(canvas, "image/webp", 0.9);
      ext = "webp";
      if (!blob || blob.type !== "image/webp") {
        blob = await canvasToBlob(canvas, "image/png");
        ext = "png";
      }
    }
    if (!blob) return keepOriginal({ width, height });

    // 줄인 결과가 더 크면(이미 작은 이미지) 원본 사용
    if (blob.size >= file.size) return keepOriginal({ width, height });

    if (blob.size > FINAL_MAX_BYTES) {
      throw new ImageUploadError(
        `사진을 줄여도 너무 큽니다(${formatBytes(blob.size)}). 더 작은 사진을 골라 주세요.`
      );
    }

    const out = new File([blob], renameFile(file.name, ext), {
      type: blob.type,
      lastModified: Date.now(),
    });
    return {
      file: out,
      resized: true,
      originalBytes: file.size,
      finalBytes: out.size,
      width: dstW,
      height: dstH,
    };
  } catch (error) {
    if (error instanceof ImageUploadError) throw error;
    console.error("이미지 줄이기 실패:", error);
    return keepOriginal();
  } finally {
    decoded.close();
  }
}

// 결과 안내 문장 (예: "사진을 알맞은 크기로 줄였습니다 (3.2MB → 0.4MB)")
export function resizeSummary(result) {
  if (!result?.resized) return "";
  return `사진을 알맞은 크기로 줄였습니다 (${formatBytes(result.originalBytes)} → ${formatBytes(result.finalBytes)})`;
}

// 기준 크기 (공개 화면 표시 폭 기준)
export const RESIZE_PRESETS = {
  // 협회 소개·교육 과정 페이지 이미지: 본문 폭(최대 약 1,200px)에 보임. 긴 안내 이미지라 세로는 제한 없음
  pageImage: { maxWidth: 1600 },
  // 에디터 본문 사진: 글 폭(최대 768px)에 보임. 고해상도 화면을 위해 약 2배.
  // 긴 변 기준으로 하면 세로로 긴 안내 이미지(예: 1448×10240)가 폭 226px로 줄어 글자를 못 읽으므로 가로 기준
  editorImage: { maxWidth: 1600 },
};
