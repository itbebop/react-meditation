// 페이지별 콘텐츠(이미지/텍스트 선택 + 에디터 본문) 저장소
// 협회 소개(/about)와 교육 과정(/lecture)이 같은 구조를 씁니다.
//
// Firestore  pages/<pageId>          pageId: "introduce" | "lecture"
//   displayMode : "image" | "text"   - 공개 화면에 무엇을 보여줄지
//   contentHtml : string             - 에디터로 작성한 본문 HTML
//   updatedAt   : Timestamp
//
// Storage
//   <pageId>/imageFile               - 기존 방식의 페이지 이미지 (그대로 사용)
//   <pageId>/content/<파일명>         - 에디터 본문에 넣은 이미지
//
// 문서가 없거나 읽을 수 없으면 기존처럼 이미지를 보여줍니다.
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase_config";

export const DISPLAY_MODE = { IMAGE: "image", TEXT: "text" };

export const PAGE_IDS = ["introduce", "lecture"];

function pageDoc(pageId) {
  if (!PAGE_IDS.includes(pageId)) throw new Error(`알 수 없는 페이지: ${pageId}`);
  return doc(db, "pages", pageId);
}

export async function loadPageContent(pageId) {
  const snap = await getDoc(pageDoc(pageId));
  const data = snap.exists() ? snap.data() : {};
  return {
    displayMode:
      data.displayMode === DISPLAY_MODE.TEXT ? DISPLAY_MODE.TEXT : DISPLAY_MODE.IMAGE,
    contentHtml: typeof data.contentHtml === "string" ? data.contentHtml : "",
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export async function savePageContent(pageId, { displayMode, contentHtml }) {
  await setDoc(
    pageDoc(pageId),
    { displayMode, contentHtml, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function uploadPageContentImage(pageId, file) {
  if (!PAGE_IDS.includes(pageId)) throw new Error(`알 수 없는 페이지: ${pageId}`);
  const ext = (file.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const imageRef = ref(storage, `${pageId}/content/${name}`);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
}
