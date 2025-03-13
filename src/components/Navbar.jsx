import React, { useState, useEffect } from "react";
import logo from "../assets/IMA_logo2.svg";
import { FaXmark, FaBars } from "react-icons/fa6";
import { FaHome, FaSignInAlt, FaUserPlus, FaRedo } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSticky, setIsSticky] = useState(false);

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 스크롤 방향 감지 및 Sticky 상태 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 방향 감지
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrollingUp(false); // 스크롤 다운: Nav 숨기기
      } else {
        setIsScrollingUp(true); // 스크롤 업: Nav 보이기
      }

      // Sticky 상태 업데이트
      setIsSticky(currentScrollY > 0);

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // 상단 Nav 아이템
  const topNavItems = [
    {
      link: "홈",
      path: "home",
      icon: (
        <FaHome className="w-6 h-6 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4" />
      ),
    },
    // {
    //   link: "로그인",
    //   path: "login",
    //   icon: (
    //     <FaSignInAlt className="w-6 h-6 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4" />
    //   ),
    // },
    {
      link: "회원가입",
      path: "signup",
      icon: (
        <FaUserPlus className="w-6 h-6 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4" />
      ),
    },
    // { link: "캐시삭제", path: "clear-cache", icon: <FaRedo /> },
  ];

  // 메인 Nav 아이템
  const navItems = [
    { link: "국제명상협회 소개", path: "about" },
    { link: "교육과정", path: "lecture" },
    { link: "수강신청", path: "signup" },
    { link: "F&A", path: "faq" },
  ];

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ${
        isScrollingUp ? "translate-y-0" : "-translate-y-full"
      } ${isSticky ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      {/* 상단 Nav (모바일: 로고 + topNavItems 함께, 데스크톱: 로고 없이 topNavItems 우측 정렬) */}
      <div className="py-4 sm:border-b-0 border-gray-300">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 text-sm text-gray-600">
          {/* 모바일에서는 로고 표시, 데스크톱에서는 숨김 */}
          <a href="#" className="flex items-center space-x-3 lg:hidden">
            <img src={logo} alt="Logo" className="w-40 h-auto" />
          </a>

          {/* topNavItems + 햄버거 버튼 (우측 정렬) */}
          <div className="flex items-center space-x-6 ml-auto">
            <ul className="flex space-x-6">
              {topNavItems.map((item, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span>{item.icon}</span>
                  {/* 텍스트는 lg 이상에서만 표시 */}
                  <a
                    href={`#${item.path}`}
                    className="hidden lg:block hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    {item.link}
                  </a>
                </li>
              ))}
            </ul>

            {/* 모바일 햄버거 버튼 */}
            <div className="lg:hidden">
              <button onClick={toggleMenu} className="relative top-[2px]">
                {isMenuOpen ? (
                  <FaXmark className="h-6 w-6 text-neutralDGrey" />
                ) : (
                  <FaBars className="h-6 w-6 text-neutralDGrey" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 Nav (데스크톱에서는 로고 왼쪽, 메뉴 우측) */}
      <nav className="py-6 hidden lg:block">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 text-base gap-8">
          {/* 데스크톱에서만 로고 표시 */}
          <a href="#" className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className=" md:w-40 lg:w-48 h-auto" />
          </a>

          {/* 네비게이션 메뉴 (항상 우측 정렬) */}
          <ul className="ml-auto flex space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={`#${item.path}`}
                  className="text-gray-900 hover:text-brandPrimary text-lg"
                >
                  {item.link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 모바일 네비게이션 메뉴 (오른쪽에서 슬라이드) */}
      <div
        className={`fixed top-0 right-0 h-auto w-64 bg-white shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex justify-end p-4">
          <button className="text-gray-700 text-2xl" onClick={toggleMenu}>
            <FaXmark />
          </button>
        </div>
        <ul className="mt-4 mb-4 space-y-4 px-6">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.path}`}
                className="text-gray-900 hover:text-brandPrimary block py-2"
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
