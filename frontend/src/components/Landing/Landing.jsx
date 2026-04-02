import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import HeroSection from "./HeroSection";
import FeaturesSection from "./Features";
import CustomerReview from "./CustomerReview";

const Landing = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection user={user} />
      <FeaturesSection />
      <CustomerReview />

      {/* AI Architecture Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Powered by <span className="text-emerald-400">Multi-Agent AI</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Our cutting-edge AI architecture uses specialized agents that work together
            to provide personalized financial guidance.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🧠",
                title: "AI Orchestrator",
                desc: "Intelligently routes your queries to the right specialist agent",
              },
              {
                icon: "💰",
                title: "Financial Advisor",
                desc: "Personalized advice based on your actual spending and income data",
              },
              {
                icon: "📊",
                title: "Expense Analyzer",
                desc: "Pattern detection, anomaly alerts, and spending predictions",
              },
              {
                icon: "🎯",
                title: "Smart Categorizer",
                desc: "Auto-categorizes expenses and scores necessity using AI",
              },
            ].map((agent, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-emerald-500 transition-colors"
              >
                <div className="text-4xl mb-4">{agent.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{agent.title}</h3>
                <p className="text-gray-400 text-sm">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-emerald-100 mb-8">
            Join thousands of students building financial literacy through gamification and AI.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-block bg-white text-emerald-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 SmartLit — Built with ❤️ for financial literacy | 
            Powered by Groq AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
