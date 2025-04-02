import React, { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { storage } from "../../firebase/firebase_config";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase_config"; // Firestore 초기화 확인
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const Home = () => {
  const navigate = useNavigate();
  const [carouselImages, setCarouselImages] = useState({ pc: [], mobile: [] });
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

      const pcImages = [];
      const mobileImages = [];

      // console.log("=== Firebase Storage에서 가져온 파일 목록 ===");
      // result.items.forEach((item) => console.log(item.name));

      await Promise.all(
        result.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            console.log(`이미지 URL (${item.name}) -> ${url}`);

            if (item.name.toLowerCase().includes("pcimg")) {
              pcImages.push(url);
            } else if (item.name.toLowerCase().includes("mobileimg")) {
              mobileImages.push(url);
            }
          } catch (error) {
            console.error(`이미지 가져오기 오류 (${item.name}):`, error);
          }
        })
      );
      // 빈 배열일 경우 기본 이미지 추가
      setCarouselImages({
        pc: pcImages.length > 0 ? pcImages : ["/default_pc.jpg"], // 기본 이미지 경로
        mobile:
          mobileImages.length > 0 ? mobileImages : ["/default_mobile.jpg"], // 기본 이미지 경로
      });
    } catch (error) {
      console.error("이미지 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchMainLectures();
  }, []);

  useEffect(() => {
    console.log("현재 상태:", carouselImages);
  }, [carouselImages]);

  const handleNavigate = () => {
    navigate("/registration");
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-screen-2xl mx-auto h-auto mt-12">
        {/* Carousel 섹션 */}
        <div className="h-[400px] sm:h-[550px] xl:h-[600px] 2xl:w-full mt-24 sm:mt-28 lg:mt-36 xl:mt-40 px-4 md:px-14 ">
          {isLoading ? (
            <p className="text-center text-gray-500"></p>
          ) : (
            <>
              {/* PC 화면 */}
              <div className="hidden lg:block ">
                {carouselImages.pc.length > 0 && (
                  <Carousel
                    slideInterval={5000}
                    leftControl=" "
                    rightControl=" "
                    className="w-full h-[550px] xl:h-[600px] 2xl:h-[600px] lg:px-0 xl:px-20 2xl:px-32"
                  >
                    {carouselImages.pc.map((image, index) => (
                      <LazyLoadImage
                        key={index}
                        src={image}
                        alt={`Carousel 이미지 ${index}`}
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </Carousel>
                )}
              </div>

              {/* 모바일 화면 */}
              <div className="block lg:hidden">
                {carouselImages.mobile.length > 0 ? (
                  <Carousel
                    slideInterval={5000}
                    leftControl=" "
                    rightControl=" "
                    className="w-full h-[430px] sm:h-[540px] md:h-[550px]"
                  >
                    {carouselImages.mobile.map((imageUrl, index) => (
                      <LazyLoadImage
                        key={index}
                        src={imageUrl}
                        alt={`Mobile Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </Carousel>
                ) : (
                  <p className="text-center text-gray-500">
                    모바일용 이미지가 없습니다.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* 카드 섹션 */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
              내면소통명상 기초과정 오픈!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-center gap-6 max-w-screen-xl mx-auto text-left">
              {mainLectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden lg:h-[230px] lg:w-[50%] 2xl:w-[100%]" // shadow-sm 추가
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* 이미지 영역 */}
                    <div className="lg:w-1/2">
                      <LazyLoadImage
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

                        {/* 강사 이름과 이동 버튼을 같은 행에 배치 */}
                        <div className="flex items-center justify-between mb-4">
                          {/* 강사 이름 */}
                          <p className="text-sm text-gray-600 font-semibold">
                            {lecture.lecturer}
                          </p>

                          {/* 이동 버튼 */}
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
