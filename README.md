# 🔥 App de Citas - Dating App

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-Purple?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12-Orange?style=for-the-badge&logo=firebase)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Blue?style=for-the-badge&logo=cloudinary)

Una aplicación moderna de citas y conexiones sociales construida con React y Firebase, diseñada con un enfoque **Mobile First** y una estética **Glassmorphism** premium.

## ✨ Características Implementadas

### 🔐 Autenticación Completa
- ✅ Registro con Email/Password
- ✅ Registro con Google OAuth
- ✅ Login con Email/Password
- ✅ Login con Google OAuth
- ✅ Gestión de sesiones con Firebase Auth
- ✅ Rutas protegidas con `ProtectedRoute`
- ✅ Redirección inteligente según estado de autenticación

### 👤 Gestión de Perfiles Avanzada
- ✅ **Creación de Perfil Inicial**: Wizard completo con validaciones
- ✅ **Edición Modal**: Sistema de modales para editar por secciones
  - Información Básica (nombre, género, orientación, ubicación)
  - Biografía (máx 500 caracteres con contador)
  - Intereses (máx 8, organizados por categorías con emojis)
  - Estilo de Vida (bebida, tabaco, ejercicio, zodiaco, altura)
  - Información Profesional (ocupación, empresa, educación)
  - Intenciones (qué busco)
- ✅ **Galería de Fotos**: Subida de hasta 9 fotos con:
  - Crop interactivo con `react-easy-crop`
  - Optimización automática en Cloudinary
  - Actualización inmediata en Firestore
- ✅ **Sistema de Edad Inteligente**:
  - Fecha de nacimiento almacenada de forma segura
  - Edad calculada automáticamente
  - No editable después del registro (seguridad)
- ✅ **Visualización de Perfil**: Carrusel de fotos con gestos táctiles

### 🔥 Feed y Descubrimiento (Optimizado)
- ✅ **Batch Loading**: Carga de perfiles en lotes de 15-25 usuarios
- ✅ **Caché Local**: Sistema de caché con Map + IndexedDB (localforage)
- ✅ **Prefetch Inteligente**: Carga anticipada cuando quedan < 5 perfiles
- ✅ **Queries Optimizadas**: Uso de `getDocs` con paginación (`startAfter`)
- ✅ **UserCard Component**: Diseño glassmorphism con foto, info y tags
- ✅ **Navegación**: Botones Like (💚) y Pass (❌)
- ✅ **Filtrado Inteligente**: Usuarios ya vistos no se repiten
- ✅ **Estado Vacío**: Mensaje "Estás al día" cuando no hay más usuarios

### ❤️ Sistema de Likes y Matches
- ✅ **Registro de Likes**: Guardado en Firestore con timestamp
- ✅ **Registro de Passes**: Sistema de dislikes persistente
- ✅ **Detección Automática de Matches**: Worker en backend (Node.js)
- ✅ **Notificación de Match en Tiempo Real**: Listener con `onSnapshot`
- ✅ **Overlay Animado**: Celebración visual cuando hay match
- ✅ **Colecciones Firestore**: `likes` y `matches` implementadas
- ✅ **Índices Compuestos**: Queries optimizadas para matches rápidos

### 🎨 UI/UX Premium
- ✅ **Diseño Glassmorphism**: Transparencias, desenfoques y gradientes modernos
- ✅ **Navegación por Tabs**: Acceso rápido a Feed, Matches, Chat y Perfil
- ✅ **Header Dinámico**: Título y acciones cambian según la página
- ✅ **Gestos Táctiles**: Swipe en carrusel de fotos
- ✅ **Animaciones Suaves**: Transiciones y micro-interacciones
- ✅ **Responsive**: Optimizado para móvil, tablet y escritorio
- ✅ **Página de Settings**: Configuración centralizada con navegación clara
- ✅ **Información de Cuenta**: Visualización de datos privados (email, fecha de nacimiento)

### 💬 Chat y Mensajería (Nuevo)
- ✅ **Chat en Tiempo Real**: Mensajería instantánea con Socket.IO
- ✅ **UI de Chat Premium**: Diseño full-screen sin distracciones
- ✅ **Navegación Fluida**: Acceso directo a perfiles desde el chat
- ✅ **Lista de Matches**: Vista moderna con badges de mensajes no leídos
- ✅ **Timestamps Inteligentes**: Formato relativo para mejor lectura
- ✅ **Indicadores de Estado**: Visualización de estado online/offline

