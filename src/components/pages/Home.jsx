import React from "react";
import { Carousel } from "flowbite-react";
import { Link } from "react-router-dom";
import slide1 from "../../assets/slide_image2.jpeg";
import slide2 from "../../assets/slide_image.jpeg";

const Home = () => {
  return (
    <div>
      {/* 전체 배경색 설정 */}
      <div className="max-w-screen-2xl mx-auto h-auto bg-white mt-12">
        {/* Carousel 섹션 */}
        <div className="h-[550px] sm:h-[550px] xl:h-[600px] 2xl:w-full mt-24 sm:mt-28 lg:mt-36 xl:mt-44 px-4 lg:px-14">
          <Carousel slideInterval={5000} leftControl=" " rightControl=" ">
            <img
              src={slide1}
              alt="Slide 1"
              className="w-full h-full object-cover"
            />
            <img
              src={slide2}
              alt="Slide 2"
              className="w-full h-full object-cover"
            />
          </Carousel>
        </div>

        {/* 카드 섹션 */}
        <section className="bg-white py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
              내면소통명상 기초과정 오픈!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-screen-xl mx-auto">
              {/* 첫 번째 카드 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://picsum.photos/id/1012/1200/600"
                  alt="Course Image 1"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 text-left">
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
                      {/* 첫 번째 그룹 */}
                      <span className="flex items-center space-x-2">
                        <span>강의수</span>
                        <span className="text-gray-400">30강</span>
                      </span>

                      {/* 구분 기호 */}
                      <span>|</span>

                      {/* 두 번째 그룹 */}
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

              {/* 두 번째 카드 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src="https://picsum.photos/id/1015/1200/600"
                  alt="Course Image 2"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 text-left">
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
                      {/* 첫 번째 그룹 */}
                      <span className="flex items-center space-x-2">
                        <span>강의수</span>
                        <span className="text-gray-400">30강</span>
                      </span>

                      {/* 구분 기호 */}
                      <span>|</span>

                      {/* 두 번째 그룹 */}
                      <span className="flex items-center space-x-2">
                        <span>이수시간</span>
                        <span className="text-gray-400">124시간</span>
                      </span>
                    </div>
                    {/* 신청 버튼 */}
                    <button className="text-xs bg-neutralSilver  px-4 py-2 rounded-lg hover:bg-lightGreen transition-all duration-300">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
