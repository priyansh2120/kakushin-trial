import React, { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {SignUp,Login,Quiz } from "../components/export";

const Routerapp = () => (
  <div className="App">
    <Router>
      <Routes>
      <Route element={<Login />} path="/login" exact />
      <Route element={<SignUp />} path="/signup" exact />
      <Route element={<Quiz />} path="/quiz" exact />        
      </Routes>
    </Router>
  </div>
);

export default Routerapp;