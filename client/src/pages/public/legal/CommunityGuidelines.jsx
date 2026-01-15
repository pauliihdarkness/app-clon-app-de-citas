import React from 'react';
import BaseLayout from '../../../components/Layout/BaseLayout';
import './LegalPage.css';

function CommunityGuidelines() {
    return (
        <BaseLayout title="Guía de Comunidad">
            <div className="legal-container">
                <p className="last-updated">Última actualización: 28 de noviembre de 2025</p>

                <div className="legal-content">
                    <section>
                        <h2>Bienvenido a Nuestra Comunidad</h2>
                        <p>
                            Nuestra aplicación está diseñada para ayudarte a conocer personas nuevas de manera
                            segura y respetuosa. Estas directrices están aquí para asegurar que todos tengan
                            una experiencia positiva.
                        </p>
                    </section>

                    <section>
                        <h2>🌟 Nuestros Valores</h2>
                        <div className="values-grid">
                            <div className="value-card">
                                <h3>🤝 Respeto</h3>
                                <p>Trata a todos con dignidad y consideración</p>
                            </div>
                            <div className="value-card">
                                <h3>✨ Autenticidad</h3>
                                <p>Sé genuino y honesto en tu perfil</p>
                            </div>
                            <div className="value-card">
                                <h3>🛡️ Seguridad</h3>
                                <p>Protege tu información y la de otros</p>
                            </div>
                            <div className="value-card">
                                <h3>💚 Inclusión</h3>
                                <p>Celebra la diversidad y la diferencia</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2>✅ Comportamiento Esperado</h2>

                        <h3>Sé Respetuoso</h3>
                        <ul>
                            <li>Trata a otros como te gustaría ser tratado</li>
                            <li>Respeta los límites y el "no" de otras personas</li>
                            <li>Usa un lenguaje apropiado y cortés</li>
                            <li>Acepta el rechazo con gracia</li>
                        </ul>

                        <h3>Sé Auténtico</h3>
                        <ul>
                            <li>Usa fotos reales y recientes de ti mismo</li>
                            <li>Proporciona información veraz en tu perfil</li>
                            <li>Sé honesto sobre tus intenciones</li>
                            <li>No te hagas pasar por otra persona</li>
                        </ul>

                        <h3>Sé Seguro</h3>
                        <ul>
                            <li>Protege tu información personal</li>
                            <li>Reporta comportamientos sospechosos</li>
                            <li>Confía en tus instintos</li>
                            <li>Toma precauciones al conocer personas en persona</li>
                        </ul>

                        <h3>Sé Inclusivo</h3>
                        <ul>
                            <li>Respeta todas las identidades y orientaciones</li>
                            <li>No discrimines por raza, religión, género, etc.</li>
                            <li>Celebra la diversidad</li>
                            <li>Sé de mente abierta</li>
                        </ul>
                    </section>

                    <section>
                        <h2>❌ Comportamiento Prohibido</h2>

                        <h3>🚫 Acoso y Abuso</h3>
                        <p>No toleramos ninguna forma de acoso:</p>
                        <ul>
                            <li>Mensajes ofensivos, amenazantes o intimidantes</li>
                            <li>Acoso sexual o insinuaciones no deseadas</li>
                            <li>Contacto persistente después de ser bloqueado</li>
                            <li>Doxing (compartir información personal de otros)</li>
                            <li>Stalking o seguimiento obsesivo</li>
                        </ul>

                        <h3>🚫 Contenido Inapropiado</h3>
                        <p>No está permitido:</p>
                        <ul>
                            <li>Desnudez o contenido sexual explícito</li>
                            <li>Contenido violento o gore</li>
                            <li>Discurso de odio o discriminación</li>
                            <li>Contenido que promueva autolesiones</li>
                            <li>Imágenes de menores de edad</li>
                        </ul>

                        <h3>🚫 Fraude y Engaño</h3>
                        <p>Prohibido estrictamente:</p>
                        <ul>
                            <li>Perfiles falsos o suplantación de identidad</li>
                            <li>Estafas o solicitudes de dinero</li>
                            <li>Phishing o robo de información</li>
                            <li>Promoción de esquemas piramidales</li>
                            <li>Catfishing (usar fotos de otra persona)</li>
                        </ul>

                        <h3>🚫 Spam y Promoción</h3>
                        <p>No uses la plataforma para:</p>
                        <ul>
                            <li>Enviar mensajes masivos no solicitados</li>
                            <li>Promocionar productos o servicios</li>
                            <li>Reclutar para otros sitios o apps</li>
                            <li>Compartir links maliciosos</li>
                            <li>Publicidad no autorizada</li>
                        </ul>

                        <h3>🚫 Actividad Ilegal</h3>
                        <p>Estrictamente prohibido:</p>
                        <ul>
                            <li>Prostitución o tráfico sexual</li>
                            <li>Venta de drogas o sustancias ilegales</li>
                            <li>Compartir contenido de menores</li>
                            <li>Cualquier actividad criminal</li>
                        </ul>
                    </section>

                    <section>
                        <h2>📸 Directrices de Fotos</h2>

                        <h3>Fotos Permitidas</h3>
                        <ul>
                            <li>✅ Fotos claras de tu rostro</li>
                            <li>✅ Fotos recientes (últimos 2 años)</li>
                            <li>✅ Fotos tuyas en actividades que disfrutas</li>
                            <li>✅ Fotos con amigos (si eres claramente identificable)</li>
                        </ul>

                        <h3>Fotos No Permitidas</h3>
                        <ul>
                            <li>❌ Desnudez o contenido sexual</li>
                            <li>❌ Fotos de otras personas sin su consentimiento</li>
                            <li>❌ Imágenes de menores de edad</li>
                            <li>❌ Contenido violento o perturbador</li>
                            <li>❌ Marcas de agua o promociones</li>
                            <li>❌ Fotos que no muestren tu rostro</li>
                        </ul>
                    </section>

                    <section>
                        <h2>💬 Directrices de Mensajería</h2>

                        <h3>Buenas Prácticas</h3>
                        <ul>
                            <li>Sé cortés y amigable en tu primer mensaje</li>
                            <li>Lee el perfil antes de enviar un mensaje</li>
                            <li>Respeta si alguien no responde</li>
                            <li>No envíes contenido sexual no solicitado</li>
                            <li>Mantén conversaciones apropiadas</li>
                        </ul>

                        <h3>Qué Evitar</h3>
                        <ul>
                            <li>Mensajes genéricos de copy-paste</li>
                            <li>Comentarios sobre apariencia física de manera inapropiada</li>
                            <li>Presionar para obtener información personal</li>
                            <li>Enviar múltiples mensajes sin respuesta</li>
                        </ul>
                    </section>

                    <section>
                        <h2>🛡️ Seguridad Personal</h2>

                        <h3>En Línea</h3>
                        <ul>
                            <li>No compartas información personal sensible (dirección, trabajo)</li>
                            <li>No envíes dinero a personas que conoces en línea</li>
                            <li>Ten cuidado con links sospechosos</li>
                            <li>Usa las funciones de bloqueo y reporte</li>
                        </ul>

                        <h3>Encuentros en Persona</h3>
                        <ul>
                            <li>Informa a un amigo sobre tus planes</li>
                            <li>Reúnete en un lugar público</li>
                            <li>Lleva tu propio transporte</li>
                            <li>Mantente sobrio en la primera cita</li>
                            <li>Confía en tus instintos</li>
                        </ul>
                    </section>

                    <section>
                        <h2>🚨 Reportar y Bloquear</h2>

                        <h3>Cuándo Reportar</h3>
                        <p>Reporta inmediatamente si alguien:</p>
                        <ul>
                            <li>Te acosa o amenaza</li>
                            <li>Envía contenido inapropiado</li>
                            <li>Solicita dinero o información financiera</li>
                            <li>Parece ser menor de edad</li>
                            <li>Viola estas directrices</li>
                        </ul>

                        <h3>Cómo Reportar</h3>
                        <ol>
                            <li>Ve al perfil del usuario</li>
                            <li>Toca el ícono de opciones (⋮)</li>
                            <li>Selecciona "Reportar"</li>
                            <li>Elige la razón del reporte</li>
                            <li>Proporciona detalles adicionales si es necesario</li>
                        </ol>

                        <h3>Bloquear Usuarios</h3>
                        <p>
                            Puedes bloquear a cualquier usuario en cualquier momento. Los usuarios bloqueados
                            no podrán ver tu perfil, enviarte mensajes ni aparecer en tu feed.
                        </p>
                    </section>

                    <section>
                        <h2>⚖️ Consecuencias</h2>
                        <p>Las violaciones de estas directrices pueden resultar en:</p>

                        <h3>Primera Violación</h3>
                        <ul>
                            <li>Advertencia formal</li>
                            <li>Eliminación de contenido inapropiado</li>
                            <li>Suspensión temporal (1-7 días)</li>
                        </ul>

                        <h3>Violaciones Repetidas</h3>
                        <ul>
                            <li>Suspensión prolongada</li>
                            <li>Restricción de funciones</li>
                            <li>Eliminación permanente de la cuenta</li>
                        </ul>

                        <h3>Violaciones Graves</h3>
                        <ul>
                            <li>Eliminación inmediata de la cuenta</li>
                            <li>Prohibición permanente de la plataforma</li>
                            <li>Reporte a las autoridades (si aplica)</li>
                        </ul>
                    </section>

                    <section>
                        <h2>💡 Consejos para una Buena Experiencia</h2>
                        <ul>
                            <li>Sé paciente - encontrar a la persona adecuada toma tiempo</li>
                            <li>Mantén una actitud positiva</li>
                            <li>No te tomes el rechazo de manera personal</li>
                            <li>Sé claro sobre lo que buscas</li>
                            <li>Diviértete y disfruta el proceso</li>
                            <li>Toma descansos si te sientes abrumado</li>
                        </ul>
                    </section>

                    <section>
                        <h2>🤝 Nuestra Responsabilidad</h2>
                        <p>Nos comprometemos a:</p>
                        <ul>
                            <li>Revisar reportes dentro de 24-48 horas</li>
                            <li>Tomar acción contra violaciones</li>
                            <li>Proteger tu privacidad</li>
                            <li>Mejorar continuamente la seguridad</li>
                            <li>Escuchar feedback de la comunidad</li>
                        </ul>
                    </section>

                    <section>
                        <h2>📞 Necesitas Ayuda?</h2>
                        <p>Si tienes preguntas o necesitas ayuda:</p>
                        <ul>
                            <li>Consulta nuestra sección de FAQ</li>
                            <li>Contáctanos a través del formulario de contacto</li>
                            <li>Email: support@tuapp.com</li>
                        </ul>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>
                        Gracias por ser parte de nuestra comunidad. Juntos podemos crear un espacio
                        seguro y positivo para todos. 💙
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
}

export default CommunityGuidelines;
