import React, { useState, useEffect } from "react";
import logo from "../assets/IMA_logo2.svg";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 화면 크기 변경 감지 및 메뉴 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false); // 화면이 커지면 메뉴를 자동으로 닫음
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 메인 Nav 아이템
  const navItems = [
    { link: "국제명상협회 소개", path: "about" },
    { link: "교육과정", path: "lecture" },
    { link: "수강신청", path: "signup" },
    { link: "F&A", path: "faq" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* 상단 로고 및 네비게이션 */}
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 py-4">
        {/* 로고 */}
        <a href="#" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-32 sm:w-36 md:w-40 lg:w-48 h-auto transition-all duration-300"
          />
        </a>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden lg:block">
          <ul className="flex space-x-8">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={`#${item.path}`}
                  className="text-gray-900 hover:text-brandPrimary text-base md:text-lg"
                >
                  {item.link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 햄버거 버튼 (모바일) */}
        <button
          onClick={toggleMenu}
          className="text-gray-700 text-2xl lg:hidden focus:outline-none"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 서랍 메뉴 (모바일) */}
      <div
        className={`overflow-hidden transition-max-height duration-500 ${
          isMenuOpen ? "max-h-screen" : "max-h-0"
        } bg-white`}
      >
        <ul className="px-4 py-6 space-y-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.path}`}
                className="block text-gray-900 hover:text-brandPrimary text-lg"
              >
                {item.link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
