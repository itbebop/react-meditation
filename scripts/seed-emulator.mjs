// 로컬 Firebase Emulator에 테스트 데이터를 넣는 스크립트입니다.
// 사용법: (1) npm run emulators  (2) 다른 터미널에서 npm run emulators:seed
//
// - Emulator(127.0.0.1)에만 요청하며 운영 Firebase에는 접근하지 않습니다.
// - 아래 계정은 Emulator 안에만 존재하는 테스트용 관리자 계정입니다.
import fs from "node:fs";
import path from "node:path";

const PROJECT_ID = "ima-meditation";
const AUTH = "http://127.0.0.1:9099";
const FIRESTORE = "http://127.0.0.1:8080";
const STORAGE = "http://127.0.0.1:9199";

export const TEST_ADMIN = {
  email: "admin@emulator.test",
  password: "emulator-admin-1234",
};

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

function readBucket() {
  const env = fs.readFileSync(path.join(root, ".env"), "utf8");
  const m = env.match(/^VITE_FIREBASE_STORAGE_BUCKET=(.*)$/m);
  if (!m) throw new Error(".env에 VITE_FIREBASE_STORAGE_BUCKET이 없습니다.");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

async function call(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`${init?.method || "GET"} ${url} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  // 0. Emulator 데이터 초기화 (반복 실행해도 같은 상태가 되도록)
  await call(`${AUTH}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" });
  await call(`${FIRESTORE}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" });

  // 1. 테스트 관리자 계정 (Auth Emulator)
  const signUp = await call(
    `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...TEST_ADMIN, returnSecureToken: true }),
    }
  );
  const uid = signUp.localId;

  // 2. 관리자 목록(user 컬렉션)에 등록 - Login.jsx가 uid로 확인함
  await call(
    `${FIRESTORE}/v1/projects/${PROJECT_ID}/databases/(default)/documents/user?documentId=${uid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
      body: JSON.stringify({
        fields: {
          uid: { stringValue: uid },
          email: { stringValue: TEST_ADMIN.email },
          role: { stringValue: "admin" },
        },
      }),
    }
  );

  // 3. 기존 방식의 소개 이미지(introduce/imageFile) - "이미지" 표시 방식 확인용
  const bucket = readBucket();
  const image = fs.readFileSync(path.join(root, "IMA_favicon.png"));
  await call(
    `${STORAGE}/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent("introduce/imageFile")}`,
    {
      method: "POST",
      headers: { "Content-Type": "image/png", Authorization: "Bearer owner" },
      body: image,
    }
  );

  console.log("Emulator 테스트 데이터 준비 완료");
  console.log(`- 관리자 계정: ${TEST_ADMIN.email} (비밀번호는 scripts/seed-emulator.mjs 참고)`);
  console.log("- user 컬렉션 등록, introduce/imageFile 업로드");
}

main().catch((e) => {
  console.error("실패:", e.message);
  console.error("Emulator가 실행 중인지 확인하세요: npm run emulators");
  process.exit(1);
});
