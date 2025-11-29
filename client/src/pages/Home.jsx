import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/UI/Button";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si ya está autenticado, redirigir al feed
  React.useEffect(() => {
    if (user) {
      navigate("/feed");
    }
  }, [user, navigate]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Encuentra tu <span className="gradient-text">Match Perfecto</span>
          </h1>
          <p className="hero-subtitle">
            Conecta con personas increíbles cerca de ti.
            Desliza, haz match y comienza nuevas historias.
          </p>

          <div className="cta-buttons">
            <Button onClick={() => navigate("/register")} className="cta-primary">
              🚀 Comenzar Ahora
            </Button>
            <Button onClick={() => navigate("/login")} variant="secondary" className="cta-secondary">
              Ya tengo cuenta
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hero-decoration">
          <div className="floating-card card-1">
            <div className="card-image">💕</div>
            <div className="card-info">
              <h4>María, 24</h4>
              <p>Buenos Aires</p>
            </div>
          </div>
          <div className="floating-card card-2">
            <div className="card-image">✨</div>
            <div className="card-info">
              <h4>Lucía, 27</h4>
              <p>Córdoba</p>
            </div>
          </div>
          <div className="floating-card card-3">
            <div className="card-image">🌟</div>
            <div className="card-info">
              <h4>Ana, 25</h4>
              <p>Rosario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">¿Por qué elegirnos?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Swipe Inteligente</h3>
            <p>Desliza para encontrar personas compatibles con tus intereses</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Chat en Tiempo Real</h3>
            <p>Conecta instantáneamente cuando hagan match</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Seguro</h3>
            <p>Tu privacidad y seguridad son nuestra prioridad</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Cerca de Ti</h3>
            <p>Encuentra personas en tu ciudad o región</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Perfil Completo</h3>
            <p>Muestra tu personalidad con fotos e intereses</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💝</div>
            <h3>Matches Reales</h3>
            <p>Solo conectas cuando ambos se gustan</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para encontrar tu match?</h2>
          <p>Únete a miles de personas que ya encontraron conexiones increíbles</p>
          <Button onClick={() => navigate("/register")} className="cta-large">
            Crear mi cuenta gratis
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 App de Citas • Hecho con 💜</p>
        <div className="footer-links">
          <a href="/terms">Términos y Condiciones</a>
          <a href="/privacy-policy">Privacidad</a>
          <a href="/cookie-policy">Cookies</a>
          <a href="/community-guidelines">Comunidad</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;