import React, { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { storage } from "../../firebase/firebase_config";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase_config"; // Firestore 초기화 확인

const Home = () => {
  const navigate = useNavigate();
  const [carouselImages, setCarouselImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainLectures, setMainLectures] = useState([]);

  // Firestore에서 isMain=true인 강의 2개 조회
  const fetchMainLectures = async () => {
    try {
      const q = query(collection(db, "lectures"), where("isMain", "==", true));
      const querySnapshot = await getDocs(q);
      const lecturesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 최대 2개의 문서만 가져오기
      setMainLectures(lecturesData.slice(0, 2));
    } catch (error) {
      console.error("메인 강의 조회 실패:", error);
    }
  };

  // 이미지 가져오기
  const fetchImages = async () => {
    try {
      const imagesRef = ref(storage, "home/");
      const result = await listAll(imagesRef);
      const urls = await Promise.all(
        result.items.map(async (item) => {
          try {
            return await getDownloadURL(item);
          } catch (error) {
            console.error(`이미지 가져오기 오류 (${item.name}):`, error);
            return null;
          }
        })
      );
      setCarouselImages(urls.filter((url) => url !== null));
    } catch (error) {
      console.error("이미지 목록 조회 실패:", error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    fetchImages();
    fetchMainLectures();
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
          {isLoading ? (
            <p className="text-center text-gray-500"></p>
          ) : carouselImages.length > 0 ? (
            <Carousel slideInterval={5000} leftControl=" " rightControl=" ">
              {carouselImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            </Carousel>
          ) : (
            <p className="text-center text-gray-500">이미지가 없습니다.</p>
          )}
        </div>

        {/* 카드 섹션 */}
        <section className="bg-white py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-left">
            {" "}
            {/* 텍스트 왼쪽 정렬 */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
              내면소통명상 기초과정 오픈!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-center lg:gap-6 max-w-screen-xl mx-auto">
              {mainLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden lg:h-[250px] lg:w-[50%]"
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* 이미지 영역 */}
                    <div className="lg:w-5/12">
                      <img
                        src={
                          lecture.imgUrl ||
                          `https://picsum.photos/800/600?random=${lecture.id}` // 기본 이미지 처리
                        }
                        alt={`강의 이미지 - ${lecture.title}`} // 접근성 개선
                        className="w-full h-48 lg:h-full object-cover"
                        style={{ aspectRatio: "1.2/1" }}
                      />
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="lg:w-7/12 p-6 flex flex-col justify-center">
                      <div className="mt-auto mb-auto">
                        {/* 카테고리 태그 */}
                        <span
                          className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4`}
                          style={{
                            backgroundColor: lecture.categoryColor || "#f59e0b", // 기본 색상 설정
                          }}
                        >
                          {lecture.category}
                        </span>

                        {/* 강의 제목 */}
                        <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
                          {lecture.title}
                        </h2>

                        {/* 강사 이름 */}
                        <p className="text-sm text-gray-600 mb-4 font-semibold">
                          {lecture.lecturer}
                        </p>
                        <div className="flex items-center space-x-4 text-gray-900 font-medium text-sm">
                          <span className="flex items-center space-x-2">
                            <span>강의수</span>
                            <span className="text-gray-400">
                              {lecture.lectureNum}강
                            </span>
                          </span>
                          <span>|</span>
                          <span className="flex items-center space-x-2">
                            <span>이수시간</span>
                            <span className="text-gray-400">
                              {lecture.lectureTime}시간
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* 이동 버튼 */}
                      <div className="flex justify-end mt-auto">
                        <button
                          onClick={handleNavigate}
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                          aria-label="강의 상세 보기" // 접근성 개선
                        >
                          <ArrowRight size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
