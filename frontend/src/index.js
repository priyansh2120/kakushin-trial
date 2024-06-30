import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SignUp from "./components/Signup";
import Login from "./components/Login";
import Route from "./routes/Routes";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Route />
  </React.StrictMode>
);
