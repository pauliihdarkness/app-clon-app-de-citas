# Resumen de la Aplicación - App de Citas

## 📋 Descripción General

Esta es una **aplicación de citas tipo Tinder** construida con React + Vite, que incluye funcionalidades de matching, chat en tiempo real, perfiles de usuario, y notificaciones push.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.0** - Framework principal
- **Vite 7.2.2** - Build tool y dev server
- **React Router DOM 7.9.6** - Navegación y rutas
- **Lucide React** - Iconos

### Backend/Servicios
- **Firebase 12.6.0** - Autenticación, Firestore, Storage, FCM
- **Socket.io Client 4.8.1** - Chat en tiempo real
- **Axios 1.13.2** - Peticiones HTTP

### Características Especiales
- **TensorFlow.js 4.22.0** - Machine Learning
- **NSFWJS 4.2.1** - Detección de contenido inapropiado
- **React Easy Crop 5.5.3** - Recorte de imágenes
- **React Swipeable 7.0.2** - Gestos de swipe
- **Browser Image Compression 2.0.2** - Optimización de imágenes
- **Localforage 1.10.0** - Almacenamiento local

---

## 📁 Estructura de Carpetas

```
client/
├── public/                    # Archivos estáticos
├── src/
│   ├── api/                   # Llamadas a APIs
│   │   ├── firebase/          # APIs específicas de Firebase
│   │   │   └── feed.js
│   │   ├── auth.js            # Autenticación
│   │   ├── axios.js           # Configuración de Axios
│   │   ├── cloudinary.js      # Integración con Cloudinary
│   │   ├── firebase.js        # Configuración de Firebase
│   │   ├── likes.js           # Sistema de likes
│   │   ├── matches.js         # Sistema de matches
│   │   ├── messages.js        # Mensajería
│   │   ├── privateData.js     # Datos privados
│   │   ├── reports.js         # Reportes de usuarios
│   │   └── user.js            # Gestión de usuarios
│   │
│   ├── assets/                # Recursos estáticos
│   │   ├── data/              # Datos estáticos
│   │   ├── icons/             # Iconos
│   │   ├── images/            # Imágenes
│   │   └── styles/            # Estilos CSS
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── Auth/              # Componentes de autenticación
│   │   ├── Chat/              # Componentes de chat
│   │   │   └── MessageBubble.jsx
│   │   ├── FCM/               # Firebase Cloud Messaging
│   │   │   └── FCMInitializer.jsx
│   │   ├── Feed/              # Componentes del feed
│   │   │   └── UserCard.jsx
│   │   ├── Layout/            # Layouts y estructura
│   │   │   ├── BaseLayout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SplashScreen.jsx
│   │   ├── MatchModal/        # Modal de match
│   │   │   └── MatchModal.jsx
│   │   ├── Navigation/        # Navegación
│   │   │   └── TabNavigation.jsx
│   │   ├── PWA/               # Progressive Web App
│   │   │   └── InstallPrompt.jsx
│   │   ├── Profile/           # Componentes de perfil
│   │   │   ├── LocationSelector/
│   │   │   │   └── LocationSelector.jsx
│   │   │   └── UpdateMultipleImagesWithCrop/
│   │   │       └── UpdateMultipleImagesWithCrop.jsx
│   │   └── UI/                # Componentes UI genéricos
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal/
│   │       │   └── Modal.jsx
│   │       ├── NSFWA/
│   │       │   └── NSFWAnalysisModal.jsx
│   │       ├── SkeletonCard.jsx
│   │       ├── TextArea.jsx
│   │       └── Toast.jsx
│   │
│   ├── context/               # Context API para estado global
│   │   ├── AuthContext.jsx    # Autenticación
│   │   ├── FeedContext.jsx    # Feed de usuarios
│   │   ├── NotificationContext.jsx  # Notificaciones
│   │   ├── ToastContext.jsx   # Mensajes toast
│   │   └── UserProfilesContext.jsx  # Perfiles de usuarios
│   │
│   ├── examples/              # Ejemplos de código
│   │
│   ├── helpers/               # Funciones auxiliares
│   │
│   ├── hooks/                 # Custom React Hooks
│   │
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── dev/               # Páginas de desarrollo
│   │   │   └── TurnstileTest.jsx
│   │   ├── profile/           # Páginas de perfil
│   │   │   ├── AccountInfo.jsx
│   │   │   ├── CreateProfile.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   └── Settings.jsx
│   │   ├── public/            # Páginas públicas
│   │   │   ├── legal/         # Páginas legales
│   │   │   │   ├── CommunityGuidelines.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   ├── CookiePolicy.jsx
│   │   │   │   ├── FAQ.jsx
│   │   │   │   ├── PrivacyPolicy.jsx
│   │   │   │   └── TermsOfService.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── Register.jsx
│   │   └── social/            # Páginas sociales
│   │       ├── Chat.jsx
│   │       ├── Feed.jsx
│   │       ├── MatchesList.jsx
│   │       └── NotificationsHistory.jsx
│   │
│   ├── services/              # Servicios
│   │   └── keepAlive.js       # Keep alive service
│   │
│   ├── utils/                 # Utilidades
│   │
│   ├── AppRouter.jsx          # Configuración de rutas
│   └── main.jsx               # Punto de entrada
│
├── .env                       # Variables de entorno
├── .env.example               # Ejemplo de variables de entorno
├── firestore.rules            # Reglas de seguridad de Firestore
├── index.html                 # HTML principal
├── netlify.toml               # Configuración de Netlify
├── vercel.json                # Configuración de Vercel
├── vite.config.js             # Configuración de Vite
└── package.json               # Dependencias
```

