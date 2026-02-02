import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import SplashScreen from "./components/Layout/SplashScreen";
import InstallPrompt from "./components/PWA/InstallPrompt";
import { FeedProvider, useFeed } from "./context/FeedContext";
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import FCMInitializer from "./components/FCM/FCMInitializer";

// Lazy load pages - Updated paths
const Home = lazy(() => import("./pages/public/Home"));
const Feed = lazy(() => import("./pages/social/Feed"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const PublicProfile = lazy(() => import("./pages/profile/PublicProfile"));
const EditProfile = lazy(() => import("./pages/profile/EditProfile"));
const Chat = lazy(() => import("./pages/social/Chat"));
const MatchesList = lazy(() => import("./pages/social/MatchesList"));
const NotificationsHistory = lazy(() => import("./pages/social/NotificationsHistory"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const CreateProfile = lazy(() => import("./pages/profile/CreateProfile"));
const Settings = lazy(() => import("./pages/profile/Settings"));
const PrivacySettings = lazy(() => import("./pages/profile/PrivacySettings"));
const NotificationsSettings = lazy(() => import("./pages/profile/NotificationsSettings"));
const AppearanceSettings = lazy(() => import("./pages/profile/AppearanceSettings"));
const AccountInfo = lazy(() => import("./pages/profile/AccountInfo"));
const TurnstileTest = lazy(() => import("./pages/dev/TurnstileTest"));
const TermsOfService = lazy(() => import("./pages/public/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/public/legal/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/public/legal/CookiePolicy"));
const CommunityGuidelines = lazy(() => import("./pages/public/legal/CommunityGuidelines"));
const FAQ = lazy(() => import("./pages/public/legal/FAQ"));
const Contact = lazy(() => import("./pages/public/legal/Contact"));
const FeedFilters = lazy(() => import("./pages/social/FeedFilters"));
const IdentityVerificationPage = lazy(() => import("./pages/profile/IdentityVerificationPage"));

// Wrapper to provide userId to FeedProvider
const FeedWithProvider = () => {
    const { user } = useAuth();
    
    // Cargar filtros guardados desde localStorage
    const getSavedFilters = () => {
        try {
            const saved = localStorage.getItem('feedFilters');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading filters from localStorage:', error);
        }
        return {};
    };
    
    function ApplyPendingFilters() {
        const { applyFilters } = useFeed();
        React.useEffect(() => {
            try {
                const p = localStorage.getItem('pendingFilters');
                if (p) {
                    const parsed = JSON.parse(p);
                    applyFilters(parsed);
                    localStorage.removeItem('pendingFilters');
                }
            } catch {
                // ignore
            }
        }, [applyFilters]);
        return null;
    }

    return (
        <FeedProvider
            initialFilters={getSavedFilters()}
            userId={user?.uid}
        >
            <ApplyPendingFilters />
            <Feed />
        </FeedProvider>
    );
};

const FeedFiltersWithProvider = () => {
    const { user } = useAuth();
    
    // Cargar filtros guardados desde localStorage
    const getSavedFilters = () => {
        try {
            const saved = localStorage.getItem('feedFilters');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading filters from localStorage:', error);
        }
        return {};
    };
    
    return (
        <FeedProvider
            initialFilters={getSavedFilters()}
            userId={user?.uid}
        >
            <FeedFilters />
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
            <FCMInitializer />
            <NotificationProvider>
                <Suspense fallback={<SplashScreen />}>
                    <Routes>
                        <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/filters" element={
                            <ProtectedRoute>
                                <FeedFiltersWithProvider />
                            </ProtectedRoute>
                        } />
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
                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <NotificationsHistory />
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
                        <Route path="/settings/privacy" element={
                            <ProtectedRoute>
                                <PrivacySettings />
                            </ProtectedRoute>
                        } />
                        <Route path="/settings/notifications" element={
                            <ProtectedRoute>
                                <NotificationsSettings />
                            </ProtectedRoute>
                        } />
                        <Route path="/settings/appearance" element={
                            <ProtectedRoute>
                                <AppearanceSettings />
                            </ProtectedRoute>
                        } />
                        <Route path="/account-info" element={
                            <ProtectedRoute>
                                <AccountInfo />
                            </ProtectedRoute>
                        } />
                        <Route path="/verify-identity" element={
                            <ProtectedRoute>
                                <IdentityVerificationPage />
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
                </Suspense>
            </NotificationProvider>
        </Router>
    );
};

export default AppRouter;