import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase/firebase_config";
import {
  Edit,
  Save,
  Plus,
  Trash2,
  X,
  GripVertical,
  ArrowDownUp,
  RefreshCcw,
} from "lucide-react"; // X 아이콘 추가

export default function AdminRegistration() {
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [editingLecture, setEditingLecture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImageId, setPreviewImageId] = useState(null); // 이미지 미리보기 상태 관리
  const [imageSizes, setImageSizes] = useState({});
  const [draggingLectureId, setDraggingLectureId] = useState(null); // 드래그 앤 드롭 상태 추가
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [modifiedLectures, setModifiedLectures] = useState([]);
  const [mainLectures, setMainLectures] = useState([]);
  const [hasMainChanged, setHasMainChanged] = useState(false);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lectures"));
      const lectureData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isMain: doc.data().isMain || false, // undefined일 경우 false로 대체
        createdAt: doc.data().createdAt?.toDate() || null,
      }));

      // 1. lectureId 기준 정렬
      const sortedData = lectureData.sort((a, b) => {
        const numA = parseInt(a.lectureId.split("-")[1], 10);
        const numB = parseInt(b.lectureId.split("-")[1], 10);
        return numA - numB;
      });

      // 2. 정렬된 데이터로 lectures 상태 업데이트
      setLectures(sortedData);

      // 3. 메인 강의 필터링 (정렬된 데이터 사용)
      const mainItems = sortedData.filter((lecture) => lecture.isMain);
      setMainLectures(mainItems);
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

  // 강의 추가 버튼 클릭 시 ID 자동 생성
  const handleAddLecture = () => {
    // 수정된 부분: LEC-${index} 형식으로 ID 생성
    const newLectureId = `LEC-${lectures.length}`;
    const newLecture = {
      id: `temp-${Date.now()}`,
      lectureId: newLectureId,
      category: "정규 과정",
      categoryColor: "#f59e0b",
      title: "새 강의 제목",
      lecturer: "강사 이름",
      lectureNum: 0,
      lectureTime: 0,
      detail: "강의 상세 설명",
      imgUrl: "",
      isNew: true,
      createdAt: null,
      isMain: false, // 기본값 false
    };
    setLectures((prev) => [...prev, newLecture]);
    setEditingLecture(newLecture);
  };

  // 드래그 시작
  const handleDragStart = (lectureId) => {
    setDraggingLectureId(lectureId); // 수정된 부분: 드래그 상태 저장
  };
  // 드롭 처리 및 순서 변경
  const handleDrop = (targetLectureId) => {
    if (!draggingLectureId || draggingLectureId === targetLectureId) return;

    const draggedIndex = lectures.findIndex(
      (lecture) => lecture.id === draggingLectureId
    );
    const targetIndex = lectures.findIndex(
      (lecture) => lecture.id === targetLectureId
    );

    const updatedLectures = [...lectures];
    [updatedLectures[draggedIndex], updatedLectures[targetIndex]] = [
      updatedLectures[targetIndex],
      updatedLectures[draggedIndex],
    ];

    // ID 재생성 및 변경 상태 추적
    const modifiedIds = [];
    updatedLectures.forEach((lecture, index) => {
      const newId = `LEC-${index}`;
      if (lecture.lectureId !== newId) {
        modifiedIds.push(lecture.id);
        lecture.lectureId = newId;
      }
    });

    setLectures(updatedLectures);
    setHasOrderChanged(modifiedIds.length > 0);
    setModifiedLectures(modifiedIds);
    setDraggingLectureId(null);
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
        categoryColor: updatedLecture.categoryColor,
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

  const toggleImagePreview = (id) => {
    setPreviewImageId((prevId) => (prevId === id ? null : id));
    if (!imageSizes[id]) {
      getImageSize(lectures.find((lecture) => lecture.id === id).imgUrl, id);
    }
  };

  const getImageSize = (url, id) => {
    const img = new Image();
    img.onload = () => {
      setImageSizes((prev) => ({
        ...prev,
        [id]: `${img.width} x ${img.height}`,
      }));
    };
    img.src = url;
  };

  // 테이블에 이미지 컬럼 추가
  const renderImageColumn = (lecture) => (
    <td className="px-6 py-4 whitespace-nowrap">
      {editingLecture?.id === lecture.id ? (
        // 편집 모드에서 이미지 업로드 필드 표시
        <div className="flex flex-col gap-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setEditingLecture({
                  ...editingLecture,
                  newImageFile: file, // 새 이미지 파일 저장
                  imgUrl: URL.createObjectURL(file), // 미리보기 URL 생성
                });
              }
            }}
            className="mb-2"
          />
          {editingLecture.imgUrl && (
            <div>
              <img
                src={editingLecture.imgUrl}
                alt="미리보기 이미지"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>
      ) : lecture.imgUrl ? (
        <>
          {/* 이미지 보기/접기 버튼 */}
          <button
            onClick={() => toggleImagePreview(lecture.id)}
            className="text-blue-500 underline"
          >
            {previewImageId === lecture.id ? "이미지 접기" : "이미지 보기"}
          </button>

          {/* 조건부 렌더링으로 이미지 표시 */}
          {previewImageId === lecture.id && (
            <div className="mt-2">
              <img
                src={lecture.imgUrl}
                alt={`강의 이미지`}
                className="w-32 h-32 object-cover rounded"
              />
              {imageSizes[lecture.id] && (
                <p className="text-gray-500 text-sm mt-2">
                  이미지 크기: {imageSizes[lecture.id]}
                </p>
              )}
            </div>
          )}
        </>
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

  const renderActionButtons = (lecture) => (
    <td className="px-4 py-4 whitespace-nowrap flex gap-4 justify-center items-center">
      {editingLecture?.id === lecture.id ? (
        <>
          <button
            onClick={handleSaveEdit}
            className="flex items-center justify-center bg-green-500 text-white rounded-lg p-4 hover:bg-green-600 transition-all duration-300"
          >
            <Save size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center justify-center bg-red-500 text-white rounded-lg p-4 hover:bg-red-600 transition-all duration-300"
          >
            <X size={18} />
          </button>
        </>
      ) : (
        <button
          onClick={() => handleEditClick(lecture)}
          className="flex items-center justify-center bg-blue-500 text-white rounded-lg p-4 hover:bg-blue-600 transition-all duration-300"
        >
          <Edit size={18} />
        </button>
      )}
      {/* 수정된 부분: 드래그 버튼 추가 */}
      <button
        draggable
        onDragStart={() => handleDragStart(lecture.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(lecture.id)}
        className={`cursor-move ${
          modifiedLectures.includes(lecture.id)
            ? "text-red-500 hover:text-red-700"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <GripVertical size={28} />
      </button>
    </td>
  );

  // 상세 설명 렌더링 함수
  const renderDetailCell = (lecture) => {
    const maxLength = 100;

    return (
      <td className="px-6 py-4 overflow-hidden w-[42rem]">
        {" "}
        {/* 너비를 약간 확장 */}
        {editingLecture?.id === lecture.id ? (
          <textarea
            value={editingLecture.detail}
            onChange={(e) =>
              setEditingLecture({ ...editingLecture, detail: e.target.value })
            }
            className="border rounded p-2 w-full"
            rows="20"
            maxLength={150}
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

  const handleSaveOrder = async () => {
    try {
      const batchUpdates = lectures.map((lecture) =>
        updateDoc(doc(db, "lectures", lecture.id), {
          lectureId: lecture.lectureId,
        })
      );

      await Promise.all(batchUpdates);
      setHasOrderChanged(false);
      setModifiedLectures([]);
      loadLectures(); // 변경 사항 반영을 위해 데이터 재조회
      alert("순서가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("순서 저장 실패:", error);
      alert("순서 저장에 실패했습니다: " + error.message);
    }
  };

  const countCheckedMain = () =>
    lectures.filter((lecture) => lecture.isMain).length;

  const handleMainCheck = (lectureId) => {
    setLectures((prevLectures) => {
      // 현재 체크된(isMain: true) 행들 가져오기
      const currentlyChecked = prevLectures.filter((lecture) => lecture.isMain);

      // 새로 체크하려는 행 가져오기
      const targetLecture = prevLectures.find(
        (lecture) => lecture.id === lectureId
      );

      // 유효성 검사: 이미 체크된 2개를 유지하면서 새로 선택한 행을 체크
      if (currentlyChecked.length === 2 && !targetLecture.isMain) {
        // 기존 체크된 두 행의 isMain을 false로 설정
        const updatedLectures = prevLectures.map((lecture) => ({
          ...lecture,
          isMain: lecture.id === lectureId ? true : false, // 새 선택된 행만 true로 설정
        }));
        return updatedLectures;
      }

      // 기본 동작: 선택된 행의 isMain 값을 토글
      return prevLectures.map((lecture) =>
        lecture.id === lectureId
          ? { ...lecture, isMain: !lecture.isMain }
          : lecture
      );
    });

    // 변경 상태 감지
    setHasMainChanged(true);
  };

  const handleSaveMain = async () => {
    try {
      // 1. 배치 인스턴스 생성
      const batch = writeBatch(db);

      // 2. 모든 강의에 대해 업데이트 추가
      lectures.forEach((lecture) => {
        const lectureRef = doc(db, "lectures", lecture.id);
        batch.update(lectureRef, {
          isMain: lecture.isMain !== undefined ? lecture.isMain : false,
        });
      });

      // 3. 배치 커밋
      await batch.commit();

      // 4. 상태 업데이트
      setHasMainChanged(false);
      alert("메인 설정이 저장되었습니다");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 실패: " + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">강의 정보 관리</h2>
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
          {hasOrderChanged && (
            <button
              onClick={handleSaveOrder}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-2"
            >
              <ArrowDownUp size={18} className="inline mr-2" />
              순서 저장
            </button>
          )}
          {hasMainChanged && (
            <button
              onClick={handleSaveMain}
              className="bg-green-500 hover:bg-green-600 text-white font-bold ml-2 py-2 px-4 rounded"
            >
              <RefreshCcw size={18} className="inline mr-2" />
              메인 변경
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {" "}
          {/* table-fixed 제거 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                선택
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                강의 ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                카테고리 색상
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                강의 횟수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                강의 시간(분)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                {" "}
                {/* 상세 설명 컬럼 너비 확대 */}
                상세 설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                {" "}
                {/* 이미지 컬럼 너비 축소 */}
                이미지 (800 x 600)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                생성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
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
                {renderEditableCell(lecture, "categoryColor", "색상코드")}
                {renderEditableCell(lecture, "title", "제목")}
                {renderEditableCell(lecture, "lecturer", "강사")}
                {renderEditableCell(lecture, "lectureNum", "0", "number")}
                {renderEditableCell(lecture, "lectureTime", "0", "number")}
                {/* 상세 설명 컬럼 */}
                {renderDetailCell(lecture)}
                {/* 이미지 컬럼 */}
                {renderImageColumn(lecture)}
                {/* 생성일 처리 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {lecture.createdAt instanceof Date
                    ? lecture.createdAt.toLocaleDateString() // 날짜만 출력
                    : "신규 항목"}
                </td>

                {/* 액션 버튼 */}
                {renderActionButtons(lecture)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
