# 개선 필요 사항

코드 검토, `npm audit`, `npm run lint` 결과를 바탕으로 정리한 수정 목록입니다(2026-11-23 기준).
Firestore 보안 규칙과 Firebase Auth 설정(회원가입 허용 여부)은 콘솔에서만 관리되어 저장소에서 확인하지 못했습니다.

## 🔴 1순위: 보안

- [x] **오타 난 외부 스크립트 주소**: `index.html`이 `https://cdn.tailwindscss.com`(`tailwindcss`가 아닌 `tailwindscss`)에서 스크립트를 불러왔습니다. 연결 시간 초과(약 20초)로 끝났지만, 누군가 이 도메인을 등록하면 모든 방문자 브라우저에서 임의의 JS가 실행될 수 있었습니다. → `<script>` 줄 삭제 (2026-11-23). Tailwind는 빌드에 포함되어 있어 스타일 변화 없음(CSS 빌드 결과 동일), 개발 서버 페이지 로드 약 20초 → 0.2초.
- [ ] **관리자 권한 확인 누락**: 로그인 화면(`Login.jsx`)만 `user` 컬렉션을 확인하고, `ProtectedRoute.jsx`는 로그인 여부만 봅니다. 로그인한 계정이면 누구나 `/dashboard`에 직접 들어갈 수 있고, 회원가입이 켜져 있으면 아무나 계정을 만들어 접근할 수 있습니다.
  - 위치: `src/components/pages/admin/ProtectedRoute.jsx`
- [ ] **Storage 쓰기 권한이 "로그인 사용자 전체"**: 관리자가 아닌 계정도 홈·소개·강의 이미지를 덮어쓸 수 있습니다. `user` 컬렉션 또는 custom claim 기준으로 제한해야 합니다.
  - 위치: `storage.rules`
- [ ] **Firestore 규칙이 저장소에 없음**: `alarms`에 신청자 이름·전화번호·이메일이 저장됩니다. 규칙이 느슨하면 개인정보가 노출됩니다. 콘솔 규칙을 확인하고 `firestore.rules`로 저장소에서 관리하도록 옮깁니다.
- [x] **npm 취약점**: 27개(critical 2) → 4개(high, 모두 `@grpc/grpc-js` 계열)로 줄임. 자세한 내용은 [WORKLOG.md](WORKLOG.md) 참고.

- [x] **`pages` 컬렉션(협회 소개 에디터) 쓰기 권한 확인**: 2026-11-23 운영에서 관리자 저장 성공(사용자 확인). 단, 관리자가 아닌 로그인 사용자도 쓸 수 있는지는 콘솔 규칙 확인이 필요합니다(1순위 권한 문제와 함께). (읽기는 비로그인으로도 허용됨을 확인: REST 요청 → 404 = 권한 있음·문서 없음)

> 1~3번은 "관리자 = `user` 컬렉션(또는 custom claim)"이라는 하나의 기준으로 묶어서, 보호 라우트·Storage 규칙·Firestore 규칙이 모두 그 기준을 쓰게 하는 것이 좋습니다.

## 🟠 2순위: 동작 오류·잘못된 설정

- [ ] **사용자 추가 버튼이 쓸 수 없는 계정을 만듦**: `uid` 없이 `새사용자@example.com` 고정값을 넣습니다. 로그인은 `uid`로 확인하므로 이 계정으로는 들어갈 수 없습니다. (`User.jsx` `handleAddUser`)
- [ ] **사용자 수정 시 화면 객체를 그대로 저장**: `updateDoc(docRef, editingUser)` 때문에 `id` 필드까지 문서에 저장됩니다. (`User.jsx` `handleSaveEdit`)
- [x] **배포 워크플로가 동작하지 않음**: GitHub Pages 템플릿이 그대로 남아 있었고, 존재하지 않는 `npm run deploy`를 호출했습니다. → Firebase Hosting(live) 배포로 다시 작성 (2026-11-23). `main` push 시 자동 배포 + 수동 실행, Node 22, secret 누락 시 빌드 전 중단.
  - [ ] GitHub secrets 등록 필요: `FIREBASE_SERVICE_ACCOUNT_IMA_MEDITATION`, `VITE_FIREBASE_*` 7개. 등록 전에는 워크플로가 실패하고 배포되지 않습니다.
  - [x] secrets 등록 및 첫 자동 배포 성공 (2026-11-23, WORKLOG 참고).
  - [ ] 더 이상 쓰지 않는 `GH_PAT` secret과 `deploy.sh` 정리.
  - [ ] `actions/checkout@v4`, `actions/setup-node@v4`가 Node.js 20 기반이라 지원 종료 예정 경고가 나옵니다. v5로 올립니다.
  - [ ] 문서(`docs/`, `*.md`)만 바뀌어도 `main` push 시 운영 재배포가 실행됩니다. 필요하면 워크플로에 `paths-ignore`를 추가합니다.
