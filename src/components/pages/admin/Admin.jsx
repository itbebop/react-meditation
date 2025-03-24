import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ui/Button";
import { Card } from "@ui/Card";
import { CardContent } from "@ui/Card";
import { Menu, Users, Settings, LogOut } from "lucide-react";
import { auth } from "../../../firebase/firebase_config";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin");
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!authChecked) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 p-5 flex flex-col justify-between ${
          menuOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* 상단 메뉴 */}
        <div>
          <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full flex items-center space-x-2"
            >
              <Menu /> <span>Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center space-x-2"
            >
              <Users /> <span>Users</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full flex items-center space-x-2"
            >
              <Settings /> <span>Settings</span>
            </Button>
          </nav>
        </div>

        {/* 하단 로그아웃 버튼 */}
        <Button
          variant="destructive"
          className="w-full mt-auto" // mt-auto로 아래로 밀어냄
          onClick={handleLogout}
        >
          <LogOut className="mr-2" /> Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md">
          <Button
            variant="outline"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            <Menu />
          </Button>
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-gray-600">1,234 registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Revenue</h3>
              <p className="text-gray-600">$12,345 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-gray-600">56 active users</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
