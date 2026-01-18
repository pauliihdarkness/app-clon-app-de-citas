import React, { useState, useEffect } from "react";
import BaseLayout from "../../components/Layout/BaseLayout";
import { useAuth } from "../../context/AuthContext";
import { useFeed } from "../../context/FeedContext";
import { saveLike, savePass } from "../../api/likes";
import UserCard from "../../components/Feed/UserCard";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../../api/firebase";
import { throttle } from "../../utils/throttle";
import SkeletonCard from "../../components/UI/SkeletonCard";
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
  }, [loadBatch]);

  // Listen for new matches
  useEffect(() => {
    if (!user) return;

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
          const createdAt = matchData.createdAt?.toDate();
          if (createdAt && (Date.now() - createdAt.getTime() < 10000)) {
            const _otherUserId = matchData.users.find(id => id !== user.uid);
            setMatchedUser({ name: "Alguien" });
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

  // Preload next user's image
  const nextImage = stack[1] && stack[1].images && stack[1].images[0];

  useEffect(() => {
    if (nextImage) {
      const img = new Image();
      img.src = nextImage;
    }
  }, [stack.length, nextImage]);

  const handleLike = throttle(async () => {
    const currentUser = stack[0];
    if (!currentUser || !user) return;

    console.log(`💖 Calling API to like user: ${currentUser.id}`);

    try {
      popProfile();
      await saveLike(user.uid, currentUser.id);
    } catch (err) {
      console.error("Error saving like:", err);
      // Optionally, add the profile back to the stack on failure
    }
  }, 1000);

  const handlePass = throttle(async () => {
    const currentUser = stack[0];
    if (!currentUser || !user) return;

    try {
      popProfile();
      await savePass(user.uid, currentUser.id);
    } catch (err) {
      console.error("Error saving pass:", err);
    }
  }, 1000);

  const currentUser = stack[0];
  const isFinished = !isInitialLoading && stack.length === 0;

  return (
    <BaseLayout showTabs={true} maxWidth="full" title="Descubre">
      <div className="feed-container">
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
            <SkeletonCard />
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