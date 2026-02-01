import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { UserProfilesProvider } from "./context/UserProfilesContext.jsx";
import "./assets/styles/global.css";

// Service Worker toggle: set to `true` to enable, `false` to disable
const ENABLE_SW = false;

if ('serviceWorker' in navigator) {
  if (ENABLE_SW) {
    // Register Service Worker for PWA
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  } else {
    // Unregister any active service workers to fully disable SW
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => {
          regs.forEach((reg) => {
            reg.unregister().then((ok) => console.log('SW unregistered:', reg.scope, ok)).catch(e => console.warn('SW unregister failed', e));
          });
        })
        .catch((err) => console.warn('Error getting SW registrations', err));
    });
  }
}

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

// Global error handlers to capture uncaught exceptions and promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      console.error('Global error caught:', event.message, event.filename, event.lineno, event.colno, event.error);
    } catch (e) {
      console.error('Error logging global error', e);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      console.error('Unhandled promise rejection:', event.reason);
    } catch (e) {
      console.error('Error logging unhandled rejection', e);
    }
  });
}
