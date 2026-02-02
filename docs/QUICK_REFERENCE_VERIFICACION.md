# Quick Reference - Verificación de Identidad Automática

## 🎯 Problema Resuelto
❌ **Antes**: Verificaciones quedaban en estado "pending" indefinidamente sin feedback
✅ **Ahora**: Sistema automático evalúa confianza y aprueba/rechaza inmediatamente

## 📊 Umbrales de Confianza
```
Confianza (0-1)  │ Estado     │ identityVerified │ Acción
────────────────┼────────────┼──────────────────┼──────────────────
    ≥ 0.6        │ approved   │ true             │ Aprobado automático
   0.4 - 0.6     │ pending    │ false            │ Enviado a revisión
    < 0.4        │ rejected   │ false            │ Rechazado automático
```

## 🔧 Dónde Editar

### Cambiar umbral de aprobación (0.6)
**Archivo**: `server/routes/verification.js`  
**Línea**: 40  
```javascript
if (confidence >= 0.6) {  // ← Cambiar este número
```

### Cambiar umbral de rechazo (0.4)
**Archivo**: `server/routes/verification.js`  
**Línea**: 42  
```javascript
} else if (confidence < 0.4) {  // ← Cambiar este número
```

### Cambiar tiempo de redirección (3s)
**Archivo**: `client/src/pages/profile/IdentityVerificationPage.jsx`  
**Línea**: 32  
```javascript
setTimeout(() => {
    window.location.href = '/profile';
}, 3000);  // ← Cambiar milisegundos
```

## 🎨 Componentes Relacionados

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| Página principal de verificación | `/pages/profile/IdentityVerificationPage.jsx` | Flujo principal y estados |
| Selección de gesto | `/components/Auth/IdentityVerification.jsx` | Interfaz de usuario |
| Detección de gesto | `/components/Auth/GestureDetection.jsx` | Canvas analysis |
| Badge en perfil | `/components/UI/VerificationBadge.jsx` | Muestra estado verificado |
| Context global | `/context/VerificationContext.jsx` | Estado global de verificación |
| API backend | `server/routes/verification.js` | Lógica de aprobación |
| API cliente | `client/src/api/verification.js` | Llamadas HTTP |

## 📡 Flujos de API

### POST /api/verification/identity
```javascript
Request:
{
  userId: "user123",
  gestureType: "smile",
  timestamp: "2024-01-15T10:30:00Z",
  confidence: 0.75
}

Response (Aprobado):
{
  success: true,
  status: "approved",
  message: "Verificación completada exitosamente",
  data: {
    status: "approved",
    confidence: 0.75,
    isVerified: true,
    ...
  }
}
```

### GET /api/verification/status/:userId
```javascript
Response:
{
  success: true,
  status: "approved",  // o "pending", "rejected", "not_submitted"
  data: {
    status: "approved",
    gestureType: "smile",
    submittedAt: "2024-01-15T10:30:00Z",
    ...
  }
}
```

## 🧪 Testing Rápido

### Test Aprobación
```
1. Ir a http://localhost:5173/verify-identity
2. Seleccionar "Sonrisa"
3. Sonreír MUCHO durante 5 segundos
4. Esperar checkmark verde
5. Verificar redirección a perfil
```

### Test Rechazo
```
1. Ir a http://localhost:5173/verify-identity
2. Seleccionar "Parpadeo"
3. Mínimo movimiento durante 5 segundos
4. Esperar icono de rechazo
5. Clic en "Intentar de Nuevo"
```

## 🔍 Debugging

### Ver confianza en consola
En `client/src/pages/profile/IdentityVerificationPage.jsx`, agregar:
```javascript
console.log('Confidence:', response.data.confidence);
console.log('Status:', response.data.status);
```

### Ver request/response en DevTools
- Abrir DevTools (F12)
- Ir a Network tab
- Hacer una verificación
- Buscar `identity` en requests
- Ver payload de request y response

### Ver cambios en Firestore
- Ir a Firebase Console
- Abrir Firestore Database
- Colección `identity_verifications`
- Verificar último documento creado
- Ver campos: `status`, `confidence`, `reviewedBy`

## 📋 Estados Visuales en Frontend

| Estado | Pantalla | Icono | Color |
|--------|----------|-------|-------|
| pending | Formulario | - | Azul |
| submitting | Spinner | ⏳ | Gris |
| approved | Checkmark | ✓ | Verde (#4caf50) |
| rejected | Advertencia | ⚠️ | Rojo (#ff6b6b) |
| error | Error | ✕ | Rojo oscuro (#d32f2f) |

## 🚨 Errores Comunes

### Error: "Verificación rechazada" en todos los intentos
→ Problema: Confianza siempre < 0.4  
→ Solución: Aumentar movimiento del gesto, mejorar iluminación

### Error: "No autorizado"
→ Problema: Token JWT inválido o usuario no autenticado  
→ Solución: Verificar que usuario está logueado antes de verificar

### Error: "Usuario no encontrado"
→ Problema: Documento en colección `users` no existe  
→ Solución: Asegurar que usuario fue creado correctamente al registrarse

## 📝 Logs Útiles

### Backend (server console)
```
"Error en verificación de identidad:" → Ver descripción del error
Status determinado como: approved/pending/rejected
```

### Frontend (browser console)
```
"Error submitting identity verification:" → Problema con API
"Error fetching verification status:" → No puede obtener estado
```

## 🔐 Seguridad

- ✅ Token JWT validado en cada request
- ✅ Usuario no puede verificar a otro usuario
- ✅ Campo `identityVerified` solo se actualiza desde backend
- ✅ No se almacenan imágenes (solo análisis de movimiento)
- ✅ Timestamps registran cada operación para auditoría

## 📞 Contacto para Problemas

Si el sistema no funciona como se espera:
1. Revisar [VERIFICACION_CHECKLIST.md](./VERIFICACION_CHECKLIST.md)
2. Revisar [VERIFICACION_AUTO_APROBACION.md](./VERIFICACION_AUTO_APROBACION.md)
3. Revisar logs en `DevTools → Network` y `Console`
4. Verificar Firestore en Firebase Console

---

**Última actualización**: Enero 2024  
**Versión**: 2.0 (Con aprobación automática)
