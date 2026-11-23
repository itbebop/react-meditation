// 강의(lectures) 컬렉션 읽기/쓰기 (관리자 화면용)
//
// Firestore lectures/<문서 id>
//   lectureId     "LEC-7"  고정 ID (순서가 바뀌어도 바뀌지 않음)
//   order         number   목록 순서 (없으면 lectureId 숫자 순, lectureUtils.js 참고)
//   isMain        boolean  홈 화면 메인 강의 (최대 2개)
//   category, categoryColor, title, lecturer, lectureNum, lectureTime(시간), detail, imgUrl, createdAt
//
// Storage registration/<문서 id>/<시각>.<확장자>
//   새로 올리는 강의 이미지. 파일 이름이 매번 달라서 다른 강의 이미지를 덮어쓰지 않습니다.
//   (예전 이미지는 registration/<lectureId>/imageFile 에 그대로 남아 있음)
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase_config";
import { sortLectures } from "../components/lecture/lectureUtils";

export const LECTURE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const LECTURE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function loadLectures() {
  const snap = await getDocs(collection(db, "lectures"));
  return sortLectures(
    snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        isMain: data.isMain === true,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    })
  );
}

// 새 문서 id를 미리 만들어 이미지 경로에 사용
export function newLectureId() {
  return doc(collection(db, "lectures")).id;
}

export function uploadLectureImage(docId, file, onProgress) {
  const ext = (file.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "");
  const imageRef = ref(storage, `registration/${docId}/${Date.now()}.${ext}`);
  const task = uploadBytesResumable(imageRef, file, { contentType: file.type });
  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

// 새 강의 생성 (fields: 폼 값, extra: lectureId, order)
export async function createLecture(docId, fields, { lectureId, order }) {
  await setDoc(doc(db, "lectures", docId), {
    ...fields,
    lectureId,
    order,
    isMain: false,
    createdAt: serverTimestamp(),
  });
}

// 기존 강의 수정: 폼 필드만 바꿈 (lectureId, order, isMain, createdAt은 건드리지 않음)
export async function updateLecture(docId, fields) {
  await updateDoc(doc(db, "lectures", docId), fields);
}

export async function deleteLecture(docId) {
  await deleteDoc(doc(db, "lectures", docId));
}

// 목록 순서와 메인 설정을 한 번에 저장 (전부 성공하거나 전부 실패)
export async function saveOrderAndMain(orderedIds, mainIds) {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, "lectures", id), {
      order: index,
      isMain: mainIds.has(id),
    });
  });
  await batch.commit();
}
