import React from "react";
import youtube from "../assets/youtube_icon.png";
import naverCafe from "../assets/naver_cafe_icon.png";

const Footer = () => {
  return (
    <footer className="py-10 bg-gray-100 w-full text-gray-600 text-sm">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-14">
        {/* 회사명 */}
        <div className="text-left text-base font-semibold text-gray-700 mb-2">
          사단법인 국제명상협회
        </div>

        {/* 회사 정보 */}
        <div className="text-left text-xs text-gray-500 mb-2">
          <p>고유번호: 460-82-00606 | 대표자: 김소영</p>
          <p>
            사업장 주소: 서울특별시 서초구 서래로 15, 402호(반포동, 범산빌딩)
          </p>
          <p>전화: 02-6956-1115 | 이메일: official@joohankim.org</p>
        </div>

        {/* Contact Us */}
        <a
          href="mailto:oomeditation2025@gmail.com"
          className="text-left text-base font-semibold cursor-pointer hover:underline text-gray-700 mb-1"
        >
          Contact Us
        </a>

        {/* 소셜 미디어 아이콘 */}
        <div className="flex space-x-4 mt-6">
          {/* YouTube 아이콘 */}
          <a
            href="https://www.youtube.com/@O2MEDI"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:opacity-75"
          >
            <img src={youtube} alt="YouTube" className="w-8 h-8" />
          </a>

          {/* 네이버 카페 아이콘 */}
          <a
            href="https://cafe.naver.com/happyashram"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:opacity-75"
          >
            <img src={naverCafe} alt="NaverCafe" className="w-8 h-8" />
          </a>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-9 right-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-full shadow-md"
          >
            ▲
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
