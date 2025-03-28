import React, { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { storage } from "../../firebase/firebase_config";
import { ref, getDownloadURL, listAll } from "firebase/storage";

const Home = () => {
  const navigate = useNavigate();
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = ref(storage, "home/");
        const result = await listAll(imagesRef);
        const urls = await Promise.all(
          result.items.map(async (item) => {
            try {
              return await getDownloadURL(item);
            } catch (error) {
              console.error(`Error fetching ${item.name}:`, error);
              return null;
            }
          })
        );

        setCarouselImages(urls.filter((url) => url !== null)); // 유효한 URL만 저장
      } catch (error) {
        console.error("Error listing images:", error);
      }
    };

    fetchImages();
  }, []);

  const handleNavigate = () => {
    navigate("/registration");
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto h-auto bg-white mt-12">
        {/* Carousel 섹션 */}
        <div className="h-[550px] sm:h-[550px] xl:h-[600px] 2xl:w-full mt-24 sm:mt-28 lg:mt-36 xl:mt-44 px-4 lg:px-14">
          <Carousel slideInterval={5000} leftControl=" " rightControl=" ">
            {carouselImages.length > 0 ? (
              carouselImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                이미지를 불러오는 중...
              </p>
            )}
          </Carousel>
        </div>

        {/* 카드 섹션 */}
        <section className="bg-white py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
              내면소통명상 기초과정 오픈!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-center lg:gap-6 max-w-screen-xl mx-auto">
              {/* 첫 번째 카드 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden lg:h-[250px] lg:w-[50%]">
                <div className="flex flex-col lg:flex-row h-full">
                  <div className="lg:w-5/12">
                    <img
                      src="https://picsum.photos/id/1012/800/600"
                      alt="Course Image 1"
                      className="w-full h-48 lg:h-full object-cover"
                      style={{ aspectRatio: "1.2/1" }}
                    />
                  </div>
                  <div className="lg:w-7/12 p-6 flex flex-col justify-center">
                    <div className="mt-auto mb-auto">
                      <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        정규 과정
                      </span>
                      <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
                        내면소통명상 기초과정 (온라인 과정)
                      </h2>
                      <p className="text-sm text-gray-600 mb-4 font-semibold">
                        홍길동 선생
                      </p>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <button
                        onClick={handleNavigate}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      >
                        <ArrowRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 두 번째 카드 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden lg:h-[250px] lg:w-[50%]">
                <div className="flex flex-col lg:flex-row h-full">
                  <div className="lg:w-5/12">
                    <img
                      src="https://picsum.photos/id/1015/800/600"
                      alt="Course Image 2"
                      className="w-full h-48 lg:h-full object-cover"
                      style={{ aspectRatio: "1.2/1" }}
                    />
                  </div>
                  <div className="lg:w-7/12 p-6 flex flex-col justify-center">
                    <div className="mt-auto mb-auto">
                      <span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        정규 과정
                      </span>
                      <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
                        내면소통명상 기초과정 (온라인 과정)
                      </h2>
                      <p className="text-sm text-gray-600 mb-4 font-semibold">
                        홍길동 선생
                      </p>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <button
                        onClick={handleNavigate}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                      >
                        <ArrowRight size={24} />
                      </button>
                    </div>
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
