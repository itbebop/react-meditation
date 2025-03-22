import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 화살표 아이콘 import

const Registration = () => {
  return (
    <div id="registration" className="px-4 py-16 mt-12 bg-gray-50">
      {/* 헤더 (왼쪽 1/3 위치) */}
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">
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
              <button className="text-xs bg-neutralSilver  px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                상세보기
              </button>
              {/* <button className="text-xs bg-neutralGreen text-white px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                더보기
              </button> */}
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
              <button className="text-xs bg-neutralSilver  px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                상세보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        <button
          aria-label="Previous Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-[300ms]"
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
            } transition-all duration-[300ms]`}
          >
            {page}
          </button>
        ))}
        <button
          aria-label="Next Page"
          className="text-gray-500 hover:text-neutralGreen transition-all duration-[300ms]"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Registration;
