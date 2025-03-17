import React from "react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-screen-xl mx-auto">
        {/* 첫 번째 카드 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            <p className="text-sm text-gray-600 mb-4">By Louis Paquet</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8 text-gray-900 font-medium text-sm">
                {/* 첫 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>강의수</span>
                  <span className="text-gray-400">1목차수</span>
                </span>

                {/* 구분 기호 */}
                <span>|</span>

                {/* 두 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>목차수</span>
                  <span className="text-gray-400">49개</span>
                </span>
              </div>
              <button className="text-sm bg-neutralGreen text-white px-4 py-2 rounded-lg hover:bg-lightGreen">
                신청
              </button>
            </div>
          </div>
        </div>

        {/* 두 번째 카드 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <span className="text-gray-400">1목차수</span>
                </span>

                {/* 구분 기호 */}
                <span>|</span>

                {/* 두 번째 그룹 */}
                <span className="flex items-center space-x-2">
                  <span>목차수</span>
                  <span className="text-gray-400">49개</span>
                </span>
              </div>
              <button className="text-sm bg-neutralGreen text-white px-4 py-2 rounded-lg hover:bg-lightGreen">
                신청
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 페이지네이션 */}
      <div className="mt-12 flex justify-center items-center space-x-2">
        <button
          className="px-4 py-2 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200"
          aria-label="Previous Page"
        >
          &larr;
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            className={`px-4 py-2 rounded-full ${
              page === 1
                ? "bg-neutralGreen text-white"
                : "border border-gray-300 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          className="px-4 py-2 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200"
          aria-label="Next Page"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};

export default Registration;
