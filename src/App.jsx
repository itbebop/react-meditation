import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/pages/Home";
import Lecture from "./components/pages/Lecture";
import Footer from "./components/Footer";
import Registration from "./components/pages/Registration";
import Faq from "./components/pages/Faq";
import About from "./components/pages/About";
import Login from "./components/pages/admin/Login";
import Dashboard from "./components/pages/admin/Dashboard";
import UserManagement from "./components/pages/admin/User";
import ProtectedRoute from "./components/pages/admin/ProtectedRoute";
import AdminLayout from "./components/pages/admin/AdminLayout";
import AdminHome from "./components/pages/admin/AdminHome";
import AdminIntroduce from "./components/pages/admin/AdminIntroduce";
import AdminLecture from "./components/pages/admin/AdminLecture";
import AdminRegistraion from "./components/pages/admin/AdminRegistraion";
import AdminFaq from "./components/pages/admin/AdminFaq";

// Layout 컴포넌트
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/lecture" element={<Lecture />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/faq" element={<Faq />} />
        </Route>

        {/* Admin login */}
        <Route path="/admin" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/users" element={<UserManagement />} />
            <Route path="/dashboard/home" element={<AdminHome />} />
            <Route path="/dashboard/introduce" element={<AdminIntroduce />} />
            <Route path="/dashboard/lecture" element={<AdminLecture />} />
            <Route
              path="/dashboard/registraion"
              element={<AdminRegistraion />}
            />
            <Route path="/dashboard/faq" element={<AdminFaq />} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
