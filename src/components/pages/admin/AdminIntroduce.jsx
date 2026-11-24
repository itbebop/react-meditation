import React, { useState, useEffect } from "react";
import { storage } from "../../../firebase/firebase_config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";
import PageContentSettings from "./PageContentSettings";
import {
  ACCEPTED_IMAGE_TYPES,
  RAW_MAX_BYTES,
  RESIZE_PRESETS,
  ImageUploadError,
  formatBytes,
  prepareImageForUpload,
  resizeSummary,
} from "../../../utils/imageResize";

export default function AdminIntroduce() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
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

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setSelectedFile(null); // 앞서 고른 파일이 대신 올라가지 않도록
      setUploadStatus("사진 파일(jpg, png, gif, webp)만 올릴 수 있습니다.");
      return;
    }

    // 큰 사진은 올릴 때 자동으로 줄이므로 원본은 20MB까지 받음
    if (file.size > RAW_MAX_BYTES) {
      setSelectedFile(null); // 앞서 고른 파일이 대신 올라가지 않도록
      setUploadStatus(`사진이 너무 큽니다(${formatBytes(file.size)}). 20MB 이하의 사진을 골라 주세요.`);
      return;
    }

    setUploadStatus("");

    setSelectedFile(file);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      setUploadStatus("파일을 선택하세요.");
      return;
    }
    if (uploading) return;
    setUploading(true);

    // 1. 올리기 전에 알맞은 크기로 줄이기 (utils/imageResize.js)
    setUploadStatus("사진 크기를 줄이는 중입니다…");
    let prepared;
    try {
      prepared = await prepareImageForUpload(selectedFile, RESIZE_PRESETS.pageImage);
    } catch (error) {
      setUploadStatus(
        error instanceof ImageUploadError
          ? error.message
          : "사진을 준비하지 못했습니다. 다른 사진으로 다시 시도해 주세요."
      );
      setUploading(false);
      return;
    }
    const summary = resizeSummary(prepared);

    // 2. 올리기
    const storageRef = ref(storage, "introduce/imageFile");
    const uploadTask = uploadBytesResumable(storageRef, prepared.file, {
      contentType: prepared.file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatus(`협회소개 이미지 업로드 중: ${progress.toFixed(0)}%`);
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatus(
          "협회소개 이미지를 올리지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."
        );
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          getImageSize(downloadURL);
          setUploadStatus(
            `협회소개 이미지 업로드 성공했습니다${summary ? `. ${summary}` : ""}`
          );
          setUploading(false);
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

      <PageContentSettings
        pageId="introduce"
        pageName="소개"
        publicPath="/about"
        imageSectionTitle="협회소개 이미지 업로드"
        imageUrl={imageUrl}
      />

      <h3 className="text-xl font-bold mb-4">협회소개 이미지 업로드</h3>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row">
          <CardContent className="flex-1">
            <h3 className="text-lg font-semibold mb-1">파일 선택 (20MB 이하)</h3>
            <p className="text-sm text-gray-500 mb-4">큰 사진은 올릴 때 자동으로 알맞은 크기로 줄여서 올립니다.</p>
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileChange}
              className="mb-4"
            />
            <Button onClick={uploadImage} disabled={uploading} className="disabled:opacity-50">
              {uploading ? "올리는 중…" : "이미지 업로드"}
            </Button>

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
