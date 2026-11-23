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
- [x] **npm 취약점**: 27개(critical 2) → 4개(high, 모두 `@grpc/grpc-js` 계열)로 줄임. 자세한 내용은 아래 "취약점 패치 기록" 참고.

> 1~3번은 "관리자 = `user` 컬렉션(또는 custom claim)"이라는 하나의 기준으로 묶어서, 보호 라우트·Storage 규칙·Firestore 규칙이 모두 그 기준을 쓰게 하는 것이 좋습니다.

## 🟠 2순위: 동작 오류·잘못된 설정

- [ ] **사용자 추가 버튼이 쓸 수 없는 계정을 만듦**: `uid` 없이 `새사용자@example.com` 고정값을 넣습니다. 로그인은 `uid`로 확인하므로 이 계정으로는 들어갈 수 없습니다. (`User.jsx` `handleAddUser`)
- [ ] **사용자 수정 시 화면 객체를 그대로 저장**: `updateDoc(docRef, editingUser)` 때문에 `id` 필드까지 문서에 저장됩니다. (`User.jsx` `handleSaveEdit`)
- [ ] **배포 워크플로가 동작하지 않음**: GitHub Pages 템플릿이 그대로 남아 있고, 존재하지 않는 `npm run deploy`를 호출하며, 이메일·저장소 주소가 placeholder입니다. Node 18은 지원 종료(EOL). Firebase Hosting용으로 다시 작성하거나 삭제합니다. (`.github/workflows/deploy.yml`, `deploy.sh`)
- [ ] **모바일에서 관리자 사이드바 토글 불가**: `setMenuOpen`을 쓰는 곳이 없습니다. (`AdminLayout.jsx`)
- [ ] **대시보드가 매번 전체 `alarms`를 읽음**: 연도 범위 계산을 위해 전체를 조회하고, 신청 건마다 `lectures`를 다시 조회합니다(N+1). 데이터가 늘면 느려지고 비용이 늘어납니다. (`Dashboard.jsx`)
- [ ] **`lectureId` 형식 의존**: 정렬 시 `LEC-<숫자>` 형식을 가정해서, 형식이 다르거나 값이 비면 `NaN`/오류가 납니다. (`Registration.jsx`)
- [x] **자기참조 의존성**: `package.json`의 `"react-js-project-202503": "file:"` 줄 삭제 (취약점 패치 때 함께 처리).

## 🟡 3순위: 코드 정리·품질

- [ ] **lint 오류 19개**: 미사용 변수(`handleFileChange`, `uploadProgress`, `mainLectures`, `handleLogout`, `setMenuOpen` 등), 불필요한 try/catch, `vite.config.js`·`tailwind.config.js`에 Node 환경 설정 누락.
- [ ] **`registraion` 오타**: 라우트(`/dashboard/registraion`), 파일명(`AdminRegistraion.jsx`), 사이드바 이동 경로를 함께 수정합니다.
- [ ] **미사용 파일·의존성 정리**: `dataconnect/`, `generated/`, `functions/`, `audit.json`(UTF-16 저장으로 JSON 파싱 불가), `public/index.html`·`public/404.html`, 미사용 `react-scroll`.
- [ ] **오류 처리 개선**: 사용자 관리 기능은 실패해도 `console.error`만 남기고 화면에 알리지 않습니다. 로그인 오류는 원인과 무관하게 같은 메시지입니다.
- [ ] **배포 사이트에 파비콘 없음**: `index.html`이 `/IMA_favicon.png`를 참조하지만 파일이 프로젝트 루트에 있어서 빌드(`dist/`)에 복사되지 않습니다. 개발 서버에서만 보입니다. 파일을 `public/`으로 옮기면 됩니다.
- [ ] **`<html lang="en">`**: 한국어 사이트이므로 `lang="ko"`가 맞습니다(검색·스크린리더에 영향). (`index.html`)
- [ ] **협회 소개 이미지가 너무 큼**: Storage `introduce/imageFile`이 1448×10240 PNG(약 1.4MB)라서 느린 네트워크에서는 로딩에 실패하기도 합니다. 웹용으로 압축(WebP/JPEG)하거나 나눠서 올리는 것을 권장합니다.
- [ ] **번들 크기**: 빌드 결과 JS가 한 파일에 약 1.09MB(gzip 289KB)입니다. 관리자 페이지를 `React.lazy`로 분리하면 공개 페이지 로딩이 빨라집니다.
- [ ] **404 페이지**: 현재 `<div>404 Not Found</div>`만 있고 레이아웃이 없습니다.
- [ ] **(선택) 데이터 접근 분리**: Firestore 호출이 페이지마다 흩어져 있습니다. 서비스/훅으로 모으면 권한·오류 처리를 한곳에서 관리할 수 있습니다.

## 취약점 패치 기록

### 2026-11-23

`npm audit`: **27개(critical 2, high 다수) → 4개(high 4)**

변경 내용:
- `package.json`의 `overrides: { "brace-expansion": "2.0.2" }` 삭제. 이 고정 버전 자체가 취약한 범위(2.0.0 ~ 2.1.6)였고, `minimatch`가 업데이트되지 못하게 막고 있었습니다.
- 자기참조 의존성 `"react-js-project-202503": "file:"` 삭제. 프로젝트가 자기 자신을 의존성으로 다시 설치하면서 의존성 트리가 꼬였습니다.
- `react-router-dom` `^7.5.2` → `^7.18.6` (`react-router`, `turbo-stream` 취약점 해결)
- `npm audit fix`로 lockfile 안의 버전 갱신: `vite` 6.4.6, `postcss` 8.5.33, `firebase` 11.10.0, `eslint` 9.39.5, `protobufjs`, `websocket-driver`, `rollup`, `picomatch` 등

확인:
- `npm run build` 성공
- `npm run lint` 오류 19개로 패치 전과 같음 (새로 생긴 오류 없음)
- 개발 서버에서 브라우저로 확인한 결과:
  - 홈, 협회 소개, 교육 과정, 수강 신청, FAQ 모두 Firestore·Storage 데이터를 정상으로 불러옵니다.
  - 내비게이션 링크로 페이지를 이동하면 새로고침 없이 전환됩니다.
  - 로그인하지 않은 상태로 `/dashboard`에 들어가면 `/admin` 로그인 화면으로 이동합니다.
  - 없는 경로에서는 404가 표시됩니다.
  - 관리자 로그인 후 화면은 확인하지 않았습니다.

남은 취약점 (`@grpc/grpc-js` < 1.13.6 → `@firebase/firestore` → `firebase`):
- 최신 `firebase`(13.4.0)도 `@grpc/grpc-js ~1.9.0`을 사용하고 있어 업그레이드로는 해결되지 않습니다. `npm audit fix --force`가 제안하는 `firebase@9.14.0`은 메이저 버전을 낮추는 것이라 적용하지 않았습니다.
- gRPC는 Firestore의 Node.js 환경에서만 쓰이고, 브라우저 번들(`dist/assets`)에는 들어가지 않는 것을 확인했습니다. 따라서 이 사이트에 실제로 영향은 없습니다.
- Firebase가 grpc 의존성을 올리면 그때 `firebase`를 업데이트합니다.
