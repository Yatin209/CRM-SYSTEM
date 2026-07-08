import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CrmDataProvider } from "./context/CrmDataContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// The "Follow-ups: 10" metric helps you see your total workload by combining:

// All unfinished tasks (regardless of due date)
// Plus leads that need attention in the next 3 days
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CrmDataProvider>
          <App />
          <ToastContainer position="top-right" autoClose={2600} newestOnTop theme="colored" />
        </CrmDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
