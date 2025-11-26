// api/firestore/feed.js
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getProfilesBatch({ filters, pageSize = 15, lastDoc = null, excludeIds = [], userId = null }) {
  // Note: Firestore 'in' operator only supports up to 10 values
  // Since we have 29 gender identities, we can't filter by gender in the query
  // Instead, we'll fetch all active users and let the client handle any filtering if needed
  let q = query(
    collection(db, "users"),
    where("active", "==", true),
    // agregar más where según filtros (edad, orientation...)
    orderBy("popularity", "desc"),
    limit(pageSize)
  );

  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);

  // Filter out user's own profile and any excluded IDs
  const filteredDocs = snap.docs.filter(doc => {
    // CRITICAL: Never show user's own profile
    if (userId && doc.id === userId) {
      return false;
    }
    // Filter out already seen/interacted profiles
    if (excludeIds.includes(doc.id)) {
      return false;
    }
    return true;
  });

  // CRITICAL FIX: lastDoc must be the last document of the FETCHED batch, 
  // not the filtered batch, to ensure pagination continues correctly.
  const lastVisible = snap.docs[snap.docs.length - 1];

  return { docs: filteredDocs, lastDoc: lastVisible || null };
}
