import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Registration = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // 상세보기 토글 함수
  const handleToggleDetails = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // 팝업 토글 함수
  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
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
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              expandedCard === index ? "md:flex" : "md:flex"
            }`}
          >
            {/* 카드 이미지 (왼쪽) */}
            <div
              className={`${
                expandedCard === index ? "md:w-1/3" : "md:w-2/5"
              } transition-all duration-700`}
            >
              <img
                src={`https://picsum.photos/id/101${index + 2}/800/600`}
                alt="Course Image"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 카드 내용 및 상세 정보 (오른쪽) */}
            <div
              className={`${
                expandedCard === index ? "md:w-2/3" : "md:w-3/5"
              } p-6`}
            >
              <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                정규 과정
              </span>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                내면소통명상 기초과정 (온라인 과정)
              </h2>
              <p className="text-sm text-gray-600 mb-4 font-semibold">
                홍길동 선생
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 md:space-x-4 text-gray-900 font-medium text-sm">
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
              </div>

              {/* 상세보기 버튼 */}
              <button
                className="text-xs bg-neutralSilver flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
                onClick={() => handleToggleDetails(index)}
              >
                {expandedCard === index ? "접기" : "상세보기"}
                {expandedCard === index ? (
                  <FaChevronUp className="ml-2 text-gray-600" />
                ) : (
                  <FaChevronDown className="ml-2 text-gray-600" />
                )}
              </button>

              {/* 상세 정보 컨테이너 */}
              {expandedCard === index && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    이 강의는 내면소통명상의 기초를 배우는 과정입니다. <br />
                    온라인 강의로 언제 어디서나 편하게 수강할 수 있습니다.{" "}
                    <br />
                    <br />✅ <strong>강의 내용:</strong> <br />
                    - 명상의 기본 원리와 실습 <br />
                    - 내면의 감정과 생각을 정리하는 법 <br />
                    - 명상을 통한 집중력 향상 및 스트레스 관리 <br />
                    - 실전 명상 가이드 및 응용 사례 <br />
                    <br />
                    📅 <strong>강의 일정:</strong> 자유롭게 학습 가능 (온라인)
                  </p>

                  {/* 신청하기 버튼 */}
                  <button
                    className="w-full mt-4 bg-lightGreen text-white font-bold py-2 rounded-lg hover:bg-green-500 transition-all duration-300"
                    onClick={handleTogglePopup}
                  >
                    신청하기
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 팝업 (신청 폼) */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {/* 제목 */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">수강 신청</h2>

            {/* 안내 문구 */}
            <p className="text-sm text-gray-600 mb-6">
              기재해주신 연락처로 수강 절차를 안내드리겠습니다.
            </p>

            {/* 입력 폼 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="example@email.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="홍길동"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="tel"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                onClick={handleTogglePopup}
              >
                닫기
              </button>
              <button className="px-4 py-2 bg-lightGreen text-white rounded-lg hover:bg-green-500 transition-all">
                보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        <button className="text-gray-500 hover:text-neutralGreen transition-all duration-300">
          <ChevronLeft size={20} />
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            className="font-medium text-gray-500 hover:text-neutralGreen transition-all duration-300"
          >
            {page}
          </button>
        ))}
        <button className="text-gray-500 hover:text-neutralGreen transition-all duration-300">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Registration;
