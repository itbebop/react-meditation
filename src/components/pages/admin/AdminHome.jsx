import React, { useState, useEffect } from "react";
import { storage } from "../../../firebase/firebase_config";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";

export default function AdminHome() {
  // 상태 초기화 부분 수정 (모든 배열을 독립 객체로 생성)
  const [selectedFiles, setSelectedFiles] = useState(
    Array.from({ length: 5 }, () => ({ pcImg: null, mobileImg: null }))
  );
  const [uploadStatuses, setUploadStatuses] = useState(
    Array.from({ length: 5 }, () => ({ pcImg: "", mobileImg: "" }))
  );
  const [imageUrls, setImageUrls] = useState(
    Array.from({ length: 5 }, () => ({ pcImg: "", mobileImg: "" }))
  );
  const [imageSizes, setImageSizes] = useState(
    Array.from({ length: 5 }, () => ({ pcImg: "", mobileImg: "" }))
  );
  const [expandedImages, setExpandedImages] = useState(
    Array.from({ length: 5 }, () => ({ pcImg: false, mobileImg: false }))
  );

  const getImageSize = (url, index, type) => {
    const img = new Image();
    img.onload = () => {
      setImageSizes((prev) => {
        const newSizes = [...prev];
        newSizes[index][type] = `${img.width} x ${img.height}`;
        return newSizes;
      });
    };
    img.src = url;
  };

  // 이미지 로드 로직 수정 (독립 객체 업데이트)
  useEffect(() => {
    const loadImages = async () => {
      try {
        const homeRef = ref(storage, "home");
        const files = await listAll(homeRef);
        const existingFiles = files.items.map((item) => item.name);

        const promises = Array(5)
          .fill(null)
          .map(async (_, i) => {
            ["pcImg", "mobileImg"].forEach(async (type) => {
              const fileName = `${type}${i + 1}`;
              if (existingFiles.includes(fileName)) {
                try {
                  const url = await getDownloadURL(
                    ref(storage, `home/${fileName}`)
                  );
                  setImageUrls((prev) => {
                    const newUrls = [...prev];
                    newUrls[i] = { ...newUrls[i], [type]: url }; // 기존 객체 유지하며 업데이트
                    return newUrls;
                  });
                  getImageSize(url, i, type);
                } catch (error) {
                  console.error(`이미지 ${type}${i + 1} 불러오기 오류:`, error);
                }
              }
            });
          });

        await Promise.all(promises);
      } catch (error) {
        console.error("Firebase 파일 목록 불러오기 실패:", error);
      }
    };
    loadImages();
  }, []);

  const handleFileChange = (event, index, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index][type] =
          "허용된 이미지 파일 형식이 아닙니다. (jpeg, png, gif)";
        return newStatuses;
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index][type] = "파일 크기는 5MB 이하여야 합니다.";
        return newStatuses;
      });
      return;
    }

    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index][type] = file;
      return newFiles;
    });
  };

  const uploadImage = async (index, type) => {
    if (!selectedFiles[index][type]) {
      setUploadStatuses((prev) => {
        const newStatuses = [...prev];
        newStatuses[index][type] = "파일을 선택하세요.";
        return newStatuses;
      });
      return;
    }
    const storageRef = ref(storage, `home/${type}${index + 1}`);
    const uploadTask = uploadBytesResumable(
      storageRef,
      selectedFiles[index][type]
    );

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[index][type] = `이미지 업로드 중: ${progress.toFixed(
            2
          )}%`;
          return newStatuses;
        });
      },
      (error) => {
        console.error("업로드 오류:", error);
        setUploadStatuses((prev) => {
          const newStatuses = [...prev];
          newStatuses[index][type] = `이미지 업로드 실패: ${error.message}`;
          return newStatuses;
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index][type] = downloadURL;
            return newUrls;
          });
          getImageSize(downloadURL, index, type);
          setUploadStatuses((prev) => {
            const newStatuses = [...prev];
            newStatuses[index][type] = `이미지 업로드 성공했습니다`;
            return newStatuses;
          });
        });
      }
    );
  };

  // 이미지 확장 토글 함수 수정 (불변성 유지)
  const toggleImageExpand = (index, type) => {
    setExpandedImages((prev) => {
      const newExpandedStates = [...prev];
      newExpandedStates[index] = {
        ...newExpandedStates[index],
        [type]: !newExpandedStates[index][type],
      };
      return newExpandedStates;
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        홈 이미지 업로드 (1920 x 1080 / ){" "}
      </h2>

      {[0, 1, 2, 3, 4].map((index) => (
        <Card key={`card-${index}`} className="mb-6">
          <div className="flex flex-col md:flex-row">
            <CardContent className="flex-1">
              <h3 className="text-lg font-semibold mb-4">
                이미지 {index + 1} (PC 및 Mobile)
              </h3>
              <div className="mb-4">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, index, "pcImg")}
                  className="mb-2"
                />
                <Button onClick={() => uploadImage(index, "pcImg")}>
                  PC 이미지 업로드
                </Button>
              </div>
              {uploadStatuses[index].pcImg && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p>{uploadStatuses[index].pcImg}</p>
                </div>
              )}
              <div className="mb-4">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, index, "mobileImg")}
                  className="mb-2"
                />
                <Button onClick={() => uploadImage(index, "mobileImg")}>
                  Mobile 이미지 업로드
                </Button>
              </div>
              {uploadStatuses[index].mobileImg && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p>{uploadStatuses[index].mobileImg}</p>
                </div>
              )}
            </CardContent>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4">
              {["pcImg", "mobileImg"].map((type) =>
                imageUrls[index][type] ? (
                  <React.Fragment key={`${type}-${index}`}>
                    <button
                      onClick={() => toggleImageExpand(index, type)}
                      className="text-blue-500 underline mb-2"
                    >
                      {expandedImages[index][type]
                        ? `${type} 이미지 접기`
                        : `${type} 이미지 보기`}
                    </button>
                    {expandedImages[index][type] && (
                      <>
                        <img
                          src={imageUrls[index][type]}
                          alt={`${type} Image ${index + 1}`}
                          className="max-w-full max-h-48 object-contain"
                        />
                        {imageSizes[index][type] && (
                          <p className="mt-2">
                            크기: {imageSizes[index][type]}
                          </p>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ) : (
                  <p key={`${type}-${index}-empty`}>{`${type} 이미지 없음`}</p>
                )
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
