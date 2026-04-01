import React from 'react';
import Expense from "./Expense";
import IncomePage from './Income';
import { Wallet } from 'lucide-react';

const ExpensePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Finance Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Track your expenses and income in one place</p>
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
