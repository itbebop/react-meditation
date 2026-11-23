import { useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { ALLOWED_STYLE_PROPERTIES, loadFontsUsedIn } from "./textStyles";

// 외부 링크는 새 탭으로 열고, 원래 페이지에 접근하지 못하도록 rel 지정
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
  if (node.tagName === "IMG") {
    node.setAttribute("loading", "lazy");
  }
  // style 속성은 에디터가 쓰는 속성(글꼴, 크기, 색, 배경색, 정렬)만 남김.
  // position, 크기 조작 등으로 화면을 덮는 것을 막기 위함
  if (node.hasAttribute && node.hasAttribute("style")) {
    const kept = ALLOWED_STYLE_PROPERTIES.map((prop) => {
      const value = node.style.getPropertyValue(prop);
      return value && !/url\(|expression|javascript:/i.test(value)
        ? `${prop}: ${value}`
        : null;
    }).filter(Boolean);
    if (kept.length) node.setAttribute("style", kept.join("; "));
    else node.removeAttribute("style");
  }
});

/**
 * 에디터로 작성된 HTML을 공개 화면에 보여줍니다.
 * 저장된 HTML은 관리자 화면에서 들어오지만, 스크립트 삽입(XSS)을 막기 위해
 * 반드시 DOMPurify로 정리한 뒤 렌더링합니다.
 */
export default function RichContent({ html, className = "" }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html || "", {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target"],
      }),
    [html]
  );

  // 글에 쓰인 웹폰트만 불러옴
  useEffect(() => {
    loadFontsUsedIn(clean);
  }, [clean]);

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
