import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, BarChart3, Target, Zap, Trophy, Brain } from 'lucide-react';

const games = [
  {
    to: '/games/stocks',
    icon: BarChart3,
    title: 'Stock Market Simulator',
    description: 'Start with ₹1,00,000 virtual cash. Buy and sell real Indian stocks. Learn investing without risk!',
    color: 'from-blue-500 to-cyan-500',
    tag: 'Investment',
  },
  {
    to: '/games/budget',
    icon: Target,
    title: 'Budget Challenge',
    description: 'Allocate a budget across categories for real-life scenarios. AI evaluates your decisions and gives a grade!',
    color: 'from-purple-500 to-pink-500',
    tag: 'Budgeting',
  },
  {
    to: '/quiz',
    icon: Brain,
    title: 'Financial Quiz',
    description: 'Test your financial knowledge with quiz questions. Earn coins and boost your literacy score!',
    color: 'from-orange-500 to-red-500',
    tag: 'Knowledge',
  },
  {
    to: '/missions',
    icon: Zap,
    title: 'Daily Missions',
    description: 'Complete daily tasks to earn rewards and build your streak. New missions every day!',
    color: 'from-emerald-500 to-teal-500',
    tag: 'Daily',
  },
  {
    to: '/leaderboard',
    icon: Trophy,
    title: 'Leaderboard',
    description: 'See where you rank among other SmartLit users. Compete for the top spot!',
    color: 'from-yellow-500 to-orange-500',
    tag: 'Compete',
  },
];

const GamesHub = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Gamepad2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Games & Activities</h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Learn financial literacy through interactive games, challenges, and competitions.
            Earn virtual currency while building real-world skills!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, i) => (
            <Link
              key={i}
              to={game.to}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all group"
            >
              <div className={`bg-gradient-to-r ${game.color} p-6`}>
                <game.icon className="h-10 w-10 text-white mb-2" />
                <span className="inline-block bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {game.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesHub;
