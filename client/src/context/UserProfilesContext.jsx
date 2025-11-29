import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { getUserProfile } from "../api/user";

const UserProfilesContext = createContext();

export const useUserProfiles = () => {
    const context = useContext(UserProfilesContext);
    if (!context) {
        throw new Error("useUserProfiles must be used within UserProfilesProvider");
    }
    return context;
};

const CACHE_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos

export const UserProfilesProvider = ({ children }) => {
    const [profiles, setProfiles] = useState({});
    const cacheTimestamps = useRef({});
    const pendingRequests = useRef({});

    const getProfile = useCallback(async (userId) => {
        if (!userId) return null;

        // Check if profile is in cache and not expired
        const cachedProfile = profiles[userId];
        const cacheTimestamp = cacheTimestamps.current[userId];
        const now = Date.now();

        if (cachedProfile && cacheTimestamp && (now - cacheTimestamp) < CACHE_EXPIRATION_MS) {
            return cachedProfile;
        }

        // Check if there's already a pending request for this userId
        if (pendingRequests.current[userId]) {
            return pendingRequests.current[userId];
        }

        // Create new request
        const requestPromise = getUserProfile(userId)
            .then((profile) => {
                setProfiles(prev => ({
                    ...prev,
                    [userId]: profile
                }));
                cacheTimestamps.current[userId] = Date.now();
                delete pendingRequests.current[userId];
                return profile;
            })
            .catch((error) => {
                console.error(`Error fetching profile for ${userId}:`, error);
                delete pendingRequests.current[userId];
                return null;
            });

        pendingRequests.current[userId] = requestPromise;
        return requestPromise;
    }, [profiles]);

    const clearCache = useCallback(() => {
        setProfiles({});
        cacheTimestamps.current = {};
    }, []);

    const removeProfile = useCallback((userId) => {
        setProfiles(prev => {
            const newProfiles = { ...prev };
            delete newProfiles[userId];
            return newProfiles;
        });
        delete cacheTimestamps.current[userId];
    }, []);

    const value = {
        getProfile,
        clearCache,
        removeProfile,
        profiles
    };

    return (
        <UserProfilesContext.Provider value={value}>
            {children}
        </UserProfilesContext.Provider>
    );
};
