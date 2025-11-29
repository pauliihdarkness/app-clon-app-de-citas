
<div align="center">
  <img src="https://img.icons8.com/color/96/architecture.png" width="64"/>
  
  # 🏗️ Arquitectura — App de Citas
  _React + Firebase + Cloudinary_
</div>

---

## 📌 Resumen General

La arquitectura se basa en un frontend **React** desacoplado, que interactúa con **Firebase** (Auth + Firestore) como backend serverless y **Cloudinary** para imágenes optimizadas.

> Escalable · Segura · Modular · Mobile First

```mermaid
graph TD
  A[React App (Vite)] -->|Firebase SDK| B[Firebase Auth]
  A -->|Firestore SDK| C[Firestore Database]
  A -->|Upload Widget| D[Cloudinary]
  E[Node.js Backend] -->|Admin SDK| C
  E -->|Express| F[Keep-Alive / API]
  C -->|Events| E
  C -->|Reglas de Seguridad| G[Datos Públicos/Privados]
  D -->|CDN| H[Imágenes Optimizadas]
```

---

## 🧩 Arquitectura de Carpetas (Frontend React)

```plaintext
client/src/
 ├── api/                   # Integraciones Firebase/Cloudinary
 │   ├── firebase.js        # Configuración Firebase
 │   ├── user.js            # API de usuarios (CRUD)
 │   └── cloudinary.js      # Utilidades Cloudinary
 ├── components/            # Componentes reutilizables
 │   ├── Auth/              # Componentes de autenticación
 │   ├── Layout/            # BaseLayout, ProtectedRoute
 │   ├── Navigation/        # TabNavigation
 │   ├── Profile/           # LocationSelector, UpdateMultipleImagesWithCrop
 │   └── UI/                # Button, Input, TextArea, Modal
 ├── context/               # Contextos de React
 │   └── AuthContext.jsx    # Estado de autenticación global
 ├── pages/                 # Vistas principales
 │   ├── Home.jsx           # Landing page
 │   ├── Login.jsx          # Inicio de sesión
 │   ├── Register.jsx       # Registro
 │   ├── CreateProfile.jsx  # Creación de perfil inicial
 │   ├── Profile.jsx        # Visualización de perfil
 │   ├── EditProfile.jsx    # Edición de perfil (modales)
 │   ├── Settings.jsx       # Configuración
 │   ├── AccountInfo.jsx    # Información de cuenta
 │   ├── Feed.jsx           # Feed de usuarios (pendiente)
 │   ├── Chat.jsx           # Chat (pendiente)
 │   └── NotFound.jsx       # Página 404
 ├── utils/                 # Funciones de utilidad
 │   ├── dateUtils.js       # Cálculo y validación de fechas
 │   ├── geolocation.js     # Utilidades de geolocalización
 │   ├── formatters.js      # Formateadores de texto
 │   └── validators.js      # Validadores de formularios
 ├── assets/                # Recursos estáticos
 │   └── data/              # JSON (géneros, orientaciones, intereses)
 ├── App.jsx
 ├── AppRouter.jsx          # Configuración de rutas
 └── main.jsx
```

---

## 🗄️ Arquitectura Firestore (Base de Datos)

### Estructura Actual

```plaintext
users/{userId}                          # Datos PÚBLICOS
  - uid, name, age, gender, sexualOrientation
  - bio, interests[], images[]
  - location {country, state, city}
  - createdAt, updatedAt
  
  /private/                             # Subcolección PRIVADA
    /data                               # Documento de datos sensibles
      - email, birthDate, authMethod
      - (futuro: preferencias, notificaciones)
```

### Estructura Futura (Pendiente)

```plaintext
likes/{likeId}
  - fromUserId, toUserId, type (like/dislike)
  - createdAt

matches/{matchId}
  - user1Id, user2Id
  - createdAt, lastMessageAt
  - unreadCount {userId: number}

chats/{chatId}
  - matchId, participants[]
  - lastMessage, lastMessageAt, lastMessageBy
  
  /messages/{messageId}
    - senderId, text, createdAt
    - read, readAt
```

---

## 🖥️ Arquitectura Backend (Node.js)

El backend actúa como un **Worker** que complementa al frontend. No es una API REST tradicional para todo, sino un procesador de eventos.

