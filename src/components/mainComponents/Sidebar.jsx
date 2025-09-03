import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();

  // Update active button based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/dashboard") setActiveButton("dashboard");
    else if (path === "/today-report") setActiveButton("today-report");
    else if (path === "/sale-report") setActiveButton("sale-report");
    else if (path === "/customer") setActiveButton("customer");
    else if (path === "/products") setActiveButton("products");
  }, [location]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleButtonClick = (buttonName, path) => {
    setActiveButton(buttonName);
    navigate(path);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle " onClick={toggleSidebar}>
        ☰
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && <div className="sidebar-overlay d-md-none" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
        </div>

        <div className="sidebar-content">
          <button
            className={`sidebar-btn ${activeButton === "dashboard" ? "active" : ""}`}
            onClick={() => handleButtonClick("dashboard", "/dashboard")}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Dashboard</span>
          </button>

          <button
            className={`sidebar-btn ${activeButton === "today-report" ? "active" : ""}`}
            onClick={() => handleButtonClick("today-report", "/today-report")}
          >
            <span className="btn-icon">📅</span>
            <span className="btn-text">Today Report</span>
          </button>

          <button
            className={`sidebar-btn ${activeButton === "sale-report" ? "active" : ""}`}
            onClick={() => handleButtonClick("sale-report", "/sale-report")}
          >
            <span className="btn-icon">💰</span>
            <span className="btn-text">Sale Report</span>
          </button>

          <button
            className={`sidebar-btn ${activeButton === "customer" ? "active" : ""}`}
            onClick={() => handleButtonClick("customer", "/customer")}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Customer</span>
          </button>

          <button
            className={`sidebar-btn ${activeButton === "products" ? "active" : ""}`}
            onClick={() => handleButtonClick("products", "/products")}
          >
            <span className="btn-icon">📦</span>
            <span className="btn-text">Products</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
