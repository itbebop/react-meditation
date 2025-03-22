import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 페이지네이션 아이콘
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // 상세보기 아이콘

const Registration = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  // 상세보기 토글 함수
  const handleToggleDetails = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div id="registration" className="px-4 py-16 mt-12 bg-gray-50">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-12 max-w-screen-xl mx-auto md:px-28">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">수강 신청</h1>
          <p className="text-gray-600">
            원하는 강의를 선택하여 수강 신청하세요.
          </p>
        </div>
      </div>

      {/* 카드 컨테이너 */}
      <div className="grid grid-cols-1 gap-4 max-w-screen-xl mx-auto md:px-28">
        {[1, 2].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* 카드 이미지 */}
            <img
              src={`https://picsum.photos/id/101${index + 2}/1200/600`}
              alt="Course Image"
              className="w-full h-48 object-cover"
            />

            {/* 카드 내용 */}
            <div className="p-6">
              <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                정규 과정
              </span>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                내면소통명상 기초과정 (온라인 과정)
              </h2>
              <p className="text-sm text-gray-600 mb-4 font-semibold">
                홍길동 선생
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-gray-900 font-medium text-sm">
                  <span className="flex items-center space-x-2">
                    <span>강의수</span>
                    <span className="text-gray-400">30강</span>
                  </span>
                  <span>|</span>
                  <span className="flex items-center space-x-2">
                    <span>이수시간</span>
                    <span className="text-gray-400">124시간</span>
                  </span>
                </div>

                {/* 상세보기 버튼 */}
                <button
                  className="text-xs bg-neutralSilver flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  onClick={() => handleToggleDetails(index)}
                >
                  상세보기
                  {expandedCard === index ? (
                    <FaChevronUp className="ml-2 text-gray-600" />
                  ) : (
                    <FaChevronDown className="ml-2 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 상세 정보 컨테이너 */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                expandedCard === index
                  ? "max-h-auto p-4 bg-gray-100"
                  : "max-h-0"
              }`}
            >
              <p className="text-sm text-gray-700">
                이 강의는 내면소통명상의 기초를 배우는 과정입니다. <br />
                온라인 강의로 언제 어디서나 편하게 수강할 수 있습니다.
              </p>
              <br />
              <p>1강</p>
              <p>2강</p>
              <p>3강</p>
              <p>4강</p>
              <p>5강</p>
              <p>6강</p>
              <p>7강</p>
              <p>8강</p>
              <p>9강</p>
              <p>10강</p>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        <button
          aria-label="Previous Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            aria-label={`Go to page ${page}`}
            className={`font-medium ${
              page === 1
                ? "text-neutralGreen"
                : "text-gray-500 hover:text-neutralGreen"
            } transition-all duration-300`}
          >
            {page}
          </button>
        ))}
        <button
          aria-label="Next Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Registration;
