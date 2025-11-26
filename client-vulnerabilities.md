# Vulnerabilidades del Cliente - App de Citas

> Documento de análisis de seguridad del lado del cliente. Identifica vulnerabilidades, riesgos y propone soluciones concretas.
> 
> **Fecha de análisis**: 25 de Noviembre, 2025  
> **Estado**: Pendiente de implementación  
> **Prioridad**: Alta

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Vulnerabilidades Críticas](#vulnerabilidades-críticas)
3. [Vulnerabilidades de Alta Prioridad](#vulnerabilidades-de-alta-prioridad)
4. [Vulnerabilidades de Media Prioridad](#vulnerabilidades-de-media-prioridad)
5. [Plan de Acción Recomendado](#plan-de-acción-recomendado)
6. [Referencias](#referencias)

---

## Resumen Ejecutivo

### Estadísticas

- **Total de vulnerabilidades identificadas**: 12
- **Críticas**: 2
- **Altas**: 4
- **Medias**: 6

### Impacto Potencial

| Categoría | Impacto Económico | Impacto en Seguridad |
|-----------|-------------------|----------------------|
| Costos Firebase/Cloudinary | **ALTO** - Potencial de miles de USD/mes | N/A |
| Exposición de datos | MEDIO | **ALTO** - Datos privados comprometidos |
| Abuso de recursos | **ALTO** - Lecturas/escrituras ilimitadas | MEDIO |
| Contenido malicioso | MEDIO | **ALTO** - Legal liability |

---

## Vulnerabilidades Críticas

### 🔴 VUL-001: Credenciales de Cloudinary Expuestas

**Severidad**: CRÍTICA  
**Impacto Económico**: ALTO  
**Impacto en Seguridad**: ALTO

#### Descripción

Las credenciales de Cloudinary (`VITE_PRESET_NAME`, `VITE_CLOUD_NAME`) están expuestas en el código del cliente, permitiendo que cualquier persona pueda subir imágenes ilimitadas a tu cuenta.

#### Ubicación

- **Archivo**: [`client/src/api/cloudinary.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/cloudinary.js)
- **Líneas**: 7-9, 19-20

#### Código Vulnerable

```javascript
const urlStorage = import.meta.env.VITE_URL_STORAGE;
const presetName = import.meta.env.VITE_PRESET_NAME;
const cloudName = import.meta.env.VITE_CLOUD_NAME;

data.append("upload_preset", presetName);
data.append("folder", `app-de-citas/users/${uid}`);
```

#### Riesgo

1. **Abuso de almacenamiento**: Cualquiera puede subir imágenes ilimitadas
2. **Costos descontrolados**: Cloudinary cobra por almacenamiento y ancho de banda
3. **Contenido malicioso**: Subida de contenido ilegal/inapropiado en tu cuenta
4. **Manipulación de carpetas**: Aunque se especifica `uid`, puede ser manipulado

#### Escenario de Ataque

```javascript
// Un atacante puede ejecutar esto desde la consola del navegador:
const data = new FormData();
data.append("file", maliciousFile);
data.append("upload_preset", "tu_preset_name"); // Obtenido del código
data.append("folder", "app-de-citas/users/fake-uid");

fetch(`https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload`, {
    method: "POST",
    body: data
});
// Resultado: Imagen subida sin autenticación
```

#### Solución Propuesta

**Opción 1: Cloud Function para Upload (Recomendado)**

```javascript
// Cloud Function
exports.uploadImage = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
    
    const { imageBase64 } = data;
    const uid = context.auth.uid;
    
    // Rate limiting
    await checkUploadRateLimit(uid);
    
    // Upload con credenciales server-side
    const result = await cloudinary.uploader.upload(imageBase64, {
        folder: `app-de-citas/users/${uid}`,
        // Validaciones server-side
    });
    
    return { url: result.secure_url };
});
```

**Opción 2: Signed Uploads**

```javascript
// Backend endpoint para generar firma
app.post('/api/cloudinary/signature', authenticate, (req, res) => {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp,
        folder: `app-de-citas/users/${req.user.uid}`
    }, process.env.CLOUDINARY_API_SECRET);
    
    res.json({ timestamp, signature });
});

// Cliente usa la firma
const { timestamp, signature } = await fetch('/api/cloudinary/signature');
data.append("signature", signature);
data.append("timestamp", timestamp);
```

#### Prioridad de Implementación

**INMEDIATA** - Antes de lanzar a producción

---

### 🔴 VUL-002: Sin Rate Limiting en Cliente

**Severidad**: CRÍTICA  
**Impacto Económico**: ALTO  
**Impacto en Seguridad**: MEDIO

#### Descripción

No existe ningún mecanismo de rate limiting o throttling en acciones críticas del cliente, permitiendo abuso masivo de recursos de Firestore.

#### Ubicación

- **Archivo**: [`client/src/api/likes.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/likes.js)
- **Archivo**: [`client/src/pages/Feed.jsx`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/pages/Feed.jsx)
- **Líneas**: 10-28 (saveLike), 55-73 (handleLike)

#### Código Vulnerable

```javascript
// Feed.jsx - Sin throttling
const handleLike = async () => {
    const currentUser = stack[0];
    if (!currentUser || !user) return;
    
    try {
        popProfile();
        await saveLike(user.uid, currentUser.id); // Sin límite
    } catch (err) {
        console.error("Error saving like:", err);
    }
};

// likes.js - Sin validación de frecuencia
export const saveLike = async (fromUserId, toUserId) => {
    await addDoc(collection(db, "likes"), {
        fromUserId,
        toUserId,
        type: "like",
        createdAt: serverTimestamp()
    }); // Escritura directa sin límites
};
```

#### Riesgo

1. **Spam de likes**: Un usuario puede dar 1000+ likes por minuto
2. **Costos de Firestore**: Cada like = 1 write (USD 0.18 por 100k writes)
3. **Abuso automatizado**: Bots pueden ejecutar scripts para agotar cuotas
4. **Degradación del servicio**: Queries lentas por exceso de documentos

#### Escenario de Ataque

```javascript
// Script malicioso ejecutado desde la consola
const userIds = ['user1', 'user2', 'user3', /* ... 1000 usuarios */];
const myUid = 'attacker-uid';

// Dar like a 1000 usuarios en segundos
for (const targetId of userIds) {
    await saveLike(myUid, targetId);
}
// Resultado: 1000 writes a Firestore sin restricción
```

#### Solución Propuesta

**Nivel 1: Throttling en Cliente**

```javascript
// utils/throttle.js
export function throttle(fn, delay = 1000) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall < delay) {
            throw new Error('Acción demasiado rápida. Espera un momento.');
        }
        lastCall = now;
        return fn(...args);
    };
}

// Feed.jsx
const handleLike = throttle(async () => {
    // ... lógica existente
}, 1000); // Máximo 1 like por segundo
```

**Nivel 2: Rate Limiting Server-Side (Cloud Function)**

```javascript
// Cloud Function con contador
exports.createLike = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const counterRef = admin.firestore().collection('rateLimits').doc(uid);
    
    await admin.firestore().runTransaction(async tx => {
        const snap = await tx.get(counterRef);
        const now = Date.now();
        const windowStart = now - (60 * 60 * 1000); // 1 hora
        
        let state = snap.exists ? snap.data() : { likes: [] };
        state.likes = state.likes.filter(t => t > windowStart);
        
        if (state.likes.length >= 40) {
            throw new functions.https.HttpsError(
                'resource-exhausted',
                'Has alcanzado el límite de 40 likes por hora'
            );
        }
        
        state.likes.push(now);
        tx.set(counterRef, state);
    });
    
    // Crear like
    await admin.firestore().collection('likes').add({
        fromUserId: uid,
        toUserId: data.toUserId,
        type: 'like',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
});
```

#### Prioridad de Implementación

**INMEDIATA** - Implementar throttling cliente + Cloud Function en 1-2 sprints

---

## Vulnerabilidades de Alta Prioridad

### 🟠 VUL-003: Queries Sin Límites Adecuados

**Severidad**: ALTA  
**Impacto Económico**: MEDIO-ALTO  
**Impacto en Seguridad**: BAJO

#### Descripción

Las queries de Firestore usan límites muy altos (50 documentos) que se ejecutan frecuentemente, generando costos innecesarios.

#### Ubicación

- **Archivo**: [`client/src/api/user.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/user.js)
- **Líneas**: 86-111

#### Código Vulnerable

```javascript
export const getFeedUsers = async (currentUserId) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, limit(50)); // 50 reads cada llamada
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
        const userId = doc.id;
        if (userId !== currentUserId && !interactedUserIds.includes(userId)) {
            users.push({ uid: userId, ...doc.data() });
        }
    });
    
    return users; // Filtrado en cliente = reads desperdiciados
};
```

#### Riesgo

1. **Reads excesivos**: 50 reads por carga del feed
2. **Filtrado ineficiente**: Se leen 50 docs para usar ~10-20
3. **Costos acumulados**: USD 0.06 por 100k reads × frecuencia alta
4. **Performance**: Transferencia de datos innecesaria

#### Solución Propuesta

```javascript
// Reducir límite y implementar paginación
export const getFeedUsers = async (currentUserId, lastDoc = null, limitCount = 15) => {
    const interactedUserIds = await getInteractedUserIds(currentUserId);
    
    let q = query(
        collection(db, "users"),
        where("active", "==", true), // Filtrar en servidor
        orderBy("popularity", "desc"),
        limit(limitCount) // Reducido a 15
    );
    
    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
        if (!interactedUserIds.includes(doc.id)) {
            users.push({ uid: doc.id, ...doc.data() });
        }
    });
    
    return {
        users,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
};
```

#### Prioridad de Implementación

**ALTA** - Implementar en próximo sprint

---

### 🟠 VUL-004: Sin Firebase App Check

**Severidad**: ALTA  
**Impacto Económico**: MEDIO  
**Impacto en Seguridad**: ALTO

#### Descripción

No se utiliza Firebase App Check para verificar que las requests provienen de tu aplicación legítima, permitiendo que bots y scrapers accedan libremente.

#### Ubicación

- **Archivo**: [`client/src/api/firebase.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/firebase.js)
- **Líneas**: 1-17

