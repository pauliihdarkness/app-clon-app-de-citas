import { useEffect } from 'react';
import { db } from '../api/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot, updateDoc } from 'firebase/firestore';
import { getUserProfile } from '../api/user';

/**
 * Hook personalizado para escuchar cambios en tiempo real de un chat
 * @param {string} matchId - ID del match/chat
 * @param {object} user - Usuario autenticado
 * @param {function} setOtherUser - Setter para el perfil del otro usuario
 * @param {function} setMessages - Setter para los mensajes
 * @param {function} setLoading - Setter para el estado de carga
 * @returns {function} Función de limpieza
 */
export const useChatSnapshot = (matchId, user, setOtherUser, setMessages, setLoading) => {
    useEffect(() => {
        if (!matchId || !user) return;

        let matchUnsubscribe;
        let messagesUnsubscribe;

        const setupListeners = async () => {
            try {
                // 1. Listener para el documento del match (para obtener info del otro usuario)
                const matchRef = doc(db, 'matches', matchId);

                matchUnsubscribe = onSnapshot(matchRef, async (matchDoc) => {
                    if (matchDoc.exists()) {
                        const matchData = matchDoc.data();
                        const otherUserId = matchData.users?.find(id => id !== user.uid);

                        if (otherUserId) {
                            try {
                                const otherUserProfile = await getUserProfile(otherUserId);
                                setOtherUser(otherUserProfile);
                            } catch (error) {
                                console.error('Error fetching other user profile:', error);
                            }
                        }

                        // Marcar mensajes como leídos
                        const unreadCount = matchData.unreadCount?.[user.uid] || 0;
                        if (unreadCount > 0) {
                            await updateDoc(matchRef, {
                                [`unreadCount.${user.uid}`]: 0
                            });
                        }
                    }
                });

                // 2. Listener para los mensajes en tiempo real (últimos 50)
                const messagesRef = collection(db, 'matches', matchId, 'messages');
                const messagesQuery = query(
                    messagesRef,
                    orderBy('timestamp', 'asc'),
                    limit(50)
                );

                messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                    const messagesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        // Convertir Firestore Timestamp a formato legible
                        time: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
                    }));

                    // Mapear a formato esperado por el componente Chat
                    const formattedMessages = messagesData.map(msg => ({
                        author: msg.senderId,
                        message: msg.text,
                        time: msg.time,
                        read: msg.read
                    }));

                    setMessages(formattedMessages);
                    setLoading(false);
                });

            } catch (error) {
                console.error('Error setting up chat listeners:', error);
                setLoading(false);
            }
        };

        setupListeners();

        // Cleanup: desuscribirse de ambos listeners
        return () => {
            if (matchUnsubscribe) matchUnsubscribe();
            if (messagesUnsubscribe) messagesUnsubscribe();
        };
    }, [matchId, user, setOtherUser, setMessages, setLoading]);
};

export default useChatSnapshot;
