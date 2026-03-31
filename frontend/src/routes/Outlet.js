import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
      <Chatbot />
    </div>
  );
};

export default MainLayout;
