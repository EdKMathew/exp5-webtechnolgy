import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <h2>TechFest 2026</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/register">Register</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/feedback">Feedback</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login">Login</Link>
      </div>
      <button onClick={toggleTheme}>
        {theme === "light" ? "Switch to Dark" : "Switch to Light"}
      </button>
    </nav>
  );
}

export default Navbar;
