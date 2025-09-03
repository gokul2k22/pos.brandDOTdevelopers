import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/mainComponents/Sidebar";
import Dashboard from "./components/OtherComponents/Dashboard";
import TodayReport from "./components/OtherComponents/TodayReport";
import SaleReport from "./components/OtherComponents/SaleReport";
import Customer from "./components/OtherComponents/Customer";
import Products from "./components/OtherComponents/Products";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/today-report" element={<TodayReport />} />
            <Route path="/sale-report" element={<SaleReport />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/products" element={<Products />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
