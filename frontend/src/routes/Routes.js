import React, { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {SignUp,Login,Quiz,ExpensePage,Landing} from "../components/export";
import ChoreManagement from "../pages/ChoreManagement";
import { Leaderboard } from "../pages/Leaderboard";
import ExpenseLeaderboard from "../pages/expenseLeaderboard";

const Routerapp = () => (
  <div className="App">
    <Router>
      <Routes>
      <Route element={<Landing />} path="/" exact />
      <Route element={<Login />} path="/login" exact />
      <Route element={<SignUp />} path="/signup" exact />
      <Route element={<Quiz />} path="/quiz" exact />
      <Route element={<ExpensePage />} path="/expense" exact />
      <Route element={<ChoreManagement />} path="/choremanagement" exact />
      <Route element={<Leaderboard />} path="/leaderboard" exact />
      <Route element={<expenseLeaderboard />} path="/expenseleaderboard" exact />
      </Routes>
    </Router>
  </div>
);

export default Routerapp;
