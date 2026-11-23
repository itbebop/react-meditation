# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)가 참고할 가이드입니다.

## 프로젝트 개요

국제명상협회(IMA) 웹사이트. 공개 사이트(홈·협회 소개·교육과정·수강신청·FAQ)와, 로그인한 관리자가 콘텐츠를 편집하는 관리자 대시보드로 이루어진 SPA입니다. 별도 백엔드 서버는 없고, 브라우저에서 Firebase(Auth / Firestore / Storage)를 직접 호출합니다.

- 스택: React 19 + Vite 6 + React Router 7, Tailwind CSS 3 + flowbite-react, 아이콘은 lucide-react / react-icons
- 언어: JavaScript(JSX), TypeScript 미사용
- UI 문구와 코드 주석은 한국어

## 개발 원칙 (실제 운영 중인 사이트)

이 사이트는 실제 사용자가 이용 중인 운영 서비스입니다. 다음 원칙을 반드시 지킵니다.

1. **요청받은 개선(버그 수정·보안·취약점·성능·코드 정리) 외의 변경은 하지 않습니다.** 하는 김에 고치기, 리팩터링 확대, 디자인 다듬기 등을 임의로 하지 않습니다.
2. **사용자가 화면에서 느낄 수 있는 변경은 원칙적으로 하지 않습니다.** 레이아웃, 스타일, 문구, 이미지, 메뉴·라우트 경로, 동작 흐름, 입력 폼 등이 해당합니다(관리자 화면 포함).
3. **위 변경이 꼭 필요하면 먼저 사용자에게 무엇이 어떻게 바뀌는지 설명하고 확인을 받은 뒤에 진행합니다.** 확인 없이 진행하지 않습니다.
4. Firestore 데이터 구조(컬렉션·필드명), Storage 경로, Firebase 규칙, 배포 설정을 바꾸는 작업도 운영 데이터에 영향을 주므로 반드시 확인을 받습니다.
5. 작업 중 발견한 다른 문제는 바로 고치지 말고 `docs/IMPROVEMENTS.md`에 기록한 뒤 보고합니다.
6. 변경 후에는 `npm run build`가 성공하는지, 그리고 가능하면 개발 서버(`.claude/launch.json`의 `vite-dev`)에서 화면이 이전과 같게 보이는지 확인합니다.

## 명령어

```bash
npm install
npm run dev       # Vite 개발 서버
npm run build     # dist/ 로 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint (flat config, eslint.config.js)
```

테스트 프레임워크는 없습니다. 변경 후에는 `npm run lint`와 `npm run build`로 확인하세요.

## 환경 변수

`src/firebase/firebase_config.js`가 `.env`(git 미추적)의 `VITE_FIREBASE_*` 값을 읽습니다:
`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`.
`.env`가 없으면 Firebase 초기화가 실패합니다. `.env` 내용은 커밋하지 마세요.

## 구조

```
src/
  main.jsx, App.jsx            # 진입점, 라우팅 전부 App.jsx에 정의
  firebase/firebase_config.js  # auth, db, storage 를 export (모든 Firebase 접근의 출발점)
  components/
    Navbar.jsx, Footer.jsx     # 공개 레이아웃
    ui/                        # Button, Card (경로 별칭 @ui)
    pages/                     # 공개 페이지: Home, About, Lecture, Registration, Faq
    pages/admin/               # 관리자: Login, ProtectedRoute, AdminLayout, Dashboard, User, Admin*
  assets/                      # 이미지 (Footer 등에서 import)
```

- 경로 별칭: `@ui` → `src/components/ui` (`vite.config.js`). 그 외 import는 상대 경로입니다.
- 상태 관리 라이브러리 없음. 각 페이지 컴포넌트가 `useState`/`useEffect`로 Firestore·Storage를 직접 조회/수정합니다. 데이터 계층(서비스/훅) 분리는 되어 있지 않습니다.
- Tailwind 커스텀 색상(`brandPrimary`, `neutralGreen`, `yellowMedi`, `darkGreen` 등)은 `tailwind.config.js`에 정의되어 있습니다.

### 라우팅 (`src/App.jsx`)

- 공개(`PublicLayout` = Navbar + Outlet + Footer): `/`, `/about`, `/lecture`, `/registration`, `/faq`
- 관리자 로그인: `/admin`
- 보호 라우트(`ProtectedRoute` → `AdminLayout` 사이드바): `/dashboard`, `/dashboard/users`, `/dashboard/home`, `/dashboard/introduce`, `/dashboard/lecture`, `/dashboard/registraion`, `/dashboard/faq`
- 주의: 경로·파일명 `registraion` 오타(`AdminRegistraion.jsx`)는 기존 그대로 쓰이고 있습니다. 바꿀 때는 라우트, 사이드바 `navigate`, import를 함께 수정해야 합니다.

