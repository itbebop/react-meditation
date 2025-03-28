import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

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
      <div className="mb-10 max-w-screen-xl mx-auto md:px-4">
        <div className="w-full">
          {/* <h1 className="text-3xl font-bold text-gray-800">
            국제명상협회 소개
          </h1>
          <p className="mt-4 text-gray-600">
            이곳은 소개 화면입니다. 원하는 내용을 추가하세요.
          </p> */}
          {/* 이미지 렌더링 */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="소개 이미지"
              className="mt-6 w-50  rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
