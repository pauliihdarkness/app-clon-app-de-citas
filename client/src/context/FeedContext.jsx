import React, { createContext, useContext, useState, useRef } from "react";
import { getProfilesBatch } from "../api/firebase/feed";
import { setUserCached } from "./UserCache";

const FeedContext = createContext();

export function FeedProvider({ children, initialFilters, pageSize = 15, userId }) {
  const [stack, setStack] = useState([]); // perfiles listos para mostrar
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);
  const filtersRef = useRef(initialFilters);

  async function loadBatch({ reset = false } = {}) {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      if (reset) {
        lastDocRef.current = null;
        setStack([]);
      }
      const { docs, lastDoc } = await getProfilesBatch({
        filters: filtersRef.current,
        pageSize,
        lastDoc: lastDocRef.current,
        userId // CRITICAL: Pass userId to filter out own profile
      });

      const profiles = docs.map(d => ({ id: d.id, ...d.data() }));

      // cache individual users
      await Promise.all(profiles.map(p => setUserCached(p.id, p)));
      setStack(prev => [...prev, ...profiles]);
      lastDocRef.current = lastDoc;
    } finally {
      loadingRef.current = false;
    }
  }

  function popProfile() {
    setStack(prev => prev.slice(1));
  }

  // prefetch trigger: call loadBatch when stack.length < 5
  React.useEffect(() => {
    if (stack.length < 5) loadBatch();
  }, [stack.length]);

  return (
    <FeedContext.Provider value={{ stack, loadBatch, popProfile, reset: () => loadBatch({ reset: true }) }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
