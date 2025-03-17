import React from "react";
import { Carousel } from "flowbite-react";
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
              alt="Slide 3"
              className="w-full h-full object-cover"
            />
          </Carousel>
        </div>

        {/* 카드 섹션 */}
        <section className="bg-white py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight ">
              내면소통명상 기초과정 오픈!
            </h2>

            {/* 카드 컨테이너 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
              {/* 첫 번째 카드 */}
              <div className="bg-[#D9AE46]/65 p-6 rounded-lg shadow-md flex items-center">
                <div>
                  <span className="inline-block bg-[#D9AE46]/50 text-white font-semibold text-sm px-3 py-1 rounded-full mb-4">
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
              <div className="bg-lightGreen/50 p-6 rounded-lg shadow-md flex items-center">
                <div>
                  <span className="inline-block bg-lightGreen/65 text-white font-semibold text-sm px-3 py-1 rounded-full mb-4">
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
    </div>
  );
};

export default Home;
