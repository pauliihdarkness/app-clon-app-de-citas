
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserProfile, createUserProfile } from "../api/user";
import { createPrivateData } from "../api/privateData";
import BaseLayout from "../components/Layout/BaseLayout";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import "../assets/styles/global.css";

const Login = () => {
  const { login, loginWithGoogle, user, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userData = await getUserProfile(user.uid);

          if (userData) {
            // Validar campos requeridos
            if (userData.name && userData.age && userData.gender && userData.birthdate && userData.CreationDate) {
              navigate("/feed");
            } else {
              navigate("/create-profile");
            }
          } else {
            // Si no existe el perfil, crearlo con datos básicos públicos
            await createUserProfile(user.uid, {
              uid: user.uid,
              createdAt: new Date()
            });

            // Guardar datos sensibles en subcolección privada
            await createPrivateData(user.uid, {
              email: user.email,
              photoURL: user.photoURL || "",
              authMethod: user.providerData?.[0]?.providerId === "google.com" ? "google" : "email"
            });

            navigate("/create-profile");
          }
        } catch (err) {
          console.error("Error checking user profile:", err);
          navigate("/create-profile");
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkUserProfile();
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // Error handled by context
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  if (user || isLoading) {
    return (
      <BaseLayout maxWidth="mobile">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          color: 'white'
        }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.1)",
            borderLeftColor: "var(--primary-color)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "1rem"
          }}></div>
          <p>Verificando perfil...</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at top right, #2a1a2e 0%, #0F0F15 60%)",
      padding: "1rem"
    }}>
      <div className="glass slide-up" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "2.5rem",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1 style={{
            fontSize: "2rem",
            background: "var(--primary-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5rem"
          }}>
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<span style={{ fontSize: "1.2rem" }}>✉️</span>}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<span style={{ fontSize: "1.2rem" }}>🔒</span>}
          />

          {error && (
            <div className="fade-in" style={{
              color: "#FF4B4B",
              fontSize: "0.9rem",
              textAlign: "center",
              background: "rgba(255, 75, 75, 0.1)",
              padding: "0.5rem",
              borderRadius: "8px"
            }}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          color: "var(--text-secondary)",
          fontSize: "0.9rem"
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        <Button
          onClick={handleGoogleLogin}
          variant="social"
          icon={<span style={{ fontSize: "1.2rem" }}>G</span>}
        >
          Google
        </Button>

        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "1rem" }}>
          Don't have an account? <a href="/register" style={{ fontWeight: "600" }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

