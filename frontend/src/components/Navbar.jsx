import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets_admin/assets";
import { hello } from "../assets/assets_frontend/assets";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    let parsedUser = null;
    try {
      parsedUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      localStorage.removeItem("user");
    }
    setToken(storedToken);
    setUser(parsedUser);

    const onAuthChange = (e) => {
      const newToken = e?.detail?.token ?? localStorage.getItem("token");
      let newUser = null;
      try {
        const userStr = e?.detail?.user;
        if (userStr) {
          newUser = typeof userStr === "string" ? JSON.parse(userStr) : userStr;
        } else {
          userStr = localStorage.getItem("user");
          newUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
        }
      } catch (e) {
        console.error("Error parsing user:", e);
        localStorage.removeItem("user");
      }
      setToken(newToken);
      setUser(newUser);
    };

    const onStorage = () => {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      let parsedU = null;
      try {
        parsedU = u && u !== "undefined" ? JSON.parse(u) : null;
      } catch (e) {
        console.error("Error parsing user from storage event:", e);
        localStorage.removeItem("user");
      }
      setToken(t);
      setUser(parsedU);
    };

    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    const userRole = user?.role;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent("authChange"));

    if (userRole === "admin") navigate("/admin-login");
    else if (userRole === "doctor") navigate("/doctor-login");
    else navigate("/login");
  };

  const getProfileImage = () => {
    if (user?.profilePic) {
      if (user.profilePic.startsWith("http")) {
        return user.profilePic;
      } else {
        return `${import.meta.env.VITE_BACKEND_URL || 'https://docterappoinmentsystemmain.onrender.com'}${user.profilePic.startsWith('/') ? '' : '/'}${user.profilePic}`;
      }
    }
    return hello.profile_pic;
  };

  return (
    <>
      <div className="flex items-center justify-between text-sm py-3 px-4 sm:px-6 mb-5 border-b border-b-gray-400">
        <img
          onClick={() => navigate("/")}
          className="w-32 sm:w-40 lg:w-44 cursor-pointer"
          src={assets.admin_logo}
          alt="Logo"
        />

        <ul className="hidden md:flex items-start gap-3 lg:gap-5 font-medium text-xs sm:text-sm">
          <NavLink to="/"><li className="py-1 hover:text-blue-600 transition-colors">HOME</li></NavLink>
          <NavLink to="/doctors"><li className="py-1 hover:text-blue-600 transition-colors">ALL DOCTORS</li></NavLink>
          <NavLink to="/about"><li className="py-1 hover:text-blue-600 transition-colors">ABOUT</li></NavLink>
          <NavLink to="/contact"><li className="py-1 hover:text-blue-600 transition-colors">CONTACT</li></NavLink>
        </ul>

        <div className="flex items-center gap-2 sm:gap-4">
          {token && (
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <img
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-300"
                  src={getProfileImage()}
                  alt="Profile"
                  onError={(e) => (e.target.src = hello.profile_pic)}
                />
                <img 
                  className={`w-2 sm:w-2.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  src={hello.dropdown_icon} 
                  alt="Dropdown" 
                />
              </div>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 min-w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[9999]">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/my-profile");
                    }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/my-appointments");
                    }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    My Appointments
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/medical-records");
                    }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    Medical Records
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!token && (
            <div className="hidden sm:flex gap-2 lg:gap-3">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-light text-xs sm:text-sm hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="border border-blue-500 text-blue-500 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-light text-xs sm:text-sm hover:bg-blue-50 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          <img
            onClick={() => setShowMenu(true)}
            className="w-5 sm:w-6 md:hidden cursor-pointer"
            src={hello.menu_icon}
            alt="Menu"
          />
        </div>
      </div>

      <div className={`${showMenu ? "fixed w-full" : "h-0 w-0"} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
        <div className="flex justify-between items-center px-4 sm:px-5 py-4 sm:py-6 border-b">
          <img className="w-28 sm:w-36" src={hello.logo} alt="Logo" />
          <img onClick={() => setShowMenu(false)} className="w-6 sm:w-7 cursor-pointer" src={hello.cross_icon} alt="Close" />
        </div>

        <ul className="flex flex-col items-center gap-1 sm:gap-2 mt-4 sm:mt-5 px-4 sm:px-5 text-base sm:text-lg font-medium">
          <NavLink to="/" onClick={() => setShowMenu(false)}><p className="px-4 py-2 sm:py-3 rounded inline-block w-full text-center hover:bg-gray-100 transition-colors">Home</p></NavLink>
          <NavLink to="/doctors" onClick={() => setShowMenu(false)}><p className="px-4 py-2 sm:py-3 rounded inline-block w-full text-center hover:bg-gray-100 transition-colors">All Doctors</p></NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false)}><p className="px-4 py-2 sm:py-3 rounded inline-block w-full text-center hover:bg-gray-100 transition-colors">About</p></NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)}><p className="px-4 py-2 sm:py-3 rounded inline-block w-full text-center hover:bg-gray-100 transition-colors">Contact</p></NavLink>

          {!token && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 w-full px-2">
              <button onClick={() => { setShowMenu(false); navigate("/login"); }} className="bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base hover:bg-blue-600 transition-colors">Login</button>
              <button onClick={() => { setShowMenu(false); navigate("/register"); }} className="border border-blue-500 text-blue-500 px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm sm:text-base hover:bg-blue-50 transition-colors">Sign Up</button>
            </div>
          )}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
