import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignUp, Login, Quiz, ExpensePage, Landing } from "../components/export";
import ChoreManagement from "../pages/ChoreManagement";
import MainLayout from "./Outlet";
import { Leaderboard } from "../pages/Leaderboard";
import DailyMissions from "../pages/DailyMissions";
import StockSimulator from "../pages/StockSimulator";
import BudgetChallenge from "../pages/BudgetChallenge";
import GamesHub from "../pages/GamesHub";
import WorkingProfessionalLab from "../pages/WorkingProfessionalLab";
import ProtectedRoute from "../components/ProtectedRoute";

const Routerapp = () => (
  <div className="App">
    <Router>
      <Routes>
        {/* Public routes with navbar */}
        <Route element={<MainLayout />}>
          <Route element={<Landing />} path="/" exact />
          <Route element={<Login />} path="/login" exact />
          <Route element={<SignUp />} path="/signup" exact />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} path="/expense" exact />
          <Route element={<ProtectedRoute><ChoreManagement /></ProtectedRoute>} path="/choremanagement" exact />
          <Route element={<ProtectedRoute><Quiz /></ProtectedRoute>} path="/quiz" exact />
          <Route element={<ProtectedRoute><DailyMissions /></ProtectedRoute>} path="/missions" exact />
          <Route element={<ProtectedRoute><GamesHub /></ProtectedRoute>} path="/games" exact />
          <Route element={<ProtectedRoute><WorkingProfessionalLab /></ProtectedRoute>} path="/career-lab" exact />
          <Route element={<ProtectedRoute><StockSimulator /></ProtectedRoute>} path="/games/stocks" exact />
          <Route element={<ProtectedRoute><BudgetChallenge /></ProtectedRoute>} path="/games/budget" exact />
          <Route element={<Leaderboard />} path="/leaderboard" exact />
        </Route>
      </Routes>
    </Router>
  </div>
);

export default Routerapp;
