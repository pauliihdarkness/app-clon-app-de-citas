import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getUserProfile } from "../../api/user";
import SplashScreen from "./SplashScreen";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const userData = await getUserProfile(user.uid);

          if (userData) {
            // Verificar campos obligatorios: Nombre, Edad, Género, Fotos, Ubicación
            const isComplete = userData.name &&
              userData.age &&
              userData.gender &&
              userData.images && userData.images.length > 0 &&
              userData.location && userData.location.city;

            setProfileComplete(!!isComplete);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          setProfileComplete(false);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  if (loading || isProfileLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el perfil está incompleto y NO estamos en /create-profile, redirigir a /create-profile
  if (!profileComplete && location.pathname !== "/create-profile") {
    return <Navigate to="/create-profile" replace />;
  }

  // Si el perfil está completo y estamos en /create-profile, redirigir a /feed
  if (profileComplete && location.pathname === "/create-profile") {
    return <Navigate to="/feed" replace />;
  }

  return children;
};

export default ProtectedRoute;
