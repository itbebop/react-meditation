import React from "react";
import logo from "../assets/IMA_logo1_dark.svg";

const Footer = () => {
  return (
    <footer className="py-10 bg-gray-900 w-full text-gray-300 text-sm">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-14 flex flex-col items-center">
        {/* 로고 및 연구소 이름 */}
        <div className="flex items-center mb-4">
          <img src={logo} alt="Logo" className="w-40 h-auto mr-3" />
          <div className="text-left text-xs text-gray-400">
            <p>(주)내면소통연구소 대표: 김주한</p>
            <p>
              사업자등록번호: 202-08-03058 | 통신판매업허가:
              제2025-서울강남-00802호
            </p>
            <p>사업장주소: 서울 강남구 남부순환로 2645 4층</p>
            <p>전화: 010-6650-0945 | 이메일: official@joohankim.org</p>
            <p className="mt-2">COPYRIGHT © HULLARO. ALL RIGHTS RESERVED.</p>
          </div>
        </div>

        {/* 네비게이션 링크 */}
        <div className="flex space-x-6 mb-4">
          <span className="cursor-pointer hover:underline">고객센터</span>
          <span className="cursor-pointer hover:underline">이용약관</span>
          <span className="cursor-pointer hover:underline">
            개인정보처리방침
          </span>
        </div>
      </div>

      {/* To Top 버튼 */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-full shadow-md"
        >
          ▲
        </button>
      </div>
    </footer>
  );
};

export default Footer;
