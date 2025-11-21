import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../api/firebase";

// Hook para consultar una colección con filtros opcionales
const useFirestoreQuery = (collectionName, filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, collectionName);
    if (filters.length > 0) {
      q = query(q, ...filters.map(f => where(f.field, f.op, f.value)));
    }
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters)]);

  return { data, loading, error };
};

export default useFirestoreQuery;