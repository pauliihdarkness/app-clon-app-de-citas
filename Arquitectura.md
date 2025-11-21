
<div align="center">
  <img src="https://img.icons8.com/color/96/architecture.png" width="64"/>
  
  # 🏗️ Arquitectura — App de Citas
  _React + Firebase + Cloudinary_
</div>

---

## 📌 Resumen General

La arquitectura se basa en un frontend **React** desacoplado, que interactúa con **Firebase** (Auth + Firestore + Functions) como backend serverless y **Cloudinary** para imágenes optimizadas.

> Escalable · Segura · Modular · Pensada para alto tráfico

```mermaid
graph TD
  A[React App (UI + State + Routing)] -->|REST / SDK| B[Firebase\nAuth, Firestore, Functions, Hosting]
  B -->|Upload / URL| C[Cloudinary\nStorage + Transformations]
```

---


## 🧩 Arquitectura de Carpetas (Frontend React)

```plaintext
src/
 ├── api/           # Integraciones Firebase/Cloudinary
 ├── components/    # UI, Auth, Profile, Feed, Chat, Layout
 ├── context/       # AuthContext, UserContext, AppConfig
 ├── hooks/         # useAuth, useFirestoreQuery, useGeolocation
 ├── pages/         # Home, Feed, Profile, EditProfile, Chat, Login, Register
 ├── utils/         # validators, formatters, geolocation
 ├── assets/        # icons, images, styles
 ├── App.jsx
 ├── AppRouter.jsx
 └── main.jsx
```

---


## 🗄️ Arquitectura Firestore (Base de Datos)

```plaintext
users/{userId}
  - name, age, bio, interests[], location {city, country, approxCoords?}
  - photos: []
  - settings {maxDistance, ageRange}
  - createdAt, updatedAt

likes/{likeId}
  - fromUser, toUser, timestamp

matches/{matchId}
  - users: [userA, userB], createdAt

messages/{matchId}/messages/{messageId}
  - senderId, text, imageUrl, createdAt
```

---


## 🌐 Flujo de Datos Principal

<details>
<summary>🔐 Autenticación</summary>

1. Usuario se registra/inicia sesión con Firebase Auth
2. Firebase devuelve uid
3. React guarda el usuario en AuthContext
4. Se carga el documento `/users/{uid}`
</details>

<details>
<summary>👤 Creación de Perfil</summary>

1. Usuario sube fotos → Cloudinary → devuelve URL
2. Se guarda el perfil en Firestore `/users/{uid}`
</details>

<details>
<summary>❤️ Feed y Recomendaciones</summary>

1. React consulta `/users/` filtrando por distancia, edad, género, no vistos
2. Swipe (Like / Dislike)
3. Se registra en `likes/`
4. Cloud Function (opcional) detecta match y genera `matches/`
</details>

<details>
<summary>💬 Chat en Tiempo Real</summary>

1. React escucha cambios en `/matches/{matchId}/messages/`
2. Mensajes se escriben allí
3. Si incluyen imagen → primero subir a Cloudinary
4. Chat actualiza en tiempo real
</details>

---


## 🛠️ Cloud Functions (Opcionales)

```plaintext
functions/
 ├── onLikeCreate.js         # Detecta si hay match
 ├── onMessageCreate.js      # Push notifications
 ├── cleanInactiveMatches.js # Limpia matches viejos
 └── moderatePhotos.js       # Moderación con Cloudinary AI
```

---



## 🖼️ Arquitectura de Imágenes (Cloudinary)

**Presets recomendados:**
- profile_photos
- chat_images

**Transformaciones automáticas:**
- `q_auto`, `f_auto`, `c_fill`, `aspect_ratio=1:1` (perfiles)
- Miniaturas para acelerar el feed

---

## 🔌 Arquitectura de Estados (State Management)

**Global State:**
- usuario autenticado
- perfil completo
- filtros de búsqueda
- matches activos
- chats activos

**Locales/Componentes:**
- estado de swipe
- estado de carga de fotos
- UI (modals, banners, toggles)

> Opción recomendada: **Zustand** (más simple que Redux)

---

## 🌍 Hosting

| Opción | Descripción |
|--------|-------------|
| Firebase Hosting (PWA) | Hosting serverless, integración directa |
| Vercel + Firebase backend | Deploy frontend en Vercel, backend en Firebase |

Ambas funcionan perfectamente con React.

---

## 🚀 Escalabilidad
- Firestore con índices compuestos para consultas de feed
- Fotos heavy → Cloudinary CDN
- Lecturas minimizadas usando `onSnapshot` y `startAfter`
- Particionar chats por match
- Cloud Functions para automatización
- Manejo eficiente de listeners

---

## 🧪 Testing
- Unit tests: **Jest + React Testing Library**
- E2E: **Cypress**
- Pruebas de reglas Firestore con **Firebase Emulator**

---

<div align="center">
  <sub>✨ Arquitectura pensada para escalar, ser segura y fácil de mantener. ✨</sub>
</div>

