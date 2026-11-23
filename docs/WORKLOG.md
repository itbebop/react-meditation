# 작업 기록 (WORKLOG)

이 사이트는 운영 중인 서비스이므로 모든 변경을 여기에 기록합니다.
각 항목에는 **무엇을(파일·코드), 왜(목적), 어떻게 확인했고 결과가 어떤지, 남은 일**을 적습니다.
최신 항목이 위에 오도록 추가합니다. 아직 하지 않은 수정 목록은 [IMPROVEMENTS.md](IMPROVEMENTS.md)에 있습니다.

---

## 2026-11-23 — PR #5 머지 및 배포 (수강 신청 관리 화면 개편 운영 반영)

- 머지 커밋: `32df0c2` (PR itbebop/react-meditation#5 → `main`). 문서 커밋 `3e16a0a`, `db69ea1`도 함께 반영됨.
- 배포 실행: GitHub Actions run `45190816431`, 전 단계 성공
- 사용자 확인: 사용자가 "머지하고 배포 확인"을 요청함

### 결과
- 운영 번들 변경 확인:
  | | 배포 전 | 배포 후 |
  |---|---|---|
  | JS | `assets/index-18hXMAQN.js` | `assets/index-DKvQ3Nm1.js` |
  | CSS | `assets/index-BtsFo21C.css` | `assets/index-Bk5YI8v3.css` |
- 배포된 파일 이름이 로컬 `main`(`32df0c2`) 빌드 결과와 같음.
- 운영 사이트 브라우저 확인 (운영 데이터 읽기만):
  - 수강 신청 1쪽: O2명상지도사 2급 과정, 마음챙김 명상, 명상요가, 우파니샤드 강론 / 2쪽: 명상지도스피치, 독서명상 → **배포 전과 같은 순서**(`LEC-1`~`LEC-6` 순, 아직 `order` 필드 없음)
  - 강의 이미지 정상 로드
  - 홈 메인 카드: O2명상지도사 2급 과정, 마음챙김 명상 (기존 메인 2개 그대로)
  - 비로그인 `/dashboard/registraion` → `/admin`으로 이동
  - 콘솔 오류 없음
- **실제 관리자 계정으로 새 관리자 화면 사용(수정·순서·메인 저장)은 확인하지 못함**(로그인 계정 없음, 운영 데이터에 쓰기 테스트 안 함). Emulator에서는 확인 완료(아래 항목).

### 남은 일
- 관리자가 운영에서 새 화면을 처음 쓸 때 확인할 것: 강의 수정 저장 후 메인 별표 유지, 순서 저장 후 수강 신청 페이지 순서, 새 강의 추가 시 ID(`LEC-7`)
- 운영에서 처음 순서를 저장하면 모든 강의에 `order` 필드가 생김

---

## 2026-11-23 — 수강 신청 관리 화면 개편 (목록 + 편집 패널 + 미리보기) 및 데이터 오류 수정

- 커밋: `04d87cb` (브랜치 `feat/admin-registration`, PR itbebop/react-meditation#5). 2026-11-23 머지·배포됨(위 항목 참고)
- 사용자 확인: 사용성 문제 목록(IMPROVEMENTS R1~R18, P1~P3) 검토 후, R13·R16 대책으로 **추천안(간단한 목록 + 편집 패널 + 공용 카드 실시간 미리보기)**을 사용자가 선택. R2·R3·R4·R6을 함께 고치는 것도 추천안에 포함되어 있었음.

### 배경 / 목적
- 기존 화면은 13개 열의 넓은 표에서 행 단위로 편집해서 불편했고(R13), 저장 전 공개 화면 모양을 볼 수 없었음(R16).
- 코드 검토에서 운영 데이터를 망가뜨릴 수 있는 문제를 발견:
  - R2: 강의 수정·저장 후 화면의 "메인" 체크가 풀리고, 이어서 메인 변경을 저장하면 실제로 메인에서 빠짐
  - R3: 순서를 바꾸면 `lectureId`를 `LEC-0`부터 다시 매김. 운영 데이터는 `LEC-1`~`LEC-6`이고 이미지가 `registration/LEC-n/imageFile`에 있어서, 순서 변경 후 이미지를 올리면 다른 강의 이미지를 덮어씀
  - R4: 새 강의 ID를 "강의 개수"로 만들어 삭제 후 추가하면 ID가 겹침
  - R5: 저장 버튼 연속 클릭 시 강의가 중복 생성

### 변경 내용
**1. 공용 강의 카드 (신규 `src/components/lecture/`)**
- `RegistrationLectureCard.jsx`: 수강 신청 페이지 카드. `Registration.jsx`의 마크업을 그대로 옮김
- `HomeLectureCard.jsx`: 홈 메인 강의 카드. `Home.jsx`의 마크업을 그대로 옮김
- 두 카드 모두 `forceMobile` 옵션: 반응형 클래스(md:, lg: 등)를 빼서 관리자 미리보기에서 모바일 모양을 보여줌
- `Registration.jsx`, `Home.jsx`는 이 카드를 쓰도록만 바꿈. 공개 화면 기존 버그(P1 "닫기" 오류, P2 "보기/접기" 글자)는 화면 변경이 되므로 **그대로 유지**(별도 확인 후 수정)

**2. 정렬·ID (신규 `src/components/lecture/lectureUtils.js`)**
- 정렬 기준: `order` 필드가 있으면 그것, 없으면 `lectureId` 숫자. 예전 데이터(order 없음)는 기존과 같은 순서
- `lectureId` 형식이 다르거나 없어도 오류 없이 맨 뒤로 정렬(기존 코드는 `split` 오류로 목록 전체가 안 보였음)
- 새 강의 ID: 가장 큰 번호 + 1 (운영 기준 다음은 `LEC-7`)
- `Registration.jsx` 정렬도 이 함수로 교체

**3. 데이터 처리 (신규 `src/firebase/lectures.js`)**
- 강의 수정은 폼 필드만 `updateDoc` → `isMain`, `order`, `lectureId`, `createdAt`을 건드리지 않음 (R2)
- 순서·메인은 `writeBatch`로 한 번에 저장(`order` 0,1,2…, `isMain`), `lectureId`는 바꾸지 않음 (R3)
- 새 이미지는 `registration/<문서 id>/<시각>.<확장자>`에 저장 → 다른 강의 이미지를 덮어쓰지 않음 (R3). 기존 이미지 파일·URL은 그대로
- 새 강의는 문서 id를 먼저 만들고 이미지 업로드 후 `setDoc` (order는 맨 뒤, isMain false)

**4. 관리자 화면 (`AdminRegistraion.jsx` 전체 재작성, `LectureEditPanel.jsx`, `LecturePreview.jsx` 신규)**
- 왼쪽 목록: 썸네일, 카테고리 배지, 제목, 강사·강의 수·시간·ID, 홈 메인 별표
  - 순서: 끌어서 끼워 넣기(예전엔 맞바꾸기) + 위/아래 버튼(터치·키보드용) (R7)
  - 메인: 별표로 지정, 최대 2개 안내·초과 시 메시지 (R10)
  - 순서·메인 변경 시 "변경사항 저장 / 되돌리기" 막대 하나로 처리 (R8)
  - 불러오는 중·실패(다시 시도)·빈 목록 표시 (R14)
- 오른쪽 편집 패널(강의를 누르면 열림, "강의 추가"도 같은 패널)
  - 카테고리: 기존 값 목록에서 고르거나 새로 입력, 배지 색: 팔레트(사이트 색 + 기존 사용 색) + 코드 입력 검사 (R11)
  - 제목·카테고리 필수, 강의 수·이수 시간은 0 이상 정수 (R11). 입력칸 이름을 **"이수 시간 (시간)"**으로 수정 (R6, 예전엔 "강의 시간(분)")
  - 상세 설명 10줄 입력칸, 줄바꿈 안내
  - 이미지: 클릭·끌어다 놓기, jpg·png·gif·webp·5MB 검사 (R12)
  - 저장 중 버튼 비활성화, 업로드 진행률 표시, 연속 클릭 방지(ref) (R5)
  - 저장 안 한 변경 표시, 다른 강의 선택·닫기·페이지 이탈 시 확인 (R8, R9)
  - 새 강의는 저장 전까지 목록에 넣지 않음 (R9)
  - 강의 삭제: 패널에서 한 개씩, 확인 창(되돌릴 수 없음, 수강 신청 내역은 남음 안내) (R1). 기존 "선택 삭제" 체크박스 방식은 없앰
- 공개 화면 미리보기: 수강 신청(PC) / 수강 신청(모바일 360px) / 홈 메인 카드. 입력하는 대로 바로 반영 (R16)
- 화면 폭 1280px 이상에서 두 칸, 좁으면 위아래로 배치

**5. Emulator 시드 (`scripts/seed-emulator.mjs`)**
- 운영과 같은 구조의 샘플 강의 5개(order 없음, `registration/LEC-n/imageFile` 이미지, 메인 2개) 추가

**6. 문서**
- `CLAUDE.md`: 구조(`lecture/`, `firebase/lectures.js`), `lectures` 필드 설명(order, isMain, lectureTime 시간 단위), Storage 경로. 개발 원칙 9번 **"모든 소통과 기록은 한글로"** 추가(사용자 요청)
- `IMPROVEMENTS.md`: R1~R16, R18 해결 표시

### 확인 / 결과
- `npm run build` 성공. `npm run lint` 19개 → 16개(기존 `AdminRegistraion.jsx`의 미사용 변수 오류 3개 사라짐, 새 파일에서 오류 없음). `npm audit` 4개(기존 grpc 계열) 변화 없음
- 번들: 공통 JS gzip 306 → 310KB, 공통 CSS gzip 16.5 → 16.9KB
- **공개 화면이 바뀌지 않았는지 확인** (개발 서버 + 운영 데이터 읽기만):
  - 수정 전에 수강 신청 1쪽·1번 카드 펼친 상태·2쪽, 홈 메인 카드 영역의 HTML을 저장해 두고, 수정 후 같은 순서로 다시 가져와 비교 → **4개 모두 완전히 같음**
- **Emulator에서 관리자 화면 확인** (운영 데이터 사용 안 함):
  - 강의 5개 목록, 메인 별표 2개 표시
  - 강의 선택 → 편집 패널, 미리보기 카드가 상세 설명 줄바꿈까지 표시
  - 제목·이수 시간 수정 → 미리보기 즉시 반영 → 저장 → 목록 반영, **메인 별표 유지(R2)**
  - 3번째 메인 지정 → 최대 2개 안내 메시지
  - 5번을 1번 위로 드래그 → 맨 앞에 끼워 넣어짐(맞바꾸기 아님), 위 버튼으로 4번 이동 → "순서·메인 변경" 막대 → 저장
  - Firestore 확인: `order` 0~4 저장, **`lectureId` 그대로(LEC-5, LEC-1, …)**, 이미지 경로 그대로, `isMain` 정확
  - 새 강의: 빈 값 저장 시 필수값 오류, 강의 수 -3 → "0 이상의 정수", txt 파일 → 형식 오류, png 끌어다 놓기 → 저장 → **`LEC-6`, order 5, 이미지 `registration/<문서 id>/<시각>.png`**
  - 저장 버튼을 코드로 같은 순간에 2번 누르니 강의가 2개 생김 → ref로 막도록 고친 뒤 3번 연속 눌러도 1개만 생성
  - 삭제: 확인 창 취소 → 유지, 확인 → 삭제·안내 메시지
  - 제목 수정 후 다른 강의 선택 → 미저장 확인 창, 취소하면 그대로
  - 미리보기 모바일 모드: 360px 폭, 이미지가 위·내용이 아래로 쌓임
  - 공개 화면(Emulator 데이터): 수강 신청 순서가 저장한 순서대로, 홈에 메인 지정한 2개 표시
- **운영 사이트·실제 관리자 계정에서는 아직 확인하지 않음(배포 전)**

### 남은 일 / 참고
- 운영 배포는 사용자 확인 후(개발 원칙 8번)
- 배포 후 운영에서 처음 순서를 저장하면 모든 강의에 `order` 필드가 생김(그 전까지는 기존과 같은 순서)
- 홈 메인 카드 2개의 표시 순서는 기존 코드 그대로(Firestore 조회 순서)
- 남은 항목: R17(메뉴 이름과 화면 제목 불일치), P1~P3(공개 화면) — 화면 변경이 있어 별도 확인 필요

---

## 2026-11-23 — PR #4 머지 및 배포 (에디터 글꼴·크기·색·형광펜 운영 반영)

- 머지 커밋: `594ff5e` (PR itbebop/react-meditation#4 → `main`). `docs/worklog-about-editor-deploy`의 문서 커밋 3개도 함께 반영됨.
- 배포 실행: GitHub Actions run `45184017869`, 전 단계 성공
- 사용자 확인: 사용자가 "머지하고 배포 확인"을 요청함

### 결과
- 운영 번들 변경 확인:
  | | 배포 전 | 배포 후 |
  |---|---|---|
  | JS | `assets/index-BQLrAs00.js` | `assets/index-18hXMAQN.js` |
  | CSS | `assets/index-DBN1yshS.css` | `assets/index-BtsFo21C.css` |
  | 에디터 | `RichTextEditor-Bxd6nGfg.js` | `RichTextEditor-CNeDtliG.js` |
- 배포된 파일 이름이 로컬 `main`(`594ff5e`) 빌드 결과와 같음.
- 운영 서버에서 에디터 파일, 글꼴 CSS, 글꼴 파일(woff2, `font/woff2`) 모두 응답 200.
- 운영 사이트 브라우저 확인:
  - 소개 페이지: 현재 운영 설정이 "이미지" 모드라 기존 이미지 표시. 글꼴 CSS·에디터 파일은 불러오지 않음
  - 홈: 이미지·강의 데이터 정상, 글꼴 파일 요청 0건
  - FAQ: 질문 12개 표시
  - 콘솔 오류 없음
- **실제 관리자 계정에서 새 툴바 사용·저장, 운영에서 글꼴이 적용된 글 표시는 확인하지 못함**(로그인 계정 없음, 운영 데이터에 쓰기 테스트 안 함). Emulator에서는 확인 완료(아래 항목).

### 남은 일
- 관리자가 운영에서 글꼴·색을 적용해 저장한 뒤 소개 페이지 표시 확인

---

## 2026-11-23 — 에디터에 글꼴·글자 크기·글자 색·형광펜 추가

- 커밋: `cc4545c` (브랜치 `feat/editor-text-style`, PR itbebop/react-meditation#4). 2026-11-23 머지·배포됨(위 항목 참고)
- 사용자 확인: 글꼴 변경 기능 문의 → 제안 중 **글꼴 종류, 글자 크기, 글자 색, 형광펜 4가지 모두**, 글꼴은 **웹폰트 4종(권장안)**으로 사용자가 선택함

### 배경 / 목적
- 협회 소개 에디터에서 글꼴을 바꿀 수 있게 해 달라는 요청.
- 사이트 기본 글꼴은 Tailwind 기본 sans(기기 시스템 글꼴)입니다. 기기에 설치된 글꼴만 쓰면 Windows/Mac/모바일마다 모양이 달라지므로, 웹폰트를 사이트에 직접 포함해 어느 기기에서나 같게 보이도록 했습니다.

### 변경 내용
**1. 툴바 (`src/components/editor/RichTextEditor.jsx`)**
- 글꼴 드롭다운: 기본 글꼴 / 나눔고딕 / 나눔명조 / 고운바탕 / Noto Sans KR (목록에서 각 글꼴 모양으로 미리 보임)
- 글자 크기 드롭다운: 작게(14px) / 기본 크기 / 조금 크게(18px) / 크게(20px) / 아주 크게(24px). 자유 입력 대신 단계로 제한해 디자인·모바일 표시가 깨지지 않게 함
- 글자 색 팔레트 8색(사이트 색 기준: 진한 초록 #1C7244, 초록 #4CAF4F, 금색 #D9AE46, 올리브 #3C493C, 진한 회색, 회색, 빨강, 파랑) + "기본 색"
- 형광펜 팔레트 6색(노랑, 연두, 주황, 하늘, 분홍, 회색) + "형광펜 없음"
- 커서 위치의 현재 글꼴·크기·색을 툴바에 표시. 브라우저가 색을 `rgb(...)`, 글꼴을 큰따옴표로 돌려주는 차이를 맞추는 처리(`toHex`, `matchOption`) 포함
- TipTap 공식 확장 `@tiptap/extension-text-style` 3.35.0의 `TextStyle`, `FontFamily`, `FontSize`, `Color`, `BackgroundColor` 사용

**2. 목록·글꼴 로딩 (`src/components/editor/textStyles.js`, 신규)**
- 글꼴·크기·색 목록과 허용 스타일 목록을 한곳에서 관리(에디터와 공개 화면이 같이 사용)
- 웹폰트: `@fontsource/nanum-gothic`, `nanum-myeongjo`, `gowun-batang`, `noto-sans-kr`(각 400·700 굵기). 외부(Google Fonts) 요청 없이 사이트에서 직접 제공
- **글꼴 CSS는 필요할 때만 동적으로 불러옴**: 처음엔 공통 CSS에 바로 넣었는데, 한글 웹폰트의 `@font-face` 선언이 많아서 모든 페이지가 받는 CSS가 117KB → 678KB(gzip 16KB → 221KB)로 커졌습니다. 그래서 공개 화면은 글에 쓰인 글꼴만(`loadFontsUsedIn`), 관리자 에디터는 목록 전체(`loadAllFonts`)를 불러오도록 바꿨습니다.

**3. 공개 화면 보안 (`src/components/editor/RichContent.jsx`)**
- 저장된 HTML의 `style` 속성은 `font-family`, `font-size`, `color`, `background-color`, `text-align`만 남기고 나머지는 제거. `url(`, `expression`, `javascript:` 값도 제거. `position: fixed` 같은 스타일로 화면을 덮거나 외부 이미지를 불러오는 것을 막기 위함
- 글에 쓰인 웹폰트만 불러오기

### 확인 / 결과
- `npm run build` 성공, `npm run lint` 19개로 기존과 같음(새 파일에서 오류 없음), `npm audit` 4개(기존 grpc 계열)로 변화 없음
- 번들: 공통 CSS 117.32KB → 117.52KB(gzip 16.51 → 16.54KB), 공통 JS gzip 305.17 → 306.12KB, 에디터 파일 gzip 138 → 140KB. 글꼴 CSS는 별도 파일(글꼴·굵기별 약 20~28KB gzip)
- **Emulator에서 브라우저 확인** (운영 데이터 사용 안 함):
  - 툴바 드롭다운으로 4개 글꼴 각각 적용 → `font-family` span 생성
  - 글자 크기 작게(14px)/아주 크게(24px) 적용
  - 글자 색 팔레트에서 진한 초록 선택 → `color: rgb(28, 114, 68)`
  - 형광펜 팔레트에서 노랑 선택 → `background-color: rgb(254, 240, 138)`
  - 커서를 옮기면 툴바에 현재 글꼴·색이 표시됨(정규화 처리 후)
  - 텍스트 모드로 저장 → 소개 페이지에 모든 스타일 표시, 4개 글꼴 모두 실제로 로드됨(`document.fonts.check` true)
  - 한 글꼴(고운바탕)만 쓴 글 → 그 글꼴 CSS 2개(400·700)만 불러옴
  - 글이 없는 페이지(FAQ) → 글꼴 파일 요청 0건
  - 보안: `position: fixed; width/height: 100%; z-index; background-image: url(...)`이 섞인 style → 화면에는 `font-family`와 `color`만 남음
- 운영 사이트·실제 관리자 계정에서는 아직 확인하지 않음(배포 전)

### 남은 일
- 운영 배포는 사용자 확인 후(개발 원칙 8번)
- 참고: `src/App.css`(Nanum Gothic 700 Google Fonts import, 맑은 고딕 지정)는 어디에서도 import되지 않는 사용하지 않는 파일입니다. IMPROVEMENTS.md에 기록

---

## 2026-11-23 — PR #3 머지 및 배포 (협회 소개 에디터 운영 반영)

- 머지 커밋: `64e63f9` (PR itbebop/react-meditation#3 → `main`). PR #2의 문서 커밋이 포함되어 PR #2도 자동으로 머지 처리됨.
- 배포 실행: GitHub Actions run `45180553357`, 전 단계 성공
- 사용자 확인: 사용자가 "머지하고 배포 확인"을 요청함

### 결과
- 운영 번들 변경 확인:
  | | 배포 전 | 배포 후 |
  |---|---|---|
  | JS | `assets/index-LegiaGDH.js` | `assets/index-BQLrAs00.js` |
  | CSS | `assets/index-KdSF9RfN.css` | `assets/index-DBN1yshS.css` |
  | 에디터 | 없음 | `assets/RichTextEditor-Bxd6nGfg.js` (응답 200) |
- 배포된 파일 이름이 로컬 `main`(`64e63f9`) 빌드 결과와 같음.
- 운영 사이트 브라우저 확인:
  - 소개 페이지: **기존 이미지 그대로 표시**(운영에 `pages/introduce` 문서가 아직 없음), 에디터 파일은 불러오지 않음
  - 홈: 이미지·강의 데이터 정상
  - 수강 신청: 강의 4개 표시
  - 비로그인 `/dashboard/introduce` → `/admin`으로 이동
  - 콘솔 오류 없음
- **관리자 로그인 후 화면과 운영에서의 저장은 확인하지 못함**(로그인 계정 없음). 관리자가 처음 저장할 때 Firestore 쓰기 권한이 확인됨.

### 정리
- 로컬 Emulator(firebase CLI, Firestore용 java)와 Emulator용 개발 서버(5174)를 종료함.

### 남은 일
- [x] 관리자 계정으로 `/dashboard/introduce`에서 첫 저장 → **2026-11-23 사용자가 운영에서 저장 성공을 확인함.** 운영 Firestore `pages` 컬렉션 쓰기 권한 문제 없음.

---

## 2026-11-23 — 협회 소개 페이지: 이미지/텍스트 선택 + 리치 텍스트 에디터

- 커밋: `475174b` (브랜치 `feat/about-editor`, PR itbebop/react-meditation#3). 2026-11-23 머지·배포됨(위 항목 참고)
- 사용자 확인: 에디터 방식 제안(TipTap / Quill / Toast UI / CKEditor·TinyMCE) 중 **추천안(TipTap + Emulator 확인)**으로 진행하기로 사용자가 선택함. 화면 변경(관리자 화면 구성, 소개 페이지 텍스트 표시)은 이 요청 범위에 포함.

### 배경 / 목적
- 소개 페이지(`/about`)는 Storage `introduce/imageFile` 이미지 한 장만 보여줄 수 있었습니다. 현재 운영 이미지는 1448×10240 PNG(약 1.4MB)로, 글을 통째로 이미지로 만든 형태라 수정이 어렵고 로딩도 무겁습니다.
- 요청: 이미지와 텍스트 중 선택해서 표시, 긴 글을 스크롤로 읽을 수 있게, 편리한 에디터, 블로그처럼 글 중간에 이미지 첨부.

### 변경 내용

**1. 데이터 구조 (신규)**
- Firestore `pages/introduce`: `displayMode`(`"image"` | `"text"`), `contentHtml`(에디터 HTML), `updatedAt`.
- Storage `introduce/content/<시각>-<랜덤>.<확장자>`: 에디터 본문 이미지. 본문에는 URL만 저장(Firestore 문서 1MB 제한 때문에 base64로 넣지 않음).
- `src/firebase/introducePage.js`: 읽기(`loadIntroducePage`), 저장(`saveIntroducePage`, `setDoc` merge), 이미지 업로드(`uploadIntroduceContentImage`).

**2. 에디터 `src/components/editor/RichTextEditor.jsx` (신규, TipTap 3.35)**
- 툴바: 본문/큰 제목/작은 제목, 굵게·기울임·밑줄·취소선, 글머리·번호 목록, 인용, 구분선, 왼쪽·가운데·오른쪽 정렬, 링크, 이미지, 실행 취소·다시 실행. 툴바는 스크롤해도 위에 고정(sticky).
- 이미지 넣기: 툴바 버튼(여러 장 선택 가능), 붙여넣기(Ctrl+V), 끌어다 놓기(놓은 위치에 삽입). jpeg·png·gif·webp, 5MB 이하(기존 이미지 업로드와 같은 기준 + webp). 업로드 중 표시, 실패 시 메시지.
- 관리자 화면에서만 `React.lazy`로 불러와 별도 파일(`RichTextEditor-*.js`, 435KB / gzip 138KB)로 분리 → 공개 페이지는 이 파일을 받지 않음.

**3. 공개 표시 `src/components/editor/RichContent.jsx` (신규)**
- 저장된 HTML을 **DOMPurify 3.5**로 정리한 뒤 표시(XSS 방지). 현재 로그인만 하면 관리자 화면에 들어갈 수 있는 문제(IMPROVEMENTS 1순위)가 있어 반드시 필요.
- 링크는 새 탭 + `rel="noopener noreferrer"`, 이미지는 `loading="lazy"`.

**4. 스타일 `src/index.css`**
- `.rich-content` 클래스 안에만 적용되는 본문 스타일(제목, 목록, 인용, 링크, 이미지 등). 에디터와 공개 화면이 같은 스타일을 써서 작성한 모양 그대로 보임. 다른 화면에는 영향 없음.
- 처음엔 `@tailwindcss/typography`를 설치했으나, 취약한 `postcss-selector-parser`(moderate 2개)를 함께 설치해서 제거하고 직접 작성함.

**5. 관리자 화면 `src/components/pages/admin/AdminIntroduce.jsx`**
- 제목 "협회소개 이미지 업로드" → "협회소개", 그 아래에 새 카드 추가:
  - "소개 페이지 표시 방식": 이미지 / 텍스트(에디터) 선택
  - "텍스트 편집": 에디터. 표시 방식이 이미지여도 미리 작성해 둘 수 있음
  - 저장 버튼(변경이 있을 때만 활성), "소개 페이지 열기" 링크, 마지막 저장 시각, 저장 안 한 변경 경고(페이지를 떠날 때 브라우저 확인 창)
  - 저장 시 검사: 텍스트 모드인데 내용이 없거나, 이미지 모드인데 등록된 이미지가 없으면 저장 안 함
- 기존 "협회소개 이미지 업로드" 카드는 그대로 유지(소제목만 추가).

**6. 공개 화면 `src/components/pages/About.jsx`**
- `pages/introduce`를 읽어 `displayMode === "text"`이고 내용이 있으면 에디터 글을, 아니면 기존 이미지를 표시.
- **문서가 없거나 읽기에 실패하면 기존처럼 이미지 표시** → 배포해도 관리자가 텍스트 모드로 저장하기 전까지 운영 화면은 그대로.
- 제목·소개 문구 영역은 변경 없음. 본문 폭은 읽기 좋게 `max-w-3xl`.

**7. 로컬 테스트 환경 (Firebase Emulator)**
- `firebase.json`에 `emulators` 설정 추가(Auth 9099, Firestore 8080, Storage 9199, UI 4000). `hosting`/`storage` 설정은 그대로이며, 배포에는 영향 없음. (이 파일의 `ignore` 배열 줄바꿈은 사용자가 `firebase init`을 실행하며 바뀐 것으로, 내용은 같음)
- `src/firebase/firebase_config.js`: `import.meta.env.DEV && VITE_USE_FIREBASE_EMULATOR === "true"`일 때만 Emulator에 연결. 운영 빌드 결과물에 연결 코드가 없는 것을 확인.
- `.env.emulator`(신규, 비밀 값 없음): `VITE_USE_FIREBASE_EMULATOR=true`.
- `package.json` 스크립트: `dev:emulator`, `emulators`, `emulators:seed`.
- `scripts/seed-emulator.mjs`(신규): Emulator 초기화 후 테스트 관리자 계정, `user` 문서, `introduce/imageFile`(파비콘 이미지) 생성. 127.0.0.1에만 요청.
- `.claude/launch.json`: `vite-emulator`(5174) 추가.
- 개발 서버(`npm run dev`)가 운영 Firebase를 그대로 쓰기 때문에, 관리자 저장 테스트를 운영에서 하면 `ima.vision`이 즉시 바뀌는 문제를 피하기 위한 것.

**8. 패키지**
- 추가: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-text-align` (모두 3.35.0), `dompurify` 3.5.0.
- `npm audit`: 4개(high, 기존 `@grpc/grpc-js` 계열)로 변화 없음.

### 확인 / 결과
- `npm run build` 성공. `npm run lint` 오류 19개로 기존과 같음(새 파일에서 오류 없음).
- 번들: 공개용 `index-*.js` 1,087KB → 1,127KB(gzip 289 → 305KB, DOMPurify 등). 에디터는 별도 파일 435KB(관리자 화면에서만 로드).
- **Emulator에서 브라우저 확인** (운영 데이터 사용 안 함, 이미지 URL이 `127.0.0.1:9199`인 것으로 확인):
  - 문서가 없을 때 소개 페이지 → 기존 이미지 표시
  - 테스트 관리자로 로그인 → `/dashboard/introduce`에 표시 방식·에디터 표시
  - 긴 글 붙여넣기(제목, 목록, 인용, 링크 포함 약 2,400자) → 서식 유지
  - 이미지 붙여넣기 → Storage `introduce/content/`에 업로드되고 커서 위치(2번째 문단 뒤)에 삽입
  - 툴바 "굵게" 클릭 → `<strong>` 적용
  - 텍스트 모드로 저장 → 소개 페이지에 글·이미지·링크 표시, 페이지 높이 2,752px로 스크롤해서 끝(푸터)까지 확인
  - 다시 열면 저장한 내용이 에디터에 불러와지고, 변경이 없으면 저장 버튼 비활성
  - 이미지 모드로 저장 → 소개 페이지에 기존 이미지 표시, 텍스트 숨김
  - 모바일(375px): 가로 스크롤 없음, 첨부 이미지 343px로 화면 폭에 맞춤
  - **XSS 확인**: Firestore에 `onerror`가 달린 img, `<script>`, `javascript:` 링크, `<iframe>`을 직접 넣어도 공개 화면에서 모두 제거되고 실행되지 않음
- **운영 Firebase 기준 확인(읽기만)**:
  - `npm run dev`로 소개 페이지 → 기존 이미지 그대로 표시(운영에는 `pages/introduce` 문서 없음)
  - 운영 Firestore `pages/introduce`를 비로그인으로 읽으면 404(문서 없음) → 읽기 권한은 있음. **쓰기 권한은 확인하지 못함**(운영에 쓰기 테스트를 하지 않음).

### 남은 일
- 운영 배포 전 사용자 확인 필요(개발 원칙 8번). 배포 후 실제 관리자 계정으로 첫 저장을 해 봐야 Firestore 쓰기 권한이 확인됩니다. 권한 오류가 나면 저장 실패 메시지가 뜨고, 소개 페이지는 그대로입니다.
- 에디터에서 지운 이미지가 Storage에 남는 문제, Emulator 규칙이 전부 허용인 점은 IMPROVEMENTS.md에 기록.

### 정정
- 앞서 IMPROVEMENTS.md에 적은 "배포 사이트에 파비콘 없음"은 잘못된 판단이었습니다. Vite가 파비콘을 `dist/assets/`로 복사하며, 운영 사이트에서도 정상 제공 중입니다. 해당 항목을 정정했습니다.

---

## 2026-11-23 — 개발 원칙에 "운영 배포 최소화" 추가

- 파일: `CLAUDE.md` (개발 원칙 8번)
- 사용자 요청: 배포는 최소화해서 꼭 필요할 때, 수정이 어느 단계까지 마무리되었을 때 하도록 원칙에 추가

### 배경 / 목적
- PR #1 머지 이후 `main` push가 곧 운영 자동 배포가 되었습니다.
- 문서만 바꾼 PR(#2)도 머지하면 재배포가 실행되는 등, 작은 변경마다 운영 배포가 일어날 수 있습니다.

### 변경 내용
- `main` 머지 = 운영 배포라는 점 명시
- 작은 수정·문서 변경은 작업 브랜치에 모아 두고, 마무리·확인이 끝난 단위로 머지
- 긴급한 보안·장애 수정이 아니면, 머지 전에 반영 내용을 정리해 사용자 확인
- 배포 후 운영 사이트 확인 및 WORKLOG 기록

### 결과
- 문서 변경만 있음(코드·화면 변경 없음).
- 사용자가 `firebase init hosting:github`로 생긴 `.github/workflows/firebase-hosting-pull-request.yml`을 직접 삭제함. `firebase.json`의 줄바꿈 형식 변경은 아직 커밋되지 않은 채 남아 있음(내용 동일).

---

## 2026-11-23 — PR #1 머지 및 첫 자동 배포 (운영 반영)

- 머지 커밋: `50048d7` (PR itbebop/react-meditation#1 → `main`, merge commit 방식)
- 배포 실행: GitHub Actions run `45174805084` (`Deploy to Firebase Hosting`)
- 사용자 확인: 사용자가 "머지하고 배포 확인"을 요청함

### 목적
- 취약점 패치, `index.html` 오타 스크립트 제거, 새 배포 워크플로를 운영(`ima.vision`)에 반영.
- 이 PR에는 이전에 push된 사용자 커밋 2개(`5e31e3a` 취약점 개선, `f6d7e9f` 인스타그램 아이콘 추가·관리자 수강신청 화면 변경)도 포함되어 함께 운영에 반영됨.

### 결과
- 워크플로 전 단계 성공(secret 확인 → `npm ci` → 빌드 → live 배포), 약 1분.
- 운영 번들 변경 확인:
  | | 배포 전 | 배포 후 |
  |---|---|---|
  | JS | `assets/index-BWmIs3C4.js` | `assets/index-LegiaGDH.js` |
  | 오타 스크립트(`cdn.tailwindscss.com`) | 있음 | 없음 |
- `ima.vision`과 `ima-meditation.web.app` 모두 새 번들을 내려줌.
- 배포된 JS 해시가 로컬 `.env`로 빌드한 해시(`index-LegiaGDH.js`)와 동일 → GitHub secrets 값이 로컬 `.env`와 일치함을 간접 확인(Vite가 환경변수를 번들에 넣기 때문).
- 운영 사이트 브라우저 확인:
  - 홈: 이미지 6/6 로드, 강의 데이터 표시, 페이지 로드 약 1.5초(이전에는 오타 스크립트 때문에 약 20초 이상).
  - 수강 신청: 강의 4개, 이미지 6/6 로드.
  - FAQ: 질문 12개 표시.
  - 비로그인 `/dashboard` → `/admin`으로 이동.
  - 콘솔 오류 없음.
- **관리자 로그인 후 화면은 확인하지 못함**(로그인 계정 없음).

### 참고
- Actions 실행 시 경고: `actions/checkout@v4`, `actions/setup-node@v4`가 Node.js 20 기반이라 지원 종료 예정(현재는 Node 24로 강제 실행되어 동작함). IMPROVEMENTS.md에 기록.
- 문제가 생기면 Firebase 콘솔 → Hosting → 출시 기록에서 이전 버전(`index-BWmIs3C4.js`)으로 롤백 가능.

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
- 2026-11-23: PR 머지 후 첫 실행 성공, 운영 반영 확인(위 "PR #1 머지 및 첫 자동 배포" 항목).

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
