// 에디터에서 고를 수 있는 글꼴·글자 크기·색 목록
// (관리자 에디터와 공개 화면 RichContent가 함께 사용)
//
// 웹폰트는 @fontsource 패키지로 사이트에 직접 포함합니다(외부 서버 요청 없음).
// 한글 웹폰트는 @font-face 선언만으로도 CSS가 매우 커서(글꼴당 수십 KB),
// 모든 페이지에 넣지 않고 실제로 쓰일 때만 동적으로 불러옵니다.
// - 공개 화면: 글에 쓰인 글꼴만 (loadFontsUsedIn)
// - 관리자 에디터: 목록의 글꼴 전부 (loadAllFonts)
// 글꼴 파일(woff2)도 필요한 글자 범위만 브라우저가 내려받습니다.
const FONT_LOADERS = {
  "Nanum Gothic": () =>
    Promise.all([
      import("@fontsource/nanum-gothic/400.css"),
      import("@fontsource/nanum-gothic/700.css"),
    ]),
  "Nanum Myeongjo": () =>
    Promise.all([
      import("@fontsource/nanum-myeongjo/400.css"),
      import("@fontsource/nanum-myeongjo/700.css"),
    ]),
  "Gowun Batang": () =>
    Promise.all([
      import("@fontsource/gowun-batang/400.css"),
      import("@fontsource/gowun-batang/700.css"),
    ]),
  "Noto Sans KR": () =>
    Promise.all([
      import("@fontsource/noto-sans-kr/400.css"),
      import("@fontsource/noto-sans-kr/700.css"),
    ]),
};

const loaded = new Map();
function loadFont(name) {
  if (!loaded.has(name)) {
    loaded.set(
      name,
      FONT_LOADERS[name]().catch((error) => {
        loaded.delete(name);
        console.error(`글꼴 불러오기 실패: ${name}`, error);
      })
    );
  }
  return loaded.get(name);
}

export function loadAllFonts() {
  return Promise.all(Object.keys(FONT_LOADERS).map(loadFont));
}

export function loadFontsUsedIn(html) {
  if (!html) return Promise.resolve();
  return Promise.all(
    Object.keys(FONT_LOADERS)
      .filter((name) => html.includes(name))
      .map(loadFont)
  );
}

// value가 ""이면 "기본"(사이트 기본 글꼴, 지정 해제)
export const FONT_FAMILIES = [
  { label: "기본 글꼴", value: "" },
  { label: "나눔고딕", value: "'Nanum Gothic', sans-serif" },
  { label: "나눔명조", value: "'Nanum Myeongjo', serif" },
  { label: "고운바탕", value: "'Gowun Batang', serif" },
  { label: "Noto Sans KR", value: "'Noto Sans KR', sans-serif" },
];

export const FONT_SIZES = [
  { label: "작게", value: "14px" },
  { label: "기본 크기", value: "" },
  { label: "조금 크게", value: "18px" },
  { label: "크게", value: "20px" },
  { label: "아주 크게", value: "24px" },
];

// 사이트 색(tailwind.config.js)을 중심으로 구성
export const TEXT_COLORS = [
  { label: "진한 초록", value: "#1C7244" },
  { label: "초록", value: "#4CAF4F" },
  { label: "금색", value: "#D9AE46" },
  { label: "올리브", value: "#3C493C" },
  { label: "진한 회색", value: "#4D4D4D" },
  { label: "회색", value: "#717171" },
  { label: "빨강", value: "#DC2626" },
  { label: "파랑", value: "#2563EB" },
];

export const HIGHLIGHT_COLORS = [
  { label: "노랑", value: "#FEF08A" },
  { label: "연두", value: "#DCFCE7" },
  { label: "주황", value: "#FFEDD5" },
  { label: "하늘", value: "#DBEAFE" },
  { label: "분홍", value: "#FCE7F3" },
  { label: "회색", value: "#F3F4F6" },
];

// 저장된 HTML의 style 속성에서 허용할 CSS 속성 (RichContent의 정리 단계에서 사용)
export const ALLOWED_STYLE_PROPERTIES = [
  "font-family",
  "font-size",
  "color",
  "background-color",
  "text-align",
];
