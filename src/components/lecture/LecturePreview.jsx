import { useState } from "react";
import RegistrationLectureCard from "./RegistrationLectureCard";
import HomeLectureCard from "./HomeLectureCard";

const MODES = [
  { key: "pc", label: "수강 신청 (PC)" },
  { key: "mobile", label: "수강 신청 (모바일)" },
  { key: "home", label: "홈 메인 카드" },
];

/**
 * 관리자 화면의 공개 화면 미리보기.
 * 공개 화면과 같은 카드 컴포넌트를 그대로 사용합니다.
 */
export default function LecturePreview({ lecture }) {
  const [mode, setMode] = useState("pc");
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700 mr-1">공개 화면 미리보기</span>
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`text-xs px-3 py-1 rounded-full border ${
              mode === m.key
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-2">
        입력하는 내용이 바로 반영됩니다. 저장해야 실제 화면에 적용됩니다.
        {mode === "home" && " 홈 화면에는 메인으로 지정한 강의(최대 2개)만 표시됩니다."}
      </p>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 overflow-hidden">
        {mode === "pc" && (
          <RegistrationLectureCard
            lecture={lecture}
            expanded={expanded}
            buttonExpanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            onApply={() => {}}
          />
        )}
        {mode === "mobile" && (
          <div className="mx-auto w-[360px] max-w-full border-x border-gray-200 bg-gray-50">
            <RegistrationLectureCard
              lecture={lecture}
              expanded={expanded}
              buttonExpanded={expanded}
              onToggle={() => setExpanded((v) => !v)}
              onApply={() => {}}
              forceMobile
            />
          </div>
        )}
        {mode === "home" && (
          <div className="lg:flex lg:justify-center text-left">
            <HomeLectureCard lecture={lecture} onNavigate={() => {}} />
          </div>
        )}
      </div>
      {(mode === "pc" || mode === "mobile") && (
        <p className="text-xs text-gray-400 mt-1">
          카드의 "보기" 버튼으로 상세 설명을 펼치거나 접을 수 있습니다. 미리보기의 "신청하기"는 동작하지 않습니다.
        </p>
      )}
    </div>
  );
}
