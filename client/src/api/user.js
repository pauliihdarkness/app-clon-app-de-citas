import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// Crear perfil
export const createUserProfile = async (userId, profileData) => {
  await setDoc(doc(db, "users", userId), profileData, { merge: true });
};

// Leer perfil
export const getUserProfile = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists() ? docSnap.data() : null;
};

// Actualizar perfil
export const updateUserProfile = async (userId, profileData) => {
  await updateDoc(doc(db, "users", userId), profileData);
};

// Eliminar perfil
export const deleteUserProfile = async (userId) => {
  await deleteDoc(doc(db, "users", userId));
};

// Crear datos privados del usuario (email, photoURL, authMethod)
export const createPrivateUserData = async (userId, privateData) => {
  await setDoc(doc(db, "users", userId, "private", "data"), privateData, { merge: true });
};

// Leer datos privados del usuario
export const getPrivateUserData = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId, "private", "data"));
  return docSnap.exists() ? docSnap.data() : null;
};