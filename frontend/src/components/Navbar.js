import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const Navbar = () => {
  const { user, loading, error } = useContext(UserContext);

  return (
    <nav className="flex justify-between items-center p-6 bg-gray-900 text-white">
      <div className="text-xl font-bold">Finlet</div>
      <ul className="flex space-x-6">
        <li>
          <Link to="/expense">Expense Tracker</Link>
        </li>
        <li>
          <Link to="/">Recommendation</Link>
        </li>
        <li>
          <Link to="/">Chatbot</Link>
        </li>
        {loading ? (
          <li>Loading...</li>
        ) : error ? (
          <li>Error loading user data</li>
        ) : user ? (
          <li>Currency: {user.virtualCurrency}</li>
        ) : (
          <>
            <li>
              <Link to="/signup" className="bg-green-500 px-4 py-2 rounded">Sign up</Link>
            </li>
            <li>
              <Link to ="/login" className="bg-green-500 px-4 py-2 rounded">Login</Link>
            </li>
          </>
        )}
        {user && (
          <li>
            <Link onClick={()=>{
                localStorage.removeItem('userId');
                window.location.href = '/';
            }} className="bg-red-500 px-4 py-2 rounded">Logout</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
