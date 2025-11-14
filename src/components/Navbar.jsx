import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/IMA_logo.svg";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [isMobile, setIsMobile] = useState(false); // 모바일 화면 여부를 저장하는 상태
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 화면 크기 감지 함수
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024); // lg 브레이크포인트(1024px) 기준

    // 모바일 화면이 아닌 경우 메뉴를 자동으로 닫음
    if (window.innerWidth >= 1024) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  useEffect(() => {
    // 초기 화면 크기 설정
    handleResize();

    // 화면 크기 변경 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navItems = [
    { link: "국제명상협회", path: "/about" },
    { link: "교육 과정", path: "/lecture" },
    { link: "수강 신청", path: "/registration" },
    { link: "FAQ", path: "/faq" },
  ];

  const handleMenuClick = (path) => {
    setActiveMenu(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full fixed top-0 left-0 bg-white shadow-md z-10 flex items-center">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 lg:px-10 2xl:px-12 py-4 w-full">
        {/* 헤더 로고 */}
        {!isMenuOpen && ( // 모바일 메뉴가 열렸을 때 헤더 로고 숨김
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setActiveMenu("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-32 sm:w-36 md:w-40 lg:w-48 h-auto transition-all duration-300"
            />
          </Link>
        )}

        {/* 모바일 메뉴 버튼 */}
        {!isMenuOpen && (
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="text-gray-700 text-xl lg:hidden focus:outline-none"
          >
            <Menu size={28} strokeWidth={1.5} />
          </button>
        )}

        {/* 네비게이션 링크 */}
        <nav className="hidden lg:block">
          <ul className="flex space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  className={`text-base md:text-lg ${
                    activeMenu === item.path
                      ? "text-brandPrimary"
                      : "text-gray-900 hover:text-brandPrimary"
                  }`}
                >
                  {item.link}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="bg-white lg:hidden absolute left-0 top-0 w-full px-4 py-6 text-left flex flex-col"
        >
          {/* 상단 로고와 닫기 버튼 */}
          <div className="flex justify-between items-center mb-6 ">
            <Link to="/" onClick={() => setActiveMenu("/")}>
              <img
                src={logo}
                alt="Logo"
                className="w-32" // 모바일 화면에서 로고 크기 조정
              />
            </Link>
            <button
              onClick={toggleMenu}
              className="text-gray-700 text-xl focus:outline-none"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* 네비게이션 링크 - 왼쪽 정렬 */}
          <ul className="space-y-6 pl-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => handleMenuClick(item.path)}
                  className={`block text-base ${
                    activeMenu === item.path
                      ? "text-brandPrimary font-semibold"
                      : "text-gray-900 hover:text-brandPrimary"
                  }`}
                >
                  {item.link}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
