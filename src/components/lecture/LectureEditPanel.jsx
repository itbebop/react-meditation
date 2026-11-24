import { useEffect, useMemo, useRef, useState } from "react";
import { Save, X, Trash2, ImagePlus } from "lucide-react";
import LecturePreview from "./LecturePreview";
import { nextLectureId, nextOrder } from "./lectureUtils";
import {
  LECTURE_IMAGE_TYPES,
  LECTURE_IMAGE_MAX_SIZE,
  newLectureId,
  uploadLectureImage,
  createLecture,
  updateLecture,
} from "../../firebase/lectures";
import { ImageUploadError } from "../../utils/imageResize";

// 배지 색 후보: 사이트 색 + 기존 기본색
const PRESET_COLORS = ["#f59e0b", "#1C7244", "#4CAF4F", "#D9AE46", "#3C493C", "#FF4949", "#2563EB", "#717171"];
const HEX = /^#[0-9a-fA-F]{6}$/;

function toForm(lecture) {
  return {
    category: lecture?.category ?? "",
    categoryColor: lecture?.categoryColor ?? "#f59e0b",
    title: lecture?.title ?? "",
    lecturer: lecture?.lecturer ?? "",
    lectureNum: lecture?.lectureNum != null ? String(lecture.lectureNum) : "",
    lectureTime: lecture?.lectureTime != null ? String(lecture.lectureTime) : "",
    detail: lecture?.detail ?? "",
  };
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "제목을 입력하세요.";
  if (!form.category.trim()) errors.category = "카테고리를 입력하세요.";
  if (!HEX.test(form.categoryColor)) errors.categoryColor = "#RRGGBB 형식의 색 코드를 입력하세요.";
  for (const key of ["lectureNum", "lectureTime"]) {
    if (form[key].trim() === "") errors[key] = "숫자를 입력하세요.";
    else if (!/^\d+$/.test(form[key].trim())) errors[key] = "0 이상의 정수로 입력하세요.";
  }
  return errors;
}

/**
 * 강의 추가/수정 패널: 폼 + 공개 화면 미리보기
 *
 * props
 * - lecture: 수정할 강의 (새 강의면 null)
 * - allLectures: 전체 강의 (새 ID·순서 계산, 카테고리 목록용)
 * - onSaved(lecture, isNew), onCancel(), onDelete(lecture), onDirtyChange(bool)
 */
