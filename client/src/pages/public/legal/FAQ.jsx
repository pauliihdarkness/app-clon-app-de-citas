import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function FAQ() {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            category: "Cuenta y Registro",
            questions: [
                {
                    q: "¿Cómo creo una cuenta?",
                    a: "Puedes crear una cuenta usando tu correo electrónico y contraseña, o registrarte rápidamente con tu cuenta de Google. Necesitas tener al menos 18 años para registrarte."
                },
                {
                    q: "¿Puedo cambiar mi correo electrónico?",
                    a: "Actualmente no es posible cambiar el correo electrónico asociado a tu cuenta. Si necesitas usar un correo diferente, deberás crear una nueva cuenta."
                },
                {
                    q: "Olvidé mi contraseña, ¿qué hago?",
                    a: "En la pantalla de inicio de sesión, toca 'Olvidé mi contraseña'. Te enviaremos un correo con instrucciones para restablecerla."
                },
                {
                    q: "¿Cómo elimino mi cuenta?",
                    a: "Ve a Configuración → Cuenta → Eliminar Cuenta. Ten en cuenta que esta acción es permanente y no se puede deshacer."
                }
            ]
        },
        {
            category: "Perfil",
            questions: [
                {
                    q: "¿Cuántas fotos puedo subir?",
                    a: "Puedes subir hasta 6 fotos en tu perfil. Recomendamos usar fotos claras y recientes donde se vea tu rostro."
                },
                {
                    q: "¿Por qué fue rechazada mi foto?",
                    a: "Las fotos pueden ser rechazadas si contienen contenido inapropiado, no muestran claramente tu rostro, incluyen menores de edad, o violan nuestras políticas de contenido."
                },
                {
                    q: "¿Puedo cambiar mi edad?",
                    a: "No, la edad se calcula automáticamente desde tu fecha de nacimiento y no se puede modificar después del registro para mantener la autenticidad de los perfiles."
                },
                {
                    q: "¿Cómo edito mi perfil?",
                    a: "Ve a tu perfil y toca el botón 'Editar Perfil'. Desde ahí puedes actualizar tus fotos, biografía, intereses y otra información."
                }
            ]
        },
        {
            category: "Matches y Likes",
            questions: [
                {
                    q: "¿Cómo funciona el sistema de matches?",
                    a: "Cuando le das like a alguien y esa persona también te da like, se crea un match. Solo entonces podrán enviarse mensajes mutuamente."
                },
                {
                    q: "¿Puedo ver quién me ha dado like?",
                    a: "Esta función está disponible en la versión premium. Los usuarios gratuitos solo verán matches cuando ambos se hayan dado like mutuamente."
                },
                {
                    q: "¿Qué pasa si le doy 'No me gusta' a alguien por error?",
                    a: "Actualmente no hay forma de deshacer un 'No me gusta'. El perfil no volverá a aparecer en tu feed."
                },
                {
                    q: "¿Por qué no veo más perfiles?",
                    a: "Esto puede ocurrir si has visto todos los perfiles disponibles en tu área con tus filtros actuales. Intenta ampliar tus criterios de búsqueda o vuelve más tarde."
                }
            ]
        },
        {
            category: "Mensajería",
            questions: [
                {
                    q: "¿Por qué no puedo enviar mensajes?",
                    a: "Solo puedes enviar mensajes a personas con las que has hecho match. Asegúrate de que ambos se hayan dado like mutuamente."
                },
                {
                    q: "¿Puedo enviar fotos en los mensajes?",
                    a: "Esta función está en desarrollo y estará disponible próximamente."
                },
                {
                    q: "¿Cómo sé si alguien leyó mi mensaje?",
                    a: "Actualmente no mostramos confirmaciones de lectura. Esta función puede agregarse en futuras actualizaciones."
                },
                {
                    q: "¿Puedo eliminar mensajes enviados?",
                    a: "No, los mensajes no se pueden eliminar una vez enviados. Piensa bien antes de enviar."
                }
            ]
        },
        {
            category: "Seguridad y Privacidad",
            questions: [
                {
                    q: "¿Es segura mi información personal?",
                    a: "Sí, tomamos muy en serio la seguridad. Usamos encriptación, autenticación segura, y nunca compartimos tu información con terceros sin tu consentimiento. Lee nuestra Política de Privacidad para más detalles."
                },
                {
                    q: "¿Cómo reporto a un usuario?",
                    a: "Ve al perfil del usuario, toca el ícono de opciones (⋮) y selecciona 'Reportar'. Elige la razón y proporciona detalles. Revisaremos todos los reportes."
                },
                {
                    q: "¿Cómo bloqueo a alguien?",
                    a: "Ve al perfil del usuario, toca el ícono de opciones (⋮) y selecciona 'Bloquear'. Los usuarios bloqueados no podrán ver tu perfil ni contactarte."
                },
                {
                    q: "¿Qué información es visible para otros usuarios?",
                    a: "Otros usuarios pueden ver tu nombre, edad, fotos, biografía, intereses y ubicación general (ciudad). Tu correo electrónico y fecha de nacimiento exacta son privados."
                }
            ]
        },
        {
            category: "Suscripción y Pagos",
            questions: [
                {
                    q: "¿Qué incluye la versión gratuita?",
                    a: "La versión gratuita incluye: crear perfil, dar likes, hacer matches, enviar mensajes, y usar filtros básicos."
                },
                {
                    q: "¿Qué beneficios tiene la versión premium?",
                    a: "Premium incluye: likes ilimitados, ver quién te ha dado like, super likes, rewind (deshacer), filtros avanzados, y sin anuncios."
                },
                {
                    q: "¿Cómo cancelo mi suscripción?",
                    a: "Ve a Configuración → Suscripción → Cancelar. La suscripción seguirá activa hasta el final del período pagado."
                },
                {
                    q: "¿Ofrecen reembolsos?",
                    a: "Generalmente no ofrecemos reembolsos, excepto cuando lo requiera la ley. Consulta nuestros Términos y Condiciones para más información."
                }
            ]
        },
        {
            category: "Problemas Técnicos",
            questions: [
                {
                    q: "La app no carga, ¿qué hago?",
                    a: "Intenta: 1) Actualizar la página, 2) Limpiar caché del navegador, 3) Cerrar sesión y volver a iniciar, 4) Usar otro navegador. Si el problema persiste, contáctanos."
                },
                {
                    q: "No recibo notificaciones",
                    a: "Verifica que las notificaciones estén habilitadas en la configuración de tu navegador y en la configuración de la app."
                },
                {
                    q: "Las fotos no se suben",
                    a: "Asegúrate de que: 1) La imagen sea menor a 10MB, 2) El formato sea JPG o PNG, 3) Tengas conexión a internet estable. Si el problema persiste, intenta con otra imagen."
                },
                {
                    q: "¿La app funciona en móvil?",
                    a: "Sí, la app está optimizada para funcionar en navegadores móviles. Próximamente lanzaremos apps nativas para iOS y Android."
                }
            ]
        },
        {
            category: "Consejos de Uso",
            questions: [
                {
                    q: "¿Cómo consigo más matches?",
                    a: "Tips: 1) Usa fotos claras y variadas, 2) Escribe una biografía interesante, 3) Completa todos los campos de tu perfil, 4) Sé activo en la app, 5) Sé auténtico."
                },
                {
                    q: "¿Qué escribo en el primer mensaje?",
                    a: "Sé genuino y personal. Menciona algo de su perfil que te llamó la atención. Evita mensajes genéricos como 'Hola' o 'Qué tal'."
                },
                {
                    q: "¿Cuándo es buen momento para conocerse en persona?",
                    a: "Cuando ambos se sientan cómodos. Generalmente después de varias conversaciones significativas. Siempre reúnanse en un lugar público la primera vez."
                },
                {
                    q: "¿Qué hago si alguien me hace sentir incómodo?",
                    a: "Confía en tus instintos. Bloquea y reporta al usuario inmediatamente. No tienes obligación de continuar ninguna conversación que te haga sentir incómodo."
                }
            ]
        }
    ];

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Volver
                </button>

                <h1>Preguntas Frecuentes (FAQ)</h1>
                <p className="last-updated">Última actualización: 28 de noviembre de 2025</p>

                <div className="faq-intro">
                    <p>
                        ¿Tienes preguntas? Aquí encontrarás respuestas a las preguntas más comunes.
                        Si no encuentras lo que buscas, no dudes en contactarnos.
                    </p>
                </div>

                <div className="faq-content">
                    {faqs.map((category, catIndex) => (
                        <div key={catIndex} className="faq-category">
                            <h2 className="faq-category-title">{category.category}</h2>
                            {category.questions.map((faq, qIndex) => {
                                const globalIndex = `${catIndex}-${qIndex}`;
                                const isOpen = openIndex === globalIndex;

                                return (
                                    <div key={qIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleFAQ(globalIndex)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="faq-answer">
                                                <p>{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="faq-footer">
                    <h3>¿No encontraste tu respuesta?</h3>
                    <p>
                        Si tienes una pregunta que no está aquí, puedes contactarnos a través de
                        nuestro formulario de contacto o enviarnos un correo a <strong>support@tuapp.com</strong>
                    </p>
                    <button className="contact-btn" onClick={() => navigate('/contact')}>
                        Ir a Contacto
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
