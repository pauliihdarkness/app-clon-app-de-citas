# 💖 App de Citas - Dating Application

Una aplicación de citas moderna tipo Tinder construida con React + Vite, con funcionalidades de matching, chat en tiempo real, y notificaciones push.

## 🚀 Características Principales

- ✨ **Sistema de Matching** - Swipe para dar like/dislike a perfiles
- 💬 **Chat en Tiempo Real** - Mensajería instantánea con Socket.io
- 🔔 **Notificaciones Push** - Firebase Cloud Messaging (FCM)
- 📸 **Gestión de Perfiles** - Subida y recorte de múltiples imágenes
- 🛡️ **Moderación de Contenido** - Detección automática de contenido NSFW con TensorFlow.js
- 📱 **PWA** - Instalable como aplicación nativa
- 🌍 **Geolocalización** - Selector de ubicación para matches cercanos
- 🔐 **Autenticación Segura** - Firebase Authentication

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.0** - Framework UI
- **Vite 7.2.2** - Build tool y dev server
- **React Router DOM 7.9.6** - Navegación SPA
- **Lucide React** - Iconos modernos

### Backend & Servicios
- **Firebase 12.6.0** - Auth, Firestore, Storage, FCM
- **Socket.io Client 4.8.1** - WebSockets para chat
- **Axios 1.13.2** - Cliente HTTP

### Características Especiales
- **TensorFlow.js + NSFWJS** - Detección de contenido inapropiado
- **React Easy Crop** - Recorte de imágenes
- **React Swipeable** - Gestos táctiles
- **Browser Image Compression** - Optimización de imágenes
- **Localforage** - Almacenamiento local persistente

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Navegar al directorio
cd client

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase, Cloudinary, etc.

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo en http://localhost:5173
npm run build    # Build de producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecutar ESLint
```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Llamadas a APIs (Firebase, Cloudinary, etc.)
├── assets/           # Recursos estáticos (imágenes, estilos, iconos)
├── components/       # Componentes reutilizables
│   ├── Auth/         # Componentes de autenticación
│   ├── Chat/         # Componentes de mensajería
│   ├── Feed/         # Componentes del feed
│   ├── Layout/       # Layouts y estructura
│   ├── Profile/      # Componentes de perfil
│   └── UI/           # Componentes UI genéricos
├── context/          # Context API (Auth, Feed, Notifications, etc.)
├── hooks/            # Custom React Hooks
├── pages/            # Páginas de la aplicación
│   ├── public/       # Páginas públicas (Home, Login, Register)
│   ├── profile/      # Páginas de perfil
│   └── social/       # Páginas sociales (Feed, Chat, Matches)
├── services/         # Servicios y utilidades
├── utils/            # Funciones auxiliares
├── AppRouter.jsx     # Configuración de rutas
└── main.jsx          # Punto de entrada
```

## 🗺️ Rutas Principales

### Públicas
- `/` - Página de inicio
- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/terms`, `/privacy-policy`, `/faq` - Páginas legales

### Protegidas (requieren autenticación)
- `/feed` - Feed principal de usuarios
- `/profile` - Perfil del usuario
- `/profile/edit` - Editar perfil
- `/chat` - Lista de matches
- `/chat/:matchId` - Chat individual
- `/notifications` - Historial de notificaciones

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=

# Cloudinary (para subida de imágenes)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# Otros servicios
VITE_SOCKET_URL=
```

Ver `.env.example` para más detalles.

## 📱 PWA - Progressive Web App

La aplicación es instalable como PWA:
- Funciona offline (parcialmente)
- Notificaciones push
- Instalable en dispositivos móviles y desktop
- Manifest configurado en `index.html`

## 🛡️ Seguridad

- **Firestore Rules** - Reglas de seguridad configuradas en `firestore.rules`
- **Detección NSFW** - Análisis automático de imágenes con TensorFlow.js
- **Sistema de Reportes** - Los usuarios pueden reportar contenido inapropiado
- **Autenticación** - Rutas protegidas con Firebase Auth

## 📦 Deployment

La aplicación está lista para desplegarse en:
- **Netlify** - Configuración en `netlify.toml`
- **Vercel** - Configuración en `vercel.json`

Ver `DEPLOYMENT.md` para instrucciones detalladas.

## 📚 Documentación Adicional

- [RESUMEN_APLICACION.md](./RESUMEN_APLICACION.md) - Documentación completa de la aplicación
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Soporte

Para preguntas o soporte, contacta a través de la página `/contact` de la aplicación.

---

Hecho con ❤️ usando React + Vite
