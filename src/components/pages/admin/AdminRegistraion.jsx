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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminRegistration() {
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [editingLecture, setEditingLecture] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImageId, setPreviewImageId] = useState(null);
  const [imageSizes, setImageSizes] = useState({});
  const [draggingLectureId, setDraggingLectureId] = useState(null);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [modifiedLectures, setModifiedLectures] = useState([]);
  const [mainLectures, setMainLectures] = useState([]);
  const [hasMainChanged, setHasMainChanged] = useState(false);

  useEffect(() => {
    loadLectures();
  }, []);
  const [expandedDetails, setExpandedDetails] = useState({});

  const loadLectures = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lectures"));
      const lectureData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isMain: doc.data().isMain || false,
        createdAt: doc.data().createdAt?.toDate() || null,
      }));

      const sortedData = lectureData.sort((a, b) => {
        const numA = parseInt(a.lectureId.split("-")[1], 10);
        const numB = parseInt(b.lectureId.split("-")[1], 10);
        return numA - numB;
      });

      setLectures(sortedData);

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

  const handleAddLecture = () => {
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
      isMain: false,
    };
    setLectures((prev) => [...prev, newLecture]);
    setEditingLecture(newLecture);
  };

  const handleDragStart = (lectureId) => {
    setDraggingLectureId(lectureId);
  };

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

  const handleImageUpload = async (file, lectureId) => {
    try {
      const storageRef = ref(storage, `registration/${lectureId}/imageFile`);
      const uploadTask = uploadBytesResumable(storageRef, file);

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

  const handleSaveEdit = async () => {
    try {
      let updatedLecture = { ...editingLecture };
      delete updatedLecture.isNew;

      if (editingLecture.newImageFile) {
        const downloadURL = await handleImageUpload(
          editingLecture.newImageFile,
          updatedLecture.lectureId
        );
        updatedLecture.imgUrl = downloadURL;
        delete updatedLecture.newImageFile;
      }

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
        const docRef = await addDoc(collection(db, "lectures"), lectureData);
        lectureData.id = docRef.id;
      } else {
        await updateDoc(doc(db, "lectures", updatedLecture.id), lectureData);
        lectureData.id = updatedLecture.id;
      }

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

  // 상세설명 토글 함수 추가
  const toggleDetailExpand = (id) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderImageColumn = (lecture) => (
    <td className="px-4 py-3">
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
                  imgUrl: URL.createObjectURL(file),
                });
              }
            }}
            className="text-sm"
          />
          {editingLecture.imgUrl && (
            <img
              src={editingLecture.imgUrl}
              alt="미리보기"
              className="w-24 h-18 object-cover rounded"
            />
          )}
        </div>
      ) : lecture.imgUrl ? (
        <div>
          <button
            onClick={() => toggleImagePreview(lecture.id)}
            className="text-blue-500 hover:text-blue-700 text-sm underline"
          >
            {previewImageId === lecture.id ? "이미지 접기" : "이미지 보기"}
          </button>
          {previewImageId === lecture.id && (
            <div className="mt-2">
              <img
                src={lecture.imgUrl}
                alt="강의 이미지"
                className="w-32 h-24 object-cover rounded"
              />
              {imageSizes[lecture.id] && (
                <p className="text-gray-500 text-xs mt-1">
                  {imageSizes[lecture.id]}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400 text-sm">없음</span>
      )}
    </td>
  );

  const renderEditableCell = (lecture, field, label, type = "text") => (
    <td className="px-4 py-3">
      {field === "lectureId" ? (
        <span className="text-sm">{lecture[field] || label}</span>
      ) : editingLecture?.id === lecture.id ? (
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
          className="border rounded p-1.5 w-full text-sm"
        />
      ) : (
        <span className="text-sm">{lecture[field] || label}</span>
      )}
    </td>
  );

  const renderActionButtons = (lecture) => (
    <td className="px-3 py-3">
      <div className="flex gap-2 justify-center items-center">
        {editingLecture?.id === lecture.id ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="bg-green-500 text-white rounded p-2 hover:bg-green-600 transition-all"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white rounded p-2 hover:bg-red-600 transition-all"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleEditClick(lecture)}
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-all"
          >
            <Edit size={16} />
          </button>
        )}
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
          <GripVertical size={20} />
        </button>
      </div>
    </td>
  );

  // 상세 설명 렌더링 함수 수정 (토글 기능 추가)
  const renderDetailCell = (lecture) => {
    const maxLength = 50;
    const isExpanded = expandedDetails[lecture.id];
    const shouldTruncate = lecture.detail && lecture.detail.length > maxLength;

    return (
      <td className="px-4 py-3 min-w-[300px]">
        {editingLecture?.id === lecture.id ? (
          <textarea
            value={editingLecture.detail}
            onChange={(e) =>
              setEditingLecture({ ...editingLecture, detail: e.target.value })
            }
            className="border rounded p-2 w-full text-sm"
            rows="4"
          />
        ) : (
          <div className="space-y-1">
            <div className="text-sm leading-relaxed">
              {/* 수정: expand 시 전체, 아니면 일부만 표시 */}
              {isExpanded
                ? lecture.detail || "상세 설명 없음"
                : shouldTruncate
                ? `${lecture.detail.slice(0, maxLength)}...`
                : lecture.detail || "상세 설명 없음"}
            </div>
            {shouldTruncate && (
              <button
                onClick={() => toggleDetailExpand(lecture.id)}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={14} />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    더보기
                  </>
                )}
              </button>
            )}
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
      loadLectures();
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
      const currentlyChecked = prevLectures.filter((lecture) => lecture.isMain);
      const targetLecture = prevLectures.find(
        (lecture) => lecture.id === lectureId
      );

      if (currentlyChecked.length === 2 && !targetLecture.isMain) {
        return prevLectures.map((lecture) => ({
          ...lecture,
          isMain: lecture.id === lectureId ? true : false,
        }));
      }

      return prevLectures.map((lecture) =>
        lecture.id === lectureId
          ? { ...lecture, isMain: !lecture.isMain }
          : lecture
      );
    });

    setHasMainChanged(true);
  };

  const handleSaveMain = async () => {
    try {
      const batch = writeBatch(db);

      lectures.forEach((lecture) => {
        const lectureRef = doc(db, "lectures", lecture.id);
        batch.update(lectureRef, {
          isMain: lecture.isMain !== undefined ? lecture.isMain : false,
        });
      });

      await batch.commit();
      setHasMainChanged(false);
      alert("메인 설정이 저장되었습니다");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 실패: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">강의 정보 관리</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAddLecture}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={18} />
            강의 추가
          </button>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            disabled={selectedLectures.length === 0}
          >
            <Trash2 size={18} />
            선택 삭제
          </button>
          {hasOrderChanged && (
            <button
              onClick={handleSaveOrder}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <ArrowDownUp size={18} />
              순서 저장
            </button>
          )}
          {hasMainChanged && (
            <button
              onClick={handleSaveMain}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <RefreshCcw size={18} />
              메인 변경
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  선택
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  메인
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  강의 ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  카테고리
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  카테고리 색상
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  제목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  강사
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  강의 횟수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  강의 시간(분)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                  상세 설명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  이미지 (800x600)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  생성일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lectures.map((lecture) => (
                <tr key={lecture.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLectures.includes(lecture.id)}
                      onChange={() => handleCheckboxChange(lecture.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                      disabled={lecture.isNew}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={lecture.isMain || false}
                      onChange={() => handleMainCheck(lecture.id)}
                      className="form-checkbox h-4 w-4 text-yellow-500"
                      disabled={countCheckedMain() >= 2 && !lecture.isMain}
                    />
                  </td>
                  {renderEditableCell(lecture, "lectureId", "강의 ID")}
                  {renderEditableCell(lecture, "category", "카테고리")}
                  {renderEditableCell(lecture, "categoryColor", "색상코드")}
                  {renderEditableCell(lecture, "title", "제목")}
                  {renderEditableCell(lecture, "lecturer", "강사")}
                  {renderEditableCell(lecture, "lectureNum", "0", "number")}
                  {renderEditableCell(lecture, "lectureTime", "0", "number")}
                  {renderDetailCell(lecture)}
                  {renderImageColumn(lecture)}
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {lecture.createdAt instanceof Date
                        ? lecture.createdAt.toLocaleDateString()
                        : "신규 항목"}
                    </span>
                  </td>
                  {renderActionButtons(lecture)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
