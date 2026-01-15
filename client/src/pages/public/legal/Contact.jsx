import React, { useState } from 'react';
import BaseLayout from '../../../components/Layout/BaseLayout';
import './LegalPage.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement actual form submission logic
        console.log('Form submitted:', formData);
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({ name: '', email: '', subject: '', message: '' });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <BaseLayout title="Contacto">
            <div className="legal-container contact-page">
                <p className="page-subtitle">¿Necesitas ayuda? Estamos aquí para ti</p>

                <div className="contact-content">
                    <div className="contact-info">
                        <h2>Información de Contacto</h2>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="contact-icon">📧</div>
                                <div className="contact-details">
                                    <h3>Email</h3>
                                    <p>support@tuapp.com</p>
                                    <span className="response-time">Respuesta en 24-48 horas</span>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">🛡️</div>
                                <div className="contact-details">
                                    <h3>Seguridad y Privacidad</h3>
                                    <p>privacy@tuapp.com</p>
                                    <span className="response-time">Para temas de privacidad y datos</span>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">⚖️</div>
                                <div className="contact-details">
                                    <h3>Legal</h3>
                                    <p>legal@tuapp.com</p>
                                    <span className="response-time">Asuntos legales y términos</span>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">💼</div>
                                <div className="contact-details">
                                    <h3>Negocios</h3>
                                    <p>business@tuapp.com</p>
                                    <span className="response-time">Asociaciones y colaboraciones</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-links">
                            <h3>Enlaces Rápidos</h3>
                            <ul>
                                <li><a href="/faq">Preguntas Frecuentes</a></li>
                                <li><a href="/community-guidelines">Guía de Comunidad</a></li>
                                <li><a href="/privacy-policy">Política de Privacidad</a></li>
                                <li><a href="/terms">Términos y Condiciones</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <h2>Envíanos un Mensaje</h2>

                        {submitted ? (
                            <div className="success-message">
                                <div className="success-icon">✓</div>
                                <h3>¡Mensaje Enviado!</h3>
                                <p>Gracias por contactarnos. Te responderemos pronto.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nombre *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tu nombre completo"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Asunto *</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecciona un asunto</option>
                                        <option value="support">Soporte Técnico</option>
                                        <option value="account">Problemas de Cuenta</option>
                                        <option value="report">Reportar Usuario</option>
                                        <option value="billing">Facturación y Pagos</option>
                                        <option value="privacy">Privacidad y Datos</option>
                                        <option value="feedback">Sugerencias y Feedback</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Mensaje *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Describe tu consulta o problema..."
                                    />
                                </div>

                                <button type="submit" className="submit-btn">
                                    Enviar Mensaje
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="contact-footer">
                    <h3>Horario de Atención</h3>
                    <p>
                        Nuestro equipo de soporte está disponible de lunes a viernes,
                        de 9:00 AM a 6:00 PM (hora local). Los mensajes recibidos fuera
                        de este horario serán respondidos el siguiente día hábil.
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
}

export default Contact;