### 🔒 Seguridad y Privacidad
- ✅ **Separación de Datos**: Públicos vs Privados en Firestore
- ✅ **Fecha de Nacimiento Protegida**: Almacenada en subcolección privada
- ✅ **Validaciones Robustas**: Edad mínima 18 años, formatos de datos
- ✅ **Reglas de Firestore**: Protección completa para users, likes y matches
- ✅ **Variables de Entorno**: Credenciales sensibles fuera del código
- ✅ **Cloudflare Turnstile**: Protección contra bots en registro y login
- ✅ **Helmet + CSP**: Prevención de XSS y configuración de seguridad HTTP
- ✅ **Moderación NSFW**: Detección automática de contenido inapropiado con nsfwjs
- ✅ **Compresión de Imágenes**: Optimización automática antes de subir (max 1MB)

### 📍 Geolocalización
- ✅ Selector de ubicación con autocompletado
- ✅ Integración con API de geocodificación
- ✅ Almacenamiento de país, estado y ciudad

### 📄 Páginas Legales
- ✅ **Términos y Condiciones**: 15 secciones completas
- ✅ **Política de Privacidad**: 13 secciones + GDPR/CCPA
- ✅ **Política de Cookies**: Con tabla detallada de cookies
- ✅ **Guía de Comunidad**: Grid visual de valores y reglas
- ✅ **FAQ**: 40+ preguntas con acordeón interactivo
- ✅ **Contacto**: Formulario funcional + información de contacto
- ✅ **Diseño Consistente**: Tema oscuro coherente con la app

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2** - Biblioteca de UI con Hooks
- **Vite 7.2** - Build tool ultrarrápido
- **React Router DOM 7.9** - Navegación SPA
- **Firebase 12.6** - Authentication y Firestore
- **CSS3 Moderno** - Variables, Flexbox, Grid, Glassmorphism

### Backend
- **Node.js 20+** - Runtime de JavaScript
- **Express 5.1** - Framework web minimalista
- **Firebase Admin SDK 13.6** - Operaciones privilegiadas en Firestore
- **Helmet 8.1** - Seguridad HTTP (CSP, XSS protection)
- **Cloudinary** - Almacenamiento y optimización de imágenes

### Seguridad y Utilidades
- **Cloudflare Turnstile** - Protección contra bots
- **nsfwjs 4.2** + **TensorFlow.js 4.22** - Detección de contenido NSFW
- **browser-image-compression 2.0** - Compresión de imágenes en cliente
- **react-easy-crop 5.5** - Recorte de imágenes interactivo
- **localforage 1.10** - Caché persistente con IndexedDB
- **axios 1.13** - Cliente HTTP
- **cors 2.8** - Middleware de seguridad CORS
- **dotenv 17.2** - Gestión de variables de entorno

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js v16 o superior
- NPM o Yarn
- Cuenta de Firebase
- Cuenta de Cloudinary

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/app-de-citas.git
   cd app-de-citas
   ```

2. **Instalar dependencias del cliente**
   ```bash
   cd client
   npm install
   ```

3. **Instalar dependencias del servidor**
   ```bash
   cd ../server
   npm install
   ```

4. **Configurar Variables de Entorno del Cliente**
   
   Crea un archivo `.env` en la carpeta `client`:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
   - Descargar Service Account Key (Project Settings > Service Accounts)
   - Copiar credenciales a los archivos `.env` correspondientes
   - Desplegar índices: `firebase deploy --only firestore:indexes`
   - Desplegar reglas: `firebase deploy --only firestore:rules`

7. **Configurar Cloudinary**
   - Crear cuenta en [Cloudinary](https://cloudinary.com/)
   - Crear upload preset sin firma
   - Copiar cloud name y preset al archivo `.env` del cliente

8. **Ejecutar en desarrollo**
   
   **Terminal 1 - Cliente:**
   ```bash
   cd client
   npm run dev
   ```
   
   **Terminal 2 - Servidor:**
   ```bash
   cd server
   npm start
   ```

   - Cliente: `http://localhost:5173`
   - Servidor: `http://localhost:3000`

## 📂 Estructura del Proyecto

