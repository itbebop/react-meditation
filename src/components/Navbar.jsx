import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/IMA_logo2.svg";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { link: "국제명상협회 소개", path: "/about" },
    { link: "교육과정", path: "/lecture" },
    { link: "수강신청", path: "/registration" },
    { link: "FAQ", path: "/faq" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 py-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-32 sm:w-36 md:w-40 lg:w-48 h-auto transition-all duration-300"
          />
        </Link>

        {/* 햄버거 버튼 */}
        <button
          onClick={toggleMenu}
          className="text-gray-700 text-2xl lg:hidden focus:outline-none"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden lg:block">
          <ul className="flex space-x-8">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className="text-gray-900 hover:text-brandPrimary text-base md:text-lg"
                >
                  {item.link}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 서랍 메뉴 */}
      {isMenuOpen && (
        <div className="bg-white lg:hidden">
          <ul className="px-4 py-6 space-y-4">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-900 hover:text-brandPrimary text-lg"
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
