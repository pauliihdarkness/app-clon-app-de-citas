# 🛠️ Configuración del Backend

> **Última actualización:** 30 de noviembre de 2025  
> **Versión:** 0.9.0-rc1

Esta documentación explica cómo configurar, ejecutar y desplegar el servidor backend de la aplicación de citas.

---

## 📑 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Variables de Entorno](#variables-de-entorno)
4. [Instalación y Ejecución](#instalación-y-ejecución)
5. [Arquitectura del Servidor](#arquitectura-del-servidor)
6. [Middleware](#middleware)
7. [Rutas API](#rutas-api)
8. [Workers en Background](#workers-en-background)
9. [Socket.IO (Chat en Tiempo Real)](#socketio-chat-en-tiempo-real)
10. [Despliegue en Render](#despliegue-en-render)
11. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)

---

## 🚀 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime de JavaScript |
| **Express** | 5.1.0 | Framework web minimalista |
| **Firebase Admin SDK** | 13.6.0 | Operaciones privilegiadas en Firestore |
| **Socket.IO** | 4.8.1 | Chat en tiempo real |
| **Helmet** | 8.1.0 | Seguridad HTTP (CSP, XSS) |
| **express-rate-limit** | 8.2.1 | Rate limiting |
| **CORS** | 2.8.5 | Control de acceso entre orígenes |
| **dotenv** | 17.2.3 | Gestión de variables de entorno |

---

## 📂 Estructura del Proyecto

```
server/
├── index.js                    # Punto de entrada del servidor
├── firebase.js                 # Configuración Firebase Admin SDK
├── package.json                # Dependencias y scripts
├── .env                        # Variables de entorno (NO subir a Git)
├── .env.example                # Plantilla de variables de entorno
│
├── middleware/                 # Middleware personalizado
│   ├── auth.js                 # Verificación de tokens Firebase
│   ├── rateLimiter.js          # Rate limiting (5 limiters)
│   └── turnstile.js            # Verificación Cloudflare Turnstile
│
├── routes/                     # Rutas de la API
│   ├── matches.js              # Endpoints de matches
│   └── likes.js                # Endpoints de likes
│
├── socket/                     # Socket.IO
│   └── socketHandler.js        # Manejo de eventos de chat
│
├── workers/                    # Procesos en background
│   └── matchWorker.js          # Detección automática de matches
│
└── scripts/                    # Scripts de utilidad
    ├── cleanMatches.js         # Limpieza de matches duplicados
    ├── cleanRateLimits.js      # Limpieza de rate limits
    └── migrateUsers.js         # Migración de datos de usuarios
```

**Total:** ~15 archivos, ~3,700 líneas de código

---

## 🔐 Variables de Entorno

### Archivo `.env`

Crea un archivo `.env` en la carpeta `server/` con las siguientes variables:

```bash
# ===== Firebase Admin SDK =====
# Obtén estas credenciales desde:
# Firebase Console > Project Settings > Service Accounts > Generate New Private Key

FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"

# ===== CORS (Orígenes Permitidos) =====
# Separa múltiples dominios con comas (sin espacios)
# Incluye localhost para desarrollo y tus dominios de producción

ALLOWED_ORIGINS=http://localhost:5173,https://tu-app-frontend.vercel.app,https://tu-app.netlify.app

# ===== Cloudflare Turnstile =====
# Obtén tu secret key desde:
# https://dash.cloudflare.com/?to=/:account/turnstile

TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxxxxx

# ===== Puerto del Servidor (Opcional) =====
# Por defecto: 3000
PORT=3000
```

### Plantilla `.env.example`

El archivo [`.env.example`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/server/.env.example) contiene una plantilla sin valores sensibles que puedes compartir en el repositorio.

> **⚠️ IMPORTANTE:** Nunca subas el archivo `.env` a Git. Asegúrate de que esté en `.gitignore`.

---

## 🔧 Instalación y Ejecución

### Instalación

```bash
# 1. Navega a la carpeta del servidor
cd server

# 2. Instala las dependencias
npm install
```

### Ejecución Local

```bash
# Modo normal
npm start

# Modo desarrollo (con watch)
npm run dev
```

**Salida esperada:**
```
🚀 Server starting...
❤️  Match Worker started... listening for new likes.
🌍 Web server listening on port 3000
```

### Scripts Disponibles

```bash
# Iniciar servidor
npm start

# Modo desarrollo con auto-reload
npm run dev

# Limpiar rate limits (útil en desarrollo)
npm run clean:ratelimits
```

---

## 🏗️ Arquitectura del Servidor

### Flujo de Inicialización

```mermaid
graph TD
    A[index.js] --> B[Inicializar Firebase Admin]
    A --> C[Configurar Express]
    C --> D[Aplicar Helmet CSP]
    C --> E[Configurar CORS]
    C --> F[Crear HTTP Server]
    F --> G[Setup Socket.IO]
    A --> H[Iniciar Match Worker]
    A --> I[Registrar Rutas]
    I --> J[Rutas Públicas]
    I --> K[Rutas Protegidas]
    F --> L[Escuchar en Puerto 3000]
```

### Componentes Principales

#### 1. **Express App**
- Framework web para manejar HTTP requests
- Middleware de seguridad (Helmet, CORS)
- Rate limiting en todas las rutas

#### 2. **HTTP Server**
- Servidor HTTP creado con `createServer(app)`
- Base para Socket.IO

#### 3. **Socket.IO Server**
- Chat en tiempo real
- Eventos: `join_room`, `send_message`, `receive_message`

#### 4. **Match Worker**
- Proceso en background
- Escucha nuevos likes en Firestore
- Detecta matches automáticamente

---

## 🛡️ Middleware

### 1. Helmet (Seguridad HTTP)

Configurado con Content Security Policy (CSP) estricta:

```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://challenges.cloudflare.com", "https://apis.google.com"],
            frameSrc: ["'self'", "https://challenges.cloudflare.com", "https://*.firebaseapp.com"],
            connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "wss://*.firebaseio.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"]
        }
    }
}));
```

**Protege contra:**
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME type sniffing

---

### 2. CORS (Control de Acceso)

```javascript
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Permite requests sin origin
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    }
}));
```

**Configuración:**
- Solo permite orígenes en `ALLOWED_ORIGINS`
- Bloquea requests de dominios no autorizados

---

### 3. Rate Limiting

Implementado con `express-rate-limit`. **5 limiters diferentes:**

| Limiter | Ventana | Límite | Uso |
|---------|---------|--------|-----|
| `generalLimiter` | 15 min | 100 req | Todas las rutas `/api` |
| `strictLimiter` | 1 hora | 50 req | Likes, acciones sensibles |
| `authLimiter` | 15 min | 5 req | Login, registro |
| `readLimiter` | 1 hora | 200 req | Endpoints GET (matches) |
| `writeLimiter` | 1 hora | 30 req | Endpoints POST/PUT/DELETE |

**Ejemplo de uso:**

```javascript
// Aplicar a todas las rutas API
app.use("/api", generalLimiter);

// Aplicar a rutas específicas
app.use("/api/matches", readLimiter, matchesRouter);
app.use("/api/likes", strictLimiter, likesRouter);
```

**Headers de respuesta:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1701360000
```

---

### 4. Autenticación Firebase

Middleware `verifyToken` que valida tokens de Firebase Auth:

```javascript
app.use("/api", verifyToken);
```

**Funcionamiento:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Verifica con Firebase Admin SDK
3. Adjunta `req.user` con datos del usuario
4. Rechaza requests sin token válido

---

### 5. Cloudflare Turnstile

Endpoint público para verificar tokens de Turnstile:

```javascript
app.post("/api/verify-turnstile", verifyTurnstileEndpoint);
```

**Uso:**
- Protege formularios de registro/login
- Previene bots y spam
- Valida tokens con la API de Cloudflare

---

## 🌐 Rutas API

### Rutas Públicas

| Método | Ruta | Descripción | Rate Limit |
|--------|------|-------------|------------|
| `GET` | `/` | Health check | General |
| `POST` | `/api/verify-turnstile` | Verificar Turnstile | General |

### Rutas Protegidas

#### **Matches** (`/api/matches`)

| Método | Ruta | Descripción | Rate Limit |
|--------|------|-------------|------------|
| `GET` | `/api/matches/:userId` | Obtener matches del usuario | Read (200/h) |
| `GET` | `/api/matches/:matchId/messages` | Obtener mensajes del chat | Read (200/h) |
| `DELETE` | `/api/matches/:matchId` | Eliminar match (unmatch) | Write (30/h) |

#### **Likes** (`/api/likes`)

| Método | Ruta | Descripción | Rate Limit |
|--------|------|-------------|------------|
| `POST` | `/api/likes` | Dar like a un usuario | Strict (50/h) |
| `GET` | `/api/likes/:userId` | Obtener likes del usuario | Read (200/h) |

> **Nota:** Todas las rutas protegidas requieren header `Authorization: Bearer <firebase-token>`

---

## ⚙️ Workers en Background

### Match Worker

**Archivo:** [`workers/matchWorker.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/server/workers/matchWorker.js)

**Funcionamiento:**

```mermaid
sequenceDiagram
    participant L as Likes Collection
    participant W as Match Worker
    participant FS as Firestore
    participant M as Matches Collection

    L->>W: Nuevo like detectado (onSnapshot)
    W->>W: Verificar type === "like"
    W->>FS: Buscar like recíproco
    alt Like recíproco encontrado
        W->>M: Crear documento de match
        W->>W: Log: ✨ MATCH FOUND!
    else No hay like recíproco
        W->>W: Log: ❌ No reciprocal like
    end
```

**Características:**
- ✅ Escucha cambios en tiempo real con `onSnapshot`
- ✅ Ignora "passes" (solo procesa likes)
- ✅ Previene duplicados (verifica si el match ya existe)
- ✅ Crea matches con ID determinístico: `userId1_userId2` (ordenado)

**Logs del worker:**
```
💝 New like detected: user123 → user456 (type: like)
🔍 Checking for reciprocal like: user456 → user123
📊 Reciprocal query result: FOUND!
✨ MATCH FOUND! user123 ↔️ user456
✅ Match document created: user123_user456
```

---

## 💬 Socket.IO (Chat en Tiempo Real)

**Archivo:** [`socket/socketHandler.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/server/socket/socketHandler.js)

### Configuración

```javascript
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});
```

### Eventos

#### 1. **Conexión**

```javascript
io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);
});
```

#### 2. **Join Room**

```javascript
socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
});
```

**Cliente:**
```javascript
socket.emit("join_room", matchId);
```

#### 3. **Send Message**

```javascript
socket.on("send_message", async (data) => {
    const { roomId, author, message, time } = data;
    
    // 1. Emitir a todos en la sala
    io.to(roomId).emit("receive_message", data);
    
    // 2. Guardar en Firestore
    await messagesRef.add({
        senderId: author,
        text: message,
        timestamp: serverTimestamp(),
        read: false
    });
    
    // 3. Actualizar lastMessage
    await matchRef.update({
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${recipientId}`]: increment(1)
    });
});
```

**Cliente:**
```javascript
socket.emit("send_message", {
    roomId: matchId,
    author: currentUserId,
    message: "Hola!",
    time: new Date().toISOString()
});
```

#### 4. **Receive Message**

```javascript
socket.on("receive_message", (data) => {
    console.log("Nuevo mensaje:", data);
    // Actualizar UI
});
```

#### 5. **Disconnect**

```javascript
socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
});
```

### Flujo Completo

```mermaid
sequenceDiagram
    participant U1 as Usuario A
    participant S1 as Socket A
    participant Srv as Server
    participant FS as Firestore
    participant S2 as Socket B
    participant U2 as Usuario B

    U1->>S1: send_message
    S1->>Srv: Evento recibido
    Srv->>FS: Guardar mensaje
    Srv->>FS: Actualizar lastMessage
    Srv->>S1: receive_message
    Srv->>S2: receive_message
    S1->>U1: Mostrar mensaje
    S2->>U2: Mostrar mensaje
```

---

## ☁️ Despliegue en Render

### Paso 1: Crear Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub

### Paso 2: Configuración del Servicio

| Campo | Valor |
|-------|-------|
| **Name** | `app-citas-backend` |
| **Region** | `Oregon (US West)` o el más cercano |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (para desarrollo) |

### Paso 3: Variables de Entorno

Agrega las siguientes variables en **Environment**:

```bash
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_KEY\n-----END PRIVATE KEY-----\n"
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-frontend.netlify.app
TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxx
```

> **⚠️ IMPORTANTE:** Para `FIREBASE_PRIVATE_KEY`, copia el valor completo incluyendo `\n` (saltos de línea). Render los interpretará correctamente.

### Paso 4: Deploy

1. Click en **"Create Web Service"**
2. Render comenzará el despliegue automáticamente
3. Espera a que el estado sea **"Live"** (verde)

**URL del servidor:**
```
https://tu-app-backend.onrender.com
```

### Paso 5: Verificar Despliegue

```bash
# Health check
curl https://tu-app-backend.onrender.com/

# Respuesta esperada:
# I am alive! 🤖
```

---

## 🔄 Mantenimiento y Monitoreo

### Keep-Alive (Evitar que se duerma)

Render duerme los servicios gratuitos tras **15 minutos de inactividad**.

**Solución:** Usar un servicio de ping automático.

#### Opción 1: UptimeRobot

1. Crea cuenta en [UptimeRobot](https://uptimerobot.com/)
2. Agrega nuevo monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://tu-backend.onrender.com/`
   - **Interval:** 5 minutos
3. Guarda y activa

#### Opción 2: Cron-Job.org

1. Crea cuenta en [cron-job.org](https://cron-job.org/)
2. Crea nuevo cron job:
   - **URL:** `https://tu-backend.onrender.com/`
   - **Interval:** Cada 5 minutos
3. Activa el job

### Logs en Tiempo Real

```bash
# Ver logs en Render Dashboard
# Logs → Shell → Ver últimos logs
```

**Logs importantes:**
```
🚀 Server starting...
❤️  Match Worker started... listening for new likes.
🌍 Web server listening on port 3000
⚡ Client connected: abc123
💝 New like detected: user1 → user2 (type: like)
✨ MATCH FOUND! user1 ↔️ user2
```

### Scripts de Mantenimiento

```bash
# Limpiar rate limits (si hay problemas)
npm run clean:ratelimits

# Limpiar matches duplicados
node cleanMatches.js

# Migrar usuarios (si es necesario)
node migrateUsers.js
```

---

## 🐛 Troubleshooting

### Problema: CORS Error

**Error:**
```
Access to fetch at 'https://backend.onrender.com/api/matches' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solución:**
1. Verifica que el dominio esté en `ALLOWED_ORIGINS`
2. Asegúrate de que no haya espacios en la variable
3. Reinicia el servicio en Render

---

### Problema: Firebase Admin Error

**Error:**
```
Error: Could not load the default credentials
```

**Solución:**
1. Verifica que todas las variables de Firebase estén configuradas
2. Asegúrate de que `FIREBASE_PRIVATE_KEY` incluya los saltos de línea `\n`
3. Verifica que el Service Account tenga permisos

---

### Problema: Rate Limit Excedido

**Error:**
```
429 Too Many Requests
```

**Solución:**
```bash
# Limpiar rate limits en desarrollo
npm run clean:ratelimits

# En producción, espera a que expire la ventana de tiempo
```

---

## 📊 Métricas de Rendimiento

| Métrica | Valor Promedio |
|---------|----------------|
| Tiempo de respuesta (health check) | ~50ms |
| Detección de match | ~150ms |
| Creación de match | ~200ms |
| Envío de mensaje (Socket.IO) | ~30ms |
| Guardado de mensaje en Firestore | ~100ms |

---

## 🔗 Recursos Adicionales

- [Express Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Helmet.js](https://helmetjs.github.io/)
- [Render Documentation](https://render.com/docs)

---

**Documentación mantenida por:** Pauliih Darkness Dev  
**Última revisión:** 30 de noviembre de 2025  
**Versión:** 0.9.0-rc1
