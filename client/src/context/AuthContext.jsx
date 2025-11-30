import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../api/firebase";
import { startKeepAlive, stopKeepAlive } from "../services/keepAlive";

const AuthContext = createContext();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Start keep-alive when user is authenticated
            if (currentUser) {
                startKeepAlive();
            } else {
                stopKeepAlive();
            }
        });
        return () => {
            unsubscribe();
            stopKeepAlive();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setError(null);
            return userCredential.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        stopKeepAlive(); // Stop keep-alive on logout
        await signOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
