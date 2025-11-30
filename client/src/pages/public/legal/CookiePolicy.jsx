import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function CookiePolicy() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Volver
                </button>

                <h1>Política de Cookies</h1>
                <p className="last-updated">Última actualización: 28 de noviembre de 2025</p>

                <div className="legal-content">
                    <section>
                        <h2>1. ¿Qué son las Cookies?</h2>
                        <p>
                            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                            visitas un sitio web o aplicación. Se utilizan ampliamente para hacer que los sitios
                            web funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.
                        </p>
                    </section>

                    <section>
                        <h2>2. Cómo Usamos las Cookies</h2>
                        <p>Utilizamos cookies y tecnologías similares para varios propósitos:</p>

                        <h3>2.1 Cookies Esenciales</h3>
                        <p>Estas cookies son necesarias para que la aplicación funcione correctamente:</p>
                        <ul>
                            <li><strong>Autenticación:</strong> Mantener tu sesión activa mientras usas la app</li>
                            <li><strong>Seguridad:</strong> Proteger contra ataques y verificar tu identidad</li>
                            <li><strong>Preferencias:</strong> Recordar tus configuraciones y preferencias</li>
                        </ul>
                        <p className="note">
                            ⚠️ Estas cookies no se pueden desactivar ya que son necesarias para el funcionamiento básico.
                        </p>

                        <h3>2.2 Cookies de Rendimiento</h3>
                        <p>Nos ayudan a entender cómo los usuarios interactúan con la aplicación:</p>
                        <ul>
                            <li>Análisis de uso y patrones de navegación</li>
                            <li>Identificación de errores y problemas técnicos</li>
                            <li>Medición de tiempos de carga y rendimiento</li>
                            <li>Optimización de la experiencia del usuario</li>
                        </ul>

                        <h3>2.3 Cookies Funcionales</h3>
                        <p>Mejoran la funcionalidad y personalización:</p>
                        <ul>
                            <li>Recordar tus preferencias de idioma</li>
                            <li>Guardar filtros de búsqueda</li>
                            <li>Personalizar tu experiencia</li>
                            <li>Recordar configuraciones de privacidad</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Tipos de Cookies que Utilizamos</h2>

                        <h3>3.1 Cookies de Sesión</h3>
                        <p>
                            Son cookies temporales que se eliminan cuando cierras el navegador.
                            Se utilizan principalmente para mantener tu sesión activa.
                        </p>

                        <h3>3.2 Cookies Persistentes</h3>
                        <p>
                            Permanecen en tu dispositivo durante un período específico.
                            Se utilizan para recordar tus preferencias entre sesiones.
                        </p>

                        <h3>3.3 Cookies de Primera Parte</h3>
                        <p>
                            Son establecidas directamente por nuestra aplicación y solo nosotros podemos leerlas.
                        </p>

                        <h3>3.4 Cookies de Terceros</h3>
                        <p>Son establecidas por servicios de terceros que utilizamos:</p>
                        <ul>
                            <li><strong>Firebase:</strong> Autenticación y análisis</li>
                            <li><strong>Cloudflare:</strong> Seguridad y protección contra bots</li>
                            <li><strong>Google Analytics:</strong> Análisis de uso (si aplicable)</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Tecnologías Similares</h2>
                        <p>Además de cookies, utilizamos otras tecnologías de almacenamiento:</p>

                        <h3>4.1 Local Storage</h3>
                        <p>
                            Almacenamiento local del navegador para guardar datos que persisten entre sesiones,
                            como preferencias de usuario y caché de perfiles.
                        </p>

                        <h3>4.2 IndexedDB</h3>
                        <p>
                            Base de datos local para almacenar información en caché y mejorar el rendimiento,
                            reduciendo las lecturas de Firestore.
                        </p>

                        <h3>4.3 Session Storage</h3>
                        <p>
                            Almacenamiento temporal que se elimina cuando cierras la pestaña,
                            utilizado para datos de sesión temporal.
                        </p>
                    </section>

                    <section>
                        <h2>5. Cookies Específicas que Utilizamos</h2>

                        <table className="cookie-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Propósito</th>
                                    <th>Tipo</th>
                                    <th>Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>auth_token</td>
                                    <td>Mantener sesión activa</td>
                                    <td>Esencial</td>
                                    <td>Sesión</td>
                                </tr>
                                <tr>
                                    <td>user_preferences</td>
                                    <td>Guardar configuraciones</td>
                                    <td>Funcional</td>
                                    <td>1 año</td>
                                </tr>
                                <tr>
                                    <td>cf_turnstile</td>
                                    <td>Protección contra bots</td>
                                    <td>Seguridad</td>
                                    <td>Sesión</td>
                                </tr>
                                <tr>
                                    <td>analytics_id</td>
                                    <td>Análisis de uso</td>
                                    <td>Rendimiento</td>
                                    <td>2 años</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>6. Control de Cookies</h2>

                        <h3>6.1 Configuración del Navegador</h3>
                        <p>Puedes controlar y eliminar cookies a través de tu navegador:</p>
                        <ul>
                            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                            <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                            <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                            <li><strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
                        </ul>

                        <h3>6.2 Limitaciones al Bloquear Cookies</h3>
                        <p>
                            Si bloqueas o eliminas cookies esenciales, algunas funciones de la aplicación
                            pueden no funcionar correctamente:
                        </p>
                        <ul>
                            <li>No podrás mantener tu sesión activa</li>
                            <li>Tendrás que iniciar sesión cada vez</li>
                            <li>Tus preferencias no se guardarán</li>
                            <li>Algunas funciones pueden no estar disponibles</li>
                        </ul>

                        <h3>6.3 Opt-Out de Cookies de Terceros</h3>
                        <p>Puedes optar por no participar en cookies de terceros:</p>
                        <ul>
                            <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Opt-out</a></li>
                            <li>Configuración de privacidad de tu navegador</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Actualizaciones de Cookies</h2>
                        <p>
                            Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios
                            en las cookies que utilizamos o por razones operativas, legales o regulatorias.
                        </p>
                    </section>

                    <section>
                        <h2>8. Más Información</h2>
                        <p>Para más información sobre cómo manejamos tus datos, consulta:</p>
                        <ul>
                            <li>Nuestra Política de Privacidad</li>
                            <li>Nuestros Términos y Condiciones</li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Contacto</h2>
                        <p>
                            Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos en:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> privacy@tuapp.com</li>
                            <li><strong>Formulario de contacto:</strong> Disponible en la aplicación</li>
                        </ul>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>
                        Al continuar usando nuestra aplicación, aceptas el uso de cookies según lo descrito
                        en esta política.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CookiePolicy;
