# Guía de Despliegue en Vercel - Frontend

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio Git con el código
- Variables de entorno configuradas

## 🚀 Pasos para Desplegar

### 1. Preparar el Proyecto

Asegúrate de que todos los archivos de configuración estén en su lugar:

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `public/_redirects` - Redirects para SPA routing
- ✅ `.env.example` - Template de variables de entorno

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, configura las siguientes variables de entorno:

```env
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset

# Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=tu_turnstile_site_key

# reCAPTCHA (App Check)
VITE_RECAPTCHA_SITE_KEY=tu_recaptcha_site_key

# NSFW Detection Thresholds
VITE_NSFW_PORN_THRESHOLD=60
VITE_NSFW_HENTAI_THRESHOLD=60
VITE_NSFW_SEXY_THRESHOLD=80
```

### 3. Desplegar desde Vercel Dashboard

#### Opción A: Importar desde GitHub

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New Project"
3. Selecciona tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Agrega las variables de entorno
6. Click en "Deploy"

#### Opción B: Desplegar desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Navegar al directorio del cliente
cd client

# Login en Vercel
vercel login

# Desplegar (primera vez)
vercel

# Desplegar a producción
vercel --prod
```

### 4. Configuración Post-Despliegue

#### Configurar Dominio Personalizado (Opcional)

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

#### Configurar CORS en Firebase

Asegúrate de que tu dominio de Vercel esté autorizado en Firebase:

1. Firebase Console → Authentication → Settings
2. Agrega tu dominio de Vercel a "Authorized domains"

## 📁 Estructura de Archivos de Configuración

```
client/
├── vercel.json          # Configuración de Vercel
├── public/
│   └── _redirects       # Redirects para SPA
├── .env.example         # Template de variables
└── package.json         # Scripts de build
```

## 🔧 Archivos de Configuración

### vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Propósito**: Redirige todas las rutas a `index.html` para que React Router funcione correctamente.

### public/_redirects

```
/* /index.html 200
```

**Propósito**: Fallback para asegurar que todas las rutas funcionen como SPA.

## 🧪 Verificar el Despliegue

Después del despliegue, verifica que todo funcione:

- ✅ Página principal carga correctamente
- ✅ Rutas de React Router funcionan (ej: `/feed`, `/profile`, `/terms`)
- ✅ Autenticación con Firebase funciona
- ✅ Subida de imágenes a Cloudinary funciona
- ✅ NSFW detection funciona
- ✅ Turnstile se muestra correctamente

## 🔄 Despliegues Automáticos

Vercel desplegará automáticamente:

- **Producción**: Cuando hagas push a la rama `main`
- **Preview**: Para cada pull request

## 📊 Monitoreo

Vercel proporciona:

- Analytics de rendimiento
- Logs en tiempo real
- Métricas de uso
- Error tracking

## 🐛 Troubleshooting

### Error: "Page not found" en rutas

**Solución**: Verifica que `vercel.json` y `_redirects` estén configurados correctamente.

### Error: Variables de entorno no definidas

**Solución**: 
1. Verifica que todas las variables estén en Vercel Dashboard
2. Redeploy el proyecto después de agregar variables

### Error: Firebase no conecta

**Solución**:
1. Verifica que el dominio de Vercel esté en Firebase Authorized Domains
2. Verifica las variables de entorno de Firebase

### Error: Build falla

**Solución**:
1. Verifica que `package.json` tenga el script `build`
2. Asegúrate de que todas las dependencias estén en `package.json`
3. Revisa los logs de build en Vercel

## 📝 Comandos Útiles

```bash
# Build local para probar
npm run build

# Preview del build
npm run preview

# Limpiar caché de Vercel
vercel --force

# Ver logs de producción
vercel logs
```

## 🔐 Seguridad

- ✅ Nunca commitees archivos `.env` al repositorio
- ✅ Usa variables de entorno en Vercel para datos sensibles
- ✅ Configura CORS correctamente en Firebase
- ✅ Habilita HTTPS (Vercel lo hace automáticamente)

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

---

**Última actualización**: 28 de noviembre de 2025
