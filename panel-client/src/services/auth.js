import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

// Configurar el provider de Google
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

/**
 * Iniciar sesión con Google
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

/**
 * Cerrar sesión
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
};

/**
 * Observar cambios en el estado de autenticación
 * @param {Function} callback - Función que se ejecuta cuando cambia el estado
 * @returns {Function} - Función para cancelar la suscripción
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Obtener el usuario actual
 * @returns {User|null}
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};
