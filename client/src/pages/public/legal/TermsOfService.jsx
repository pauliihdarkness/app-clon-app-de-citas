import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Volver
                </button>

                <h1>Términos y Condiciones</h1>
                <p className="last-updated">Última actualización: 28 de noviembre de 2025</p>

                <div className="legal-content">
                    <section>
                        <h2>1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar esta aplicación de citas, aceptas estar sujeto a estos Términos y Condiciones,
                            todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de
                            todas las leyes locales aplicables.
                        </p>
                    </section>

                    <section>
                        <h2>2. Elegibilidad</h2>
                        <p>Debes cumplir con los siguientes requisitos para usar nuestro servicio:</p>
                        <ul>
                            <li>Tener al menos 18 años de edad</li>
                            <li>Tener capacidad legal para celebrar un contrato vinculante</li>
                            <li>No estar prohibido de usar el servicio según las leyes aplicables</li>
                            <li>No haber sido previamente suspendido o eliminado de la plataforma</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Cuenta de Usuario</h2>
                        <h3>3.1 Registro</h3>
                        <p>
                            Para usar nuestro servicio, debes crear una cuenta proporcionando información precisa,
                            actual y completa. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
                        </p>

                        <h3>3.2 Responsabilidad de la Cuenta</h3>
                        <p>
                            Eres responsable de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos
                            inmediatamente sobre cualquier uso no autorizado de tu cuenta.
                        </p>

                        <h3>3.3 Información Veraz</h3>
                        <p>
                            Te comprometes a proporcionar información veraz y actualizada en tu perfil. La falsificación
                            de identidad o información puede resultar en la suspensión o eliminación de tu cuenta.
                        </p>
                    </section>

                    <section>
                        <h2>4. Uso Aceptable</h2>
                        <h3>4.1 Conducta Permitida</h3>
                        <p>Te comprometes a usar el servicio de manera respetuosa y legal. Está permitido:</p>
                        <ul>
                            <li>Crear un perfil auténtico con información veraz</li>
                            <li>Interactuar respetuosamente con otros usuarios</li>
                            <li>Reportar comportamientos inapropiados</li>
                            <li>Usar las funciones de la app según lo previsto</li>
                        </ul>

                        <h3>4.2 Conducta Prohibida</h3>
                        <p>Está estrictamente prohibido:</p>
                        <ul>
                            <li>Acosar, intimidar o amenazar a otros usuarios</li>
                            <li>Publicar contenido ofensivo, obsceno o ilegal</li>
                            <li>Suplantar la identidad de otra persona</li>
                            <li>Usar la plataforma con fines comerciales sin autorización</li>
                            <li>Enviar spam o contenido no solicitado</li>
                            <li>Intentar acceder a cuentas de otros usuarios</li>
                            <li>Usar bots o automatización no autorizada</li>
                            <li>Compartir contenido sexual explícito no consensuado</li>
                            <li>Solicitar dinero o información financiera</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Contenido del Usuario</h2>
                        <h3>5.1 Propiedad del Contenido</h3>
                        <p>
                            Mantienes todos los derechos sobre el contenido que publicas. Sin embargo, nos otorgas
                            una licencia mundial, no exclusiva, libre de regalías para usar, almacenar, mostrar y
                            distribuir tu contenido en relación con el servicio.
                        </p>

                        <h3>5.2 Moderación de Contenido</h3>
                        <p>
                            Nos reservamos el derecho de revisar, moderar y eliminar contenido que viole estos términos.
                            Utilizamos sistemas automatizados y revisión manual para detectar contenido inapropiado.
                        </p>

                        <h3>5.3 Contenido de Fotos</h3>
                        <p>Las fotos de perfil deben cumplir con las siguientes reglas:</p>
                        <ul>
                            <li>Mostrar claramente tu rostro</li>
                            <li>Ser apropiadas y no contener desnudez</li>
                            <li>No incluir menores de edad</li>
                            <li>No contener marcas de agua o promociones</li>
                            <li>Ser de tu propiedad o tener permiso para usarlas</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Privacidad y Datos</h2>
                        <p>
                            El uso de tu información personal se rige por nuestra Política de Privacidad.
                            Al usar el servicio, aceptas la recopilación y uso de información según lo descrito en dicha política.
                        </p>
                    </section>

                    <section>
                        <h2>7. Seguridad</h2>
                        <h3>7.1 Seguridad en Línea</h3>
                        <p>Recomendaciones de seguridad:</p>
                        <ul>
                            <li>No compartas información personal sensible (dirección, datos financieros)</li>
                            <li>Reporta comportamientos sospechosos inmediatamente</li>
                            <li>Usa las funciones de bloqueo y reporte cuando sea necesario</li>
                            <li>Ten precaución al conocer personas en persona</li>
                        </ul>

                        <h3>7.2 Encuentros en Persona</h3>
                        <p>Si decides conocer a alguien en persona:</p>
                        <ul>
                            <li>Informa a un amigo o familiar sobre tus planes</li>
                            <li>Reúnete en un lugar público</li>
                            <li>Mantén tu propio transporte</li>
                            <li>Confía en tus instintos</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Suscripciones y Pagos</h2>
                        <h3>8.1 Servicios Gratuitos y Premium</h3>
                        <p>
                            Ofrecemos servicios gratuitos y de pago. Los servicios premium pueden incluir
                            funciones adicionales como likes ilimitados, ver quién te ha dado like, y otras características.
                        </p>

                        <h3>8.2 Facturación</h3>
                        <p>
                            Las suscripciones se renuevan automáticamente a menos que las canceles. Los precios
                            pueden cambiar con previo aviso. No ofrecemos reembolsos excepto cuando lo requiera la ley.
                        </p>
                    </section>

                    <section>
                        <h2>9. Suspensión y Terminación</h2>
                        <h3>9.1 Por Nuestra Parte</h3>
                        <p>
                            Podemos suspender o terminar tu cuenta en cualquier momento por violación de estos términos,
                            actividad sospechosa, o a nuestra discreción.
                        </p>

                        <h3>9.2 Por Tu Parte</h3>
                        <p>
                            Puedes eliminar tu cuenta en cualquier momento desde la configuración. La eliminación
                            es permanente y no se puede deshacer.
                        </p>
                    </section>

                    <section>
                        <h2>10. Limitación de Responsabilidad</h2>
                        <p>
                            El servicio se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de:
                        </p>
                        <ul>
                            <li>La conducta de otros usuarios dentro o fuera de la plataforma</li>
                            <li>Daños resultantes del uso o incapacidad de usar el servicio</li>
                            <li>La precisión o confiabilidad del contenido del usuario</li>
                            <li>Pérdida de datos o interrupciones del servicio</li>
                        </ul>
                    </section>

                    <section>
                        <h2>11. Propiedad Intelectual</h2>
                        <p>
                            Todos los derechos de propiedad intelectual en el servicio y su contenido original
                            (excluyendo el contenido del usuario) son propiedad nuestra o de nuestros licenciantes.
                        </p>
                    </section>

                    <section>
                        <h2>12. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                            significativos se notificarán a través de la aplicación o por correo electrónico.
                            El uso continuado del servicio después de los cambios constituye tu aceptación.
                        </p>
                    </section>

                    <section>
                        <h2>13. Ley Aplicable</h2>
                        <p>
                            Estos términos se rigen por las leyes aplicables en tu jurisdicción. Cualquier disputa
                            se resolverá en los tribunales competentes.
                        </p>
                    </section>

                    <section>
                        <h2>14. Contacto</h2>
                        <p>
                            Si tienes preguntas sobre estos términos, puedes contactarnos a través de la
                            sección de Contacto en la aplicación o enviando un correo electrónico a:
                            <strong> legal@tuapp.com</strong>
                        </p>
                    </section>

                    <section>
                        <h2>15. Disposiciones Generales</h2>
                        <p>
                            Si alguna disposición de estos términos se considera inválida, las disposiciones
                            restantes permanecerán en pleno vigor y efecto. Nuestro fracaso en hacer cumplir
                            cualquier derecho no constituye una renuncia a ese derecho.
                        </p>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>Al usar nuestro servicio, confirmas que has leído y aceptado estos Términos y Condiciones.</p>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;