```
client/src/
├── api/                    # Conexiones a Firebase y Cloudinary
│   ├── firebase/
│   │   └── feed.js         # Queries optimizadas del feed
│   ├── firebase.js         # Configuración de Firebase
│   ├── user.js             # API de usuarios (CRUD)
│   ├── likes.js            # API de likes (sin lógica de matches)
│   └── cloudinary.js       # Utilidades de Cloudinary
├── assets/                 # Recursos estáticos
│   ├── data/               # JSON de datos (géneros, orientaciones, intereses)
│   └── styles/
│       └── global.css      # Estilos globales y variables CSS
├── components/             # Componentes reutilizables
│   ├── Feed/               # UserCard
│   ├── Layout/             # BaseLayout, ProtectedRoute
│   ├── Navigation/         # TabNavigation
│   ├── Profile/            # LocationSelector, UpdateMultipleImagesWithCrop
│   └── UI/                 # Button, Input, TextArea, Modal
├── context/                # Contextos de React
│   ├── AuthContext.jsx     # Contexto de autenticación
│   ├── FeedContext.jsx     # Contexto del feed (batch loading)
│   └── UserCache.js        # Sistema de caché local
├── pages/                  # Vistas principales
│   ├── Home.jsx            # Página de inicio
│   ├── Login.jsx           # Inicio de sesión
│   ├── Register.jsx        # Registro de usuario
│   ├── CreateProfile.jsx   # Creación de perfil inicial
│   ├── Profile.jsx         # Visualización de perfil
│   ├── EditProfile.jsx     # Edición de perfil (modales)
│   ├── Settings.jsx        # Configuración
│   ├── AccountInfo.jsx     # Información de cuenta
│   ├── Feed.jsx            # Feed optimizado con listeners
│   ├── MatchesList.jsx     # Lista de conversaciones
│   └── Chat.jsx            # Chat en tiempo real
├── utils/                  # Funciones de utilidad
│   ├── dateUtils.js        # Cálculo y validación de fechas
│   ├── geolocation.js      # Utilidades de geolocalización
│   ├── formatters.js       # Formateadores de texto
│   └── validators.js       # Validadores de formularios
└── AppRouter.jsx           # Configuración de rutas

server/
├── middleware/
│   └── auth.js             # Middleware de autenticación Firebase
├── workers/
│   └── matchWorker.js      # Worker de detección de matches
├── firebase.js             # Configuración Firebase Admin SDK
├── index.js                # Punto de entrada del servidor
└── package.json
```

## 📊 Estructura de Datos

Ver documentación completa en [`docs/firestore-structure.md`](./docs/firestore-structure.md)

### Colección `users/{userId}` (Público)
```javascript
{
  uid, name, age, gender, sexualOrientation,
  bio, interests[], images[], location{},
  lifestyle{}, job{}, searchIntent,
  createdAt
}
```

### Subcolección `users/{userId}/private/data` (Privado)
```javascript
{
  email, birthDate, authMethod
}
```

### Colección `likes/{likeId}`
```javascript
{
  fromUserId, toUserId, type, createdAt
}
```

### Colección `matches/{matchId}`
```javascript
{
  users: [userId1, userId2],  // Array para queries con array-contains
  createdAt,
  lastMessage: null,
  lastMessageTime: null
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Desplegar carpeta dist/
```

### Backend (Render)
1. Crear nuevo Web Service en Render
2. Conectar repositorio
3. Configurar:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Agregar variables de entorno desde `.env`
5. Configurar UptimeRobot para keep-alive (ping cada 5 min)

### Firebase
```bash
# Desplegar índices
firebase deploy --only firestore:indexes

# Desplegar reglas de seguridad
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 🎯 Próximas Funcionalidades

### En Desarrollo
- [ ] **Notificaciones Push**: Alertas de matches y mensajes (FCM)

### Mejoras Planificadas
- [ ] Animaciones de swipe en Feed
- [ ] Filtros de búsqueda (edad, distancia, género)
- [ ] Super Like destacado
- [ ] Deshacer último swipe
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Cambio de contraseña
- [ ] PWA (Progressive Web App)
- [ ] Sistema de reportes mejorado

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Documentación Adicional

- [📚 Índice de Documentación](./docs/README.md)
- [Arquitectura del Proyecto](./docs/Arquitectura.md)
- [Configuración del Backend](./docs/Backend-Config.md)
- [Configuración de Firebase](./docs/FIREBASE_SETUP.md)
- [Guía de Despliegue en Vercel](./client/DEPLOYMENT.md)
- [Estructura de Firestore](./docs/firestore-structure.md)
- [Requisitos del Proyecto](./docs/Requisitos.md)
- [Configuración de Turnstile](./docs/TURNSTILE_SETUP.md)
- [Moderación NSFW](./docs/NSFW_MODERATION.md)
- [Análisis de Seguridad](./docs/security.md)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Firebase por el backend serverless
- Cloudinary por el almacenamiento de imágenes
- React y Vite por las herramientas de desarrollo
- La comunidad open source

---

<div align="center">
    <sub>Hecho con 💜 por Pauliihh Darkness Dev</sub>
    <br>
    <sub>Noviembre 2025</sub>
</div>
