import React from "react";
import { Carousel } from "flowbite-react";
import slide1 from "../assets/sample1.png";

const Home = () => {
  return (
    <div>
      {" "}
      {/* 전체 배경색 설정 */}
      {/* Carousel Section */}
      <div className="max-w-screen-2xl mx-auto min-h-screen bg-white">
        {/* Carousel 섹션 */}
        <div className="h-[400px] sm:h-[500px] xl:h-[600px] 2xl:h-[800px] mt-40 px-4 lg:px-14">
          <Carousel slideInterval={3000}>
            <img
              src={slide1}
              alt="Slide 1"
              className="w-full h-full object-cover"
            />
            <img
              src="https://picsum.photos/id/1015/1200/600"
              alt="Slide 2"
              className="w-full h-full object-cover"
            />
            <img
              src="https://picsum.photos/id/1025/1200/600"
              alt="Slide 3"
              className="w-full h-full object-cover"
            />
          </Carousel>
        </div>

        {/* 카드 섹션 */}
        <section className="bg-white py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            {/* 제목 */}
            <span className="text-blue-500 text-center text-sm block mb-2 mt-20">
              김주한 교수가 100% 직접 지도하는
            </span>
            <h2 className="text-xl lg:text-3xl font-bold mb-8 text-gray-800">
              내면소통명상 기초과정 오픈!
            </h2>

            {/* 카드 컨테이너 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 첫 번째 카드 */}
              <div className="bg-blue-100 p-6 rounded-lg shadow-md flex items-center">
                <div>
                  <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                    내면소통명상 기초과정
                  </span>
                  <h3 className="text-lg font-semibold mb-2">
                    3월 12일 온라인 개강!
                  </h3>
                  <p className="text-gray-600 mb-4">교육 일정 및 내용 →</p>
                  <img
                    src="https://picsum.photos/id/1014/1200/600"
                    alt="Meditation Image"
                    className="w-[80px] h-[80px] mt-auto"
                  />
                </div>
              </div>

              {/* 두 번째 카드 */}
              <div className="bg-blue-100 p-6 rounded-lg shadow-md flex items-center">
                <div>
                  <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                    내면소통명상 기초과정
                  </span>
                  <h3 className="text-lg font-semibold mb-2">
                    내면소통 기초과정 소개
                  </h3>
                  <p className="text-gray-600 mb-4">김주한 교수의 안내 →</p>
                  <img
                    src="https://picsum.photos/id/1015/1200/600"
                    alt="Meditation Image"
                    className="w-[80px] h-[80px] mt-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="py-8 bg-gray-900 w-full">
        {" "}
        {/* Footer는 화면 전체 너비로 확장 */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center text-gray-300 text-sm">
          내면소통연구소
          <br />
          고객센터 | 이용약관 | 개인정보처리방침
          <br />
          (주)내면소통연구소 대표: 김주한
          <br />
          사업자등록번호: 2025 서울 강남구 남부순환로 2645 4층
          <br />
          전화: 010–6650–0945 이메일: official@joohankim.org
          <br />
          COPYRIGHT © HULLARO ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default Home;
