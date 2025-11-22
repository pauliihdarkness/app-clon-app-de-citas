import React, { useState, useEffect } from "react";
import BaseLayout from "../components/Layout/BaseLayout";
import { useAuth } from "../context/AuthContext";
import { getFeedUsers } from "../api/user";
import { saveLike, savePass } from "../api/likes";
import UserCard from "../components/Feed/UserCard";
import "./Feed.css";

const Feed = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user) {
        try {
          setLoading(true);
          const feedUsers = await getFeedUsers(user.uid);
          setUsers(feedUsers);
        } catch (err) {
          console.error("Error fetching feed:", err);
          setError("Error al cargar usuarios. Intenta de nuevo.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [user]);

  const handleLike = async () => {
    const currentUser = users[currentIndex];
    if (!currentUser || !user) return;

    try {
      const result = await saveLike(user.uid, currentUser.uid);

      if (result.isMatch) {
        // Mostrar notificación de match
        setMatchedUser(currentUser);
        setShowMatchNotification(true);

        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
          setShowMatchNotification(false);
          setMatchedUser(null);
        }, 3000);
      }

      nextUser();
    } catch (err) {
      console.error("Error saving like:", err);
    }
  };

  const handlePass = async () => {
    const currentUser = users[currentIndex];
    if (!currentUser || !user) return;

    try {
      await savePass(user.uid, currentUser.uid);
      nextUser();
    } catch (err) {
      console.error("Error saving pass:", err);
    }
  };

  const nextUser = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const currentUser = users[currentIndex];
  const isFinished = !loading && currentIndex >= users.length;

  return (
    <BaseLayout showTabs={true} maxWidth="mobile" title="Descubre">
      <div className="feed-container">
        {/* Match Notification */}
        {showMatchNotification && matchedUser && (
          <div className="match-notification">
            <div className="match-content">
              <div className="match-icon">🎉</div>
              <h3>¡Es un Match!</h3>
              <p>Tú y {matchedUser.name} se gustaron mutuamente</p>
            </div>
          </div>
        )}

        <div className="feed-content">
          {loading ? (
            <div className="spinner"></div>
          ) : error ? (
            <div className="feed-error">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="feed-retry-btn"
              >
                Reintentar
              </button>
            </div>
          ) : isFinished ? (
            <div className="feed-finished">
              <div className="finished-icon">🎉</div>
              <h3 className="finished-title">¡Estás al día!</h3>
              <p className="finished-text">
                Vuelve más tarde para ver nuevos perfiles.
              </p>
            </div>
          ) : (
            <UserCard
              user={currentUser}
              onLike={handleLike}
              onPass={handlePass}
            />
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Feed;