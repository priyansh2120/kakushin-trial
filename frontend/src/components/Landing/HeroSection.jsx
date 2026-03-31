import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Shield, Gamepad2, Brain } from "lucide-react";

const HeroSection = ({ user }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <Brain className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">AI-Powered Financial Education</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Financial Future
              </span>
              {" "}Through Play
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              SmartLit gamifies financial literacy with AI-powered insights, 
              expense tracking, interactive quizzes, and personalized coaching — 
              making finance fun and accessible.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/expense"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
                  >
                    Start Learning Free
                  </Link>
                  <Link
                    to="/login"
                    className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-full transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, label: "Expense Tracking", desc: "Smart categorization", color: "from-emerald-500 to-emerald-600" },
              { icon: Brain, label: "AI Advisor", desc: "Personalized insights", color: "from-cyan-500 to-cyan-600" },
              { icon: Gamepad2, label: "Gamification", desc: "Earn rewards", color: "from-purple-500 to-purple-600" },
              { icon: Shield, label: "Secure", desc: "JWT + encryption", color: "from-orange-500 to-orange-600" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${item.color} mb-3`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
