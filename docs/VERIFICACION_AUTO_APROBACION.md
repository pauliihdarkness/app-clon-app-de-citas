# Sistema de Aprobación Automática de Verificación de Identidad

## Descripción General

El sistema de verificación de identidad ahora implementa aprobación automática basada en niveles de confianza. Esto evita que las verificaciones queden en estado "pendiente" indefinidamente y proporciona retroalimentación inmediata al usuario.

## Flujo de Verificación

### 1. Usuario completa el gesto
- El usuario selecciona un gesto (Sonrisa, Parpadeo, Asentimiento, Negación)
- El sistema analiza 10 frames en 5 segundos usando Canvas API
- Se calcula un puntaje de confianza (0-1)

### 2. Envío al servidor
```javascript
POST /api/verification/identity
{
  userId: "...",
  gestureType: "smile",
  timestamp: "2024-...",
  confidence: 0.75
}
```

### 3. Decisión automática (Backend)
El servidor evalúa automáticamente basado en confianza:

| Confianza | Estado | Acción |
|-----------|--------|--------|
| ≥ 0.6 | **approved** | Se aprueba inmediatamente, `identityVerified = true` |
| 0.4 - 0.6 | **pending** | Se envía a revisión manual |
| < 0.4 | **rejected** | Se rechaza automáticamente |

### 4. Respuesta al cliente
```javascript
{
  success: true,
  message: "Verificación completada exitosamente",
  status: "approved",
  isVerified: true,
  verificationId: "...",
  data: {
    status: "approved",
    isVerified: true,
    confidence: 0.75,
    ...
  }
}
```

### 5. Estados de UI en el cliente

#### Estado: Submitting (Procesando)
- Muestra spinner de carga
- Texto: "Procesando tu verificación..."

#### Estado: Approved (Aprobado) ✓
- Muestra checkmark verde
- Título: "¡Verificación Completada!"
- Mensaje: "Tu identidad ha sido verificada exitosamente"
- Nota: Indica que el badge ahora aparece en el perfil
- **Acción automática**: Redirige a `/profile` en 3 segundos

#### Estado: Rejected (Rechazado) ⚠️
- Muestra icono de advertencia
- Título: "Verificación Rechazada"
- Muestra porcentaje de confianza detectado
- Sugerencia: "Intenta de nuevo con un gesto más notable y en un lugar mejor iluminado"
- Botón: "Intentar de Nuevo"
- **Acción automática**: Vuelve a estado 'pending' en 5 segundos

#### Estado: Error (Error) ✕
- Muestra icono de error con animación shake
- Título: "Error en la Verificación"
- Botón: "Intentar de Nuevo"

#### Estado: Pending (En revisión) - Opcional
- Usado si confianza está entre 0.4 y 0.6
- Muestra mensaje de espera
- Redirige a perfil automáticamente

## Cambios en Base de Datos

### Colección: `identity_verifications`
```javascript
{
  userId: "...",
  gestureType: "smile",
  timestamp: Timestamp,
  confidence: 0.75,
  status: "approved", // approved | pending | rejected
  submittedAt: Timestamp,
  reviewedAt: Timestamp (null si pending),
  reviewedBy: "system" (si auto-aprobado) o null,
  notes: "Aprobado automáticamente"
}
```

### Campo en `users` document
```javascript
{
  ...
  identityVerified: true, // true si status = 'approved'
  lastVerificationAttempt: Timestamp,
  identityVerificationId: "reference_to_verification"
}
```

## Impacto en otras partes de la aplicación

### VerificationBadge.jsx
- Muestra estado verificado inmediatamente si `identityVerified = true`
- Badge verde ✓ con "Verificado"

### PrivacySettings.jsx
- Botón "Verificación de Identidad" lleva a `/verify-identity`
- Muestra estado actual de verificación
- Permite reiniciar proceso si está rechazado

### Profile.jsx
- Badge aparece en header si usuario está verificado
- Contribuye a la confianza del perfil

## Ventajas del nuevo sistema

✅ **Feedback inmediato**: Usuario sabe si fue aprobado al instante
✅ **Sin estado indefinido**: No hay verificaciones "perdidas" en pending
✅ **Experiencia mejorada**: UX más fluido con redirecciones automáticas
✅ **Escalabilidad**: No requiere revisión manual para casos claros
✅ **Transparencia**: Usuario ve su puntaje de confianza si es rechazado

## Archivos modificados

- `server/routes/verification.js` - Lógica de aprobación automática
- `client/src/pages/profile/IdentityVerificationPage.jsx` - Estados de UI y redirecciones
- `client/src/pages/profile/IdentityVerificationPage.css` - Estilos para aprobado/rechazado/error
- `client/src/api/verification.js` - Manejo correcto de respuesta del servidor

## Testing

### Prueba: Verificación aprobada (confianza > 0.6)
1. Completar gesto con movimiento notable
2. Verificar que estado sea "approved"
3. Verificar redirección automática a perfil
4. Verificar que badge aparezca en perfil

### Prueba: Verificación rechazada (confianza < 0.4)
1. Completar gesto con movimiento muy leve
2. Verificar que estado sea "rejected"
3. Verificar que se muestre % de confianza
4. Verificar que botón "Intentar de Nuevo" funcione

### Prueba: Verificación pendiente (0.4 ≤ confianza ≤ 0.6)
1. Completar gesto con movimiento moderado
2. Verificar que estado sea "pending"
3. Verificar redirección a perfil después de 3s
4. Verificar que badge muestre "Verificación Pendiente"

## Notas de desarrollo

- La confianza se calcula en `GestureDetection.jsx` analizando cambios de píxeles
- Los umbrales (0.6, 0.4) pueden ajustarse en `server/routes/verification.js` si es necesario
- Para cambiar tiempos de redirección, editar timeouts en `IdentityVerificationPage.jsx`
- El sistema no almacena imágenes, solo el análisis de movimiento