#### Código Vulnerable

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Sin App Check = cualquier origen puede hacer requests
```

#### Riesgo

1. **Scraping masivo**: Bots pueden extraer todos los perfiles
2. **Abuso de API**: Scripts automatizados sin restricción de origen
3. **Competencia desleal**: Otras apps pueden usar tu backend
4. **Costos inflados**: Tráfico no legítimo consume cuota

#### Solución Propuesta

```javascript
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);

// Activar App Check
if (import.meta.env.PROD) {
    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
    });
} else {
    // En desarrollo, usar debug token
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const db = getFirestore(app);
export default app;
```

**Configuración en Firebase Console:**

1. Ir a Project Settings > App Check
2. Registrar tu app web
3. Activar reCAPTCHA v3
4. Enforcing mode: Habilitado

#### Prioridad de Implementación

**ALTA** - Implementar antes de producción

---

### 🟠 VUL-005: Sin Validación de Tipos de Archivo

**Severidad**: ALTA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: ALTO

#### Descripción

No se valida el tipo de archivo antes de subirlo a Cloudinary, permitiendo la subida de archivos potencialmente maliciosos.

#### Ubicación

- **Archivo**: [`client/src/api/cloudinary.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/cloudinary.js)
- **Líneas**: 3-31

#### Código Vulnerable

