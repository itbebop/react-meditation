import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/pages/Home";
import Lecture from "./components/pages/Lecture";
import Footer from "./components/Footer";
import Registration from "./components/pages/Registration";
import Faq from "./components/pages/Faq";
import About from "./components/pages/About";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/lecture" element={<Lecture />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/faq" element={<Faq />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
