import { ArrowRight } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { mobileOnly } from "./lectureUtils";

/**
 * 홈 화면 "메인 강의" 카드.
 * 공개 화면(Home.jsx)과 관리자 미리보기가 같은 컴포넌트를 씁니다.
 * (마크업은 Home.jsx에 있던 것을 그대로 옮긴 것)
 */
export default function HomeLectureCard({ lecture, onNavigate, forceMobile = false }) {
  const m = (cls) => mobileOnly(cls, forceMobile);

  return (
    <div
      className={m(
        "bg-white rounded-lg shadow-lg overflow-hidden lg:h-[230px] lg:w-[50%] 2xl:w-[100%]"
      )} // shadow-sm 추가
    >
      <div className={m("flex flex-col lg:flex-row h-full")}>
        {/* 이미지 영역 */}
        <div className={m("lg:w-1/2")}>
          <LazyLoadImage
            src={
              lecture.imgUrl ||
              `https://picsum.photos/800/600?random=${lecture.id}` // 기본 이미지 처리
            }
            alt={`강의 이미지 - ${lecture.title}`} // 접근성 개선
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: "1.2/1" }}
          />
        </div>

        {/* 텍스트 영역 */}
        <div className={m("lg:w-7/12 p-6 flex flex-col justify-center")}>
          <div className="mt-auto mb-auto">
            {/* 카테고리 태그 */}
            <span
              className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4`}
              style={{
                backgroundColor: lecture.categoryColor || "#f59e0b", // 기본 색상 설정
              }}
            >
              {lecture.category}
            </span>

            {/* 강의 제목 */}
            <h2 className={m("text-lg lg:text-xl font-bold text-gray-800 mb-4")}>
              {lecture.title}
            </h2>

            {/* 강사 이름과 이동 버튼을 같은 행에 배치 */}
            <div className="flex items-center justify-between mb-1">
              {/* 강사 이름 */}
              <p className="text-sm text-gray-600 font-semibold">
                {lecture.lecturer}
              </p>

              {/* 이동 버튼 */}
              <button
                onClick={onNavigate}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                aria-label="강의 상세 보기" // 접근성 개선
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
