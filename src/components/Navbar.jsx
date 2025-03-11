import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
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
    { link: "홈", path: "home", icon: <FaHome /> },
    { link: "로그인", path: "login", icon: <FaSignInAlt /> },
    { link: "회원가입", path: "signup", icon: <FaUserPlus /> },
    { link: "캐시삭제", path: "clear-cache", icon: <FaRedo /> },
  ];

  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isScrollingUp ? "translate-y-0" : "-translate-y-full"
      } ${isSticky ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      {/* 상단 Nav */}
      <div className="py-2 border-b border-gray-300">
        <div className="max-w-screen-2xl mx-auto flex justify-end items-center px-4 lg:px-14 text-sm text-gray-600">
          {/* 우측 아이템 */}
          <ul className="flex space-x-6">
            {topNavItems.map((item, index) => (
              <li key={index} className="flex items-center space-x-1">
                {/* 아이콘 항상 표시 */}
                <span>{item.icon}</span>
                {/* 텍스트는 md 이상에서만 표시 */}
                <a
                  href={`#${item.path}`}
                  className="hidden md:block hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  {item.link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 메인 Nav */}
      <nav className="py-4">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 text-base gap-8">
          {/* 로고 왼쪽 고정 */}
          <a href="#" className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-10 h-auto" />
            <span className="text-2xl font-semibold text-[#263238]">
              내면소통연구소
            </span>
          </a>

          {/* 네비게이션 메뉴 */}
          <ul className="md:flex space-x-12 hidden">
            <li>
              <a
                href="#about"
                className="text-gray-900 hover:text-brandPrimary text-lg"
              >
                기초과정 소개
              </a>
            </li>
            <li>
              <a
                href="#lecture"
                className="text-gray-900 hover:text-brandPrimary text-lg"
              >
                강의
              </a>
            </li>
            <li>
              <a
                href="#signup"
                className="text-gray-900 hover:text-brandPrimary text-lg"
              >
                회원가입
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-gray-900 hover:text-brandPrimary text-lg"
              >
                고객센터
              </a>
            </li>
            <li>
              <a
                href="#mypage"
                className="text-gray-900 hover:text-brandPrimary text-lg"
              >
                마이페이지
              </a>
            </li>
          </ul>

          {/* 햄버거 버튼 (모바일) */}
          <div className="md:hidden">
            <button onClick={toggleMenu}>
              {isMenuOpen ? (
                <FaXmark className="h-6 w-6 text-neutralDGrey" />
              ) : (
                <FaBars className="h-6 w-6 text-neutralDGrey" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 네비게이션 메뉴 (오른쪽에서 슬라이드) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button className="text-gray-700 text-2xl" onClick={toggleMenu}>
            <FaXmark />
          </button>
        </div>
        <ul className="mt-4 space-y-4 px-6">
          {topNavItems.map((item, index) => (
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
