import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: updatedMessages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer sk-proj-tQrkSIpykkhUiVQThIAMT3BlbkFJPUTTAh8EAlMoTJMAR83D`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message;
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="flex-grow p-6 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-2 p-4 rounded-lg ${
              message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-900 flex">
        <input
          type="text"
          className="flex-grow p-2 rounded-l-lg border-none focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 p-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
