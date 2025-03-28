import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/IMA_logo2.svg";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

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
    { link: "국제명상협회 소개", path: "/about" },
    { link: "교육과정", path: "/lecture" },
    { link: "수강신청", path: "/registration" },
    { link: "FAQ", path: "/faq" },
  ];

  const handleMenuClick = (path) => {
    setActiveMenu(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-4 lg:px-14 py-4">
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

        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="text-gray-700 text-xl lg:hidden focus:outline-none"
        >
          {isMenuOpen ? (
            <X size={28} strokeWidth={1.5} />
          ) : (
            <Menu size={28} strokeWidth={1.5} />
          )}
        </button>

        <nav className="hidden lg:block">
          <ul className="flex space-x-8">
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

      {isMenuOpen && (
        <div ref={menuRef} className="bg-white lg:hidden">
          <ul className="px-4 py-6 space-y-6">
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