export default function LectureEditPanel({
  lecture,
  allLectures,
  onSaved,
  onCancel,
  onDelete,
  onDirtyChange,
}) {
  const isNew = !lecture;
  const initial = useMemo(() => toForm(lecture), [lecture]);
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef(null);
  // 화면 갱신 전에 저장 버튼이 연속으로 눌려도 한 번만 저장되도록 (state는 비동기라 ref로 막음)
  const savingRef = useRef(false);

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty =
    imageFile !== null ||
    Object.keys(initial).some((k) => form[k] !== initial[k]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // 미리보기용 임시 URL 정리
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const categories = useMemo(
    () => [...new Set(allLectures.map((l) => l.category).filter(Boolean))],
    [allLectures]
  );
  const colors = useMemo(() => {
    const used = allLectures.map((l) => l.categoryColor).filter((c) => HEX.test(c || ""));
    const all = [...PRESET_COLORS, ...used];
    const seen = new Set();
    return all.filter((c) => {
      const k = c.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [allLectures]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickImage = (file) => {
    if (!file) return;
    if (!LECTURE_IMAGE_TYPES.includes(file.type)) {
      setImageError("jpg, png, gif, webp 이미지만 올릴 수 있습니다.");
      return;
    }
    if (file.size > LECTURE_IMAGE_MAX_SIZE) {
      setImageError("20MB 이하 이미지만 올릴 수 있습니다.");
      return;
    }
    setImageError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const previewLecture = {
    id: lecture?.id ?? "preview",
    ...form,
    lectureNum: form.lectureNum,
    lectureTime: form.lectureTime,
    imgUrl: imagePreview || lecture?.imgUrl || "",
  };

  const handleSave = async () => {
    setTouched(true);
    if (hasErrors || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try {
      const docId = lecture?.id ?? newLectureId();
      let imgUrl = lecture?.imgUrl ?? "";
      if (imageFile) {
        setProgress(0);
        imgUrl = await uploadLectureImage(docId, imageFile, setProgress);
      }
      const fields = {
        category: form.category.trim(),
        categoryColor: form.categoryColor,
        title: form.title.trim(),
        lecturer: form.lecturer.trim(),
        lectureNum: Number(form.lectureNum),
        lectureTime: Number(form.lectureTime),
        detail: form.detail,
        imgUrl,
      };
      if (isNew) {
        const extra = {
          lectureId: nextLectureId(allLectures),
          order: nextOrder(allLectures),
        };
        await createLecture(docId, fields, extra);
        onSaved({ id: docId, ...fields, ...extra, isMain: false, createdAt: new Date() }, true);
      } else {
        await updateLecture(docId, fields);
        onSaved({ ...lecture, ...fields }, false);
      }
    } catch (error) {
      console.error("강의 저장 실패:", error);
      setSaveError(
        error instanceof ImageUploadError
          ? error.message
          : `저장하지 못했습니다: ${error.message}`
      );
      savingRef.current = false;
      setSaving(false);
      setProgress(null);
    }
  };

  const fieldError = (key) =>
    touched && errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null;
  const inputCls = (key) =>
    `w-full border rounded px-3 py-2 text-sm ${
      touched && errors[key] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="bg-white rounded-lg shadow p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{isNew ? "새 강의 추가" : "강의 수정"}</h3>
          {!isNew && (
            <p className="text-xs text-gray-500">
              {lecture.lectureId || "ID 없음"}
              {lecture.createdAt instanceof Date && ` · 생성 ${lecture.createdAt.toLocaleDateString("ko-KR")}`}
            </p>
          )}
        </div>
        {dirty && <span className="text-xs text-orange-600">저장하지 않은 변경이 있습니다</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
          <input
            className={inputCls("category")}
            list="lecture-categories"
            value={form.category}
            onChange={set("category")}
            placeholder="필수 과정"
          />
          <datalist id="lecture-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-xs text-gray-400 mt-1">기존 카테고리에서 고르거나 새로 입력</p>
          {fieldError("category")}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 배지 색 *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`배지 색 ${c}`}
                onClick={() => setForm((f) => ({ ...f, categoryColor: c }))}
                className={`h-7 w-7 rounded-full border ${
                  form.categoryColor.toLowerCase() === c.toLowerCase()
                    ? "ring-2 ring-offset-1 ring-blue-500 border-white"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            className={inputCls("categoryColor")}
            value={form.categoryColor}
            onChange={set("categoryColor")}
            placeholder="#f59e0b"
          />
          {fieldError("categoryColor")}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
          <input className={inputCls("title")} value={form.title} onChange={set("title")} />
          {fieldError("title")}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">강사</label>
          <input className={inputCls("lecturer")} value={form.lecturer} onChange={set("lecturer")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강의 수 (강) *</label>
            <input
              className={inputCls("lectureNum")}
              inputMode="numeric"
              value={form.lectureNum}
              onChange={set("lectureNum")}
            />
            {fieldError("lectureNum")}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이수 시간 (시간) *</label>
            <input
              className={inputCls("lectureTime")}
              inputMode="numeric"
              value={form.lectureTime}
              onChange={set("lectureTime")}
            />
            {fieldError("lectureTime")}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">상세 설명</label>
          <textarea
            className={`${inputCls("detail")} leading-relaxed`}
            rows={10}
            value={form.detail}
            onChange={set("detail")}
          />
          <p className="text-xs text-gray-400 mt-1">줄바꿈이 공개 화면에 그대로 표시됩니다.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            강의 이미지 <span className="font-normal text-gray-400">(가로 4:3 권장, 예: 800×600 · jpg·png·gif·webp · 20MB 이하 · 큰 사진은 저장할 때 자동으로 줄여서 올립니다)</span>
          </label>
          <div
            className="flex items-center gap-4 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pickImage(e.dataTransfer.files?.[0]);
            }}
          >
            {previewLecture.imgUrl ? (
              <img src={previewLecture.imgUrl} alt="" className="h-16 w-20 object-cover rounded" />
            ) : (
              <div className="h-16 w-20 rounded bg-gray-100" />
            )}
            <div className="text-sm text-gray-600">
              <ImagePlus size={16} className="inline mr-1" />
              {imageFile ? `${imageFile.name} (저장 시 업로드)` : "클릭하거나 이미지를 끌어다 놓으세요"}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={LECTURE_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              pickImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || (!isNew && !dirty)}
          className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={16} />
          {saving
            ? progress != null && progress < 100
              ? `이미지 업로드 중 ${progress}%`
              : "저장 중…"
            : isNew
            ? "강의 추가"
            : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <X size={16} />
          {isNew ? "취소" : "닫기"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={() => onDelete(lecture)}
            disabled={saving}
            className="ml-auto flex items-center gap-1 text-red-600 text-sm px-3 py-2 rounded hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
            강의 삭제
          </button>
        )}
        {touched && hasErrors && (
          <p className="w-full text-sm text-red-600">입력 내용을 확인하세요.</p>
        )}
        {saveError && <p className="w-full text-sm text-red-600">{saveError}</p>}
      </div>

      <LecturePreview lecture={previewLecture} />
    </div>
  );
}
