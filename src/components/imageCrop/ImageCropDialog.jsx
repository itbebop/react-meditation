import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";

// 고를 수 있는 비율 (자유롭게 늘이는 방식은 조작이 어려워서 정해진 비율만 제공)
const RATIOS = [
  { key: "original", label: "원본 비율" },
  { key: "landscape", label: "가로형 (4:3)", value: 4 / 3 },
  { key: "wide", label: "넓은 가로형 (16:9)", value: 16 / 9 },
  { key: "square", label: "정사각형 (1:1)", value: 1 },
  { key: "portrait", label: "세로형 (3:4)", value: 3 / 4 },
];

// 확대 1배·가운데일 때의 자르기 영역 (원본 사진 픽셀 기준)
function centeredArea({ width, height }, aspect) {
  if (width / height > aspect) {
    const w = Math.round(height * aspect);
    return { x: Math.round((width - w) / 2), y: 0, width: w, height };
  }
  const h = Math.round(width / aspect);
  return { x: 0, y: Math.round((height - h) / 2), width, height: h };
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

/**
 * 사진 자르기 창
 *
 * props
 * - file: 자를 사진(File)
 * - index, total: 여러 장을 차례로 자를 때 몇 번째인지 (예: 2 / 3)
 * - onDone(result): { action: "cancel" } | { action: "original" } | { action: "crop", crop: {x, y, width, height} }
 *   crop은 방향 정보를 반영한 원본 사진 기준 픽셀 (utils/imageResize.js 의 crop 옵션으로 그대로 전달)
 */
export default function ImageCropDialog({ file, index = 0, total = 1, onDone }) {
  // 사진 주소는 효과 안에서 만들고 정리함 (useMemo로 만들면 개발 모드에서 정리 후 다시 만들지 않아 사진이 깨졌음)
  const [src, setSrc] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const [natural, setNatural] = useState(null); // { width, height }
  const [ratioKey, setRatioKey] = useState("original");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState(null);

  const aspect =
    ratioKey === "original"
      ? natural
        ? natural.width / natural.height
        : 4 / 3
      : RATIOS.find((r) => r.key === ratioKey).value;

  // 라이브러리가 사진을 처음 그리는 동안 이전 비율의 영역을 늦게 알려 오는 경우가 있어서(2026-11-24 확인),
  // 지금 고른 비율과 다른 영역은 무시함
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;
  const ready = natural !== null; // 사진이 다 열렸는지

  // Esc 키 = 취소
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onDone({ action: "cancel" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  // 비율만 바꾸고 위치·확대를 건드리지 않으면 react-easy-crop이 새 영역을 알려 주지 않아서
  // 이전 비율의 영역으로 잘리는 문제가 있었음 (2026-11-24 확인).
  // 비율을 바꾸면 위치는 가운데·확대 1배로 돌아가므로, 그때의 영역(사진 가운데에서 그 비율로
  // 가장 크게 잡은 사각형)을 직접 계산해 둠. 이후 끌기·확대를 하면 onCropComplete 값으로 바뀜
  const changeRatio = (key) => {
    if (key === ratioKey) return;
    const nextAspect =
      key === "original"
        ? natural
          ? natural.width / natural.height
          : null
        : RATIOS.find((r) => r.key === key).value;
    setAreaPixels(natural && nextAspect ? centeredArea(natural, nextAspect) : null);
    setRatioKey(key);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const changeZoom = (z) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)));

  const bigBtn = "px-4 py-3 rounded-lg text-base font-semibold disabled:opacity-40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-crop-title"
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 id="image-crop-title" className="text-xl font-bold text-gray-900">
            사진 자르기{total > 1 && ` (${index + 1} / ${total})`}
          </h2>
          <span className="truncate text-sm text-gray-500">{file.name}</span>
        </div>
        <p className="mb-3 text-base text-gray-700">
          사진을 끌어서 남길 부분을 맞추세요. 자를 필요가 없으면 <b>"자르지 않고 그대로 쓰기"</b>를 누르세요.
        </p>

        <div className="relative h-[45vh] min-h-[260px] w-full overflow-hidden rounded-lg bg-gray-800">
          {loadFailed && (
            <p className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-base text-white">
              이 사진을 열지 못했습니다. "자르지 않고 그대로 쓰기"를 누르거나 다른 사진을 골라 주세요.
            </p>
          )}
          {src && (
          <Cropper
            image={src}
            mediaProps={{ onError: () => setLoadFailed(true) }}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoomSpeed={0.2}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => {
              const a = pixels.width / pixels.height;
              if (Math.abs(a - aspectRef.current) / aspectRef.current > 0.02) return;
              setAreaPixels(pixels);
            }}
            onMediaLoaded={(m) => {
              // 사진이 열리면 지금 비율의 기본 영역(가운데·확대 1배)을 직접 계산해 둠
              const nat = { width: m.naturalWidth, height: m.naturalHeight };
              setNatural(nat);
              const a = ratioKey === "original" ? nat.width / nat.height : aspectRef.current;
              setAreaPixels(centeredArea(nat, a));
            }}
          />
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-base font-semibold text-gray-800">모양 고르기</p>
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => changeRatio(r.key)}
                disabled={!ready}
                aria-pressed={ratioKey === r.key}
                className={`rounded-lg border-2 px-3 py-2 text-base disabled:opacity-40 ${
                  ratioKey === r.key
                    ? "border-blue-600 bg-blue-50 font-semibold text-blue-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-base font-semibold text-gray-800">크기 조절</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => changeZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className={`${bigBtn} border-2 border-gray-300 text-gray-800`}
            >
              − 축소
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(e) => changeZoom(Number(e.target.value))}
              aria-label="사진 크기 조절"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => changeZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className={`${bigBtn} border-2 border-gray-300 text-gray-800`}
            >
              + 확대
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onDone({ action: "cancel" })}
            className={`${bigBtn} bg-gray-100 text-gray-700 hover:bg-gray-200`}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onDone({ action: "original" })}
            className={`${bigBtn} border-2 border-gray-800 text-gray-900 hover:bg-gray-50`}
          >
            자르지 않고 그대로 쓰기
          </button>
          <button
            type="button"
            onClick={() => areaPixels && onDone({ action: "crop", crop: areaPixels })}
            disabled={!ready || !areaPixels}
            className={`${bigBtn} bg-blue-600 text-white hover:bg-blue-700`}
          >
            이대로 잘라서 쓰기
          </button>
        </div>
      </div>
    </div>
  );
}
