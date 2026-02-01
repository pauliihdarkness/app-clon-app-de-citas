// api/firestore/feed.js
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getProfilesBatch({ pageSize = 15, lastDoc = null, excludeIds = [], userId = null, filters = {} }) {
  // Note: Firestore 'in' operator only supports up to 10 values
  // Since we have 29 gender identities, we can't filter by gender in the query
  // Instead, we'll fetch all active users and let the client handle any filtering if needed
  let q = query(collection(db, "users"), where("active", "==", true));

  // Map simple filters to Firestore where clauses (MVP)
  if (filters.ageMin !== undefined) q = query(q, where("age", ">=", filters.ageMin));
  if (filters.ageMax !== undefined) q = query(q, where("age", "<=", filters.ageMax));
  if (filters.gender && filters.gender !== 'any') q = query(q, where("gender", "==", filters.gender));
  // interests: use array-contains-any (note Firestore limits)
  if (filters.interests && Array.isArray(filters.interests) && filters.interests.length > 0) {
    const slice = filters.interests.slice(0, 10);
    q = query(q, where("interests", "array-contains-any", slice));
  }

  // Default ordering
  q = query(q, orderBy("popularity", "desc"), limit(pageSize));

  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);

  console.debug('getProfilesBatch: fetched batch size=', snap.docs.length, 'pageSize=', pageSize, 'filters=', filters);

  // Filter out user's own profile and any excluded IDs
  let filteredDocs = snap.docs.filter(doc => {
    if (userId && doc.id === userId) return false;
    if (excludeIds.includes(doc.id)) return false;
    return true;
  });

  // Client-side gender filtering: Firestore 'in' operator limited to 10 values
  // If caller provided `filters.genders` (array) we'll filter the fetched batch
  if (filters) {
    const g = filters.genders || (filters.gender ? [filters.gender] : []);
    if (Array.isArray(g) && g.length > 0) {
      filteredDocs = filteredDocs.filter(doc => {
        const d = doc.data();
        return g.includes(d.gender);
      });
    }
  }

  // Proximity filtering (approximate) — requires caller to provide `filters.distance` (km)
  // and `filters.userLocation` with `{ city, state }` (optional).
  // NOTE: precise geospatial queries require storing geo-coordinates or geohashes in the DB.
  if (filters && filters.distance && filters.userLocation) {
    const distanceKm = Number(filters.distance) || 0;
    const userLoc = filters.userLocation || {};
    const userCity = (userLoc.city || '').toLowerCase();
    const userState = (userLoc.state || '').toLowerCase();

    // Simple heuristic:
    // - If distance <= 50 km, prefer same city (strict match)
    // - If distance > 50 and <= 200 km, prefer same state/province
    // - Otherwise, no additional proximity filtering
    let proximityFiltered = filteredDocs;
    if (distanceKm > 0 && distanceKm <= 50 && userCity) {
      proximityFiltered = filteredDocs.filter(doc => {
        const d = doc.data();
        return (d.location?.city || '').toLowerCase() === userCity;
      });
    } else if (distanceKm > 50 && distanceKm <= 200 && userState) {
      proximityFiltered = filteredDocs.filter(doc => {
        const d = doc.data();
        return (d.location?.state || '').toLowerCase() === userState;
      });
    }

    // If proximity filtering removed all results, fall back to unfiltered batch
    console.debug('getProfilesBatch: proximityFiltered count=', proximityFiltered.length, 'original count=', filteredDocs.length);
    if (Array.isArray(proximityFiltered) && proximityFiltered.length > 0) {
      filteredDocs = proximityFiltered;
    } else {
      // keep filteredDocs as-is (no proximity applied) to avoid empty feed
    }
  }

  console.debug('getProfilesBatch: returning docs after filters=', filteredDocs.length);

  // CRITICAL FIX: lastDoc must be the last document of the FETCHED batch, 
  // not the filtered batch, to ensure pagination continues correctly.
  const lastVisible = snap.docs[snap.docs.length - 1];

  return { docs: filteredDocs, lastDoc: lastVisible || null };
}
