import { lazy, Suspense, useCallback, useRef, useState } from "react";

// 자르기 창은 관리자가 사진을 고를 때만 필요하므로 따로 불러옵니다 (공개 페이지 용량에 영향 없음)
const ImageCropDialog = lazy(() => import("./ImageCropDialog"));

/**
 * 사진 자르기 창을 띄우고 결과를 기다리는 훅
 *
 * const { askCrop, cropDialog } = useImageCropper();
 * const result = await askCrop(file, index, total);
 *   // { action: "cancel" } | { action: "original" } | { action: "crop", crop }
 * ...
 * return <>{cropDialog} ...</>;
 *
 * 움직이는 GIF는 자르면 움직임이 사라지므로 창을 띄우지 않고 "original"을 돌려줍니다.
 */
export function useImageCropper() {
  const [job, setJob] = useState(null);
  const counter = useRef(0);

  const askCrop = useCallback((file, index = 0, total = 1) => {
    if (file?.type === "image/gif") return Promise.resolve({ action: "original" });
    return new Promise((resolve) => {
      counter.current += 1;
      setJob({ id: counter.current, file, index, total, resolve });
    });
  }, []);

  const cropDialog = job ? (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-lg text-white">
          사진을 여는 중…
        </div>
      }
    >
      <ImageCropDialog
        key={job.id}
        file={job.file}
        index={job.index}
        total={job.total}
        onDone={(result) => {
          job.resolve(result);
          setJob(null);
        }}
      />
    </Suspense>
  ) : null;

  return { askCrop, cropDialog };
}
