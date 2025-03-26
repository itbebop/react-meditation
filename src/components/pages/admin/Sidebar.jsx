import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ui/Button";
import { Menu, Users, Settings, LogOut } from "lucide-react";

const Sidebar = ({ menuOpen, setMenuOpen, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-gray-900 text-white w-48 sm:w-64 p-3 sm:p-5 flex flex-col ${
        menuOpen ? "block" : "hidden"
      } md:flex`}
    >
      <div className="flex-grow">
        <h1 className="text-lg sm:text-xl font-bold mb-4">Admin Panel</h1>
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full text-sm sm:text-base flex items-center space-x-2"
            onClick={() => navigate("/dashboard")}
          >
            <Menu size={18} /> <span>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm sm:text-base flex items-center space-x-2"
            onClick={() => navigate("/dashboard/users")}
          >
            <Users size={18} /> <span>Users</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm sm:text-base flex items-center space-x-2"
          >
            <Settings size={18} /> <span>Settings</span>
          </Button>
        </nav>
      </div>
      <div className="mt-auto">
        <Button
          variant="destructive"
          className="w-full text-sm sm:text-base"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