```javascript
export async function uploadCroppedImage(fileBlob, uid) {
    if (!fileBlob) throw new Error("No se recibió imagen recortada.");
    // Sin validación de tipo de archivo
    
    const compressed = await imageCompression(fileBlob, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1500,
    });
    
    const data = new FormData();
    data.append("file", compressed); // Cualquier archivo
    // ...
}
```

#### Riesgo

1. **SVG con scripts**: Archivos SVG pueden contener JavaScript
2. **Archivos ejecutables**: `.exe`, `.sh` renombrados como `.jpg`
3. **Exploits de parsers**: Imágenes malformadas que explotan vulnerabilidades
4. **Contenido inapropiado**: Sin moderación previa

#### Solución Propuesta

```javascript
// utils/fileValidation.js
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file) {
    // Validar tipo MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido. Solo: ${ALLOWED_TYPES.join(', ')}`);
    }
    
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Archivo muy grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    // Validar extensión (doble verificación)
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        throw new Error('Extensión de archivo no válida');
    }
    
    return true;
}

// cloudinary.js
import { validateImageFile } from '../utils/fileValidation';

export async function uploadCroppedImage(fileBlob, uid) {
    if (!fileBlob) throw new Error("No se recibió imagen recortada.");
    
    // Validar archivo
    validateImageFile(fileBlob);
    
    // Validar que sea realmente una imagen (magic numbers)
    const arrayBuffer = await fileBlob.slice(0, 4).arrayBuffer();
    const header = new Uint8Array(arrayBuffer);
    const isValidImage = validateImageHeader(header);
    
    if (!isValidImage) {
        throw new Error('El archivo no es una imagen válida');
    }
    
    // ... resto del código
}

