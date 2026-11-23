# 작업 기록 (WORKLOG)

이 사이트는 운영 중인 서비스이므로 모든 변경을 여기에 기록합니다.
각 항목에는 **무엇을(파일·코드), 왜(목적), 어떻게 확인했고 결과가 어떤지, 남은 일**을 적습니다.
최신 항목이 위에 오도록 추가합니다. 아직 하지 않은 수정 목록은 [IMPROVEMENTS.md](IMPROVEMENTS.md)에 있습니다.

---

## 2026-11-23 — 배포 워크플로를 Firebase Hosting용으로 변경

- 커밋: `b824208` (PR itbebop/react-meditation#1)
- 파일: `.github/workflows/deploy.yml`, `CLAUDE.md`, `docs/IMPROVEMENTS.md`
- 사용자 확인: 배포 시점은 사용자가 "main 머지 시 자동"으로 선택함

### 배경 / 목적
- 기존 워크플로는 GitHub Pages용 템플릿이 그대로 남아 있었습니다.
  - 존재하지 않는 `npm run deploy` 스크립트를 호출
  - git 이메일·이름·저장소 주소가 placeholder(`your-username/your-repo`)
  - Node 18 사용(지원 종료)
  - GitHub Actions 실행 기록이 없었음(`gh run list` 결과 비어 있음)
- 운영 도메인이 실제로 어디서 서비스되는지 먼저 확인했습니다.
  - `ima.vision`과 `ima-meditation.web.app`이 같은 번들(`assets/index-BWmIs3C4.js`)을 내려줌 → **운영은 Firebase Hosting `ima-meditation`**
  - PR에 붙는 Vercel 체크는 미리보기용이며 운영과 별개(`react-meditation.vercel.app`은 404)

### 변경 내용
| 항목 | 이전 | 이후 |
|---|---|---|
| 트리거 | `main` push | `main` push + `workflow_dispatch`(수동 실행) |
| 배포 대상 | GitHub Pages (`npm run deploy`, 동작 안 함) | `FirebaseExtended/action-hosting-deploy@v0`, `projectId: ima-meditation`, `channelId: live` |
| 빌드 환경변수 | 없음 | `VITE_FIREBASE_*` 7개를 GitHub secrets에서 주입 |
| 인증 | `GH_PAT` | `FIREBASE_SERVICE_ACCOUNT_IMA_MEDITATION`(서비스 계정 JSON) |
| 안전장치 | 없음 | secret 중 하나라도 비면 빌드 전에 실패 (Firebase 설정 없는 깨진 사이트가 운영에 올라가는 것 방지) |
| 기타 | Node 18, `npm install` | Node 22, `npm ci`, npm 캐시, `concurrency`로 동시 배포 방지, `permissions: contents: read` |

- Hosting만 배포하며 `storage.rules`는 배포하지 않습니다(운영 규칙을 바꾸지 않기 위해).
- `CLAUDE.md` 배포 섹션을 새 흐름에 맞게 수정했습니다.

### 확인 / 결과
- 워크플로 YAML 파싱 확인(트리거 `push`, `workflow_dispatch`, 6단계).
- `package-lock.json`이 `package.json`과 일치하는지 확인(`npm ci` 가능).
- **실제 Actions 실행은 아직 하지 않았습니다.** secrets가 없어서 실행해도 "Check required secrets" 단계에서 멈춥니다.

### 진행 상황
- 2026-11-23: 사용자가 GitHub secrets 8개 등록. `gh secret list`로 이름이 워크플로와 모두 일치함을 확인(`FIREBASE_SERVICE_ACCOUNT_IMA_MEDITATION`, `VITE_FIREBASE_*` 7개). 값은 GitHub에서 읽을 수 없어 확인하지 못함 → 첫 실행(머지 시)에서 검증됨.

### 남은 일 (사용자 작업 필요)
- [x] GitHub 저장소 Settings → Secrets and variables → Actions에 등록:
  - `FIREBASE_SERVICE_ACCOUNT_IMA_MEDITATION`: Firebase 콘솔(또는 `firebase init hosting:github`)에서 만든 서비스 계정 JSON
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`: 로컬 `.env`와 같은 값
- ⚠️ secrets가 등록되었으므로 PR을 머지하면 그 즉시 운영에 배포됩니다. 머지 후 Actions 실행 결과와 `ima.vision` 화면을 확인하고, 문제가 있으면 Firebase 콘솔 → Hosting → 출시 기록에서 이전 버전으로 롤백합니다.
- 더 이상 쓰지 않는 `GH_PAT` secret과 `deploy.sh` 정리.

---

## 2026-11-23 — 프로젝트 문서 추가

- 커밋: `8fa70e4`
- 파일: `CLAUDE.md`(신규), `docs/IMPROVEMENTS.md`(신규), `.claude/launch.json`(신규)

### 목적
- 프로젝트 구조, Firebase 데이터 구조, 배포 방식을 기록해 이후 작업 시 참고할 수 있게 함.
- 운영 사이트이므로 개발 원칙(요청 외 변경 금지, 화면 변경은 사전 확인 등)을 명문화.
- 코드 검토로 찾은 문제를 우선순위별로 정리.
- 개발 서버를 브라우저에서 바로 띄워 확인할 수 있도록 실행 설정 추가.

### 변경 내용
- `CLAUDE.md`: 개요, 개발 원칙, 명령어, 환경 변수, 디렉터리 구조, 라우팅, 인증 흐름, Firestore 컬렉션/필드, Storage 경로, 배포, 사용하지 않는 파일.
- `docs/IMPROVEMENTS.md`: 1순위(보안)·2순위(동작 오류)·3순위(코드 정리) 체크리스트.
- `.claude/launch.json`: `vite-dev` 설정(`npm run dev -- --port 5173 --strictPort`).

### 결과
- 코드·화면 변경 없음(문서와 개발 도구 설정만 추가).

---

## 2026-11-23 — `index.html` 오타 도메인 스크립트 제거

- 커밋: `19eb8a9`
- 파일: `index.html`

### 배경 / 목적
- 8행에 `<script src="https://cdn.tailwindscss.com"></script>`가 있었습니다(`tailwindcss`의 오타).
- 문제점:
  1. **보안**: 존재하지 않는 도메인이라, 누군가 이 도메인을 등록하면 사이트의 모든 방문자 브라우저에서 임의의 JS가 실행될 수 있음.
  2. **성능**: 매 페이지 로드마다 연결 시간 초과(약 23.5초 측정)까지 기다림.
- Tailwind는 PostCSS로 빌드에 이미 포함되어 있어 이 스크립트는 처음부터 필요 없었습니다(한 번도 정상 로드된 적 없음).
- 운영 사이트(`ima.vision`)의 현재 HTML에도 같은 줄이 있는 것을 확인했습니다.

### 변경 내용
```diff
     <title>국제명상협회</title>
-    <script src="https://cdn.tailwindscss.com"></script>
   </head>
```

### 확인 / 결과
- `npm run build` 성공. CSS 결과물 해시(`index-KdSF9RfN.css`)가 변경 전과 동일 → **화면 스타일 변화 없음**.
- `dist/index.html`에 `tailwindscss` 없음.
- 개발 서버에서 홈 화면이 변경 전과 같게 보이고, 오타 도메인 요청이 사라짐. 페이지 로드 완료 시간 약 20초 이상 → 0.2초.

---

## 2026-11-23 — npm 의존성 취약점 패치

- 커밋: `19eb8a9`
- 파일: `package.json`, `package-lock.json`

### 배경 / 목적
- `npm audit` 결과 27개 취약점(critical 2: `protobufjs`, `websocket-driver` / high: `vite`, `react-router-dom`, `postcss`, `rollup`, `brace-expansion`, `minimatch` 등).
- 이전 커밋 `5e31e3a`(2025-11-14)에서 취약점 대응으로 `react-router-dom` ^7.5.2, `vite` ^6.2.3, `overrides: { brace-expansion: 2.0.2 }`를 적용했지만, 이후 새 취약점이 나왔고 일부 설정이 오히려 업데이트를 막고 있었습니다.
- 처음 `npm audit fix`만 실행했을 때는 27개 → 15개로만 줄었고, 원인을 다음 두 가지로 확인했습니다.
  1. `overrides`로 고정한 `brace-expansion@2.0.2`가 그 자체로 취약 범위(2.0.0 ~ 2.1.6)였고, 모든 하위 패키지에 이 버전을 강제해서 `minimatch`·`eslint` 쪽 수정을 막음.
  2. `"react-js-project-202503": "file:"` 자기참조 의존성 때문에 프로젝트가 자기 자신을 `node_modules`에 다시 설치하며 의존성 트리가 꼬임(`react-router-dom@7.5.2`가 중복 고정됨).

### 변경 내용
```diff
   "dependencies": {
     ...
-    "react-js-project-202503": "file:",
     "react-lazy-load-image-component": "^1.6.3",
-    "react-router-dom": "^7.5.2",
+    "react-router-dom": "^7.18.6",
     "react-scroll": "^1.9.3"
   },
   ...
-  },
-  "overrides": {
-    "brace-expansion": "2.0.2"
   }
