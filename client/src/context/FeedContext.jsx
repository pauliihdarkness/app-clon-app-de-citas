/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef } from "react";
import { getProfilesBatch } from "../api/firebase/feed";
import { useUserProfiles } from "./UserProfilesContext";

const FeedContext = createContext();

export function FeedProvider({ children, initialFilters, pageSize = 15, userId }) {
  const [stack, setStack] = useState([]); // perfiles listos para mostrar
  const [interactedUserIds, setInteractedUserIds] = useState(new Set());
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);
  const filtersRef = useRef(initialFilters);
  const interactedLoadedRef = useRef(false);
  const { getProfile } = useUserProfiles();

  // Cargar interacciones previas al iniciar
  React.useEffect(() => {
    if (!userId) return;

    import("../api/likes").then(({ getInteractedUserIds }) => {
      getInteractedUserIds(userId).then(ids => {
        const idsSet = new Set(ids);
        setInteractedUserIds(idsSet);
        interactedLoadedRef.current = true;

        // CRITICAL: Filter out any users already in the stack that we just discovered are interacted
        setStack(prev => prev.filter(u => !idsSet.has(u.id)));

        // NOTE: not calling `loadBatch()` here to avoid referencing `stack` from this effect.
        // The prefetch effect below (`stack.length` watcher) will trigger loading when appropriate.
      });
    });
  }, [userId]);

  async function loadBatch({ reset = false } = {}) {
    if (loadingRef.current) return;
    // Esperar a que carguen las interacciones si es la primera carga
    if (!interactedLoadedRef.current && userId) {
      // Podríamos esperar o simplemente continuar y filtrar después, 
      // pero mejor esperar un poco o dejar que el efecto de carga lo maneje
      // Por simplicidad, si no ha cargado, retornamos y dejamos que el effect de interacted lo dispare
      // Ojo: esto podría causar un deadlock si la carga de interacciones falla.
      // Asumiremos que es rápido.
    }

    loadingRef.current = true;
    try {
      if (reset) {
        lastDocRef.current = null;
        setStack([]);
      }

      const currentStackIds = stack.map(u => u.id);
      const excludeIds = [...interactedUserIds, ...currentStackIds];

      const { docs, lastDoc } = await getProfilesBatch({
        filters: filtersRef.current,
        pageSize,
        lastDoc: lastDocRef.current,
        userId, // CRITICAL: Pass userId to filter out own profile
        excludeIds
      });

      const profiles = docs.map(d => ({ id: d.id, ...d.data() }));

      // Cache profiles using UserProfilesContext
      profiles.forEach(p => {
        getProfile(p.id); // This will cache the profile
      });

      // Filtrado adicional de seguridad por si acaso
      const newProfiles = profiles.filter(p => !interactedUserIds.has(p.id));

      setStack(prev => {
        // Evitar duplicados que ya estén en el stack
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProfiles = newProfiles.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewProfiles];
      });

      lastDocRef.current = lastDoc;

      // Si no obtuvimos perfiles pero hay más en la DB (lastDoc no es null), cargar más automáticamente
      if (newProfiles.length === 0 && lastDoc) {
        loadingRef.current = false; // Reset loading to allow recursive call
        return loadBatch(); // Recursive call
      }

    } finally {
      loadingRef.current = false;
    }
  }

  // keep a stable ref to loadBatch so effects can call it without being required
  // to include the function in dependency arrays.
  const loadBatchRef = useRef();
  loadBatchRef.current = loadBatch;

  function popProfile() {
    setStack(prev => prev.slice(1));
  }

  function markAsInteracted(targetUserId) {
    setInteractedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.add(targetUserId);
      return newSet;
    });
  }

  // prefetch trigger: call loadBatch when stack.length < 5
  React.useEffect(() => {
    if (stack.length < 5 && interactedLoadedRef.current) {
      loadBatchRef.current && loadBatchRef.current();
    }
  }, [stack.length]);

  return (
    <FeedContext.Provider value={{ stack, loadBatch, popProfile, markAsInteracted, reset: () => loadBatch({ reset: true }) }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