function validateImageHeader(header) {
    // JPEG: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) return true;
    
    // PNG: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return true;
    
    // WebP: 52 49 46 46
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) return true;
    
    return false;
}
```

#### Prioridad de Implementación

**ALTA** - Implementar en 1 sprint

---

### 🟠 VUL-006: Datos Privados Accesibles desde Cliente

**Severidad**: ALTA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: ALTO

#### Descripción

El cliente intenta acceder directamente a la subcolección `private/data`, lo que podría exponer información sensible si las reglas de Firestore no están correctamente configuradas.

#### Ubicación

- **Archivo**: [`client/src/api/user.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/user.js)
- **Líneas**: 30-38, 70-73

#### Código Vulnerable

```javascript
// getUserProfile intenta leer datos privados
if (currentUser && currentUser.uid === userId) {
    try {
        const privateData = await getPrivateUserData(userId);
        if (privateData?.birthDate) {
            userData.age = calculateAge(privateData.birthDate);
        }
    } catch (error) {
        console.warn(`Could not fetch private data for user ${userId}:`, error);
    }
}

// getPrivateUserData accede directamente
export const getPrivateUserData = async (userId) => {
    const docSnap = await getDoc(doc(db, "users", userId, "private", "data"));
    return docSnap.exists() ? docSnap.data() : null;
};
```

#### Riesgo

1. **Exposición de birthDate**: Información sensible accesible
2. **Exposición de email**: Si se almacena en private/data
3. **Dependencia de reglas**: Si las reglas fallan, todo se expone
4. **Logs del navegador**: Datos sensibles en DevTools

#### Solución Propuesta

**Opción 1: Calcular edad en servidor**

```javascript
// Cloud Function que calcula edad al actualizar perfil
exports.onProfileUpdate = functions.firestore
    .document('users/{userId}/private/data')
    .onWrite(async (change, context) => {
        const privateData = change.after.data();
        if (!privateData?.birthDate) return;
        
        const age = calculateAge(privateData.birthDate);
        
        // Actualizar edad en perfil público
        await admin.firestore()
            .collection('users')
            .doc(context.params.userId)
            .update({ age });
    });

// Cliente solo lee edad del perfil público
export const getUserProfile = async (userId) => {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? docSnap.data() : null;
    // No accede a private/data
};
```

**Opción 2: Cloud Function para obtener datos propios**

```javascript
// Cloud Function
exports.getMyPrivateData = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
    
    const uid = context.auth.uid;
    const privateDoc = await admin.firestore()
        .collection('users')
        .doc(uid)
        .collection('private')
        .doc('data')
        .get();
    
    return privateDoc.data();
});

// Cliente
import { getFunctions, httpsCallable } from 'firebase/functions';

export const getMyPrivateData = async () => {
    const functions = getFunctions();
    const callable = httpsCallable(functions, 'getMyPrivateData');
    const result = await callable();
    return result.data;
};
```

#### Prioridad de Implementación

**ALTA** - Implementar en 1-2 sprints

---

## Vulnerabilidades de Media Prioridad

### 🟡 VUL-007: Sin Sanitización de Inputs

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: MEDIO

#### Descripción

No se sanitizan los inputs de usuario antes de guardarlos en Firestore, permitiendo potenciales ataques XSS o inyección de caracteres especiales.

#### Ubicación

