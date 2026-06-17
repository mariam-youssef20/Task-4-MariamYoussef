import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark-mode", next);
      return next;
    });
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/add-clothing", label: "Add Item" },
    { to: "/closet", label: "My Closet" },
    { to: "/outfits", label: "Outfit Generator" },
    { to: "/build-outfit", label: "Build Outfit" },
    { to: "/ai-tryon",     label: "AI Try-On" },
    { to: "/saved-outfits", label: "Saved Outfits" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Digital Closet</span>
        </div>

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`nav-link${isActive(link.to) ? " active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            className="dark-toggle"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
            onClick={toggleDark}
          >
            <span>{darkMode ? "☀" : "☽"}</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="#"
            className="mobile-nav-link"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              logout();
            }}
          >
            Logout
          </a>
        </div>
      )}
    </>
  );
}

export default Navbar;
