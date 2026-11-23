// 협회 소개 페이지(/about) 콘텐츠 저장소
//
// Firestore  pages/introduce
//   displayMode : "image" | "text"   - 공개 화면에 무엇을 보여줄지
//   contentHtml : string             - 에디터로 작성한 본문 HTML
//   updatedAt   : Timestamp
//
// Storage
//   introduce/imageFile              - 기존 방식의 소개 이미지 (그대로 사용)
//   introduce/content/<파일명>        - 에디터 본문에 넣은 이미지
//
// 문서가 없거나 읽을 수 없으면 기존처럼 이미지를 보여줍니다.
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase_config";

export const DISPLAY_MODE = { IMAGE: "image", TEXT: "text" };

const introduceDoc = () => doc(db, "pages", "introduce");

export async function loadIntroducePage() {
  const snap = await getDoc(introduceDoc());
  const data = snap.exists() ? snap.data() : {};
  return {
    displayMode:
      data.displayMode === DISPLAY_MODE.TEXT ? DISPLAY_MODE.TEXT : DISPLAY_MODE.IMAGE,
    contentHtml: typeof data.contentHtml === "string" ? data.contentHtml : "",
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export async function saveIntroducePage({ displayMode, contentHtml }) {
  await setDoc(
    introduceDoc(),
    { displayMode, contentHtml, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function uploadIntroduceContentImage(file) {
  const ext = (file.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const imageRef = ref(storage, `introduce/content/${name}`);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
}
