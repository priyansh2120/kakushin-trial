import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../contexts/UserContext";
import { Brain, CheckCircle, XCircle, Trophy, Sparkles, Loader2 } from 'lucide-react';
import Modal from 'react-modal';
import API_BASE_URL from '../config';

Modal.setAppElement('#root');

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState('select');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const { user, refreshUser } = useContext(UserContext);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/quiz/questions`)
      .then(res => res.json())
      .then(data => {
        if (data && data[0] && data[0].questions) setQuestions(data[0].questions);
        else if (Array.isArray(data)) setQuestions(data);
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, []);

  const generateAIQuiz = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topic: aiTopic || null, numQuestions: 5 }),
      });
      const data = await res.json();
      if (data.questions) {
        setAiQuestions(data.questions);
        setMode('ai');
        setUserAnswers({});
        setResults(null);
      }
    } catch (err) {
      console.error('AI Quiz error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const currentQuestions = mode === 'ai' ? aiQuestions : questions;

  const handleOptionChange = (qIndex, option) => {
    setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    const results = currentQuestions.map((q, i) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[i] || '',
      isCorrect: q.correctAnswer === (userAnswers[i] || ''),
      explanation: q.explanation || null,
    }));
    const score = results.filter(r => r.isCorrect).length;
    setResults({ score, results });

    fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ results, score, userId: user?._id }),
    }).then(() => refreshUser()).catch(console.error);
  };

  const closeModal = () => setResults(null);

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <Brain className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Financial Quiz</h1>
            <p className="text-gray-500 mt-2">Test your financial knowledge and earn coins!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setMode('standard')} className="bg-white rounded-2xl border border-gray-200 p-8 text-left hover:border-emerald-400 hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Standard Quiz</h3>
              <p className="text-sm text-gray-500">Answer pre-made financial literacy questions</p>
              <p className="text-emerald-600 text-sm font-medium mt-3">{questions.length} questions available</p>
            </button>
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">AI-Generated Quiz</h3>
              <p className="text-sm text-gray-500 mb-4">Get personalized questions based on your level</p>
              <select value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">Any topic</option>
                <option value="Budgeting">Budgeting</option>
                <option value="Investing">Investing</option>
                <option value="Savings">Savings</option>
                <option value="Credit">Credit</option>
                <option value="Insurance">Insurance</option>
                <option value="Tax">Tax Planning</option>
              </select>
              <button onClick={generateAIQuiz} disabled={aiLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate AI Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mode === 'ai' ? '🤖 AI Quiz' : '📝 Standard Quiz'}</h1>
            <p className="text-gray-500 text-sm">{currentQuestions.length} questions</p>
          </div>
          <button onClick={() => { setMode('select'); setUserAnswers({}); setResults(null); }} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        </div>
        <div className="space-y-6">
          {currentQuestions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                <span className="text-emerald-600">Q{qIdx + 1}.</span> {q.question}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => {
                  const selected = userAnswers[qIdx] === opt;
                  return (
                    <button key={oIdx} onClick={() => handleOptionChange(qIdx, opt)}
                      className={`text-left p-3 rounded-lg border text-sm transition-all ${selected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + oIdx)}.</span>{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors">
          Submit Answers
        </button>

        {results && (
          <Modal isOpen={!!results} onRequestClose={closeModal} contentLabel="Results"
            className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto my-10 border"
            overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="text-center mb-6">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-gray-900">{results.score}/{currentQuestions.length}</h2>
              <p className="text-gray-500">Score: {Math.round((results.score / currentQuestions.length) * 100)}%</p>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.results.map((r, i) => (
                <div key={i} className={`p-4 rounded-lg border ${r.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {r.isCorrect ? <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                    <div>
                      <p className="font-medium text-sm text-gray-900">{r.question}</p>
                      <p className="text-xs mt-1">Your answer: <span className={r.isCorrect ? 'text-emerald-600' : 'text-red-600'}>{r.userAnswer || 'Not answered'}</span></p>
                      {!r.isCorrect && <p className="text-xs text-gray-500">Correct: {r.correctAnswer}</p>}
                      {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={closeModal} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium">Close</button>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Quiz;