### Componentes
1.  **Match Worker**: Escucha la colección `likes`. Cuando detecta un nuevo like, verifica reciprocidad y crea el match.
2.  **Express Server**: Mantiene el servicio "despierto" en Render con un endpoint `/` y expone rutas protegidas `/api` para futuras funcionalidades.
3.  **Firebase Admin SDK**: Otorga privilegios de superusuario al backend para escribir en colecciones protegidas.

### Seguridad
- **Middleware de Autenticación**: Verifica tokens de Firebase (ID Tokens) en las rutas `/api`.
- **CORS**: Restringido a dominios permitidos (`ALLOWED_ORIGINS`).
- **Variables de Entorno**: Credenciales sensibles fuera del código.

---

## 🌐 Flujo de Datos Principal

### 🔐 Autenticación

1. Usuario se registra/inicia sesión con Firebase Auth (Email/Password o Google)
2. Firebase devuelve `uid`
3. React guarda el usuario en `AuthContext`
4. Se verifica si existe perfil en `/users/{uid}`
5. Si no existe → redirige a `/create-profile`
6. Si existe → redirige a `/feed`

### 👤 Creación de Perfil

1. Usuario completa formulario con datos personales
2. Usuario selecciona **fecha de nacimiento** (validación: +18 años)
3. Se calcula **edad** automáticamente desde la fecha
4. Usuario sube fotos → Cloudinary → devuelve URLs
5. Se guarda:
   - Datos públicos en `/users/{uid}`
   - `birthDate` y `email` en `/users/{uid}/private/data`
6. Redirige a `/feed`

### ✏️ Edición de Perfil

1. Usuario accede a `/profile/edit`
2. Sistema de **modales** para editar por secciones:
   - Información Básica (nombre, género, orientación, ubicación)
   - Biografía (máx 500 caracteres)
   - Intereses (máx 8)
   - Fotos (subida directa, sin modal)
3. Al guardar, se **recalcula edad** automáticamente desde `birthDate`
4. **Nota**: La fecha de nacimiento NO es editable (seguridad)

### 📋 Información de Cuenta

1. Usuario accede a `Settings → Información de la cuenta`
2. Se obtiene `birthDate` desde `/users/{uid}/private/data`
3. Se muestra fecha de nacimiento formateada
4. Se indica que NO es editable por seguridad

### ❤️ Feed y Recomendaciones (Futuro)

1. React consulta `/users/` filtrando por:
   - Distancia (geolocalización)
   - Rango de edad
   - Género/orientación compatible
   - No vistos previamente
2. Usuario hace swipe (Like / Dislike)
3. Se registra en `likes/{likeId}`
4. Si hay match mutuo → se crea `matches/{matchId}`

### 💬 Chat en Tiempo Real (Futuro)

1. React escucha cambios en `/chats/{chatId}/messages/`
2. Mensajes se escriben en tiempo real
3. Si incluyen imagen → primero subir a Cloudinary
4. Chat actualiza automáticamente con `onSnapshot`

---

## 🖼️ Arquitectura de Imágenes (Cloudinary)

### Configuración

- **Cloud Name**: Configurado en `.env`
- **Upload Preset**: Sin firma, configurado en Cloudinary
- **Carpeta**: `app-de-citas/users/{uid}/`
- **Límite**: 9 fotos por usuario

### Transformaciones Automáticas

- `q_auto` - Calidad automática
- `f_auto` - Formato automático (WebP en navegadores compatibles)
- `c_fill` - Recorte para llenar dimensiones
- Compresión: Máx 1MB
- Dimensiones: Máx 1500px

### Flujo de Subida

1. Usuario selecciona imagen
2. Crop interactivo con `react-easy-crop`
3. Subida a Cloudinary con Upload Widget
4. Cloudinary devuelve URL optimizada
5. URL se guarda en Firestore `/users/{uid}/images[]`
6. Actualización inmediata en UI

---

## 🔒 Seguridad y Reglas de Firestore