- [ ] **모바일에서 관리자 사이드바 토글 불가**: `setMenuOpen`을 쓰는 곳이 없습니다. (`AdminLayout.jsx`)
- [ ] **대시보드가 매번 전체 `alarms`를 읽음**: 연도 범위 계산을 위해 전체를 조회하고, 신청 건마다 `lectures`를 다시 조회합니다(N+1). 데이터가 늘면 느려지고 비용이 늘어납니다. (`Dashboard.jsx`)
- [ ] **`lectureId` 형식 의존**: 정렬 시 `LEC-<숫자>` 형식을 가정해서, 형식이 다르거나 값이 비면 `NaN`/오류가 납니다. (`Registration.jsx`)
- [x] **자기참조 의존성**: `package.json`의 `"react-js-project-202503": "file:"` 줄 삭제 (취약점 패치 때 함께 처리).

## 🟡 3순위: 코드 정리·품질

- [ ] **lint 오류 19개**: 미사용 변수(`handleFileChange`, `uploadProgress`, `mainLectures`, `handleLogout`, `setMenuOpen` 등), 불필요한 try/catch, `vite.config.js`·`tailwind.config.js`에 Node 환경 설정 누락.
- [ ] **`registraion` 오타**: 라우트(`/dashboard/registraion`), 파일명(`AdminRegistraion.jsx`), 사이드바 이동 경로를 함께 수정합니다.
- [ ] **미사용 파일·의존성 정리**: `dataconnect/`, `generated/`, `functions/`, `audit.json`(UTF-16 저장으로 JSON 파싱 불가), `public/index.html`·`public/404.html`, 미사용 `react-scroll`.
- [ ] **오류 처리 개선**: 사용자 관리 기능은 실패해도 `console.error`만 남기고 화면에 알리지 않습니다. 로그인 오류는 원인과 무관하게 같은 메시지입니다.
- [x] ~~**배포 사이트에 파비콘 없음**~~ → **잘못된 판단이었음** (2026-11-23 정정). Vite가 `index.html`의 `/IMA_favicon.png`를 `dist/assets/IMA_favicon-<해시>.png`로 복사하고 경로도 바꿔 줍니다. 운영 사이트에서도 `<link rel="icon" href="/assets/IMA_favicon-DBg9wzKt.png">`로 정상 제공 중. 처음 확인할 때 `dist/` 최상위만 보고 판단한 실수입니다.
- [ ] **`<html lang="en">`**: 한국어 사이트이므로 `lang="ko"`가 맞습니다(검색·스크린리더에 영향). (`index.html`)
- [ ] **협회 소개 이미지가 너무 큼**: Storage `introduce/imageFile`이 1448×10240 PNG(약 1.4MB)라서 느린 네트워크에서는 로딩에 실패하기도 합니다. 웹용으로 압축(WebP/JPEG)하거나 나눠서 올리는 것을 권장합니다.
- [ ] **번들 크기**: 빌드 결과 JS가 한 파일에 약 1.09MB(gzip 289KB)입니다. 관리자 페이지를 `React.lazy`로 분리하면 공개 페이지 로딩이 빨라집니다.
- [ ] **404 페이지**: 현재 `<div>404 Not Found</div>`만 있고 레이아웃이 없습니다.
- [ ] **에디터 본문에서 지운 이미지가 Storage에 남음**: 협회 소개 에디터에서 이미지를 삭제해도 `introduce/content/`의 파일은 지워지지 않습니다. 용량이 쌓이면 저장된 HTML에 없는 파일을 정리하는 기능을 추가합니다.
- [ ] **Emulator의 Firestore 규칙이 전부 허용**: 운영 규칙이 저장소에 없어서 Emulator는 모든 읽기/쓰기를 허용한 상태로 실행됩니다. 운영 규칙을 `firestore.rules`로 가져오면 Emulator에서도 같은 규칙으로 시험할 수 있습니다(단, `firebase.json`에 `firestore` 항목을 넣으면 `firebase deploy` 시 규칙도 배포되므로 주의).
- [ ] **사용하지 않는 `src/App.css`**: Google Fonts(Nanum Gothic 700) import와 `맑은 고딕` 글꼴 지정이 있지만 어디에서도 import되지 않습니다. 실수로 import하면 사이트 전체 글꼴이 바뀌므로 삭제를 권장합니다.
- [ ] **(선택) 데이터 접근 분리**: Firestore 호출이 페이지마다 흩어져 있습니다. 서비스/훅으로 모으면 권한·오류 처리를 한곳에서 관리할 수 있습니다.

## 작업 기록

완료한 항목의 상세 내용(변경 코드, 목적, 확인 결과)은 [WORKLOG.md](WORKLOG.md)에 있습니다.
