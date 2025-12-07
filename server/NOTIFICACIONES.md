# Notificaciones Push - Documentación

## Descripción General

El servidor ahora incluye un sistema completo de notificaciones push integrado que envía notificaciones automáticamente cuando:
- Se recibe un nuevo mensaje en un chat
- Se crea un nuevo match entre dos usuarios

## Arquitectura

### Servicio de Notificaciones
**Archivo:** `server/services/notificationService.js`

Servicio centralizado que maneja toda la lógica de notificaciones push:
- `sendMessageNotification(matchId, senderId, messageText)` - Notificaciones de mensajes
- `sendMatchNotification(matchId, userId1, userId2)` - Notificaciones de matches
- `getUserTokens(userId)` - Obtiene tokens FCM de un usuario
- `cleanInvalidTokens(userId, invalidTokens)` - Limpia tokens inválidos automáticamente

### Integración

#### Socket Handler (`socket/socketHandler.js`)
Cuando se envía un mensaje:
1. Guarda el mensaje en Firestore
2. Actualiza el match con último mensaje
3. **Envía notificación push al destinatario** (nuevo)

#### Match Worker (`workers/matchWorker.js`)
Cuando se crea un match:
1. Detecta likes recíprocos
2. Crea documento de match en Firestore
3. **Envía notificaciones push a ambos usuarios** (nuevo)

## API Endpoints

### Registrar Token FCM
```http
POST /api/fcm-tokens
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "token": "fcm-token-string"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

### Eliminar Token FCM
```http
DELETE /api/fcm-tokens
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "token": "fcm-token-string"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token removed successfully"
}
```

## Estructura de Datos en Firestore

### Tokens FCM
```
users/{userId}/private/fcmTokens
{
  tokens: ["token1", "token2", ...],
  updatedAt: Timestamp
}
```

Los tokens se almacenan en una subcolección `private` para mantenerlos seguros y separados del perfil público.

## Formato de Notificaciones

### Notificación de Mensaje
```javascript
{
  notification: {
    title: "Nombre del Remitente",
    body: "Texto del mensaje (truncado a 100 chars)",
    imageUrl: "URL de la foto del remitente" // opcional
  },
  data: {
    conversationId: "matchId",
    senderId: "userId",
    type: "chat_message",
    click_action: "FLUTTER_NOTIFICATION_CLICK"
  }
}
```

### Notificación de Match
```javascript
{
  notification: {
    title: "¡Nuevo Match! 💕",
    body: "¡Hiciste match con [Nombre]!",
    imageUrl: "URL de la foto del match" // opcional
  },
  data: {
    conversationId: "matchId",
    matchedUserId: "userId",
    type: "new_match",
    click_action: "FLUTTER_NOTIFICATION_CLICK"
  }
}
```

## Configuración de Plataformas

### Android
- **Channel ID:** `chat_messages`
- **Priority:** `high`
- **Sound:** `default`

### iOS (APNS)
- **Sound:** `default`
- **Badge:** `1`

## Manejo de Errores

Las notificaciones push son **no bloqueantes**:
- Si falla el envío, se registra el error pero no afecta el flujo principal
- Los tokens inválidos se limpian automáticamente
- Los errores se logean con el prefijo `⚠️` o `❌`

### Tokens Inválidos
Los tokens se consideran inválidos cuando:
- El usuario desinstala la app
- El usuario borra los datos de la app
- El token expira (raramente)

El sistema limpia automáticamente tokens inválidos después de cada intento de envío fallido.

## Rate Limiting

Los endpoints de FCM tokens tienen rate limiting estricto:
- **50 requests por hora** por usuario
- Previene abuso del sistema de registro de tokens

## Logs

### Mensajes de Log
- `📱 Enviando notificación a X dispositivo(s)` - Inicio de envío
- `✅ Notificación enviada: X éxitos, Y fallos` - Resultado exitoso
- `🧹 Eliminando X token(s) inválido(s)` - Limpieza automática
- `⚠️ Usuario no tiene tokens FCM` - Usuario sin tokens registrados
- `❌ Error en notificación:` - Error en el proceso

## Uso desde el Cliente

### 1. Obtener Token FCM
```dart
// En Flutter
String? token = await FirebaseMessaging.instance.getToken();
```

### 2. Registrar Token en el Servidor
```dart
final response = await http.post(
  Uri.parse('$apiUrl/api/fcm-tokens'),
  headers: {
    'Authorization': 'Bearer $firebaseToken',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({'token': token}),
);
```

### 3. Manejar Notificaciones
```dart
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Manejar notificación cuando la app está en foreground
  print('Mensaje recibido: ${message.notification?.title}');
  
  // Navegar según el tipo
  if (message.data['type'] == 'chat_message') {
    // Navegar al chat
    Navigator.push(...);
  } else if (message.data['type'] == 'new_match') {
    // Mostrar pantalla de match
    showMatchDialog(...);
  }
});
```

### 4. Eliminar Token al Cerrar Sesión
```dart
await http.delete(
  Uri.parse('$apiUrl/api/fcm-tokens'),
  headers: {
    'Authorization': 'Bearer $firebaseToken',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({'token': token}),
);
```

## Testing

### Probar Notificación de Mensaje
1. Tener dos usuarios con tokens FCM registrados
2. Usuario A envía mensaje a Usuario B
3. Usuario B debe recibir notificación push

### Probar Notificación de Match
1. Tener dos usuarios con tokens FCM registrados
2. Usuario A da like a Usuario B
3. Usuario B da like a Usuario A
4. Ambos usuarios deben recibir notificación de match

### Verificar Logs
```bash
# En el servidor, revisar logs en tiempo real
npm run dev
```

Buscar mensajes con emojis:
- 📱 = Enviando notificación
- ✅ = Éxito
- ❌ = Error
- 🧹 = Limpieza de tokens

## Diferencias con Cloud Functions

### Antes (Cloud Functions)
- Funciones separadas desplegadas en Firebase
- Triggers automáticos de Firestore
- Requiere Blaze Plan (plan de pago)
- Deploy separado: `firebase deploy --only functions`

### Ahora (Servidor Integrado)
- Todo en un solo servidor Express
- Integrado con workers y socket handlers existentes
- No requiere plan de pago adicional
- Deploy único con el resto del servidor

## Ventajas de la Integración

1. **Unificación**: Todo el código del servidor en un solo lugar
2. **Simplicidad**: Un solo deploy, una sola configuración
3. **Costos**: No requiere Blaze Plan de Firebase
4. **Debugging**: Más fácil debuggear con logs centralizados
5. **Mantenimiento**: Más fácil mantener y actualizar

## Próximos Pasos

1. ✅ Implementación completada
2. ⏳ Testing en desarrollo
3. ⏳ Testing en producción
4. ⏳ Monitoreo de logs y métricas
