import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./context/AuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
