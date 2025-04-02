import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Lazy Load Image 추가
import "react-lazy-load-image-component/src/effects/blur.css"; // 블러 효과 스타일 추가

const About = () => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storage = getStorage(); // Firebase Storage 인스턴스 생성
        const imageRef = ref(storage, "introduce/imageFile"); // 파일 경로 설정
        const url = await getDownloadURL(imageRef); // 다운로드 URL 가져오기
        setImageUrl(url); // 상태에 URL 저장
      } catch (error) {
        console.error("이미지 가져오기 실패:", error.message);
      }
    };

    fetchImage();
  }, []);

  return (
    <div id="about" className="px-4 py-16 mt-10">
      <div className="max-w-screen-xl mx-auto px-0 md:px-4 lg:px-10 xl:px-14">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-800 md:mt-4">
            소개 화면
          </h1>
          <p className="mt-4 text-gray-600">국제명상협회 소개화면입니다.</p>
          {/* Lazy Load Image 적용 */}
          {imageUrl && (
            <LazyLoadImage
              src={imageUrl}
              alt="소개 이미지"
              effect="blur" // 블러 효과 추가
              className="mt-10 w-50 rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
