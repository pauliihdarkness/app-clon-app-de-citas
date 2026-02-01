import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { registerListener, unregisterListener } from "../utils/listenerDebug";
import { db } from "../api/firebase";

// Hook para consultar una colección con filtros opcionales
const useFirestoreQuery = (collectionName, filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a stable key for filters to avoid resubscribing when parent passes
  // a freshly created (but equal) array on each render.
  const filtersKey = useMemo(() => JSON.stringify(filters || []), [filters]);

  const filtersConstraints = useMemo(() => {
    try {
      return (filters || []).map(f => where(f.field, f.op, f.value));
    } catch (e) {
      // If filters are malformed, fall back to no constraints
      console.warn('useFirestoreQuery: invalid filters, ignoring', e);
      return [];
    }
  }, [filtersKey]);

  useEffect(() => {
    let q = collection(db, collectionName);
    if (filtersConstraints.length > 0) {
      q = query(q, ...filtersConstraints);
    }

    console.debug('useFirestoreQuery: subscribing', collectionName, filtersKey);
    let listenerId;
    try {
      listenerId = registerListener(`useFirestoreQuery:${collectionName}:${filtersKey}`);
    } catch (e) {
      console.debug('useFirestoreQuery: registerListener failed', e);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
        console.debug('useFirestoreQuery: unsubscribed', collectionName, filtersKey);
        if (listenerId) {
          try { unregisterListener(listenerId); } catch (e) { console.debug('useFirestoreQuery: unregisterListener failed', e); }
        }
      } catch (e) {
        console.warn('useFirestoreQuery: error during unsubscribe', e);
      }
    };
  }, [collectionName, filtersKey]);

  return { data, loading, error };
};

window.__LISTENER_DEBUG.getActiveListeners()

export default useFirestoreQuery;