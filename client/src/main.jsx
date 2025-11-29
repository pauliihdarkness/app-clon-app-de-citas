import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { UserProfilesProvider } from "./context/UserProfilesContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <UserProfilesProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </UserProfilesProvider>
    </AuthProvider>
  </React.StrictMode>
);
