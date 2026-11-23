import { useMemo } from "react";
import DOMPurify from "dompurify";

// 외부 링크는 새 탭으로 열고, 원래 페이지에 접근하지 못하도록 rel 지정
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
  if (node.tagName === "IMG") {
    node.setAttribute("loading", "lazy");
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

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
