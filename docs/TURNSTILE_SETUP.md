# Configuración de Cloudflare Turnstile

Esta guía te ayudará a configurar Cloudflare Turnstile en tu aplicación para protegerla contra bots y solicitudes automatizadas.

## ¿Qué es Cloudflare Turnstile?

Cloudflare Turnstile es una alternativa gratuita y amigable a reCAPTCHA que:
- ✅ Es completamente **gratuito** sin límites
- ✅ Ofrece mejor **experiencia de usuario** (menos intrusivo)
- ✅ Respeta la **privacidad** del usuario
- ✅ Es **fácil de integrar**

## Paso 1: Obtener Credenciales de Turnstile

### 1.1 Crear cuenta en Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Crea una cuenta gratuita si no tienes una
3. Inicia sesión en tu cuenta

### 1.2 Configurar Turnstile

1. En el dashboard, busca **"Turnstile"** en el menú lateral
2. Haz clic en **"Add Site"** o **"Crear sitio"**
3. Completa el formulario:
   - **Site name**: Nombre descriptivo (ej: "Mi App de Citas")
   - **Domain**: Tu dominio (ej: `app-didactica.netlify.app`)
     - Para desarrollo local, agrega: `localhost`
   - **Widget Mode**: Selecciona **"Managed"** (recomendado)
4. Haz clic en **"Create"**

### 1.3 Copiar las Credenciales

Después de crear el sitio, verás dos claves:

- **Site Key** (Clave pública): Se usa en el cliente (frontend)
- **Secret Key** (Clave secreta): Se usa en el servidor (backend)

⚠️ **IMPORTANTE**: Nunca compartas tu Secret Key públicamente.

## Paso 2: Configurar Variables de Entorno

### 2.1 Cliente (Frontend)

Edita tu archivo `.env` en `client/`:

```env
# Cloudflare Turnstile Configuration
VITE_TURNSTILE_SITE_KEY=tu_site_key_aqui
```

### 2.2 Servidor (Backend)

Edita tu archivo `.env` en `server/`:

```env
# Cloudflare Turnstile Configuration
TURNSTILE_SECRET_KEY=tu_secret_key_aqui
```

## Paso 3: Uso en el Cliente

### Ejemplo: Agregar Turnstile a un Formulario de Login

```javascript
import { renderTurnstile, getTurnstileToken } from '../utils/turnstile.js';

// En tu componente de login
let turnstileWidgetId;

// Renderizar el widget cuando se carga la página
async function initTurnstile() {
    try {
        turnstileWidgetId = await renderTurnstile('turnstile-container', {
            theme: 'light',
            size: 'normal',
            callback: (token) => {
                console.log('✅ Turnstile completado:', token);
            }
        });
    } catch (error) {
        console.error('Error al cargar Turnstile:', error);
    }
}

// Llamar al inicializar
initTurnstile();

// Al enviar el formulario
async function handleLogin(e) {
    e.preventDefault();
    
    // Obtener el token de Turnstile
    const turnstileToken = getTurnstileToken(turnstileWidgetId);
    
    if (!turnstileToken) {
        alert('Por favor completa la verificación');
        return;
    }
    
    // Enviar al servidor con el token
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value,
            turnstileToken: turnstileToken
        })
    });
    
    // Manejar respuesta...
}
```

### HTML necesario:

```html
<form id="login-form">
    <input type="email" id="email" required>
    <input type="password" id="password" required>
    
    <!-- Contenedor para el widget de Turnstile -->
    <div id="turnstile-container"></div>
    
    <button type="submit">Iniciar Sesión</button>
</form>
```

## Paso 4: Verificación en el Servidor

### Ejemplo: Proteger una Ruta

```javascript
import { verifyTurnstile } from './middleware/turnstile.js';

// Aplicar middleware a rutas específicas
app.post('/api/login', verifyTurnstile, async (req, res) => {
    // Si llegamos aquí, el token de Turnstile es válido
    const { email, password } = req.body;
    
    // Procesar login...
    res.json({ success: true });
});
```

## Paso 5: Testing

### Desarrollo Local

1. Asegúrate de que `localhost` esté en la lista de dominios permitidos en Cloudflare
2. Inicia tu servidor: `npm start`
3. Inicia tu cliente: `npm run dev`
4. Abre `http://localhost:5173` y prueba el widget

### Producción

1. Asegúrate de que tu dominio de producción esté en la lista de Cloudflare
2. Configura las variables de entorno en tu plataforma de hosting
3. Despliega y prueba

## Troubleshooting

### El widget no se muestra

- ✅ Verifica que `VITE_TURNSTILE_SITE_KEY` esté configurado
- ✅ Revisa la consola del navegador para errores
- ✅ Confirma que el dominio esté permitido en Cloudflare

### Error 403 en verificación

- ✅ Verifica que `TURNSTILE_SECRET_KEY` esté configurado en el servidor
- ✅ Confirma que el token no haya expirado (válido por 5 minutos)
- ✅ Revisa los logs del servidor para más detalles

### Widget en modo "Challenge"

- ✅ Esto es normal para IPs sospechosas o VPNs
- ✅ El usuario deberá completar un desafío simple
- ✅ Considera usar modo "Invisible" en configuración de Cloudflare

## Recursos Adicionales

- [Documentación Oficial de Turnstile](https://developers.cloudflare.com/turnstile/)
- [API Reference](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Dashboard de Cloudflare](https://dash.cloudflare.com/)

## Diferencias con Firebase App Check

| Característica | Firebase App Check | Cloudflare Turnstile |
|----------------|-------------------|----------------------|
| **Costo** | Gratis | Gratis |
| **UX** | Invisible (reCAPTCHA v3) | Menos intrusivo |
| **Privacidad** | Tracking de Google | Más privado |
| **Configuración** | Compleja | Simple |
| **Dependencias** | Firebase SDK | Script standalone |

---

¿Necesitas ayuda? Revisa los logs del navegador y del servidor para más información sobre errores.
