import React, { useState, useEffect, lazy, Suspense } from "react";
import { storage } from "../../../firebase/firebase_config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";
import {
  DISPLAY_MODE,
  loadIntroducePage,
  saveIntroducePage,
  uploadIntroduceContentImage,
} from "../../../firebase/introducePage";

// 에디터(TipTap)는 용량이 커서 이 화면에서만 따로 불러옵니다 (공개 페이지 로딩에 영향 없음)
const RichTextEditor = lazy(() => import("../../editor/RichTextEditor"));

export default function AdminIntroduce() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false); // 이미지 확장 상태 추가

  const getImageSize = (url) => {
    const img = new Image();
    img.onload = () => {
      setImageSize(`${img.width} x ${img.height}`);
    };
    img.src = url;
  };

  useEffect(() => {
    getDownloadURL(ref(storage, "introduce/imageFile"))
      .then((url) => {
        setImageUrl(url);
        getImageSize(url);
      })
      .catch(() => setImageUrl("")); // 이미지가 없는 경우 무시
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus("허용된 이미지 파일 형식이 아닙니다. (jpeg, png, gif)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      setUploadStatus("파일을 선택하세요.");
      return;
    }

    const storageRef = ref(storage, "introduce/imageFile");
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatus(`협회소개 이미지 업로드 중: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatus(`협회소개 이미지 업로드 실패: ${error.message}`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          getImageSize(downloadURL);
          setUploadStatus(`협회소개 이미지 업로드 성공했습니다`);
        });
      }
    );
  };

  // 이미지 확장 토글 함수
  const toggleImageExpand = () => {
    setIsImageExpanded((prev) => !prev);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">협회소개</h2>

      <IntroduceContentSettings imageUrl={imageUrl} />

      <h3 className="text-xl font-bold mb-4">협회소개 이미지 업로드</h3>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <CardContent className="flex-1">
            <h3 className="text-lg font-semibold mb-4">파일 선택 (5MB 이하)</h3>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <Button onClick={uploadImage}>이미지 업로드</Button>

            {uploadStatus && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>{uploadStatus}</p>
              </div>
            )}
          </CardContent>

          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4">
            {imageUrl ? (
              <>
                {/* 이미지 보기/접기 버튼 */}
                <button
                  onClick={toggleImageExpand}
                  className="text-blue-500 underline mb-2"
                >
                  {isImageExpanded ? "이미지 접기" : "이미지 보기"}
                </button>

                {/* 조건부 렌더링으로 이미지 표시 */}
                {isImageExpanded && (
                  <>
                    <img
                      src={imageUrl}
                      alt="협회소개 이미지"
                      className="max-w-full max-h-80 object-contain"
                    />
                    {imageSize && (
                      <p className="mt-2 text-gray-500">크기: {imageSize}</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-gray-500">이미지 없음</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// 소개 페이지 표시 방식(이미지/텍스트) 선택 + 텍스트 에디터
function IntroduceContentSettings({ imageUrl }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [displayMode, setDisplayMode] = useState(DISPLAY_MODE.IMAGE);
  const [contentHtml, setContentHtml] = useState("");
  const [initialHtml, setInitialHtml] = useState("");
  const [saved, setSaved] = useState({ displayMode: DISPLAY_MODE.IMAGE, contentHtml: "" });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    loadIntroducePage()
      .then((page) => {
        setDisplayMode(page.displayMode);
        setContentHtml(page.contentHtml);
        setInitialHtml(page.contentHtml);
        setSaved({ displayMode: page.displayMode, contentHtml: page.contentHtml });
        setUpdatedAt(page.updatedAt);
      })
      .catch((error) => {
        console.error("소개 페이지 설정 불러오기 실패:", error);
        setLoadError(`저장된 내용을 불러오지 못했습니다: ${error.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty =
    displayMode !== saved.displayMode || contentHtml !== saved.contentHtml;

  // 저장하지 않은 변경이 있으면 페이지를 떠날 때 경고
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleSave = async () => {
    if (displayMode === DISPLAY_MODE.TEXT && !contentHtml) {
      setStatus({ type: "error", text: "텍스트로 표시하려면 내용을 입력하세요." });
      return;
    }
    if (displayMode === DISPLAY_MODE.IMAGE && !imageUrl) {
      setStatus({ type: "error", text: "등록된 소개 이미지가 없습니다. 이미지를 먼저 업로드하세요." });
      return;
    }
    setSaving(true);
    setStatus({ type: "", text: "" });
    try {
      await saveIntroducePage({ displayMode, contentHtml });
      setSaved({ displayMode, contentHtml });
      setUpdatedAt(new Date());
      setStatus({ type: "ok", text: "저장했습니다. 소개 페이지에 바로 반영됩니다." });
    } catch (error) {
      console.error("소개 페이지 저장 실패:", error);
      setStatus({ type: "error", text: `저장 실패: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mb-6 text-gray-500">불러오는 중…</p>;
  }

  return (
    <Card className="mb-8">
      <CardContent>
        <h3 className="text-lg font-semibold mb-3">소개 페이지 표시 방식</h3>
        {loadError && <p className="mb-3 text-sm text-red-600">{loadError}</p>}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <ModeOption
            checked={displayMode === DISPLAY_MODE.IMAGE}
            onChange={() => setDisplayMode(DISPLAY_MODE.IMAGE)}
            title="이미지"
            description="아래 '협회소개 이미지 업로드'에 올린 이미지 한 장을 보여줍니다."
          />
          <ModeOption
            checked={displayMode === DISPLAY_MODE.TEXT}
            onChange={() => setDisplayMode(DISPLAY_MODE.TEXT)}
            title="텍스트 (에디터)"
            description="에디터로 작성한 글과 이미지를 보여줍니다."
          />
        </div>

        <h3 className="text-lg font-semibold mb-3">텍스트 편집</h3>
        <p className="mb-3 text-sm text-gray-500">
          표시 방식이 '이미지'여도 미리 작성해 둘 수 있습니다. 작성한 글은 저장해야 반영됩니다.
        </p>
        <Suspense fallback={<p className="text-gray-500">에디터 불러오는 중…</p>}>
          <RichTextEditor
            initialHtml={initialHtml}
            onChange={setContentHtml}
            uploadImage={uploadIntroduceContentImage}
          />
        </Suspense>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving || !dirty} className="disabled:opacity-50">
            {saving ? "저장 중…" : "저장"}
          </Button>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            소개 페이지 열기
          </a>
          {dirty && <span className="text-sm text-orange-600">저장하지 않은 변경이 있습니다.</span>}
          {!dirty && updatedAt && (
            <span className="text-sm text-gray-500">
              마지막 저장: {updatedAt.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
        {status.text && (
          <p className={`mt-3 text-sm ${status.type === "error" ? "text-red-600" : "text-green-700"}`}>
            {status.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ModeOption({ checked, onChange, title, description }) {
  return (
    <label
      className={`flex-1 flex gap-3 p-4 border rounded-lg cursor-pointer ${
        checked ? "border-blue-600 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="introduce-display-mode"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-gray-500">{description}</span>
      </span>
    </label>
  );
}