### Reglas Implementadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar para verificar si es el dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección de usuarios (pública)
    match /users/{userId} {
      // Cualquier usuario autenticado puede leer perfiles públicos
      allow read: if isAuthenticated();
      
      // Solo el dueño puede crear/actualizar su perfil
      allow create, update: if isOwner(userId);
      
      // Solo el dueño puede eliminar su perfil
      allow delete: if isOwner(userId);
      
      // Subcolección privada
      match /private/data {
        // Solo el dueño puede leer/escribir sus datos privados
        allow read, write: if isOwner(userId);
        
        // Prevenir edición de birthDate después de la creación
        allow update: if isOwner(userId) 
                      && (!request.resource.data.keys().hasAny(['birthDate']) 
                          || request.resource.data.birthDate == resource.data.birthDate);
      }
    }
    
    // Colección de likes
    match /likes/{likeId} {
      // Cualquier usuario autenticado puede leer likes
      allow read: if isAuthenticated();
      
      // Solo se puede crear un like si el usuario autenticado es quien lo da
      allow create: if isAuthenticated() 
                    && request.auth.uid == request.resource.data.fromUserId;
      
      // Solo el creador puede eliminar su like
      allow delete: if isAuthenticated() 
                    && request.auth.uid == resource.data.fromUserId;
      
      // No se permite actualizar likes
      allow update: if false;
    }
    
    // Colección de matches
    match /matches/{matchId} {
      // Solo los usuarios involucrados pueden leer el match
      allow read: if isAuthenticated() 
                  && (request.auth.uid == resource.data.user1Id 
                      || request.auth.uid == resource.data.user2Id);
      
      // Solo se puede crear un match automáticamente
      allow create: if isAuthenticated()
                    && (request.auth.uid == request.resource.data.user1Id 
                        || request.auth.uid == request.resource.data.user2Id);
      
      // Los matches no se pueden actualizar ni eliminar
      allow update, delete: if false;
    }
  }
}
```

### Principios de Seguridad

- ✅ Separación de datos públicos y privados
- ✅ Validación a nivel de base de datos
- ✅ Fecha de nacimiento inmutable después del registro
- ✅ Solo el usuario puede ver/editar sus datos privados
- ✅ Perfiles públicos visibles solo para usuarios autenticados

---

## 🔌 Gestión de Estado (State Management)

### Estado Global (Context API)

- **AuthContext**: Usuario autenticado, funciones de login/logout
- Futuro: **UserContext** para perfil completo
- Futuro: **MatchesContext** para matches activos

### Estado Local (useState)

- Estados de formularios
- Estados de carga (loading, saving)
- Estados de modales (open/close)
- Estados de UI (carrusel, tabs)

> **Nota**: Para funcionalidades futuras más complejas, considerar **Zustand** o **Redux Toolkit**

---

## 🚀 Escalabilidad

### Optimizaciones Implementadas

- ✅ Lazy loading de imágenes
- ✅ Compresión automática con Cloudinary
- ✅ Separación de datos públicos/privados
- ✅ Cálculo de edad en el backend (no en cliente)

### Optimizaciones Futuras

- [ ] Índices compuestos en Firestore para consultas de feed
- [ ] Paginación con `startAfter` para resultados grandes
- [ ] Cache de perfiles visitados
- [ ] Listeners eficientes con `onSnapshot`
- [ ] Cloud Functions para automatización (detección de matches)
- [ ] PWA para instalación en móviles

---

## 🌍 Hosting y Deployment

### Opción Recomendada: Vercel + Firebase

| Componente | Plataforma | Razón |
|------------|-----------|-------|
| Frontend (React) | Vercel | Deploy automático, CDN global, preview URLs |
| Backend (Auth + DB) | Firebase | Serverless, escalable, integración directa |
| Imágenes | Cloudinary | CDN global, transformaciones automáticas |

### Alternativa: Firebase Hosting

- Todo en Firebase (Hosting + Auth + Firestore)
- Más simple, menos configuración
- Ideal para MVP

---

## 🧪 Testing (Futuro)

### Recomendaciones

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress o Playwright
- **Firestore Rules**: Firebase Emulator Suite
- **Visual Regression**: Percy o Chromatic

---

## 📊 Métricas y Analytics (Futuro)

- Firebase Analytics para eventos de usuario
- Cloudinary Analytics para uso de imágenes
- Custom events: swipes, matches, mensajes

---

<div align="center">
  <sub>✨ Arquitectura pensada para escalar, ser segura y fácil de mantener. ✨</sub>
  <br>
  <sub>Actualizado: Noviembre 2025</sub>
</div>
