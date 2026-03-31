import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { Menu, X, Coins, LogOut, Brain } from "lucide-react";

const Navbar = () => {
  const { user, loading, logout } = useContext(UserContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: "/", label: "Home" },
        { to: "/expense", label: "Dashboard" },
        { to: "/games", label: "Games" },
        { to: "/missions", label: "Missions" },
        { to: "/choremanagement", label: "Chores" },
        { to: "/quiz", label: "Quiz" },
        { to: "/leaderboard", label: "Leaderboard" },
      ]
    : [{ to: "/", label: "Home" }];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">
              Smart<span className="text-emerald-400">Lit</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-gray-800 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold">
                    {user.virtualCurrency}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-400"
                  />
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-1.5 text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.to)
                    ? "bg-emerald-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">{user.virtualCurrency} coins</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-400 px-3 py-2 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 text-sm">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-emerald-600 text-white rounded-md text-sm text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
