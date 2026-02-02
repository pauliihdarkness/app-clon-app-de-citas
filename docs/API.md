# 📚 Documentación de API - App de Citas

Esta documentación detalla los endpoints disponibles en el backend de la aplicación (Node.js + Express).

## 🔐 Autenticación y Seguridad

Todas las rutas bajo `/api` (excepto `/api/verify-turnstile`) requieren un token de autenticación de Firebase válido en el header `Authorization`.

**Header:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

### Rate Limiting
Se aplican límites de velocidad para prevenir abuso:
- **General**: 100 peticiones / 15 min (todos los endpoints)
- **Lectura (Matches)**: 200 peticiones / hora
- **Escritura (Likes)**: 50 peticiones / hora (además del límite de negocio de 40 likes/hora)
- **Privacidad (Bloques)**: 100 peticiones / hora

---

## 📡 Endpoints

### 1. Estado del Servidor

#### `GET /`
Verifica si el servidor está en línea.
- **Auth**: No requerida
- **Respuesta**: `200 OK` - "I am alive! 🤖"

#### `GET /api/status`
Verifica el estado de la autenticación y conexión segura.
- **Auth**: Requerida
- **Respuesta**: `200 OK`
  ```json
  {
    "status": "secure",
    "user": "uid_del_usuario",
    "message": "You are authenticated!"
  }
  ```

---

### 2. Verificación de Bots (Turnstile)

#### `POST /api/verify-turnstile`
Verifica el token generado por el widget de Cloudflare Turnstile.
- **Auth**: No requerida
- **Body**:
  ```json
  {
    "token": "turnstile_token_string"
  }
  ```
- **Respuesta**: `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

### 3. Matches

#### `GET /api/matches`
Obtiene la lista de matches para un usuario específico.
- **Auth**: Requerida
- **Query Params**: `userId` (ID del usuario actual)
- **Respuesta**: `200 OK`
  ```json
  [
    {
      "id": "match_id",
      "users": ["uid1", "uid2"],
      "otherUserId": "uid2",
      "lastMessage": "Hola!",
      "lastMessageTime": "2023-10-27T10:00:00.000Z",
      "unreadCount": 2
    }
  ]
  ```

#### `GET /api/matches/:matchId/messages`
Obtiene el historial de mensajes de un match.
- **Auth**: Requerida
- **Respuesta**: `200 OK`
  ```json
  [
    {
      "id": "msg_id",
      "roomId": "match_id",
      "author": "sender_uid",
      "message": "Hola, ¿cómo estás?",
      "time": "10:00:00",
      "timestamp": { "_seconds": 1698400800, "_nanoseconds": 0 }
    }
  ]
  ```

#### `POST /api/matches/:matchId/mark-read`
Marca todos los mensajes de un match como leídos para el usuario actual.
- **Auth**: Requerida
- **Body**:
  ```json
  {
    "userId": "uid_del_usuario_actual"
  }
  ```
- **Respuesta**: `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

### 4. Likes

#### `POST /api/likes`
Envía un like a otro usuario. Incluye validación de rate limit de negocio (40 likes/hora).
- **Auth**: Requerida
- **Body**:
  ```json
  {
    "toUserId": "uid_del_usuario_destino"
  }
  ```
- **Respuesta**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Like saved successfully."
  }
  ```
- **Errores**:
  - `400 Bad Request`: Si falta `toUserId` o es auto-like.
  - `429 Too Many Requests`: Si excede el límite de 40 likes/hora.

#### `POST /api/passes`
Registra un "pass" (rechazo) a otro usuario.
- **Auth**: Requerida
- **Body**:
  ```json
  {
    "toUserId": "uid_del_usuario_rechazado"
  }
  ```
- **Respuesta**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Pass saved successfully."
  }
  ```

---

## 5. Contactos Bloqueados (Privacidad)

#### `GET /api/blocked-contacts`
Obtiene la lista de contactos bloqueados del usuario actual.
- **Auth**: Requerida
- **Query Params**: `userId` (ID del usuario actual)
- **Respuesta**: `200 OK`
  ```json
  [
    {
      "id": "uid_bloqueado",
      "name": "Juan Pérez",
      "username": "juanperez",
      "avatar": "https://..."
    }
  ]
  ```

#### `POST /api/blocked-contacts`
Bloquea un contacto.
- **Auth**: Requerida
- **Body**:
  ```json
  {
    "blockedUserId": "uid_del_usuario_a_bloquear"
  }
  ```
- **Respuesta**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Contact blocked successfully."
  }
  ```
- **Errores**:
  - `400 Bad Request`: Si falta `blockedUserId`.
  - `409 Conflict`: Si el contacto ya está bloqueado.

#### `DELETE /api/blocked-contacts/:blockedUserId`
Desbloquea un contacto.
- **Auth**: Requerida
- **Respuesta**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Contact unblocked successfully."
  }
  ```
- **Errores**:
  - `404 Not Found`: Si el contacto no está en la lista de bloqueados.

---

## 6. Verificación de Identidad

#### `POST /api/verify-identity`
Verifica la identidad del usuario mediante gestos faciales.
- **Auth**: Requerida
- **Body**:
  ```json
  {
    "gestureType": "smile|blink|nod|shake",
    "confidence": 0.85,
    "processedAt": "2023-10-27T10:00:00.000Z"
  }
  ```
- **Respuesta**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Identity verified successfully.",
    "verificationId": "ver_xxxxx",
    "verified": true
  }
  ```
- **Errores**:
  - `400 Bad Request`: Si los datos no son válidos.
  - `422 Unprocessable Entity`: Si la confianza es < 0.70.

#### `GET /api/verify-identity/status`
Obtiene el estado de verificación del usuario actual.
- **Auth**: Requerida
- **Respuesta**: `200 OK`
  ```json
  {
    "isVerified": true,
    "verificationStatus": "approved",
    "verifiedAt": "2023-10-27T10:00:00.000Z",
    "gestureType": "smile"
  }
  ```

---

## 📱 Almacenamiento Local (localStorage)

### Privacy Settings
```javascript
// Estructura en localStorage
{
  "privacySettings": {
    "showApproxLocation": true,
    "shareExactLocation": false,
    "allowUseForProximity": true
  },
  
  "blockedContacts": [
    {
      "id": "uid_bloqueado",
      "name": "Juan Pérez",
      "username": "juanperez",
      "avatar": "https://..."
    }
  ]
}
```

---

## 🛠️ Scripts de Mantenimiento

### Limpieza de Rate Limits
Script para eliminar registros antiguos de límites de velocidad.
```bash
npm run clean:ratelimits
```

### Limpieza de Matches
Script para limpiar registros de matches antiguos.
```bash
npm run clean:matches
```

---

## 📊 Códigos de Error HTTP

| Código | Significado | Solución |
|--------|-------------|----------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Validación fallida, revisa el body |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | No tienes permisos para esta acción |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | El recurso ya existe |
| `429` | Too Many Requests | Has excedido el rate limit |
| `500` | Server Error | Error interno del servidor |

---

## 🔄 Migración de v1.0.0 a v1.0.1

### Nuevas Características
- ✅ Endpoints de contactos bloqueados (`/api/blocked-contacts`)
- ✅ Almacenamiento local de datos de privacidad
- ✅ Control de rate limit para operaciones de privacidad

### Breaking Changes
- Ninguno

---

**Última actualización:** 2 de febrero de 2026  
**Versión:** 1.0.1  
**Estado:** ✅ En Producción

---
