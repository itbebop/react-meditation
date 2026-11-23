import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { LazyLoadImage } from "react-lazy-load-image-component"; // Lazy Load Image 추가
import "react-lazy-load-image-component/src/effects/blur.css"; // 블러 효과 스타일 추가
import { DISPLAY_MODE, loadPageContent } from "../../firebase/pageContent";
import RichContent from "../editor/RichContent";

const Lecture = () => {
  const [imageUrl, setImageUrl] = useState("");
  // null: 아직 확인 전. 확인이 끝나면 { displayMode, contentHtml }
  const [page, setPage] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const storage = getStorage(); // Firebase Storage 인스턴스 생성
        const imageRef = ref(storage, "lecture/imageFile"); // 파일 경로 설정
        const url = await getDownloadURL(imageRef); // 다운로드 URL 가져오기
        setImageUrl(url); // 상태에 URL 저장
      } catch (error) {
        console.error("이미지 가져오기 실패:", error.message);
      }
    };

    // 표시 방식 설정을 읽지 못하면(문서 없음, 권한 없음 등) 기존처럼 이미지를 보여줌
    const fetchPage = async () => {
      try {
        setPage(await loadPageContent("lecture"));
      } catch (error) {
        console.error("교육 과정 페이지 설정 가져오기 실패:", error.message);
        setPage({ displayMode: DISPLAY_MODE.IMAGE, contentHtml: "" });
      }
    };

    fetchImage();
    fetchPage();
  }, []);

  const showText =
    page?.displayMode === DISPLAY_MODE.TEXT && page.contentHtml !== "";
  const showImage = page !== null && !showText;

  return (
    <div id="lecture" className="px-4 py-16 mt-10">
      <div className="max-w-screen-xl mx-auto md:px-4 lg:px-10 xl:px-14">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-800 md:mt-4 mb-4 ">
            교육 과정
          </h1>
          <p className="mt-4 text-gray-600">
            국제명상협회에서 제공하는 교육과정 안내입니다.{" "}
          </p>
          {showText && (
            <RichContent html={page.contentHtml} className="mt-10 max-w-3xl" />
          )}
          {/* Lazy Load Image 적용 */}
          {showImage && imageUrl && (
            <LazyLoadImage
              src={imageUrl}
              alt="교육 과정 이미지"
              effect="blur" // 블러 효과 추가
              className="mt-10 w-50 rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Lecture;
