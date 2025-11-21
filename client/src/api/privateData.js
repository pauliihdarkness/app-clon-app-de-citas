import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Crear o actualizar datos privados del usuario
 * Estos datos NO son públicos y solo el usuario autenticado puede acceder
 */
export const createPrivateData = async (userId, privateData) => {
    await setDoc(doc(db, "users", userId, "private", "auth"), privateData, { merge: true });
};

/**
 * Obtener datos privados del usuario
 * Solo debe ser llamado para el usuario autenticado
 */
export const getPrivateData = async (userId) => {
    const docSnap = await getDoc(doc(db, "users", userId, "private", "auth"));
    return docSnap.exists() ? docSnap.data() : null;
};

/**
 * Actualizar datos privados del usuario
 */
export const updatePrivateData = async (userId, privateData) => {
    await setDoc(doc(db, "users", userId, "private", "auth"), privateData, { merge: true });
};
