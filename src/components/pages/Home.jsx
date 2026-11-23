import React, { useState, useEffect } from "react";
import { Carousel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { storage } from "../../firebase/firebase_config";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase_config"; // Firestore 초기화 확인
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import HomeLectureCard from "../lecture/HomeLectureCard";

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

      // 1. PC 및 모바일 파일만 추출
      const pcItems = result.items.filter((item) =>
        /^PC\d+$/i.test(item.name) // 파일명이 정확히 PC + 숫자
      );
      const mobileItems = result.items.filter((item) =>
        /^mobileimg\d+$/i.test(item.name)
      );

      // 2. 파일명을 오름차순 정렬 (PC1, PC2, PC3...)
      const sortedPcItems = pcItems.sort((a, b) => {
        const getNumber = (name) => parseInt(name.match(/\d+/)[0], 10);
        return getNumber(a.name) - getNumber(b.name);
      });

      const sortedMobileItems = mobileItems.sort((a, b) => {
        const getNumber = (name) => parseInt(name.match(/\d+/)[0], 10);
        return getNumber(a.name) - getNumber(b.name);
      });

      // 3. Download URL 비동기 처리
      const pcImages = await Promise.all(
        sortedPcItems.map((item) => getDownloadURL(item))
      );
      const mobileImages = await Promise.all(
        sortedMobileItems.map((item) => getDownloadURL(item))
      );

      // 4. 상태 업데이트
      setCarouselImages({
        pc: pcImages.length > 0 ? pcImages : ["/default_pc.jpg"],
        mobile: mobileImages.length > 0 ? mobileImages : ["/default_mobile.jpg"],
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
                    className="w-full h-[540px] sm:h-[540px] md:h-[550px]"
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
        <section className="pt-44 pb-6">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-14 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
              내면소통명상 기초과정 오픈!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-center gap-6 max-w-screen-xl mx-auto text-left">
              {mainLectures.map((lecture) => (
                <HomeLectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
