import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { calculateAge } from "../utils/dateUtils";

// Crear perfil
export const createUserProfile = async (userId, profileData) => {
  await setDoc(doc(db, "users", userId), profileData, { merge: true });
};

// Leer perfil
export const getUserProfile = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId));
  if (!docSnap.exists()) return null;

  const userData = docSnap.data();

  // Get birth date from private collection to calculate age
  const privateData = await getPrivateUserData(userId);
  if (privateData?.birthDate) {
    userData.age = calculateAge(privateData.birthDate);
  }

  return userData;
};

// Actualizar perfil
export const updateUserProfile = async (userId, profileData) => {
  // Remove age from profileData if present (it should be calculated)
  const { age, ...dataToUpdate } = profileData;

  // Get birth date to recalculate age
  const privateData = await getPrivateUserData(userId);
  if (privateData?.birthDate) {
    dataToUpdate.age = calculateAge(privateData.birthDate);
  }

  await updateDoc(doc(db, "users", userId), dataToUpdate);
};

// Eliminar perfil
export const deleteUserProfile = async (userId) => {
  await deleteDoc(doc(db, "users", userId));
};

// Crear datos privados del usuario (email, birthDate, etc.)
export const createPrivateUserData = async (userId, privateData) => {
  await setDoc(doc(db, "users", userId, "private", "data"), privateData, { merge: true });
};

// Leer datos privados del usuario
export const getPrivateUserData = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId, "private", "data"));
  return docSnap.exists() ? docSnap.data() : null;
};

// Actualizar datos privados (solo para campos permitidos, NO birthDate)
export const updatePrivateUserData = async (userId, privateData) => {
  // Prevent birthDate from being updated after initial creation
  const { birthDate, ...allowedData } = privateData;

  if (Object.keys(allowedData).length > 0) {
    await updateDoc(doc(db, "users", userId, "private", "data"), allowedData);
  }
};

// Obtener usuarios para el feed (excluyendo al usuario actual y usuarios ya vistos)
export const getFeedUsers = async (currentUserId) => {
  // Nota: En una app real, esto debería ser una query paginada y filtrada en el backend.
  // Para este MVP, traemos una colección limitada y filtramos en cliente.

  // Importar dinámicamente para evitar dependencia circular
  const { getInteractedUserIds } = await import("./likes");

  // Obtener usuarios con los que ya hubo interacción
  const interactedUserIds = await getInteractedUserIds(currentUserId);

  const usersRef = collection(db, "users");
  const q = query(usersRef, limit(50)); // Aumentamos el límite para compensar el filtrado

  const querySnapshot = await getDocs(q);
  const users = [];

  querySnapshot.forEach((doc) => {
    const userId = doc.id;
    // Excluir: usuario actual y usuarios ya vistos
    if (userId !== currentUserId && !interactedUserIds.includes(userId)) {
      users.push({ uid: userId, ...doc.data() });
    }
  });

  return users;
};