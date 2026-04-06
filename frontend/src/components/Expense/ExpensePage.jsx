import React from 'react';
import Expense from "./Expense";
import IncomePage from './Income';
import { ArrowRight, Sparkles, Wallet } from 'lucide-react';

const ExpensePage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5,transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#0f172a_0%,#10261e_55%,#0b8f68_100%)] p-8 md:p-10 text-white shadow-[0_20px_60px_rgba(16,24,40,0.18)] overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_28%)]" />
          <div className="relative grid lg:grid-cols-[1.4fr_0.9fr] gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100 mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Money Command Center
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
                <Wallet className="h-8 w-8 md:h-10 md:w-10 text-emerald-300" />
                Finance Dashboard
              </h1>
              <p className="text-base md:text-lg text-slate-200 mt-4 max-w-2xl leading-relaxed">
                Build your money rhythm here: capture every expense, log every income stream, and turn a blank tracker into a living picture of your financial habits.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {[
                { label: 'Track spending patterns', detail: 'Spot where cash disappears first' },
                { label: 'Map income sources', detail: 'Salary, side hustles, gifts, freelance' },
                { label: 'Grow consistency', detail: 'Small daily entries beat end-of-month guesswork' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-slate-300 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: 'Capture Fast',
              copy: 'Quick-entry modals for expenses and income so tracking never feels like admin work.',
            },
            {
              title: 'See the Split',
              copy: 'Visual charts reveal category mix, source mix, and how necessary your spending really is.',
            },
            {
              title: 'Build the Habit',
              copy: 'The first few entries matter most. This page is designed to make getting started feel rewarding.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-stone-200 bg-white/90 backdrop-blur-sm px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-stone-900">{item.title}</p>
                <ArrowRight className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Expense />
          <IncomePage />
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
