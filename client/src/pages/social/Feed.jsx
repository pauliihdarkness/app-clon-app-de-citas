import React, { useState, useEffect, useRef } from "react";
import BaseLayout from "../../components/Layout/BaseLayout";
import { useAuth } from "../../context/AuthContext";
import { useFeed } from "../../context/FeedContext";
import { saveLike, savePass } from "../../api/likes";
import UserCard from "../../components/Feed/UserCard";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../api/firebase";
import { registerListener, unregisterListener } from "../../utils/listenerDebug";
import { throttle } from "../../utils/throttle";
import SkeletonCard from "../../components/UI/SkeletonCard";
import "./Feed.css";

const Feed = () => {
  const { user } = useAuth();
  const { stack, loadBatch, popProfile } = useFeed();
  useEffect(() => {
    console.debug('Feed: stack length=', stack.length);
  }, [stack.length]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadBatch().finally(() => setIsInitialLoading(false));
  }, [loadBatch]);

  

  // Poll for new matches instead of real-time listener to avoid Firestore Listen streams from Feed
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;

    let lastMatchId = null;
    let stopped = false;

    const q = query(
      collection(db, "matches"),
      where("users", "array-contains", uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const fetchLatest = async () => {
      try {
        const snapshot = await getDocs(q);
        if (stopped) return;
        const doc = snapshot.docs[0];
        if (!doc) return;
        const matchData = doc.data();
        const matchId = doc.id;
        const createdAt = matchData.createdAt?.toDate?.getTime?.() || (matchData.createdAt ? new Date(matchData.createdAt).getTime() : null);

        if (matchId && createdAt && Date.now() - createdAt < 10000 && matchId !== lastMatchId) {
          lastMatchId = matchId;
          setMatchedUser({ name: "Alguien" });
          setShowMatchNotification(true);
          setTimeout(() => {
            setShowMatchNotification(false);
            setMatchedUser(null);
          }, 3000);
        }
      } catch (err) {
        console.error('Feed: error fetching latest match', err);
      }
    };

    // Initial fetch
    fetchLatest();
    const iv = setInterval(fetchLatest, 20000);

    return () => {
      stopped = true;
      clearInterval(iv);
    };
  }, [user?.uid]);

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