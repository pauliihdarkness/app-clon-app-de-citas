import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../api/firebase";

const auth = getAuth(app);

const useAuth = () => {
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { login, error };
};

export default useAuth;