```
- 이후 `npm audit fix`로 `package-lock.json` 갱신. 주요 결과 버전: `vite` 6.4.6, `postcss` 8.5.33, `firebase` 11.10.0, `eslint` 9.39.5, `react-router` 7.18.6, `brace-expansion` 1.1.x/2.1.7+, `picomatch` 2.3.2/4.0.7.
- 메이저 버전 변경 없음(`npm audit fix --force` 사용 안 함).
- 작업 전 `package.json`, `package-lock.json`을 임시 폴더에 백업 후 진행.

### 확인 / 결과
- `npm audit`: **27개 → 4개 (high 4)**.
- `npm run build` 성공.
- `npm run lint`: 오류 19개로 변경 전과 동일(새 오류 없음, 기존 오류는 IMPROVEMENTS.md 3순위).
- 브라우저(개발 서버) 확인:
  - 홈, 협회 소개, 교육 과정, 수강 신청, FAQ 모두 Firestore·Storage 데이터 정상 로드.
  - 상단 메뉴 링크로 이동 시 새로고침 없이 전환(React Router 정상).
  - 비로그인 상태에서 `/dashboard` 접근 → `/admin`으로 이동(보호 라우트 정상).
  - 없는 경로 → "404 Not Found" 표시.
  - 협회 소개 이미지가 처음 한 번 로드 실패했으나, 같은 URL을 직접 열면 정상이고 재시도 시 정상 표시. 이미지가 1448×10240 PNG(약 1.4MB)로 큰 탓으로 판단, 패치와 무관(IMPROVEMENTS.md에 기록).
  - **관리자 로그인 후 화면은 확인하지 못함**(로그인 계정 없음).

### 남은 취약점
- `@grpc/grpc-js` < 1.13.6 → `@firebase/firestore` → `@firebase/firestore-compat` → `firebase` (4개).
- 최신 `firebase` 13.4.0도 `@grpc/grpc-js ~1.9.0`을 사용해 업그레이드로 해결되지 않음. `npm audit fix --force`가 제안하는 `firebase@9.14.0`은 메이저 다운그레이드라 적용하지 않음.
- gRPC는 Firestore의 Node.js 환경에서만 쓰이며, 빌드 결과(`dist/assets`)에 포함되지 않는 것을 확인 → 이 사이트(브라우저)에는 영향 없음.
- Firebase가 grpc 의존성을 올리면 `firebase` 업데이트로 해결.
