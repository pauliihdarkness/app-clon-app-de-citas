/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef } from "react";
import { getProfilesBatch } from "../api/firebase/feed";
import { useUserProfiles } from "./UserProfilesContext";

const FeedContext = createContext();

// Función para cargar filtros desde localStorage
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem('feedFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.debug('loadFiltersFromStorage: loaded', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
  }
  return null;
};

// Función para guardar filtros en localStorage
const saveFiltersToStorage = (filters) => {
  try {
    localStorage.setItem('feedFilters', JSON.stringify(filters));
    console.debug('saveFiltersToStorage: saved', filters);
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
};

export function FeedProvider({ children, initialFilters, pageSize = 15, userId }) {
  const [stack, setStack] = useState([]); // perfiles listos para mostrar
  const [interactedUserIds, setInteractedUserIds] = useState(new Set());

  // Refs to access latest state in loadBatch without adding to dependencies
  const stackRef = useRef(stack);
  const interactedRef = useRef(interactedUserIds);
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);

  // Sync refs with state
  React.useEffect(() => {
    stackRef.current = stack;
  }, [stack]);

  React.useEffect(() => {
    interactedRef.current = interactedUserIds;
  }, [interactedUserIds]);

  // Cargar filtros guardados o usar initialFilters
  const savedFilters = loadFiltersFromStorage();
  const defaultFilters = {};
  const mergedInitial = {
    ...defaultFilters,
    ...(savedFilters || {}),
    ...(initialFilters || {})
  };

  const filtersRef = useRef(mergedInitial);
  const [filters, setFiltersState] = useState(mergedInitial);
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

  /* 
  /*
   * Fix for excessive recursion:
   * Added recursionDepth parameter to limit retries.
   * Added delay to prevent browser freeze.
   */
  const MAX_RECURSION_DEPTH = 5;

  const loadBatch = React.useCallback(async ({ reset = false, recursionDepth = 0 } = {}) => {
    if (loadingRef.current) return;

    // Safety check: stop if recursion too deep
    if (recursionDepth > MAX_RECURSION_DEPTH) {
      console.warn('FeedContext: Max recursion depth reached. Stopping to prevent infinite loop.');
      loadingRef.current = false;
      return;
    }

    // Esperar a que carguen las interacciones si es la primera carga
    if (!interactedLoadedRef.current && userId) {
      // ... existing logic ...
    }

    loadingRef.current = true;
    try {
      if (reset) {
        lastDocRef.current = null;
        setStack([]);
        stackRef.current = []; // Sync ref immediately for this execution
      }

      const currentStackIds = stackRef.current.map(u => u.id);
      const excludeIds = [...interactedRef.current, ...currentStackIds];

      // Inject current user's public location into filters for approximate proximity filtering
      let filtersToPass = { ...(filtersRef.current || {}) };
      try {
        if (userId) {
          const profile = await getProfile(userId);
          console.debug('FeedContext.loadBatch: current user profile', profile);
          if (profile?.location) {
            filtersToPass = { ...filtersToPass, userLocation: profile.location };
          }
        }
      } catch (err) {
        // ignore errors getting profile; proceed without location
        console.warn('Could not load current user profile for proximity filtering', err);
      }

      console.debug(`FeedContext.loadBatch: depth=${recursionDepth}, filters=`, filtersToPass);

      const { docs, lastDoc } = await getProfilesBatch({
        filters: filtersToPass,
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
      const newProfiles = profiles.filter(p => !interactedRef.current.has(p.id));

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

        // Add specific delay to prevent tight loop
        console.debug(`FeedContext: No profiles in this batch, retrying... (Attempt ${recursionDepth + 1}/${MAX_RECURSION_DEPTH})`);
        setTimeout(() => {
          loadBatch({ reset: false, recursionDepth: recursionDepth + 1 });
        }, 500);

        return;
      }

    } finally {
      loadingRef.current = false;
    }
  }, [userId, pageSize, getProfile]); // Removed stack and interactedUserIds from deps

  function setFilters(newFilters) {
    const filtersToSave = newFilters || {};
    filtersRef.current = filtersToSave;
    setFiltersState(filtersToSave);
    // Guardar en localStorage
    saveFiltersToStorage(filtersToSave);
  }

  function applyFilters(newFilters) {
    // Apply and reset pagination
    console.debug('FeedContext.applyFilters called with', newFilters);
    setFilters(newFilters);
    // Reset stack and lastDoc then load first batch
    return loadBatch({ reset: true });
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

  const value = React.useMemo(() => ({
    stack,
    loadBatch,
    popProfile,
    markAsInteracted,
    reset: () => loadBatch({ reset: true }),
    filters,
    setFilters,
    applyFilters
  }), [stack, loadBatch, filters]);

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
