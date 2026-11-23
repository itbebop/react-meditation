import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { mobileOnly } from "./lectureUtils";

/**
 * 수강 신청 페이지(/registration)의 강의 카드.
 * 공개 화면과 관리자 미리보기가 같은 컴포넌트를 써서 모양이 어긋나지 않게 합니다.
 * (마크업은 Registration.jsx에 있던 것을 그대로 옮긴 것)
 *
 * props
 * - lecture: 강의 데이터
 * - fallbackIndex: 이미지가 없을 때 쓰는 임시 이미지 번호 (기존 동작 유지)
 * - expanded: 상세 정보 펼침 여부
 * - buttonExpanded: "보기/접기" 버튼 표시 상태
 *     공개 화면은 기존 동작(항상 "보기")을 유지하기 위해 따로 받습니다. (IMPROVEMENTS P2)
 * - onToggle, onApply: 보기 버튼 / 신청하기 버튼 클릭
 * - forceMobile: 관리자 미리보기에서 모바일 모양으로 보여줄 때 true
 */
export default function RegistrationLectureCard({
  lecture,
  fallbackIndex = 0,
  expanded = false,
  buttonExpanded = false,
  onToggle,
  onApply,
  forceMobile = false,
}) {
  const m = (cls) => mobileOnly(cls, forceMobile);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={m("md:flex")}>
        {/* 카드 이미지 (왼쪽) */}
        <div className={m("md:w-1/4")}>
          <LazyLoadImage
            src={
              lecture.imgUrl ||
              `https://picsum.photos/id/101${fallbackIndex + 2}/800/600`
            }
            alt="Course"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* 카드 내용 (오른쪽) */}
        <div className={m("md:w-3/4 p-4 md:p-6 md:ml-4")}>
          <span
            className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: lecture.categoryColor || "#f59e0b",
            }}
          >
            {lecture.category}
          </span>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            {lecture.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4 font-semibold">
            {lecture.lecturer}
          </p>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 text-gray-900 font-medium text-sm">
              <span className="flex items-center space-x-2">
                <span>강의수</span>
                <span className="text-gray-400">{lecture.lectureNum}강</span>
              </span>
              <span>|</span>
              <span className="flex items-center space-x-2">
                <span>이수시간</span>
                <span className="text-gray-400">{lecture.lectureTime}시간</span>
              </span>
            </div>
            {/* 상세보기 버튼 */}
            <button
              className="text-xs bg-neutralSilver flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
              onClick={onToggle}
            >
              {buttonExpanded ? "접기" : "보기"}
              {buttonExpanded ? (
                <FaChevronUp className="ml-2 text-gray-600" />
              ) : (
                <FaChevronDown className="ml-2 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* 상세 정보 컨테이너 */}
      {expanded && (
        <div className="bg-gray-100 p-4 rounded-lg mt-4 mx-6 mb-6">
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {lecture.detail}
          </p>

          {/* 신청하기 버튼 */}
          <button
            className="w-full mt-4 bg-lightGreen text-white font-bold py-2 rounded-lg hover:bg-green-500 transition-all duration-300"
            onClick={onApply}
          >
            신청하기
          </button>
        </div>
      )}
    </div>
  );
}
