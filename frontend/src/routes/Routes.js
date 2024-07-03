import React, { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {SignUp,Login,Quiz,ExpensePage,Landing} from "../components/export";
import ChoreManagement from "../pages/ChoreManagement";
import MainLayout from "./Outlet";

const Routerapp = () => (
  <div className="App">
    <Router>
      <Routes>
      <Route element={<MainLayout />}>
      <Route element={<Landing />} path="/" exact />
      <Route element={<Login />} path="/login" exact />
      <Route element={<SignUp />} path="/signup" exact />
      <Route element={<Quiz />} path="/quiz" exact />
      <Route element={<ExpensePage />} path="/expense" exact />
      <Route element={<ChoreManagement />} path="/choremanagement" exact />
      </Route>
      </Routes>
    </Router>
  </div>
);

export default Routerapp;
