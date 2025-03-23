import { useState } from "react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/card";
import { Menu, Users, Settings, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 p-5 space-y-4 ${
          menuOpen ? "block" : "hidden"
        } md:block`}
      >
        <h1 className="text-xl font-bold">Admin Panel</h1>
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
          <Button variant="destructive">
            <LogOut /> Logout
          </Button>
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
