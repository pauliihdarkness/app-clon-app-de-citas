import React from 'react';
import BaseLayout from '../../../components/Layout/BaseLayout';
import './LegalPage.css';

function PrivacyPolicy() {
    return (
        <BaseLayout title="Política de Privacidad">
            <div className="legal-container">
                <p className="last-updated">Última actualización: 28 de noviembre de 2025</p>

                <div className="legal-content">
                    <section>
                        <h2>1. Introducción</h2>
                        <p>
                            Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos
                            tu información personal cuando utilizas nuestra aplicación de citas. Nos comprometemos
                            a proteger tu privacidad y manejar tus datos de manera responsable.
                        </p>
                    </section>

                    <section>
                        <h2>2. Información que Recopilamos</h2>

                        <h3>2.1 Información que Proporcionas</h3>
                        <ul>
                            <li><strong>Información de Registro:</strong> Nombre, correo electrónico, fecha de nacimiento, género</li>
                            <li><strong>Información de Perfil:</strong> Fotos, biografía, intereses, preferencias de citas</li>
                            <li><strong>Información de Ubicación:</strong> País, estado, ciudad (proporcionada manualmente)</li>
                            <li><strong>Mensajes:</strong> Contenido de tus conversaciones con otros usuarios</li>
                            <li><strong>Información de Verificación:</strong> Datos necesarios para verificar tu identidad</li>
                        </ul>

                        <h3>2.2 Información Recopilada Automáticamente</h3>
                        <ul>
                            <li><strong>Información del Dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
                            <li><strong>Datos de Uso:</strong> Cómo interactúas con la aplicación, funciones utilizadas</li>
                            <li><strong>Información Técnica:</strong> Dirección IP, cookies, identificadores únicos</li>
                            <li><strong>Datos de Rendimiento:</strong> Errores, tiempos de carga, métricas de uso</li>
                        </ul>

                        <h3>2.3 Información de Terceros</h3>
                        <ul>
                            <li><strong>Autenticación Social:</strong> Si te registras con Google, recibimos información básica de tu perfil</li>
                            <li><strong>Servicios de Análisis:</strong> Datos agregados de herramientas de análisis</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Cómo Usamos tu Información</h2>
                        <p>Utilizamos tu información para:</p>

                        <h3>3.1 Proporcionar el Servicio</h3>
                        <ul>
                            <li>Crear y mantener tu cuenta</li>
                            <li>Mostrarte perfiles compatibles</li>
                            <li>Facilitar matches y conversaciones</li>
                            <li>Personalizar tu experiencia</li>
                        </ul>

                        <h3>3.2 Seguridad y Prevención de Fraude</h3>
                        <ul>
                            <li>Verificar identidades y prevenir cuentas falsas</li>
                            <li>Detectar y prevenir actividades fraudulentas</li>
                            <li>Moderar contenido inapropiado</li>
                            <li>Proteger contra spam y abuso</li>
                        </ul>

                        <h3>3.3 Mejorar el Servicio</h3>
                        <ul>
                            <li>Analizar patrones de uso</li>
                            <li>Desarrollar nuevas funciones</li>
                            <li>Realizar investigación y análisis</li>
                            <li>Optimizar el rendimiento</li>
                        </ul>

                        <h3>3.4 Comunicación</h3>
                        <ul>
                            <li>Enviarte notificaciones sobre matches y mensajes</li>
                            <li>Informarte sobre cambios en el servicio</li>
                            <li>Responder a tus consultas</li>
                            <li>Enviar actualizaciones importantes</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Compartir tu Información</h2>

                        <h3>4.1 Con Otros Usuarios</h3>
                        <p>
                            Tu perfil público (fotos, nombre, edad, biografía, intereses) es visible para otros usuarios
                            de la aplicación. Tu información privada (correo electrónico, fecha de nacimiento exacta)
                            nunca se comparte con otros usuarios.
                        </p>

                        <h3>4.2 Con Proveedores de Servicios</h3>
                        <p>Compartimos información con proveedores que nos ayudan a operar el servicio:</p>
                        <ul>
                            <li><strong>Firebase:</strong> Autenticación y base de datos</li>
                            <li><strong>Cloudinary:</strong> Almacenamiento de imágenes</li>
                            <li><strong>Servicios de hosting:</strong> Vercel, Render</li>
                            <li><strong>Análisis:</strong> Herramientas de análisis de uso</li>
                        </ul>

                        <h3>4.3 Por Razones Legales</h3>
                        <p>Podemos divulgar tu información si:</p>
                        <ul>
                            <li>Es requerido por ley o proceso legal</li>
                            <li>Es necesario para proteger nuestros derechos</li>
                            <li>Es necesario para prevenir fraude o abuso</li>
                            <li>Es necesario para proteger la seguridad de usuarios</li>
                        </ul>

                        <h3>4.4 Nunca Vendemos tus Datos</h3>
                        <p>
                            <strong>No vendemos, alquilamos ni compartimos tu información personal con terceros
                                para sus propósitos de marketing.</strong>
                        </p>
                    </section>

                    <section>
                        <h2>5. Seguridad de los Datos</h2>
                        <p>Implementamos medidas de seguridad para proteger tu información:</p>
                        <ul>
                            <li><strong>Encriptación:</strong> Datos en tránsito protegidos con HTTPS/TLS</li>
                            <li><strong>Autenticación:</strong> Sistema seguro de autenticación con Firebase</li>
                            <li><strong>Reglas de Seguridad:</strong> Firestore configurado con reglas estrictas</li>
                            <li><strong>Moderación de Contenido:</strong> Detección automática de contenido NSFW</li>
                            <li><strong>Protección contra Bots:</strong> Cloudflare Turnstile implementado</li>
                            <li><strong>Prevención XSS:</strong> Helmet y CSP configurados</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Retención de Datos</h2>
                        <p>Conservamos tu información mientras:</p>
                        <ul>
                            <li>Tu cuenta esté activa</li>
                            <li>Sea necesario para proporcionar el servicio</li>
                            <li>Sea requerido por ley</li>
                            <li>Sea necesario para resolver disputas</li>
                        </ul>
                        <p>
                            Cuando eliminas tu cuenta, eliminamos permanentemente tu información personal dentro de
                            30 días, excepto la información que debemos conservar por razones legales.
                        </p>
                    </section>

                    <section>
                        <h2>7. Tus Derechos</h2>
                        <p>Tienes derecho a:</p>

                        <h3>7.1 Acceso y Portabilidad</h3>
                        <ul>
                            <li>Acceder a tu información personal</li>
                            <li>Solicitar una copia de tus datos</li>
                            <li>Exportar tu información en formato legible</li>
                        </ul>

                        <h3>7.2 Corrección y Actualización</h3>
                        <ul>
                            <li>Corregir información inexacta</li>
                            <li>Actualizar tu perfil en cualquier momento</li>
                        </ul>

                        <h3>7.3 Eliminación</h3>
                        <ul>
                            <li>Eliminar tu cuenta permanentemente</li>
                            <li>Solicitar la eliminación de información específica</li>
                        </ul>

                        <h3>7.4 Restricción y Objeción</h3>
                        <ul>
                            <li>Restringir ciertos usos de tu información</li>
                            <li>Objetar el procesamiento de tus datos</li>
                            <li>Retirar consentimientos previamente otorgados</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Cookies y Tecnologías Similares</h2>
                        <p>Utilizamos cookies y tecnologías similares para:</p>
                        <ul>
                            <li>Mantener tu sesión activa</li>
                            <li>Recordar tus preferencias</li>
                            <li>Analizar el uso de la aplicación</li>
                            <li>Mejorar la seguridad</li>
                        </ul>
                        <p>
                            Puedes controlar las cookies a través de la configuración de tu navegador.
                            Consulta nuestra Política de Cookies para más detalles.
                        </p>
                    </section>

                    <section>
                        <h2>9. Privacidad de Menores</h2>
                        <p>
                            Nuestro servicio está destinado exclusivamente a personas mayores de 18 años.
                            No recopilamos intencionalmente información de menores de edad. Si descubrimos
                            que hemos recopilado información de un menor, la eliminaremos inmediatamente.
                        </p>
                    </section>

                    <section>
                        <h2>10. Transferencias Internacionales</h2>
                        <p>
                            Tu información puede ser transferida y almacenada en servidores ubicados fuera de tu país.
                            Tomamos medidas para asegurar que tu información reciba un nivel adecuado de protección.
                        </p>
                    </section>

                    <section>
                        <h2>11. Cambios a esta Política</h2>
                        <p>
                            Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre
                            cambios significativos a través de la aplicación o por correo electrónico.
                            La fecha de "Última actualización" al inicio indica cuándo se realizó la última modificación.
                        </p>
                    </section>

                    <section>
                        <h2>12. Contacto</h2>
                        <p>
                            Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información,
                            puedes contactarnos:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> privacy@tuapp.com</li>
                            <li><strong>Formulario de contacto:</strong> Disponible en la aplicación</li>
                        </ul>
                    </section>

                    <section>
                        <h2>13. Información Específica por Región</h2>

                        <h3>13.1 Usuarios de la Unión Europea (GDPR)</h3>
                        <p>
                            Si resides en la UE, tienes derechos adicionales bajo el GDPR, incluyendo el derecho
                            a presentar una queja ante tu autoridad de protección de datos local.
                        </p>

                        <h3>13.2 Usuarios de California (CCPA)</h3>
                        <p>
                            Los residentes de California tienen derechos adicionales bajo la CCPA, incluyendo el
                            derecho a saber qué información recopilamos y cómo la usamos.
                        </p>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>
                        Al usar nuestro servicio, aceptas esta Política de Privacidad y el procesamiento
                        de tu información según lo descrito aquí.
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
}

export default PrivacyPolicy;
