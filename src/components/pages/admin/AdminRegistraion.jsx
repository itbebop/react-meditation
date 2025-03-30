import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase/firebase_config";
import { Edit, Save, Plus, Trash2, X } from "lucide-react"; // X 아이콘 추가

export default function AdminRegistration() {
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [editingLecture, setEditingLecture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lectures"));
      const lectureData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Firestore Timestamp를 JavaScript Date로 변환
        createdAt: doc.data().createdAt?.toDate() || null,
      }));
      setLectures(lectureData);
    } catch (error) {
      console.error("Error loading lectures:", error);
    }
  };

  const handleCheckboxChange = (lectureId) => {
    setSelectedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const handleEditClick = (lecture) => {
    setEditingLecture(lecture);
  };
  // 임시 ID 생성기
  const generateTempId = () => `temp-${Date.now()}`;
  // 강의 추가 핸들러 수정
  const handleAddLecture = () => {
    const newLecture = {
      id: `temp-${Date.now()}`, // 임시 ID 생성
      lectureId: `LEC-${Date.now()}`,
      category: "기본 카테고리",
      categoryColor: 0,
      title: "새 강의 제목",
      lecturer: "강사 이름",
      lectureNum: 0,
      lectureTime: 0,
      detail: "강의 상세 설명",
      imgUrl: "",
      isNew: true, // 새 항목 표시
      createdAt: null, // 생성일 초기값 설정
    };
    setLectures((prev) => [...prev, newLecture]);
    setEditingLecture(newLecture);
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (editingLecture?.isNew) {
      setLectures((prev) => prev.filter((l) => l.id !== editingLecture.id));
    }
    setEditingLecture(null);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedLectures.map((lectureId) =>
          deleteDoc(doc(db, "lectures", lectureId))
        )
      );
      setSelectedLectures([]);
      loadLectures();
    } catch (error) {
      console.error("Error deleting lectures:", error);
    }
  };

  // 이미지 업로드 핸들러 수정
  const handleImageUpload = async (file, lectureId) => {
    try {
      const storageRef = ref(storage, `registration/${lectureId}/imageFile`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // 업로드 상태 추적 추가
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => reject(error),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  };

  // 이미지 업로드 통합 저장 로직
  const handleSaveEdit = async () => {
    try {
      let updatedLecture = { ...editingLecture };
      delete updatedLecture.isNew;

      // 1. 이미지 업로드 처리
      if (editingLecture.newImageFile) {
        const downloadURL = await handleImageUpload(
          editingLecture.newImageFile,
          updatedLecture.lectureId
        );
        updatedLecture.imgUrl = downloadURL;
        delete updatedLecture.newImageFile;
      }

      // 2. Firestore 업데이트/추가 분기 처리
      let lectureData = {
        lectureId: updatedLecture.lectureId,
        category: updatedLecture.category,
        categoryColor: Number(updatedLecture.categoryColor),
        title: updatedLecture.title,
        lecturer: updatedLecture.lecturer,
        lectureNum: Number(updatedLecture.lectureNum),
        lectureTime: Number(updatedLecture.lectureTime),
        detail: updatedLecture.detail,
        imgUrl: updatedLecture.imgUrl,
        createdAt: editingLecture.isNew
          ? serverTimestamp()
          : updatedLecture.createdAt,
      };

      if (editingLecture.isNew) {
        // 새 문서 추가
        const docRef = await addDoc(collection(db, "lectures"), lectureData);
        lectureData.id = docRef.id; // 실제 ID 획득
      } else {
        // 기존 문서 업데이트
        await updateDoc(doc(db, "lectures", updatedLecture.id), lectureData);
        lectureData.id = updatedLecture.id;
      }

      // 3. UI 상태 업데이트
      setLectures((prev) =>
        prev.map((lec) =>
          lec.id === editingLecture.id ? { ...lectureData } : lec
        )
      );
      setEditingLecture(null);
    } catch (error) {
      console.error("강의 저장 실패:", error);
      alert("저장에 실패했습니다: " + error.message);
    }
  };

  // 테이블에 이미지 컬럼 추가
  const renderImageColumn = (lecture) => (
    <td className="px-6 py-4 whitespace-nowrap">
      {editingLecture?.id === lecture.id ? (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setEditingLecture({
                  ...editingLecture,
                  newImageFile: file,
                  imgUrl: URL.createObjectURL(file), // 미리보기용 임시 URL
                });
              }
            }}
            className="border p-1 rounded"
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded">
              <div
                className="bg-blue-500 text-xs text-white p-1 rounded"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      ) : lecture.imgUrl ? (
        <img
          src={lecture.imgUrl || undefined} // 빈 문자열 대신 undefined 전달
          alt={`강의 이미지`}
          className="w-16 h-16 object-cover rounded"
        />
      ) : (
        <span className="text-gray-500">이미지 없음</span>
      )}
    </td>
  );

  // 편집 가능한 셀 렌더링
  const renderEditableCell = (lecture, field, label, type = "text") => (
    <td className="px-6 py-4 whitespace-nowrap">
      {editingLecture?.id === lecture.id ? (
        <input
          type={type}
          value={editingLecture[field]}
          onChange={(e) =>
            setEditingLecture({
              ...editingLecture,
              [field]:
                type === "number" ? Number(e.target.value) : e.target.value,
            })
          }
          className="border rounded p-1 w-full max-w-[200px]"
        />
      ) : (
        lecture[field] || label
      )}
    </td>
  );

  // 상세 설명 렌더링 함수
  const renderDetailCell = (lecture) => {
    const maxLength = 50; // maxLength 변수 정의 추가

    return (
      <td className="px-6 py-4 max-w-xs overflow-hidden">
        {editingLecture?.id === lecture.id ? (
          <textarea
            value={editingLecture.detail}
            onChange={(e) =>
              setEditingLecture({ ...editingLecture, detail: e.target.value })
            }
            className="border rounded p-1 w-64"
            rows="3"
            maxLength={100} // 필요시 maxLength 속성 추가
          />
        ) : (
          <div className="truncate-text">
            {lecture.detail
              ? lecture.detail.slice(0, maxLength) +
                (lecture.detail.length > maxLength ? "..." : "")
              : "상세 설명 없음"}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">강의 관리</h2>
        <div>
          <button
            onClick={handleAddLecture}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            <Plus size={18} className="inline mr-2" />
            강의 추가
          </button>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            disabled={selectedLectures.length === 0}
          >
            <Trash2 size={18} className="inline mr-2" />
            선택 삭제
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                선택
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강의 ID
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리 색상
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강의 횟수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강의 시간(분)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상세 설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이미지
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lectures.map((lecture) => (
              <tr key={lecture.id}>
                {/* 선택 체크박스 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedLectures.includes(lecture.id)}
                    onChange={() => handleCheckboxChange(lecture.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                    disabled={lecture.isNew}
                  />
                </td>
                {/* 수정된 렌더링 함수 호출 */}
                {renderEditableCell(lecture, "lectureId", "강의 ID")}
                {renderEditableCell(lecture, "category", "카테고리")}
                {renderEditableCell(
                  lecture,
                  "categoryColor",
                  "색상코드",
                  "number"
                )}
                {renderEditableCell(lecture, "title", "제목")}
                {renderEditableCell(lecture, "lecturer", "강사")}
                {renderEditableCell(lecture, "lectureNum", "횟수", "number")}
                {renderEditableCell(lecture, "lectureTime", "시간", "number")}
                {/* 상세 설명 컬럼 */}
                {renderDetailCell(lecture)}
                {/* 이미지 컬럼 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingLecture?.id === lecture.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          file &&
                            setEditingLecture({
                              ...editingLecture,
                              newImageFile: file,
                              imgUrl: URL.createObjectURL(file),
                            });
                        }}
                      />
                      {/* ... (업로드 진행률 표시) */}
                    </div>
                  ) : lecture.imgUrl ? (
                    <img src={lecture.imgUrl || undefined} alt="강의 이미지" />
                  ) : (
                    <span className="text-gray-500">이미지 없음</span>
                  )}
                </td>
                {/* 생성일 처리 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {lecture.createdAt instanceof Date
                    ? lecture.createdAt.toLocaleString()
                    : "신규 항목"}
                </td>
                {/* 액션 버튼 */}
                <td className="px-6 py-4 whitespace-nowrap flex flex-col flex-1 justify-center items-center h-full">
                  {editingLecture?.id === lecture.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center justify-center"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(lecture)}
                      className="flex items-center justify-center"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
