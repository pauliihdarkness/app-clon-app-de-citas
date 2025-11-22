import React, { useState, useEffect } from "react";
import BaseLayout from "../components/Layout/BaseLayout";
import { useAuth } from "../context/AuthContext";
import { useFeed } from "../context/FeedContext";
import { saveLike, savePass } from "../api/likes";
import UserCard from "../components/Feed/UserCard";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../api/firebase"; // Ensure this path is correct
import "./Feed.css";

const Feed = () => {
  const { user } = useAuth();
  const { stack, loadBatch, popProfile } = useFeed();
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadBatch().finally(() => setIsInitialLoading(false));
  }, []);

  // Listen for new matches
  useEffect(() => {
    if (!user) return;

    // Listen for matches where current user is in the 'users' array
    // Note: This requires a composite index or simple array-contains query
    const q = query(
      collection(db, "matches"),
      where("users", "array-contains", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const matchData = change.doc.data();
          // Check if this match is recent (created in the last 10 seconds) to avoid showing old matches
          const createdAt = matchData.createdAt?.toDate();
          if (createdAt && (Date.now() - createdAt.getTime() < 10000)) {
            // Find the OTHER user in the match to display their name
            const otherUserId = matchData.users.find(id => id !== user.uid);
            // For now, we might not have the other user's name immediately available if not in stack
            // We can use a generic message or try to find it in the stack/cache
            // Simple version:
            setMatchedUser({ name: "Alguien" }); // You might want to fetch the user details here
            setShowMatchNotification(true);
            setTimeout(() => {
              setShowMatchNotification(false);
              setMatchedUser(null);
            }, 3000);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleLike = async () => {
    const currentUser = stack[0];
    if (!currentUser || !user) return;

    try {
      // Optimistic update: remove user immediately
      popProfile();
      await saveLike(user.uid, currentUser.id);
    } catch (err) {
      console.error("Error saving like:", err);
    }
  };

  const handlePass = async () => {
    const currentUser = stack[0];
    if (!currentUser || !user) return;

    try {
      popProfile();
      await savePass(user.uid, currentUser.id);
    } catch (err) {
      console.error("Error saving pass:", err);
    }
  };

  const currentUser = stack[0];
  const isFinished = !isInitialLoading && stack.length === 0;

  return (
    <BaseLayout showTabs={true} maxWidth="mobile" title="Descubre">
      <div className="feed-container">
        {/* Match Notification */}
        {showMatchNotification && matchedUser && (
          <div className="match-notification">
            <div className="match-content">
              <div className="match-icon">🎉</div>
              <h3>¡Es un Match!</h3>
              <p>¡Has hecho match!</p>
            </div>
          </div>
        )}

        <div className="feed-content">
          {isInitialLoading ? (
            <div className="spinner"></div>
          ) : isFinished ? (
            <div className="feed-finished">
              <div className="finished-icon">🎉</div>
              <h3 className="finished-title">¡Estás al día!</h3>
              <p className="finished-text">
                Vuelve más tarde para ver nuevos perfiles.
              </p>
              <button onClick={() => loadBatch({ reset: true })} className="feed-retry-btn">
                Recargar
              </button>
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