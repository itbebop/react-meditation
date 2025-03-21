import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 화살표 아이콘 import

const Registration = () => {
  return (
    <div id="registration" className="px-4 py-16 mt-10 bg-gray-50">
      {/* 헤더 */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 mt-4">
        수강 신청
      </h1>
      <p className="text-center text-gray-600 mb-12">
        원하는 강의를 선택하여 수강 신청하세요.
      </p>

      {/* 카드 컨테이너 */}
      <div className="grid grid-cols-1 gap-4 md:gap-8 max-w-screen-xl mx-auto md:px-28">
        {/* 첫 번째 카드 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden md:mb-4">
          <img
            src="https://picsum.photos/id/1012/1200/600"
            alt="Course Image 1"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              정규 과정
            </span>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              내면소통명상 기초과정 (온라인 과정)
            </h2>
            <p className="text-sm text-gray-600 mb-4">By Mirko Santangelo</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8 text-gray-900 font-medium text-sm">
                {/* 첫 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>강의수</span>
                  <span className="text-gray-400">30강</span>
                </span>

                {/* 구분 기호 */}
                <span>|</span>

                {/* 두 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>목차수</span>
                  <span className="text-gray-400">49개</span>
                </span>
              </div>
              {/* 신청 버튼 */}
              <button className="text-sm bg-neutralGreen text-white px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                더보기
              </button>
            </div>
          </div>
        </div>

        {/* 두 번째 카드 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <img
            src="https://picsum.photos/id/1015/1200/600"
            alt="Course Image 2"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              정규 과정
            </span>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              내면소통명상 기초과정 (온라인 과정)
            </h2>
            <p className="text-sm text-gray-600 mb-4">By Mirko Santangelo</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8 text-gray-900 font-medium text-sm">
                {/* 첫 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>강의수</span>
                  <span className="text-gray-400">30강</span>
                </span>

                {/* 구분 기호 */}
                <span>|</span>

                {/* 두 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>목차수</span>
                  <span className="text-gray-400">49개</span>
                </span>
              </div>
              {/* 신청 버튼 */}
              <button className="text-sm bg-neutralGreen text-white px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                더보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        {/* 이전 페이지 버튼 */}
        <button
          aria-label="Previous Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-[300ms]"
        >
          <ChevronLeft size={20} /> {/* 왼쪽 화살표 아이콘 */}
        </button>

        {/* 페이지 번호 버튼들 */}
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            aria-label={`Go to page ${page}`}
            className={`font-medium ${
              page === 1
                ? "text-neutralGreen"
                : "text-gray-500 hover:text-neutralGreen"
            } transition-all duration-[300ms]`}
          >
            {page}
          </button>
        ))}

        {/* 다음 페이지 버튼 */}
        <button
          aria-label="Next Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-[300ms]"
        >
          <ChevronRight size={20} /> {/* 오른쪽 화살표 아이콘 */}
        </button>
      </div>
    </div>
  );
};

export default Registration;
