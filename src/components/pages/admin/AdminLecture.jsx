import React, { useState, useEffect } from "react";
import { storage } from "../../../firebase/firebase_config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";

export default function AdminLecture() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState("");

  // 이미지 크기 확인 함수
  const getImageSize = (url) => {
    const img = new Image();
    img.onload = () => {
      setImageSize(`${img.width} x ${img.height}`);
    };
    img.src = url;
  };

  // 기존 이미지 불러오기
  useEffect(() => {
    getDownloadURL(ref(storage, "lecture/imageFile"))
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
    const storageRef = ref(storage, `lecture/imageFile`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatus(`교육과정 이미지 업로드 중: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatus(`교육과정 이미지 업로드 실패: ${error.message}`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          getImageSize(downloadURL);
          setUploadStatus(`교육과정 이미지 업로드 성공했습니다`);
        });
      }
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">교육과정 이미지 업로드</h2>

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
                <img
                  src={imageUrl}
                  alt="교육과정 이미지"
                  className="max-w-full max-h-80 object-contain"
                />
                {imageSize && <p className="mt-2">크기: {imageSize}</p>}
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
