# Security.md

> Guía de seguridad práctica y accionable para la **App de Citas** (React + Firebase + Cloudinary). Contiene reglas, snippets y checklist listos para implementar.

---

## 1. Objetivo

Proteger datos sensibles, prevenir abuso (lecturas/escrituras masivas), mitigar uploads maliciosos, detectar bots y proporcionar un plan de monitoreo y respuesta.

---

## 2. Principios generales

- **Separación de datos públicos / privados** (ya implementada).
- **Defensa en profundidad**: validaciones en cliente, reglas de Firestore, Cloud Functions y monitoreo.
- **Fail closed**: cuando exista duda, denegar.
- **Registro (audit logging)**: todo acceso denegado o patrón sospechoso debe quedar registrado.

---

## 3. Firestore — reglas y prácticas

### 3.1 Reglas recomendadas (snippet)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId){
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users public profile
    match /users/{userId} {
      // lectura solo si autenticado y con limit en el cliente
      allow read: if isAuthenticated();

      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId)
                  && !request.resource.data.keys().hasAny(['birthDate'])
                  || request.resource.data.birthDate == resource.data.birthDate;
      allow delete: if isOwner(userId);

      // Private subcollection
      match /private/data {
        allow read, write: if isOwner(userId);

        // birthDate inmutable post-creation
        allow update: if isOwner(userId)
                      && (!request.resource.data.keys().hasAny(['birthDate'])
                          || request.resource.data.birthDate == resource.data.birthDate);
      }
    }

    // Likes collection - validaciones anti-spam
    match /likes/{likeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated()
                    && request.auth.uid == request.resource.data.fromUserId
                    && request.resource.data.fromUserId != request.resource.data.toUserId
                    // obligar timestamp y limitar tamaño de payload
                    && request.resource.data.keys().size() < 20;
      allow delete: if isAuthenticated() && resource.data.fromUserId == request.auth.uid;
      allow update: if false;
    }

    // Matches - solo partes involucradas
    match /matches/{matchId} {
      allow read: if isAuthenticated() && (request.auth.uid == resource.data.user1Id || request.auth.uid == resource.data.user2Id);
      allow create: if isAuthenticated() && (request.auth.uid == request.resource.data.user1Id || request.auth.uid == request.resource.data.user2Id);
      allow update, delete: if false;
    }

    // Chats/messages: reglas estrictas (más abajo sugerimos usar Cloud Functions para crear mensajes)
    match /chats/{chatId} {
      allow read: if isAuthenticated() && request.auth.uid in resource.data.participants;
      allow create: if false; // crear chat sólo vía Cloud Function
      match /messages/{messageId} {
        allow read: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if false; // crear mensajes sólo vía Cloud Function
      }
    }
  }
}
```

**Notas**:
- Evitar `allow list` sin límites; forzar `.limit()` en consultas cliente.
- Para consultas complejas, usar índices compuestos y paginación (`startAfter`).

---

### 3.2 Evitar export masivo

- No permitir endpoints o funciones que devuelvan `allUsers`.
- Rechazar en Firestore cualquier intento de listar sin `limit()` desde el cliente (forzar en lógica de app y auditar intentos).

---

## 4. Rate limiting y anti-flood

### 4.1 Estrategia híbrida

- **Cliente**: debounce / throttle y bloqueo UX temporario.
- **Servidor (Cloud Functions)**: contador por `uid` + TTL (por ejemplo Redis o Firestore con doc por usuario) para verificar límites por minuto/hora/día.

### 4.2 Umbrales sugeridos

- Likes: 40/hora, 200/día
- Creación de cuentas desde misma IP: máximo 5 en 1 hora
- Subidas de imágenes: 10/hora

### 4.3 Ejemplo básico (Cloud Function) — contador de likes

```js
// Pseudocódigo: incrementa y verifica
exports.createLike = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  if(!uid) throw new functions.https.HttpsError('unauthenticated','...');

  const counterRef = admin.firestore().collection('rateLimits').doc(uid);
  await admin.firestore().runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    const now = Date.now();
    const windowStart = now - (60*60*1000); // 1h
    let state = snap.exists ? snap.data() : {likes: [], lastReset: now};
    // limpiar likes fuera de la ventana
    state.likes = state.likes.filter(t => t > windowStart);
    if(state.likes.length >= 40) throw new functions.https.HttpsError('resource-exhausted','rate limit');
    state.likes.push(now);
    tx.set(counterRef, state);
  });
  // Luego crear documento en likes/...
});
```

**Mejor opción a mediano plazo**: usar Redis (más eficiente) o un servicio de rate-limiting.

---

## 5. Imágenes — Cloudinary

### 5.1 Presets y firma

- Usar **Upload Presets** restringidos por carpeta `users/{uid}`.
- Preferir presets con firma para operaciones sensibles (si no hay backend, mantener presets sin firma pero con validación adicional y límites).

### 5.2 Validaciones en subida

- Tipos permitidos: `jpg, jpeg, png, webp` (NO SVG).
- Tamaño máximo: 2MB (preferible 1MB para mobile).
- Dimensiones máximas: 1500px.
- `q_auto`, `f_auto`, `c_fill` en transformaciones.

### 5.3 Moderación automática

- Habilitar detección de nudity / gore / violence / safe search.
- Flujo: subir → Cloudinary callback (webhook) → Cloud Function que valida tags/moderation → si falla, borrar imagen o poner status `pending_review`.

### 5.4 Evitar hotlinking y abuso

- Limitar permisos de CDN a solo servir recursos con firma si se detecta abuso.
- Monitorear número de requests por folder/uid.

---

## 6. Prevención de bots y scraping

### 6.1 Captcha

- Implementar reCAPTCHA v3 o hCaptcha en:
  - Registro
  - Subida de imagen
  - Acciones de alto impacto (p. ej.: enviar X likes consecutivos)

### 6.2 Device fingerprinting y señales

- Guardar en `users/{uid}/private/security`: userAgent (normalizado), IP (rango), timestamp de creación, provider OAuth.
- Analizar patrones (mismo userAgent + múltiples cuentas + mismas IPs).

### 6.3 Heurísticas simples

- Detectar rapidez en swipes: si swipe < 200ms por perfil → marcar cuenta.
- Ratio likes/visits alto → revisar.

---

## 7. Encriptación y manejo de datos sensibles

### 7.1 Encriptación en reposo / tránsito

- Firebase en tránsito y en reposo ya provee cifrado. Para datos aún más sensibles (birthDate, email), valorar cifrado a nivel de aplicación o server-side con Cloud Functions.

### 7.2 Ejemplo: cifrado AES en Cloud Function

```js
// Cloud Function que encripta antes de guardar
const crypto = require('crypto');
const KEY = functions.config().security.aes_key; // usar env vars
function encrypt(text){
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY,'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
```

---

## 8. Sanitización y validación

- Sanear todo texto que venga del cliente (bio, nombre, mensajes) para eliminar `<>`, scripts y long payloads.
- Limitar longitud (bio 500 chars, intereses 8 max).

---

## 9. Monitoreo, alertas y auditoría

### 9.1 Logging

- Activar Firebase security rules logging (audit).
- En Cloud Functions: loggear intentos denegados, patrones de abuso e IPs.

### 9.2 Herramientas

- **Sentry**: errores cliente/servidor.
- **Cloud Monitoring / Cloud Logging**: métricas de Firestore reads/writes.
- **Cloudinary Analytics**: uso de imágenes.

### 9.3 Alertas

- Alertas si:
  - lecturas de Firestore aumentan > 2x día vs baseline
  - spikes en subidas de imágenes
  - múltiple creación de cuentas desde la misma IP

---

## 10. Respuesta a incidentes

- Bloquear cuenta sospechosa en modo `suspended` (read-only) hasta revisión manual.
- Endpoint admin (interno) para revisar `security` doc de usuario y logs.
- Proceso: detectar → suspender → conservar evidencia → contactar soporte → resolver / ban.

---

## 11. Checklist de implementación (prioridad)

### Obligatorio (MVP previo a producción)
- [ ] Implementar reglas Firestore del apartado 3.1
- [ ] Forzar `.limit()` y paginación en consultas de feed
- [ ] Implementar debounces/throttles en frontend para llamadas críticas
- [ ] Limitar cantidad de imágenes por usuario y tipos permitidos
- [ ] Habilitar Cloudinary moderation y webhook
- [ ] Implementar captchas en registro y upload
- [ ] Activar logging de rules (audit)

### Recomendado (1-3 sprints)
- [ ] Rate limiting server-side con Cloud Functions (o Redis)
- [ ] Cifrado server-side para birthDate/email
- [ ] Sistema de reporte + automatismo (bloqueo temporal)
- [ ] Sentry + dashboards básicos

### Opcional / a futuro
- [ ] Redis para counters y rate limiting
- [ ] Detección avanzada de bots con ML
- [ ] Firma en URLs Cloudinary si se detecta abuso

---

## 12. Ejemplos de snippets cliente (prácticos)

### 12.1 Debounce para solicitudes (ejemplo en React)

```js
// simple debounce
export function debounce(fn, ms = 400){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

### 12.2 Cache de perfiles en IndexedDB (idea)

- Usar `idb` o `localForage` para guardar perfiles ya consultados y evitar re-reads innecesarios.

---

## 13. Tests y validación

- Tests de reglas de Firestore con **Firebase Emulator Suite**.
- Tests E2E que simulen abuso (spamming likes, descargas masivas).
- Tests de Cloud Functions (unit + integration) con mocks.

---

## 14. Tareas operativas (deploy)

1. Crear ENV vars seguras en Firebase / Cloud Functions (keys, AES key).
2. Revisar Cloudinary presets y habilitar moderation.
3. Desplegar reglas Firestore en entorno staging.
4. Ejecutar batería de tests de reglas contra emulator.
5. Lanzar en production con monitoreo activado.

---

## 15. Referencias rápidas

- Arquitectura ya existente: `Arquitectura.md` (usar estructura de `users/{uid}/private/data`).
- Requisitos: `Requisitos.md` (lista de pendientes: moderación, reporte, 2FA).

---

## 16. Próximos pasos que puedo ayudarte a producir

- `firestore.rules` final listo para pegar (con tests de emulator).
- Cloud Function completa para rate-limiting (JS/TS) y ejemplo de despliegue.
- Webhook handler de Cloudinary que marque `images/{imageId}` como `pending_review` o `approved`.
- Panel admin minimal para revisar users sospechosos.


---

*Actualizado: Noviembre 2025*

