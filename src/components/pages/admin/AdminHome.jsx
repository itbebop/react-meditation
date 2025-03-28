import React, { useState, useEffect } from "react";
import { storage } from "../../../firebase/firebase_config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";

export default function AdminHome() {
  const [selectedFiles, setSelectedFiles] = useState(Array(5).fill(null));
  const [uploadStatuses, setUploadStatuses] = useState(Array(5).fill(""));
  const [imageUrls, setImageUrls] = useState(Array(5).fill(""));

  useEffect(() => {
    // 컴포넌트 마운트 시 기존 이미지 URL 가져오기
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        getDownloadURL(ref(storage, `home/img${i + 1}`))
          .then((url) => {
            setImageUrls((prev) => {
              const newUrls = [...prev];
              newUrls[i] = url;
              return newUrls;
            });
          })
          .catch((error) => {
            if (error.code === "storage/object-not-found") {
              setImageUrls((prev) => {
                const newUrls = [...prev];
                newUrls[i] = ""; // 이미지 없음 처리
                return newUrls;
              });
            } else {
              console.error(`이미지 ${i + 1}를 불러오는 중 오류 발생:`, error);
            }
          })
      );
    }
    Promise.all(promises).then(() => {
      console.log("모든 이미지 상태 확인 완료");
    });
  }, []);

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index] =
          "허용된 이미지 파일 형식이 아닙니다. (jpeg, png, gif)";
        return newStatuses;
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index] = "파일 크기는 5MB 이하여야 합니다.";
        return newStatuses;
      });
      return;
    }

    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const uploadImage = async (index) => {
    if (!selectedFiles[index]) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index] = "파일을 선택하세요.";
        return newStatuses;
      });
      return;
    }
    const storageRef = ref(storage, `home/img${index + 1}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFiles[index]);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[index] = `이미지 업로드 중: ${progress.toFixed(2)}%`;
          return newStatuses;
        });
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[index] = `이미지 업로드 실패: ${error.message}`;
          return newStatuses;
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = downloadURL;
            return newUrls;
          });
          setUploadStatuses((prev) => {
            const newStatuses = [...prev];
            newStatuses[index] = `이미지 업로드 성공했습니다`;
            return newStatuses;
          });
        });
      }
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">홈 이미지 업로드</h2>

      {[0, 1, 2, 3, 4].map((index) => (
        <Card key={index} className="mb-6 flex">
          <CardContent className="flex-1">
            <h3 className="text-lg font-semibold mb-4">
              이미지 {index + 1} (5MB 이하)
            </h3>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, index)}
              className="mb-4"
            />
            <Button onClick={() => uploadImage(index)}>이미지 업로드</Button>
            {uploadStatuses[index] && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>{uploadStatuses[index]}</p>
              </div>
            )}
          </CardContent>
          <div className="w-1/3 flex items-center justify-center">
            {imageUrls[index] ? (
              <img
                src={imageUrls[index]}
                alt={`Image ${index + 1}`}
                className="max-w-full max-h-48 object-contain"
              />
            ) : (
              <p>이미지 없음</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
