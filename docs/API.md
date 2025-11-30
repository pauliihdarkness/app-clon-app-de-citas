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

---

## 🛠️ Scripts de Mantenimiento

### Limpieza de Rate Limits
Script para eliminar registros antiguos de límites de velocidad.
```bash
npm run clean:ratelimits
```
