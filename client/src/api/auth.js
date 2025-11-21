// Funciones de login/registro
// Aquí puedes implementar las funciones relacionadas con la autenticación.

//login y register con firebase auth con google
import { getAuth, signInWithPopup, GoogleAuthProvider, logout } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
};

//register y login con email y password
export const registerWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
};

export const loginWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};


export const logout = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
};