import React, { useState } from "react";
import { storage } from "../../../firebase/firebase_config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";

export default function AdminIntroduce() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus("허용된 이미지 파일 형식이 아닙니다. (jpeg, png, gif)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB 제한
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
    const storageRef = ref(storage, `introduce/imageFile`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setUploadStatus(`협회소개 이미지 업로드 중: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatus(`협회소개 이미지 업로드 실패: ${error.message}`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("파일 다운로드 URL:", downloadURL);
          setUploadStatus(`협회소개 이미지 업로드 성공했습니다`);
        });
      }
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">협회소개 이미지 업로드</h2>

      <Card className="mb-6">
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">파일 선택 (5MB 이하)</h3>
          <input type="file" onChange={handleFileChange} className="mb-4" />
          <Button onClick={uploadImage}>이미지 업로드</Button>
        </CardContent>
      </Card>

      {uploadStatus && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{uploadStatus}</p>
        </div>
      )}
    </div>
  );
}
