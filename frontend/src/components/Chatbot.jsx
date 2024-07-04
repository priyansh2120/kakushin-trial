// src/components/Chatbot.js
import React, { useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const Chatbot = () => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSendQuery = async () => {
        if (!query.trim()) return;

        const newChatHistory = [...chatHistory, { type: 'question', text: query }];
        setChatHistory(newChatHistory);

        try {
            const response = await axios.post('http://localhost:5000/api/query', { query });
            const botResponse = response.data.response;
            setChatHistory([...newChatHistory, { type: 'answer', text: botResponse }]);
        } catch (error) {
            console.error('Error fetching response:', error);
            setChatHistory([...newChatHistory, { type: 'answer', text: 'Error fetching response. Please try again later.' }]);
        }

        setQuery('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendQuery();
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="border rounded-lg p-4 bg-white shadow-md">
                <h1 className="text-2xl font-bold mb-4">Chatbot</h1>
                <div className="h-64 overflow-y-auto mb-4">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`p-2 my-2 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg ${chat.type === 'question' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                {chat.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        onKeyPress={handleKeyPress}
                        className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Type your query..."
                    />
                    <button
                        onClick={handleSendQuery}
                        className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
