import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import API_BASE_URL from '../config';

const agentLabels = {
  financial_advisor: { label: 'Financial Advisor', color: 'bg-emerald-500', icon: '💰' },
  expense_analyzer: { label: 'Expense Analyzer', color: 'bg-cyan-500', icon: '📊' },
  smart_categorizer: { label: 'Smart Categorizer', color: 'bg-purple-500', icon: '🏷️' },
  quiz_generator: { label: 'Quiz Generator', color: 'bg-orange-500', icon: '🧠' },
  general_chat: { label: 'SmartLit AI', color: 'bg-gray-500', icon: '🤖' },
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm SmartLit AI 🤖 I can help with financial advice, analyze your spending, categorize expenses, or generate quiz questions. What would you like to know?",
      agent: 'general_chat',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useContext(UserContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.conversationId) setConversationId(data.conversationId);

      let content = '';
      if (typeof data.response === 'string') {
        content = data.response;
      } else if (data.isStructured) {
        content = formatStructuredResponse(data.response, data.agent);
      } else {
        content = JSON.stringify(data.response, null, 2);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content,
          agent: data.agent,
          isStructured: data.isStructured,
          structuredData: data.isStructured ? data.response : null,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          agent: 'general_chat',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatStructuredResponse = (data, agent) => {
    if (agent === 'expense_analyzer' && data.overallHealthScore !== undefined) {
      return `📊 **Financial Health Score: ${data.overallHealthScore}/100**\n\n` +
        (data.insights || []).map((i) => `${i.type === 'warning' ? '⚠️' : i.type === 'tip' ? '💡' : '📌'} **${i.title}**: ${i.description}`).join('\n\n') +
        (data.savingsOpportunities?.length ? '\n\n💰 **Savings Opportunities:**\n' + data.savingsOpportunities.map((s) => `• ${s.area}: Save ₹${s.potentialSaving} - ${s.action}`).join('\n') : '');
    }
    if (agent === 'quiz_generator' && data.questions) {
      return `🧠 Here are ${data.questions.length} quiz questions for you!\n\n` +
        data.questions.map((q, i) => `**Q${i + 1}:** ${q.question}\n${q.options.map((o, j) => `  ${String.fromCharCode(65 + j)}. ${o}`).join('\n')}`).join('\n\n');
    }
    if (agent === 'smart_categorizer' && data.category) {
      return `🏷️ **Category:** ${data.category}\n📊 **Necessity:** ${data.necessityPercentage}%\n🎯 **Confidence:** ${Math.round(data.confidence * 100)}%\n💡 ${data.suggestion}`;
    }
    return JSON.stringify(data, null, 2);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col z-50" style={{ height: '500px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">SmartLit AI</h3>
                <p className="text-gray-400 text-xs">Multi-Agent Financial Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                  {msg.role === 'assistant' && msg.agent && (
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-xs">{agentLabels[msg.agent]?.icon}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${agentLabels[msg.agent]?.color || 'bg-gray-500'}`}>
                        {agentLabels[msg.agent]?.label || 'AI'}
                      </span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-200 rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about finances..."
                className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-full transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">Powered by Google Gemini • Multi-Agent AI</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen ? 'bg-gray-700 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </>
  );
};

export default Chatbot;