### 인증

- `Login.jsx`: 이메일/비밀번호 로그인 후 Firestore `user` 컬렉션에 `uid`가 같은 문서가 있어야 `/dashboard`로 이동합니다.
- `ProtectedRoute.jsx`: `useAuthState(auth)`로 **로그인 여부만** 확인합니다(`user` 컬렉션 확인은 하지 않음).
- Persistence는 `browserLocalPersistence`.

## Firebase 데이터

### Firestore 컬렉션

| 컬렉션 | 용도 | 사용처 |
|---|---|---|
| `lectures` | 강의/수강신청 대상. 필드: `lectureId`(`LEC-<숫자>` 형식, 숫자로 정렬), `category`, `categoryColor`, `title`, `lecturer`, `lectureNum`, `lectureTime`, `detail`, `imgUrl`, `createdAt` | Home, Registration, AdminRegistraion |
| `alarms` | 수강 신청 내역. `email`, `name`, `phone`, `lectureKey`(lectures 문서 id), `lectureId`, `title`, `createdAt` | Registration(생성), Dashboard |
| `faqs`, `faqCategories` | FAQ와 카테고리 | Faq, AdminFaq |
| `user` | 관리자 계정 목록(`uid` 필드) | Login, User, Dashboard |

### Storage 경로

- `home/` — 홈 화면 이미지 (`home/${type}${n}.png` 형식 등, AdminHome에서 관리)
- `introduce/imageFile` — 협회 소개 이미지 (단일 파일 덮어쓰기)
- `lecture/imageFile` — 교육과정 소개 이미지 (단일 파일 덮어쓰기)
- `registration/${lectureId}/imageFile` — 강의별 이미지

`storage.rules`: 읽기는 모두 허용, 쓰기는 로그인 사용자만. Firestore 규칙 파일은 저장소에 없습니다(콘솔에서 관리).
`cors.json`은 Storage 버킷 CORS 설정용입니다.

## 배포

- `firebase.json`: Firebase Hosting(`dist/`, 모든 경로를 `/index.html`로 rewrite) + Storage 규칙. 프로젝트는 `.firebaserc`의 `ima-meditation`.
- 운영 도메인 `ima.vision`은 Firebase Hosting `ima-meditation`에서 서비스됩니다.
- **`main`에 push(머지)되면 `.github/workflows/deploy.yml`이 자동으로 운영(live)에 배포합니다.** Actions 탭에서 수동 실행도 가능합니다. Hosting만 배포하며 Storage 규칙은 배포하지 않습니다.
  - 필요한 GitHub secrets: `FIREBASE_SERVICE_ACCOUNT_IMA_MEDITATION`(서비스 계정 JSON), `VITE_FIREBASE_*` 7개(`.env`와 같은 값). 하나라도 없으면 빌드 전에 실패하도록 되어 있습니다.
- 수동 배포: `npm run build` 후 `firebase deploy --only hosting`.
- PR에는 Vercel 미리보기 배포가 붙지만 운영 사이트와는 별개입니다.
- `deploy.sh`는 GitHub Pages용 템플릿이 남은 것으로 사용하지 않습니다.

## 사용하지 않는/생성된 파일

- `dataconnect/`, `generated/` — Firebase Data Connect 초기 템플릿(예제 스키마는 주석 처리됨). 앱 코드에서 사용하지 않습니다.
- `functions/` — 소스 없이 `node_modules`만 있음. Cloud Functions 미사용.
- `dist/` — 빌드 산출물(git 미추적). 수정하지 마세요.
- `audit.json` — 예전 `npm audit` 결과 스냅샷(현재 상태와 다름).

수정해야 할 항목 목록과 취약점 패치 기록은 `docs/IMPROVEMENTS.md`에 있습니다.

## 작업 시 참고

- 커밋 메시지는 `feat:`, `fix:`, `chore:` 접두사 + 한국어 설명 형식을 씁니다.
- 새 Firebase 호출은 `src/firebase/firebase_config.js`의 `auth`, `db`, `storage`를 import해서 사용하세요. 앱을 다시 초기화하지 마세요.
- 이미지 표시는 `react-lazy-load-image-component`를 사용하는 패턴이 있습니다(Home 등).
