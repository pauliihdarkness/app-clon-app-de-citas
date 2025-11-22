# 🔥 App de Citas - Dating App

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-Purple?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-10-Orange?style=for-the-badge&logo=firebase)
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

### 🔒 Seguridad y Privacidad
- ✅ **Separación de Datos**: Públicos vs Privados en Firestore
- ✅ **Fecha de Nacimiento Protegida**: Almacenada en subcolección privada
- ✅ **Validaciones Robustas**: Edad mínima 18 años, formatos de datos
- ✅ **Reglas de Firestore**: Protección completa para users, likes y matches
- ✅ **Variables de Entorno**: Credenciales sensibles fuera del código

### 📍 Geolocalización
- ✅ Selector de ubicación con autocompletado
- ✅ Integración con API de geocodificación
- ✅ Almacenamiento de país, estado y ciudad

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI con Hooks
- **Vite 5** - Build tool ultrarrápido
- **React Router DOM** - Navegación SPA
- **CSS3 Moderno** - Variables, Flexbox, Grid, Glassmorphism

### Backend
- **Node.js + Express** - Servidor backend para workers y API
- **Firebase Admin SDK** - Operaciones privilegiadas en Firestore
- **Firebase Authentication** - Gestión de usuarios
- **Firestore Database** - Base de datos NoSQL con índices compuestos
- **Cloudinary** - Almacenamiento y optimización de imágenes

### Utilidades y Librerías
- **react-easy-crop** - Recorte de imágenes interactivo
- **localforage** - Caché persistente con IndexedDB
- **cors** - Middleware de seguridad CORS
- **dotenv** - Gestión de variables de entorno
- **date-fns** - Manipulación de fechas (utilidades personalizadas)

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
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
   ```

5. **Configurar Variables de Entorno del Servidor**
   
   Crea un archivo `.env` en la carpeta `server`:

   ```env
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_CLIENT_EMAIL=tu_client_email@app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # CORS (dominios permitidos separados por comas)
   ALLOWED_ORIGINS=http://localhost:5173,https://tu-app.vercel.app
   ```

6. **Configurar Firebase**
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password y Google)
   - Crear base de datos Firestore
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
│   └── Chat.jsx            # Chat (pendiente)
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
- [ ] **Página de Matches**: Visualizar lista de matches activos
- [ ] **Chat en Tiempo Real**: Mensajería entre matches
- [ ] **Notificaciones Push**: Alertas de matches y mensajes (FCM)

### Mejoras Planificadas
- [ ] Animaciones de swipe en Feed
- [ ] Filtros de búsqueda (edad, distancia, género)
- [ ] Super Like destacado
- [ ] Deshacer último swipe
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Cambio de contraseña
- [ ] Páginas de Términos y Privacidad
- [ ] Sistema de reportes y bloqueos

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Documentación Adicional

- [Arquitectura del Proyecto](./Arquitectura.md)
- [Configuración del Backend](./Backend-Config.md)
- [Configuración de Firebase](./FIREBASE_SETUP.md)
- [Estructura de Firestore](./docs/firestore-structure.md)
- [Requisitos del Proyecto](./Requisitos.md)
- [Lista de Tareas](./Lista%20de%20tareas.md)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Firebase por el backend serverless
- Cloudinary por el almacenamiento de imágenes
- React y Vite por las herramientas de desarrollo
- La comunidad open source

---

<div align="center">
    <sub>Hecho con 💜 por Pauliih Darkness Dev</sub>
    <br>
    <sub>Noviembre 2025</sub>
</div>
