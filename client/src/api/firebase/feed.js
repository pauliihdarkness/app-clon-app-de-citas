// api/firestore/feed.js
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getProfilesBatch({ filters, pageSize = 15, lastDoc = null, excludeIds = [] }) {
  let q = query(
    collection(db, "users"),
    where("active", "==", true),
    where("gender", "in", filters.genders),
    // agregar más where según filtros (edad, orientation...)
    orderBy("popularity", "desc"),
    limit(pageSize)
  );

  if (lastDoc) q = query(q, startAfter(lastDoc));

  // Nota: 'not-in' / 'array-contains' tienen limitaciones; para excludeIds usa client filter si es poco.
  const snap = await getDocs(q);
  return { docs: snap.docs, lastDoc: snap.docs[snap.docs.length - 1] || null };
}
