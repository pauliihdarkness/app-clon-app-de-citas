// hooks/useFeed.js
import { useEffect, useCallback } from "react";
import { useFeed } from "../context/FeedContext";
import { sendLike } from "../api/firestore/likes";
import { useAuth } from "../context/AuthContext";

export function useFeed() {
    const { user } = useAuth(); // usuario autenticado (viene del AuthContext)

    const {
        stack,
        loadBatch,
        popProfile,
        reset
    } = useFeed();

    // Perfil actual (primer item del stack)
    const currentProfile = stack.length > 0 ? stack[0] : null;

    // Cargar primer batch al montar
    useEffect(() => {
        if (stack.length === 0) {
            loadBatch();
        }
    }, []);

    /**
     * Acción LIKE
     * - Enviar like a Firestore
     * - Hace POP del perfil (UI instantánea)
     * - Prefetch automático viene del FeedContext
     */
    const like = useCallback(async () => {
        if (!currentProfile) return;

        await sendLike(user.uid, currentProfile.id);
        popProfile();
    }, [currentProfile, user]);

    /**
     * Acción PASS
     * - No guarda nada en Firestore (más liviano)
     * - Sólo quita el perfil actual
     */
    const pass = useCallback(() => {
        if (!currentProfile) return;
        popProfile();
    }, [currentProfile]);

    /**
     * Reiniciar feed (cuando cambian filtros, por ejemplo)
     */
    const reload = useCallback(() => {
        reset();
    }, []);

    return {
        currentProfile,
        queueCount: stack.length,
        isEmpty: stack.length === 0,
        like,
        pass,
        reload,
        loading: !currentProfile,
    };
}