- **Archivos**: `Chat.jsx`, `CreateProfile.jsx`, `EditProfile.jsx`
- **Líneas**: Múltiples inputs sin validación

#### Código Vulnerable

```javascript
// Chat.jsx - Mensaje sin sanitizar
const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && matchId) {
        const messageData = {
            roomId: matchId,
            author: user.uid,
            message: message, // Sin sanitización
            time: new Date().toLocaleTimeString(),
        };
        socketService.sendMessage(messageData);
    }
};
```

#### Riesgo

1. **XSS**: Si se renderiza HTML sin escapar
2. **Payloads largos**: Mensajes de 10MB que consumen storage
3. **Caracteres especiales**: Rompen queries o UI
4. **Spam**: Mensajes repetitivos sin límite

#### Solución Propuesta

```javascript
// utils/sanitize.js
export function sanitizeText(text, maxLength = 500) {
    if (!text || typeof text !== 'string') return '';
    
    // Limitar longitud
    let sanitized = text.slice(0, maxLength);
    
    // Eliminar caracteres peligrosos
    sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    // Eliminar espacios múltiples
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
}

export function validateBio(bio) {
    const sanitized = sanitizeText(bio, 500);
    
    if (sanitized.length < 10) {
        throw new Error('La biografía debe tener al menos 10 caracteres');
    }
    
    return sanitized;
}

// Chat.jsx
import { sanitizeText } from '../utils/sanitize';

const handleSendMessage = (e) => {
    e.preventDefault();
    const sanitizedMessage = sanitizeText(message, 1000);
    
    if (sanitizedMessage && matchId) {
        const messageData = {
            roomId: matchId,
            author: user.uid,
            message: sanitizedMessage,
            time: new Date().toLocaleTimeString(),
        };
        socketService.sendMessage(messageData);
        setMessage("");
    }
};
```

#### Prioridad de Implementación

**MEDIA** - Implementar en 2-3 sprints

---

### 🟡 VUL-008: Console.log con Información Sensible

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: MEDIO

#### Descripción

Múltiples archivos contienen `console.log` con información sensible (UIDs, datos de usuarios) que queda expuesta en producción.

#### Ubicación

- **Archivo**: [`client/src/pages/Feed.jsx`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/pages/Feed.jsx) línea 59
- **Archivo**: [`client/src/pages/Chat.jsx`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/pages/Chat.jsx) línea 82
- **Múltiples archivos**

#### Código Vulnerable

```javascript
// Feed.jsx
console.log("💖 Like action:", {
    fromUserId: user.uid,
    toUserId: currentUser.id,
    currentUserName: currentUser.name,
    loggedInUserUid: user.uid,
    areTheSame: user.uid === currentUser.id
});

// Chat.jsx
console.error("❌ Cannot send message: User not authenticated");
```

#### Riesgo

1. **Exposición de UIDs**: Visible en DevTools
2. **Tracking de usuarios**: Terceros pueden ver interacciones
3. **Debugging info**: Revela lógica interna de la app
4. **Performance**: Console.log afecta rendimiento

#### Solución Propuesta

```javascript
// utils/logger.js
const isDevelopment = import.meta.env.DEV;

export const logger = {
    log: (...args) => {
        if (isDevelopment) console.log(...args);
    },
    warn: (...args) => {
        if (isDevelopment) console.warn(...args);
    },
    error: (...args) => {
        // Errores siempre se loggean, pero sin datos sensibles
        console.error(...args);
        
        // En producción, enviar a servicio de monitoreo
        if (!isDevelopment) {
            // Sentry, LogRocket, etc.
        }
    }
};

// Feed.jsx
import { logger } from '../utils/logger';

const handleLike = async () => {
    logger.log("💖 Like action:", {
        fromUserId: user.uid,
        toUserId: currentUser.id
    }); // Solo en desarrollo
    
    // ...
};
```

**Build Configuration (vite.config.js)**

```javascript
export default defineConfig({
    plugins: [react()],
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Eliminar console.* en producción
                drop_debugger: true
            }
        }
    }
});
```

#### Prioridad de Implementación

**MEDIA** - Implementar antes de producción

---

### 🟡 VUL-009: WebSocket Sin Autenticación Robusta

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: MEDIO

