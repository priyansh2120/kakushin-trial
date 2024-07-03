import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-900 text-white">
      <div className="text-xl font-bold">Finlet</div>
      <ul className="flex space-x-6">
        <li><Link to ="/expense" > Expense Tracker</Link></li>
        <li><Link to ="/" > Recommendation</Link></li>
        <li><Link to ="/" > Chatbot</Link></li>
        <li><button className="bg-green-500 px-4 py-2 rounded">Sign up</button></li>
        <li><button className="bg-green-500 px-4 py-2 rounded">Login</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
