import React, { useEffect, useMemo, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  Trophy,
  Wand2,
  XCircle,
} from 'lucide-react';
import Modal from 'react-modal';
import API_BASE_URL from '../config';

Modal.setAppElement('#root');

const AI_TOPICS = ['Budgeting', 'Investing', 'Savings', 'Credit', 'Insurance', 'Tax'];

const buildResultTone = (percentage) => {
  if (percentage >= 80) return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (percentage >= 60) return 'border-sky-200 bg-sky-50 text-sky-800';
  if (percentage >= 40) return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-rose-200 bg-rose-50 text-rose-800';
};

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
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0] && data[0].questions) setQuestions(data[0].questions);
        else if (Array.isArray(data)) setQuestions(data);
      })
      .catch((err) => console.error('Error fetching questions:', err));
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
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = currentQuestions.length > 0 ? (answeredCount / currentQuestions.length) * 100 : 0;

  const currentModeMeta = useMemo(() => {
    if (mode === 'ai') {
      return {
        badge: 'AI-crafted session',
        title: aiTopic ? `${aiTopic} AI Quiz` : 'Adaptive AI Quiz',
        description: 'Fresh questions are generated around your chosen theme so the quiz feels less recycled and more like a personal coach.',
      };
    }

    return {
      badge: 'Classic practice',
      title: 'Standard Financial Quiz',
      description: 'A stable set of core finance questions to sharpen fundamentals and benchmark your literacy over time.',
    };
  }, [aiTopic, mode]);

  const handleOptionChange = (qIndex, option) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    const evaluatedResults = currentQuestions.map((q, i) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[i] || '',
      isCorrect: q.correctAnswer === (userAnswers[i] || ''),
      explanation: q.explanation || null,
    }));

    const score = evaluatedResults.filter((r) => r.isCorrect).length;
    setResults({ score, results: evaluatedResults });

    fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ results: evaluatedResults, score, userId: user?._id }),
    })
      .then(() => refreshUser())
      .catch(console.error);
  };

  const closeModal = () => setResults(null);

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7,transparent_24%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          <div className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#0f172a_0%,#102b3f_45%,#0a8f68_100%)] p-8 md:p-10 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_28%)]" />
            <div className="relative grid lg:grid-cols-[1.35fr_0.85fr] gap-8 items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100 mb-5">
                  <Wand2 className="h-3.5 w-3.5" />
                  Learn In Quiz Mode
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
                  <Brain className="h-9 w-9 text-emerald-300" />
                  Financial Quiz Studio
                </h1>
                <p className="text-base md:text-lg text-slate-200 mt-4 max-w-2xl leading-relaxed">
                  Pick a classic practice run or let SmartLit generate a fresher AI-led challenge around the topic you want to strengthen today.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: '5-question burst', detail: 'Fast enough to finish, rich enough to learn' },
                  { label: 'Coins + literacy', detail: 'Every run still feeds your game loop' },
                  { label: 'AI topic control', detail: 'Guide the generator toward your weak spots' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-sm text-slate-300 mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setMode('standard');
                setUserAnswers({});
                setResults(null);
              }}
              className="group rounded-[1.8rem] border border-stone-200 bg-white p-8 text-left shadow-sm hover:shadow-xl hover:border-sky-300 transition-all"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 mb-5 text-2xl">
                <Target className="h-7 w-7" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-600 mb-2">Classic Track</p>
                  <h3 className="font-bold text-2xl text-stone-900 mb-2">Standard Quiz</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Use a consistent question bank when you want stable practice and a clearer before/after sense of improvement.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-sky-500 transition-colors" />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-medium border border-sky-100">
                  {questions.length} questions available
                </span>
                <span className="rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-medium">
                  Reliable fundamentals
                </span>
              </div>
            </button>

            <div className="rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#eff6ff_100%)] p-8 shadow-sm">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-5 text-2xl">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-600 mb-2">AI Track</p>
              <h3 className="font-bold text-2xl text-stone-900 mb-2">AI-Generated Quiz</h3>
              <p className="text-sm text-stone-500 mb-5 leading-relaxed">
                Let the model generate a tighter, more contextual set of questions so each attempt feels less repetitive and more like adaptive tutoring.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {AI_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setAiTopic((prev) => (prev === topic ? '' : topic))}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      aiTopic === topic
                        ? 'border-emerald-300 bg-emerald-600 text-white'
                        : 'border-emerald-100 bg-white text-stone-600 hover:border-emerald-300'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <button
                onClick={generateAIQuiz}
                disabled={aiLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? 'Generating...' : `Generate ${aiTopic || 'Adaptive'} Quiz`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = currentQuestions.length > 0 && answeredCount === currentQuestions.length;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f8fafc_100%)] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className={`px-8 py-7 text-white ${mode === 'ai' ? 'bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_50%,#2563eb_100%)]' : 'bg-[linear-gradient(135deg,#1f2937_0%,#334155_55%,#0f766e_100%)]'}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/75 mb-2">{currentModeMeta.badge}</p>
                <h1 className="text-3xl font-bold tracking-tight">{currentModeMeta.title}</h1>
                <p className="text-white/80 mt-3 max-w-2xl leading-relaxed">{currentModeMeta.description}</p>
              </div>
              <button
                onClick={() => {
                  setMode('select');
                  setUserAnswers({});
                  setResults(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Questions</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{currentQuestions.length}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Answered</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{answeredCount}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Completion</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{Math.round(progressPercent)}%</p>
              </div>
            </div>

            <div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#10b981,#06b6d4)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>Start</span>
                <span>{canSubmit ? 'Ready to submit' : 'Answer every question to unlock results'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {currentQuestions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white rounded-[1.6rem] border border-stone-200 p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                  Q{qIdx + 1}
                </div>
                <div>
                  <p className="font-semibold text-lg text-stone-900 leading-relaxed">{q.question}</p>
                  <p className="text-sm text-stone-500 mt-1">
                    {mode === 'ai' ? 'AI generated this question to stretch understanding, not just memory.' : 'Core knowledge check from the standard question bank.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => {
                  const selected = userAnswers[qIdx] === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionChange(qIdx, opt)}
                      className={`text-left p-4 rounded-2xl border text-sm transition-all ${
                        selected
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full mr-3 text-xs font-bold ${selected ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="align-middle">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 z-10">
          <div className="rounded-[1.5rem] border border-stone-200 bg-white/95 backdrop-blur px-5 py-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-stone-900">{answeredCount}/{currentQuestions.length} answered</p>
              <p className="text-sm text-stone-500">Finish every question to get your score, review, and coin reward.</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 font-semibold transition-colors"
            >
              <Trophy className="h-4 w-4" />
              Submit Answers
            </button>
          </div>
        </div>

        {results && (() => {
          const percentage = Math.round((results.score / currentQuestions.length) * 100);
          const resultTone = buildResultTone(percentage);
          return (
            <Modal
              isOpen={!!results}
              onRequestClose={closeModal}
              contentLabel="Results"
              className="bg-white p-8 rounded-[2rem] shadow-xl max-w-3xl mx-auto my-10 border border-stone-200"
              overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50 overflow-y-auto pt-10"
            >
              <div className={`rounded-[1.5rem] border p-6 text-center ${resultTone}`}>
                <Trophy className="h-12 w-12 mx-auto mb-3" />
                <h2 className="text-4xl font-bold">{results.score}/{currentQuestions.length}</h2>
                <p className="mt-2 text-sm">Score: {percentage}%</p>
                <p className="mt-3 text-sm">
                  {percentage >= 80
                    ? 'Strong run. You are showing real confidence in this topic.'
                    : percentage >= 60
                      ? 'Solid progress. A few review passes will lift this quickly.'
                      : 'Good learning run. The explanations below are where the growth is.'}
                </p>
              </div>

              <div className="space-y-4 max-h-[26rem] overflow-y-auto mt-6 pr-1">
                {results.results.map((r, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${r.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex items-start gap-3">
                      {r.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-stone-900">{r.question}</p>
                        <p className="text-xs mt-2">
                          Your answer:{' '}
                          <span className={r.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                            {r.userAnswer || 'Not answered'}
                          </span>
                        </p>
                        {!r.isCorrect && <p className="text-xs text-stone-500 mt-1">Correct answer: {r.correctAnswer}</p>}
                        {r.explanation && <p className="text-xs text-stone-500 mt-2 italic leading-relaxed">{r.explanation}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={closeModal} className="w-full mt-6 bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-medium">
                Close Review
              </button>
            </Modal>
          );
        })()}
      </div>
    </div>
  );
};

export default Quiz;
