import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { FaXmark, FaBars } from "react-icons/fa6";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 네비게이션 메뉴 아이템
  const navItems = [
    { link: "Home", path: "home" },
    { link: "Services", path: "services" },
    { link: "About", path: "about" },
    { link: "Product", path: "product" },
    { link: "Testimonial", path: "testimonial" },
    { link: "FAQ", path: "faq" },
  ];

  return (
    <header className="w-full bg-white md:bg-transparent fixed top-0 left-0 right-0">
      <nav
        className={`py-4 lg:px-14 px-4 ${
          isSticky
            ? "sticky top-0 left-0 right-0 border-b bg-white duration-300"
            : ""
        }`}
      >
        <div className="flex justify-between items-center text-base gap-8">
          {/* 로고 */}
          <a
            href="#"
            className="text-2xl font-semibold flex items-center space-x-3"
          >
            <img src={logo} alt="logo" className="w-10" />
            <span className="text-[#263238]">IMA</span>
          </a>

          {/* 네비게이션 메뉴 (대형 화면) */}
          <ul className="md:flex space-x-12 hidden">
            {navItems.map((link, index) => (
              <li key={index}>
                <a
                  href={`#${link.path}`}
                  className="text-gray-900 hover:text-brandPrimary"
                >
                  {link.link}
                </a>
              </li>
            ))}
          </ul>

          {/* 로그인 & 회원가입 버튼 (대형 화면) */}
          <div className="space-x-12 hidden lg:flex items-center">
            <a
              href="#"
              className="hidden lg:flex items-center text-brandPrimary hover:text-gray-900"
            >
              Login
            </a>
            <button className="bg-brandPrimary text-white py-2 px-4 transition-all duration-300 rounded hover:bg-neutralDGrey">
              Sign up
            </button>
          </div>

          {/* 햄버거 버튼 (모바일) */}
          <div className="md:hidden">
            <button
              className="focus:outline-none focus:text-grey-500"
              onClick={toggleMenu}
            >
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
          {navItems.map((link, index) => (
            <li key={index}>
              <a
                href={`#${link.path}`}
                className="text-gray-900 hover:text-brandPrimary block py-2"
              >
                {link.link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
