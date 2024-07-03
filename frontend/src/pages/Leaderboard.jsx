import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";

export const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(
        "http://localhost:5000/api/extras/alluser/search"
      );
      const data = await response.json();
      data.sort((a, b) => b.virtualCurrency - a.virtualCurrency);
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const getCategory = (index) => {
    if (index < 3) return "diamond";
    if (index < 8) return "gold";
    if (index < 18) return "silver";
    return "bronze";
  };

  const categoryStyles = {
    diamond: "bg-gradient-to-r from-blue-400 to-blue-600",
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    silver: "bg-gradient-to-r from-gray-400 to-gray-600",
    bronze: "bg-gradient-to-r from-orange-400 to-orange-600",
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Leaderboard</h1>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left">
            <th className="p-2">Profile</th>
            <th className="p-2">Username</th>
            <th className="p-2">Score</th>
            <th className="p-2">Financial Literacy</th>
            <th className="p-2">Profession</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user._id}
              className={`${categoryStyles[getCategory(index)]} text-white`}
            >
              <td className="p-2">
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </td>
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.virtualCurrency}</td>
              <td className="p-2">{user.financialLiteracy}</td>
              <td className="p-2">{user.profession}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
