import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import CreateProfile from "./pages/CreateProfile";
import ProtectedRoute from "./components/Layout/ProtectedRoute";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/feed" element={
                    <ProtectedRoute>
                        <Feed />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/profile/edit" element={
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                } />
                <Route path="/chat" element={
                    <ProtectedRoute>
                        <Chat />
                    </ProtectedRoute>
                } />
                <Route path="/create-profile" element={
                    <ProtectedRoute>
                        <CreateProfile />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;