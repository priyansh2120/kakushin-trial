import React from "react";
import { Wallet, ListChecks, Award, MessageCircle, BarChart3, Sparkles } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Smart Expense Tracking",
    description: "Track income and expenses with AI-powered auto-categorization and necessity scoring.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    title: "AI Financial Analysis",
    description: "Get deep spending insights, anomaly detection, and predictive forecasts from our Expense Analyzer agent.",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
  {
    icon: MessageCircle,
    title: "AI Financial Chatbot",
    description: "Chat with our multi-agent AI system for personalized financial advice powered by Google Gemini.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: ListChecks,
    title: "Chore Management",
    description: "Complete chores to earn virtual currency. Parents can assign tasks with secret key verification.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Quizzes",
    description: "Test your knowledge with dynamically generated questions tailored to your financial literacy level.",
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    icon: Award,
    title: "Leaderboard & Rewards",
    description: "Compete with others, earn virtual currency, unlock badges, and climb the financial literacy ranks.",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Build{" "}
            <span className="text-emerald-600">Financial Literacy</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From AI-powered expense analysis to gamified learning — SmartLit combines 
            cutting-edge technology with engaging gameplay.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
