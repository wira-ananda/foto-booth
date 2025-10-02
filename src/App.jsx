import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Camera from "./pages/Camera";

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navbar sederhana */}
        <nav style={{ padding: "10px", background: "#f0f0f0" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            Home
          </Link>
          <Link to="/camera" style={{ marginRight: "15px" }}>
            Camera
          </Link>
          <Link to="/gallery">Gallery</Link>
        </nav>

        {/* Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
