import React from "react";
import { Users, BookOpen, Trophy, Target } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "Active Users", color: "text-emerald-500" },
  { icon: BookOpen, value: "50,000+", label: "Lessons Completed", color: "text-cyan-500" },
  { icon: Trophy, value: "25,000+", label: "Quizzes Taken", color: "text-purple-500" },
  { icon: Target, value: "₹2.5Cr", label: "Expenses Tracked", color: "text-orange-500" },
];

const testimonials = [
  {
    name: "Aditi, 22",
    role: "First Job, Pune",
    text: "SmartLit helped me understand budgeting when I started my first job. The AI advisor gave me personalized tips!",
    avatar: "https://avatar.iran.liara.run/public/girl?username=aditi",
  },
  {
    name: "Ravi, 16",
    role: "Student, Mumbai",
    text: "The gamification makes learning about money actually fun. I've earned 500+ coins just by tracking my expenses!",
    avatar: "https://avatar.iran.liara.run/public/boy?username=ravi",
  },
  {
    name: "Neha, 14",
    role: "Student, Jaipur",
    text: "My parents love the chore management feature. I'm learning to save while doing tasks at home.",
    avatar: "https://avatar.iran.liara.run/public/girl?username=neha",
  },
];

const CustomerReview = () => {
  return (
    <>
      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomerReview;
