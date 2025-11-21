import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPrivateUserData } from "../api/user";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import BaseLayout from "../components/Layout/BaseLayout";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const user = await register(email, password);

      // Guardar datos privados
      await createPrivateUserData(user.uid, {
        email: user.email,
        photoURL: user.photoURL || "",
        authMethod: "email"
      });

      // Redirigir a crear perfil
      navigate("/create-profile");
    } catch (err) {
      console.error("Error en registro:", err);

      // Mensajes de error más amigables
      if (err.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado");
      } else if (err.code === "auth/invalid-email") {
        setError("Email inválido");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es muy débil");
      } else {
        setError("Error al crear la cuenta. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      // El resto del flujo se maneja en Login.jsx con useEffect
      navigate("/create-profile");
    } catch (err) {
      console.error("Error con Google:", err);
      setError("Error al registrarse con Google");
      setLoading(false);
    }
  };

  return (
    <BaseLayout maxWidth="mobile">
      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <h1>Crear Cuenta</h1>
            <p>Únete y comienza a conectar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Google Button */}
          <Button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="google-button"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="google-icon"
            />
            Continuar con Google
          </Button>

          {/* Divider */}
          <div className="divider">
            <span>o</span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailRegister} className="register-form">
            <div className="form-group">
              <label>Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="submit-button">
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="login-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>

          {/* Terms */}
          <div className="terms">
            Al registrarte, aceptas nuestros{" "}
            <a href="#terms">Términos de Servicio</a> y{" "}
            <a href="#privacy">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Register;