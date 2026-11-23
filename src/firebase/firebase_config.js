import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from "firebase/auth"; // 수정된 부분
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 모듈 가져오기
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 로컬 테스트용 Firebase Emulator 연결 (npm run dev:emulator 에서만 동작).
// 운영 데이터를 건드리지 않고 관리자 저장 기능 등을 시험하기 위한 것입니다.
// import.meta.env.DEV 조건 때문에 운영 빌드(npm run build)에는 포함되지 않습니다.
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  console.info("[firebase] Emulator에 연결됨 (운영 데이터 아님)");
}

// 지속성 설정 추가
setPersistence(auth, browserLocalPersistence).catch((error) =>
  console.error("Persistence 설정 실패:", error)
);

export { auth, db, storage };