---

## 🗺️ Rutas de la Aplicación

### 🌐 Rutas Públicas (Sin autenticación)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home` | Página de inicio (redirige a `/feed` si está autenticado) |
| `/login` | `Login` | Inicio de sesión |
| `/register` | `Register` | Registro de usuario |
| `/terms` | `TermsOfService` | Términos de servicio |
| `/privacy-policy` | `PrivacyPolicy` | Política de privacidad |
| `/cookie-policy` | `CookiePolicy` | Política de cookies |
| `/community-guidelines` | `CommunityGuidelines` | Guías de la comunidad |
| `/faq` | `FAQ` | Preguntas frecuentes |
| `/contact` | `Contact` | Contacto |
| `/test-turnstile` | `TurnstileTest` | Test de Turnstile (desarrollo) |

### 🔒 Rutas Protegidas (Requieren autenticación)

#### Feed y Descubrimiento
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/feed` | `Feed` | Feed principal de usuarios para hacer match |

#### Perfil
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/profile` | `Profile` | Perfil del usuario actual |
| `/profile/edit` | `EditProfile` | Editar perfil |
| `/create-profile` | `CreateProfile` | Crear perfil inicial |
| `/user/:userId` | `PublicProfile` | Ver perfil público de otro usuario |
| `/settings` | `Settings` | Configuración de la cuenta |
| `/account-info` | `AccountInfo` | Información de la cuenta |

#### Social y Mensajería
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/chat` | `MatchesList` | Lista de matches/conversaciones |
| `/chat/:matchId` | `Chat` | Chat individual con un match |
| `/notifications` | `NotificationsHistory` | Historial de notificaciones |

### 🚫 Ruta de Error
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `*` | `NotFound` | Página 404 - No encontrada |

---

## 🔑 Funcionalidades Principales

### 1. **Autenticación**
- Registro e inicio de sesión con Firebase Auth
- Rutas protegidas con `ProtectedRoute`
- Gestión de sesión con `AuthContext`

### 2. **Sistema de Matching**
- Feed de usuarios con sistema de swipe
- Likes y dislikes
- Detección de matches mutuos
- Modal de celebración de match

### 3. **Chat en Tiempo Real**
- Mensajería instantánea con Socket.io
- Burbujas de mensajes
- Lista de conversaciones activas

### 4. **Perfiles de Usuario**
- Creación y edición de perfil
- Subida de múltiples imágenes con recorte
- Selector de ubicación
- Perfiles públicos y privados

### 5. **Notificaciones**
- Firebase Cloud Messaging (FCM)
- Notificaciones push
- Historial de notificaciones
- Sistema de toast para mensajes en la app

### 6. **Seguridad y Moderación**
- Detección de contenido NSFW con TensorFlow.js
- Sistema de reportes
- Reglas de seguridad de Firestore
- Validación de imágenes

### 7. **PWA (Progressive Web App)**
- Instalable en dispositivos
- Prompt de instalación
- Funciona offline (parcialmente)

### 8. **Optimizaciones**
- Lazy loading de páginas
- Compresión de imágenes
- Skeleton loaders
- Almacenamiento local con Localforage

---

## 🎨 Contextos Globales

| Context | Propósito |
|---------|-----------|
| `AuthContext` | Gestión de autenticación y usuario actual |
| `FeedContext` | Estado del feed de usuarios y filtros |
| `NotificationContext` | Gestión de notificaciones |
| `ToastContext` | Mensajes toast/alertas |
| `UserProfilesContext` | Caché de perfiles de usuarios |

---

## 🚀 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Linting con ESLint
npm run preview  # Preview del build
```

---

## 📦 Deployment

La aplicación está configurada para desplegarse en:
- **Netlify** (ver `netlify.toml`)
- **Vercel** (ver `vercel.json`)

Ver `DEPLOYMENT.md` para instrucciones detalladas de despliegue.

---

## 🔐 Variables de Entorno

Ver `.env.example` para las variables de entorno necesarias (Firebase config, Cloudinary, etc.)