#### Descripción

El sistema de WebSocket no verifica adecuadamente la identidad del usuario en cada mensaje, permitiendo potencial suplantación.

#### Ubicación

- **Archivo**: [`client/src/services/socket.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/services/socket.js)
- **Archivo**: [`client/src/pages/Chat.jsx`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/pages/Chat.jsx) líneas 88-93

#### Código Vulnerable

```javascript
// Chat.jsx
const messageData = {
    roomId: matchId,
    author: user.uid, // UID enviado desde cliente
    message: message,
    time: new Date().toLocaleTimeString(),
};

socketService.sendMessage(messageData);
```

#### Riesgo

1. **Suplantación de identidad**: Usuario puede cambiar `author` en DevTools
2. **Mensajes falsos**: Enviar mensajes como otro usuario
3. **Spam**: Enviar mensajes a rooms sin permiso
4. **Manipulación de timestamps**: Alterar orden de mensajes

#### Solución Propuesta

**Backend (Socket Handler)**

```javascript
// server/socket/socketHandler.js
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    try {
        // Verificar token de Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.userId = decodedToken.uid;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    socket.on('send_message', async (data) => {
        const { roomId, message } = data;
        
        // Verificar que el usuario pertenece al room
        const matchDoc = await admin.firestore()
            .collection('matches')
            .doc(roomId)
            .get();
        
        const matchData = matchDoc.data();
        if (!matchData.users.includes(socket.userId)) {
            socket.emit('error', 'No tienes permiso para este chat');
            return;
        }
        
        // Usar UID del socket (verificado), no del cliente
        const messageData = {
            roomId,
            author: socket.userId, // UID del servidor
            message: sanitize(message),
            time: new Date().toISOString()
        };
        
        // Guardar en Firestore
        await admin.firestore()
            .collection('chats')
            .doc(roomId)
            .collection('messages')
            .add(messageData);
        
        // Broadcast
        io.to(roomId).emit('receive_message', messageData);
    });
});
```

**Cliente**

```javascript
// services/socket.js
import { getAuth } from 'firebase/auth';

class SocketService {
    async connect() {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });
    }
    
    sendMessage(data) {
        // No enviar author, el servidor lo asigna
        this.socket.emit('send_message', {
            roomId: data.roomId,
            message: data.message
        });
    }
}
```

#### Prioridad de Implementación

**MEDIA** - Implementar en 2 sprints

---

### 🟡 VUL-010: Sin Protección CSRF

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: MEDIO

#### Descripción

No hay tokens CSRF en formularios, permitiendo potenciales ataques de Cross-Site Request Forgery.

#### Riesgo

1. **Acciones no autorizadas**: Ejecutar acciones en nombre del usuario
2. **Likes/matches falsos**: Forzar interacciones
3. **Modificación de perfil**: Cambiar datos sin consentimiento

#### Solución Propuesta

Firebase Authentication ya provee protección contra CSRF mediante tokens de sesión. Asegurar que:

1. Todas las requests usen el token de Firebase
2. Verificar `Origin` y `Referer` headers en el backend
3. Usar SameSite cookies si se implementan sesiones

```javascript
// Cloud Function
exports.protectedAction = functions.https.onCall(async (data, context) => {
    // context.auth ya valida el token
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated');
    }
    
    // Verificar que la request viene de tu dominio
    const origin = context.rawRequest.headers.origin;
    const allowedOrigins = ['https://tu-app.com', 'https://www.tu-app.com'];
    
    if (!allowedOrigins.includes(origin)) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid origin');
    }
    
    // ... lógica
});
```

#### Prioridad de Implementación

**MEDIA** - Verificar configuración actual

---

### 🟡 VUL-011: Credenciales de Firebase Expuestas

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: BAJO

#### Descripción

Las credenciales de Firebase están en el código del cliente. Aunque esto es normal para Firebase, requiere que las reglas de seguridad sean perfectas.

#### Ubicación

- **Archivo**: [`client/src/api/firebase.js`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/client/src/api/firebase.js)

#### Código

```javascript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    // ...
};
```

#### Nota

Esto es **esperado** en Firebase. La seguridad se maneja mediante:

1. **Firestore Rules**: Validación server-side
2. **App Check**: Verificación de origen
3. **Rate Limiting**: Límites de uso

#### Acción Requerida

✅ Verificar que las reglas de Firestore sean estrictas (ver [`firestore.rules`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/firestore.rules))  
✅ Implementar App Check (VUL-004)  
✅ Monitorear uso en Firebase Console

#### Prioridad de Implementación

**BAJA** - Solo verificar configuración

---

### 🟡 VUL-012: Falta de Validación de Longitud en Campos

**Severidad**: MEDIA  
**Impacto Económico**: BAJO  
**Impacto en Seguridad**: BAJO

#### Descripción

No se validan las longitudes máximas de campos de texto, permitiendo payloads muy grandes.

#### Riesgo

1. **Costos de storage**: Biografías de 10MB
2. **Performance**: Queries lentas
3. **UI rota**: Textos muy largos rompen diseño

#### Solución Propuesta

```javascript
// utils/validation.js
export const FIELD_LIMITS = {
    name: { min: 2, max: 50 },
    bio: { min: 10, max: 500 },
    message: { min: 1, max: 1000 },
    interests: { max: 8, itemLength: 30 }
};

