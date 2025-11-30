import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, MessageCircle, User } from "lucide-react";
import "./TabNavigation.css";

const TabNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Feed', path: '/feed', icon: <Flame size={24} />, label: 'Feed' },
        { name: 'Chat', path: '/chat', icon: <MessageCircle size={24} />, label: 'Chat' },
        { name: 'Profile', path: '/profile', icon: <User size={24} />, label: 'Perfil' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="tab-navigation">
            {tabs.map((tab) => (
                <button
                    key={tab.name}
                    className={`tab-item ${isActive(tab.path) ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                    aria-label={tab.label}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default TabNavigation;
