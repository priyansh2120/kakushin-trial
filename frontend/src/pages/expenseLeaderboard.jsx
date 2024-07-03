// src/components/Leaderboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const categoryStyles = {
    0: 'bg-gradient-to-r from-blue-400 to-blue-600',
    1: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    2: 'bg-gradient-to-r from-gray-400 to-gray-600',
    3: 'bg-gradient-to-r from-orange-400 to-orange-600'
};

const ExpenseLeaderboard = () => {
    const [competitions, setCompetitions] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/leaderboard');
                setCompetitions(response.data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Leaderboard</h1>
            {competitions.map((competition, index) => (
                <div key={index} className={`${categoryStyles[index] || 'bg-gradient-to-r from-green-400 to-green-600'} text-white p-4 rounded-lg mb-4`}>
                    <h2 className="text-2xl font-semibold mb-2">{competition.competition}</h2>
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left">
                                <th className="p-2">Profile</th>
                                <th className="p-2">Username</th>
                                <th className="p-2">Points</th>
                                <th className="p-2">Financial Literacy</th>
                                <th className="p-2">Profession</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competition.users.map((user) => (
                                <tr key={user.username} className="border-b border-gray-200">
                                    <td className="p-2">
                                        <img src={user.profilePictureUrl} alt="Profile" className="w-10 h-10 rounded-full" />
                                    </td>
                                    <td className="p-2">{user.username}</td>
                                    <td className="p-2">{user.points.toFixed(2)}</td>
                                    <td className="p-2">{user.financialLiteracy}</td>
                                    <td className="p-2">{user.profession}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default ExpenseLeaderboard;