export function validateField(value, fieldName) {
    const limits = FIELD_LIMITS[fieldName];
    if (!limits) return value;
    
    if (value.length < limits.min) {
        throw new Error(`${fieldName} debe tener al menos ${limits.min} caracteres`);
    }
    
    if (value.length > limits.max) {
        throw new Error(`${fieldName} no puede exceder ${limits.max} caracteres`);
    }
    
    return value;
}

// Implementar en Firestore Rules también
// firestore.rules
match /users/{userId} {
    allow update: if request.resource.data.bio.size() <= 500
                  && request.resource.data.name.size() <= 50;
}
```

#### Prioridad de Implementación

**MEDIA** - Implementar en 2 sprints

---

## Plan de Acción Recomendado

### Sprint 0 (Inmediato - Antes de Producción)

**Duración**: 1 semana

- [ ] **VUL-001**: Implementar Cloud Function para upload de imágenes
- [ ] **VUL-002**: Agregar throttling básico en cliente (likes, uploads)
- [ ] **VUL-004**: Activar Firebase App Check
- [ ] **VUL-008**: Configurar build para eliminar console.log

**Resultado esperado**: Bloquear vulnerabilidades críticas que pueden generar costos descontrolados.

---

### Sprint 1 (Alta Prioridad)

**Duración**: 2 semanas

- [ ] **VUL-002**: Implementar Cloud Function con rate limiting server-side
- [ ] **VUL-003**: Reducir límites de queries y agregar paginación
- [ ] **VUL-005**: Validación robusta de tipos de archivo
- [ ] **VUL-006**: Mover cálculo de edad a Cloud Function

**Resultado esperado**: Optimizar costos y mejorar seguridad de datos privados.

---

### Sprint 2 (Media Prioridad)

**Duración**: 2 semanas

- [ ] **VUL-007**: Implementar sanitización de inputs
- [ ] **VUL-009**: Mejorar autenticación de WebSocket
- [ ] **VUL-012**: Validación de longitudes de campos
- [ ] Pruebas de seguridad end-to-end

**Resultado esperado**: Cerrar vectores de ataque XSS y suplantación.

---

### Sprint 3 (Mejoras Continuas)

**Duración**: Ongoing

- [ ] Monitoreo con Sentry/LogRocket
- [ ] Dashboards de Firebase Usage
- [ ] Alertas de costos
- [ ] Auditorías de seguridad mensuales
- [ ] Penetration testing

---

## Referencias

### Documentos Relacionados

- [`security.md`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/security.md) - Guía general de seguridad
- [`firestore.rules`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/firestore.rules) - Reglas actuales de Firestore
- [`Arquitectura.md`](file:///c:/Users/Ladyt/Paulii%20Darkness%20Dev/Aplicación%20123/Arquitectura.md) - Arquitectura del sistema

### Recursos Externos

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Cloudinary Security](https://cloudinary.com/documentation/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Última actualización**: 25 de Noviembre, 2025  
**Próxima revisión**: Después de implementar Sprint 0
