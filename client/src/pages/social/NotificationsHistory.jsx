import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import BaseLayout from '../../components/Layout/BaseLayout';
import { Bell, MessageCircle, Heart, Info, Check, Trash2 } from 'lucide-react';
import '../../assets/styles/NotificationsHistory.css';

const NotificationsHistory = () => {
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);

        // Navigate based on type
        if (notification.type === 'match' && notification.data?.matchId) {
            navigate(`/chat/${notification.data.matchId}`);
        } else if (notification.type === 'message' && notification.data?.chatId) {
            navigate(`/chat/${notification.data.chatId}`);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'match': return <Heart size={20} className="icon-match" />;
            case 'message': return <MessageCircle size={20} className="icon-message" />;
            default: return <Info size={20} className="icon-system" />;
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        // Less than 24 hours
        if (diff < 1000 * 60 * 60 * 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Less than 7 days
        if (diff < 1000 * 60 * 60 * 24 * 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString();
    };

    return (
        <BaseLayout title="Notificaciones" showTabs={true} maxWidth="md">
            <div className="notifications-container">
                <div className="notifications-header">
                    <h3>Recientes</h3>
                    {notifications.length > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            <Check size={16} /> Marcar todo leído
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="notifications-loading">
                        <div className="spinner"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notifications-empty">
                        <Bell size={48} className="empty-icon" />
                        <p>No tienes notificaciones nuevas</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon-wrapper">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <h4 className="notification-title">{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{formatDate(notification.timestamp)}</span>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BaseLayout>
    );
};

export default NotificationsHistory;
