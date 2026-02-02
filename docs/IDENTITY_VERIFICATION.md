# Sistema de Verificación de Identidad con Gesto

## Descripción General

Este sistema valida la identidad de los usuarios capturando un gesto facial en tiempo real. El usuario debe completar uno de varios gestos posibles para demostrar que es una persona real, no un bot.

## Características

### Gestos Soportados
1. **Sonreír** - Hacer una sonrisa natural a la cámara
2. **Parpadear** - Parpadear dos o tres veces de forma clara
3. **Asentir** - Mover la cabeza hacia arriba y hacia abajo
4. **Negar** - Mover la cabeza de lado a lado

### Funcionalidades
- ✅ Acceso a cámara web en tiempo real
- ✅ Detección de movimiento facial usando canvas
- ✅ Contador regresivo antes de iniciar grabación
- ✅ Grabación de 5 segundos máximo
- ✅ Análisis de confianza de gesto (0-1)
- ✅ Historial de intentos
- ✅ Estados de verificación: pendiente, aprobada, rechazada
- ✅ Cancelación de verificaciones pendientes

## Estructura del Código

### Frontend

#### Componentes

**IdentityVerification.jsx**
- Componente principal que muestra las opciones de gestos
- Maneja el flujo de estados: instrucciones → captura → procesamiento → resultado

**GestureDetection.jsx**
- Captura de video en tiempo real
- Contador regresivo (3 segundos)
- Indicador de grabación
- Barra de progreso

#### Hooks

**useGestureDetection.js**
- Lógica de detección de gestos basada en análisis de frames
- Comparación de frames consecutivos para detectar movimiento
- Clasificación de gestos según patrones de movimiento

#### API

**api/verification.js**
- `submitIdentityVerification()` - Enviar verificación
- `getVerificationStatus()` - Obtener estado actual
- `cancelVerification()` - Cancelar verificación pendiente
- `getVerificationHistory()` - Historial de intentos

#### Páginas

**pages/profile/IdentityVerificationPage.jsx**
- Página completa de verificación
- Estados: pendiente, procesando, completado

### Backend

#### Rutas

**routes/verification.js**

**POST /api/verification/identity**
```json
Request:
{
    "userId": "user123",
    "gestureType": "smile",
    "timestamp": "2024-02-02T10:30:00Z",
    "confidence": 0.85
}

Response:
{
    "success": true,
    "message": "Verificación enviada exitosamente",
    "verificationId": "doc123",
    "data": { ... }
}
```

**GET /api/verification/status/:userId**
- Obtiene el estado actual de la verificación del usuario

**GET /api/verification/history/:userId**
- Retorna los últimos 10 intentos de verificación

**POST /api/verification/cancel/:userId**
- Cancela una verificación pendiente

## Estructura de Firestore

### Colección: `identity_verifications`
```json
{
    "userId": "user123",
    "gestureType": "smile",
    "timestamp": "2024-02-02T10:30:00Z",
    "confidence": 0.85,
    "status": "pending",
    "submittedAt": "2024-02-02T10:30:05Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": "",
    "cancelledAt": null
}
```

### Documento: `users/{userId}`
```json
{
    "identityVerificationId": "doc123",
    "lastVerificationAttempt": "2024-02-02T10:30:05Z",
    "identityVerified": false
}
```

## Flujo de Uso

### Cliente (Usuario)
1. Usuario navega a `/verify-identity`
2. Selecciona un gesto para realizar
3. Otorga permiso de acceso a la cámara
4. Espera el contador regresivo (3 segundos)
5. Realiza el gesto durante la grabación (5 segundos máximo)
6. Sistema detecta el gesto y analiza confianza
7. Recibe confirmación y espera revisión

### Servidor
1. Recibe datos de verificación
2. Valida que el usuario sea autenticado
3. Almacena verificación en Firestore con estado "pending"
4. Actualiza referencia en documento del usuario
5. Admin revisa manualmente o sistema automático aprueba/rechaza

## Algoritmo de Detección

### Análisis de Movimiento
1. Captura 10 frames cada 500ms (total 5 segundos)
2. Convierte cada frame a ImageData usando canvas
3. Compara píxeles consecutivos para detectar cambios
4. Calcula intensidad de movimiento

### Clasificación
Umbrales por gesto:
- **Sonreír**: movimiento bajo (0.05-0.2)
- **Parpadear**: movimiento medio-alto (0.15-0.4)
- **Asentir**: movimiento medio (0.1-0.35)
- **Negar**: movimiento medio (0.1-0.35)

### Confianza
- Rango: 0 a 1
- Se calcula comparando movimiento detectado con patrón esperado
- Mínimo 0.5 para aceptar gesto como válido

## Mejoras Futuras

- [ ] Implementar detección facial real con ml5.js o TensorFlow.js
- [ ] Liveness detection avanzado (detección de vídeos deepfakes)
- [ ] Análisis de velocidad y patrones de movimiento más precisos
- [ ] Integración con servicio de verificación de identidad (Onfido, IDology)
- [ ] Revisión automática basada en ML
- [ ] Dashboard de admin para revisar verificaciones
- [ ] Notificaciones al usuario sobre estado
- [ ] Limitación de intentos por hora/día
- [ ] Análisis de iluminación y calidad de video
- [ ] Multi-lenguaje en instrucciones

## Configuración

### Variables de Entorno (Backend)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Dependencias

**Frontend**
- @tensorflow/tfjs (^4.22.0)
- react (^19.2.0)
- react-router-dom (^7.9.6)
- axios (^1.13.2)

**Backend**
- firebase-admin
- express
- cors
- helmet

## Testing

### Pruebas Manuales
1. Abrir página en navegador
2. Otorgar permisos de cámara
3. Seleccionar cada gesto y verificar que se detecte
4. Comprobar que se registren en Firestore

### Estados Esperados
- ✅ Gesto detectado correctamente: confianza > 0.5
- ⚠️ Gesto débil: confianza 0.3-0.5
- ❌ Sin gesto: confianza < 0.3

## Seguridad

- Verificación de token Firebase en todas las rutas backend
- Rate limiting en endpoints de verificación
- Validación de que el usuario solo pueda acceder a sus propios datos
- Almacenamiento seguro en Firestore con reglas de seguridad
- El servidor no almacena imágenes de video, solo análisis

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Acceso a cámara denegado" | Usuario rechazó permisos | Conceder permisos en configuración del navegador |
| "No se detectó el gesto" | Movimiento insuficiente | Realizar gesto más notable y claro |
| "Error de confianza" | Iluminación pobre | Mejorar iluminación del entorno |
| "Timeout" | Gestos muy lentos | Completar gesto más rápidamente |

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.
