import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import EditProfile from "./pages/EditProfile";
import Chat from "./pages/Chat";
import MatchesList from "./pages/MatchesList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import CreateProfile from "./pages/CreateProfile";
import Settings from "./pages/Settings";
import AccountInfo from "./pages/AccountInfo";
import TurnstileTest from "./pages/TurnstileTest";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import SplashScreen from "./components/Layout/SplashScreen";
import InstallPrompt from "./components/PWA/InstallPrompt";
import { FeedProvider } from "./context/FeedContext";
import { useAuth } from "./context/AuthContext";

// Wrapper to provide userId to FeedProvider
const FeedWithProvider = () => {
    const { user } = useAuth();
    return (
        <FeedProvider
            initialFilters={{ genders: ["female", "male", "other"] }}
            userId={user?.uid}
        >
            <Feed />
        </FeedProvider>
    );
};

const AppRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <Router>
            <InstallPrompt />
            <Routes>
                <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/feed" element={
                    <ProtectedRoute>
                        <FeedWithProvider />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/user/:userId" element={
                    <ProtectedRoute>
                        <PublicProfile />
                    </ProtectedRoute>
                } />
                <Route path="/profile/edit" element={
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                } />
                <Route path="/chat" element={
                    <ProtectedRoute>
                        <MatchesList />
                    </ProtectedRoute>
                } />
                <Route path="/chat/:matchId" element={
                    <ProtectedRoute>
                        <Chat />
                    </ProtectedRoute>
                } />
                <Route path="/create-profile" element={
                    <ProtectedRoute>
                        <CreateProfile />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
                <Route path="/account-info" element={
                    <ProtectedRoute>
                        <AccountInfo />
                    </ProtectedRoute>
                } />
                <Route path="/test-turnstile" element={<TurnstileTest />} />

                {/* Legal Pages - Public Access */}
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;