import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-scroll";

// react icons
import { FaXmark, FaBars } from "react-icons/fa6";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // set toggle Menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // natitems array
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
        className={
          "py-4 lg:px-14 px-4 ${isSticky ? 'sticky top-0 left-0 right-0 border-b bg-white duration-300' : ''}"
        }
      >
        <div className="flex justify-between items-center text-base gap-8">
          <a
            href=""
            className="text-2xl font-semibold flex items-center space-x-3"
          >
            <img
              src={logo}
              alt="logo"
              className="w-10 inline-block item-center"
            />
            <span className="text-[##263238">IMA</span>
          </a>

          {/* nav item for large devices */}
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
              //   <Link
              //     to={path}
              //     spy={true}
              //     smooth={true}
              //     offset={-100}
              //     key={path}
              //     className="block text-base text-gray-900 hover:text-brandPrimary"
              //   >
              //     {link}
              //   </Link>
            ))}
          </ul>

          {/* btn for large devices */}
          <div className="space-x-12 hidden lg:flex items-center">
            <a
              href=""
              className="hidden lg:flex items-center text-brandPrimary hever:text-gray-900"
            >
              Login
            </a>
            <button className="bg-brandPrimary text-white py-2 px-4 transition-all duration-300 rounded hover:bg-neutralDGrey">
              Sign up
            </button>
          </div>

          {/* btn for only mobile devices */}
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
        {/* nav item for mobile devices */}
        <ul
          className={`${
            // isMenuOpen ? "block fixed top-0 right-0 left-0" : "hidden"
            isMenuOpen ? "block" : "hidden"
          } md:hidden mt-4 space-y-4`}
        >
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
      </nav>
    </header>
  );
};

export default Navbar;
