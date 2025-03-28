import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@ui/Button";
import {
  Menu,
  Users,
  LogOut,
  Home,
  Handshake,
  LayoutDashboard,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebase_config";

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 공통 사이드바 */}
      <div
        className={`bg-gray-900 text-white w-16 sm:w-64 p-3 sm:p-5 flex flex-col ${
          menuOpen ? "block" : "hidden"
        } md:flex`}
      >
        <div className="flex-grow">
          <h1 className="text-lg sm:text-xl font-bold mb-4 hidden sm:block">
            Admin Panel
          </h1>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start space-x-2"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard size={18} />{" "}
              <span className="hidden sm:inline">대시보드</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start space-x-2"
              onClick={() => navigate("/dashboard/users")}
            >
              <Users size={18} />{" "}
              <span className="hidden sm:inline">사용자관리</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start space-x-2"
              onClick={() => navigate("/dashboard/home")}
            >
              <Home size={18} />{" "}
              <span className="hidden sm:inline">홈 화면</span>
            </Button>{" "}
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start space-x-2"
              onClick={() => navigate("/dashboard/introduce")}
            >
              <Handshake size={18} />{" "}
              <span className="hidden sm:inline">협회 소개</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start space-x-2"
              onClick={() => navigate("/dashboard/lecture")}
            >
              <Menu size={18} />{" "}
              <span className="hidden sm:inline">교육과정 소개</span>
            </Button>
          </nav>
        </div>
        <div className="mt-auto">
          <Button
            variant="destructive"
            className="w-full text-sm sm:text-base flex items-center justify-center sm:justify-start"
            onClick={handleLogout}
          >
            <LogOut size={18} />{" "}
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 bg-gray-100">
        <header className="flex justify-between items-center bg-white p-3 sm:p-4 shadow-md">
          <Button
            variant="outline"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            <Menu size={20} />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold">Dashboard</h2>
        </header>
        <Outlet /> {/* 하위 라우트 컴포넌트가 렌더링되는 위치 */}
      </div>
    </div>
  );
};

export default AdminLayout;
