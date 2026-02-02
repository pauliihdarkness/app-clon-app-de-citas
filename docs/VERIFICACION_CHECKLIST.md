# Checklist de Validación - Sistema de Verificación Automática

## Pre-validación

- [ ] Backend Express está corriendo en puerto 3000
- [ ] Cliente Vite está corriendo en puerto 5173
- [ ] Firestore está accesible (conexión a Firebase funciona)
- [ ] Variables de entorno están configuradas correctamente
  - [ ] `.env` en `server/` tiene URLs correctas
  - [ ] `.env` en `client/` tiene `VITE_API_URL=http://localhost:3000/api`

## Flujo de Verificación Aprobada (Confianza ≥ 0.6)

### Pasos
1. Navegar a `/verify-identity`
2. Seleccionar un gesto (ej: Sonrisa)
3. Hacer un gesto **notable** (mover cara claramente)
4. Completar los 5 segundos

### Verificaciones esperadas
- [ ] Ver estado "Procesando tu verificación..." con spinner
- [ ] Ver pantalla "¡Verificación Completada!" con checkmark verde
- [ ] Mensaje: "Tu identidad ha sido verificada exitosamente"
- [ ] Nota: "Tu perfil ahora aparecerá con un badge de verificado"
- [ ] Se redirige a `/profile` automáticamente en 3 segundos
- [ ] En el perfil, aparece badge verde "✓ Verificado" en la sección de nombre
- [ ] En Firestore `users` document: `identityVerified: true`
- [ ] En Firestore `identity_verifications`: documento con `status: "approved"`

## Flujo de Verificación Rechazada (Confianza < 0.4)

### Pasos
1. Navegar a `/verify-identity`
2. Seleccionar un gesto
3. Hacer un gesto **muy leve** (mínimo movimiento)
4. Completar los 5 segundos

### Verificaciones esperadas
- [ ] Ver estado "Procesando tu verificación..."
- [ ] Ver pantalla "Verificación Rechazada" con icono ⚠️
- [ ] Se muestra: "Confianza detectada: [XX]%"
- [ ] Sugerencia: "Intenta de nuevo con un gesto más notable..."
- [ ] Botón "Intentar de Nuevo" visible y funcional
- [ ] Al hacer clic en botón, vuelve a estado 'pending' (inicio del formulario)
- [ ] En Firestore: `status: "rejected"`
- [ ] En Firestore: `identityVerified: false`

## Flujo de Verificación Pendiente (0.4 ≤ Confianza < 0.6)

### Pasos
1. Navegar a `/verify-identity`
2. Seleccionar un gesto
3. Hacer un gesto **moderado** (movimiento notable pero no exagerado)
4. Completar los 5 segundos

### Verificaciones esperadas
- [ ] Ver estado "Procesando tu verificación..."
- [ ] Se redirige a perfil automáticamente en 3 segundos
- [ ] Badge muestra "⏳ Verificación Pendiente" (naranja)
- [ ] En Firestore: `status: "pending"`
- [ ] En Firestore: `identityVerified: false` (aún no aprobado)

## Integración con Perfil

### Verificado
- [ ] Badge aparece en el header del perfil (nombre del usuario)
- [ ] Icono verde con checkmark ✓
- [ ] Texto: "Verificado"
- [ ] Hover muestra tooltip explicativo

### Pendiente
- [ ] Badge aparece en naranja
- [ ] Icono de reloj ⏳
- [ ] Texto: "Pendiente de Revisión"

### No Verificado
- [ ] Botón rosa "Verificar Identidad"
- [ ] Clickeable, lleva a `/verify-identity`

## Integración con Configuración de Privacidad

### Estado Inicial (No Verificado)
- [ ] Opción "Verificación de Identidad" visible en Privacy & Security
- [ ] Botón con icono de escudo y texto "Verificar Identidad"
- [ ] Al hacer clic, navega a `/verify-identity`

### Después de Aprobación
- [ ] Opción cambia a mostrar estado "Verificado"
- [ ] Se muestra fecha de verificación
- [ ] Opción para "Re-verificar" o similar

## Manejo de Errores

### Error de Red
- [ ] Si falla POST a `/api/verification/identity`
- [ ] Se muestra pantalla "Error en la Verificación" con ✕
- [ ] Botón "Intentar de Nuevo" reinicia el flujo
- [ ] Mensaje de error se registra en console

### Error de Autenticación
- [ ] Si usuario no está autenticado
- [ ] Redirecciona a login antes de permitir verificación

### Error de Validación
- [ ] Si datos incompletos se envían
- [ ] Backend retorna 400 con mensaje descriptivo
- [ ] Frontend muestra error al usuario

## Validación de Base de Datos

### Documento en `identity_verifications`
Verificar que contenga:
- [ ] `userId`: ID correcto
- [ ] `gestureType`: "smile", "blink", "nod", o "shake"
- [ ] `confidence`: Número entre 0 y 1
- [ ] `status`: "approved", "pending", o "rejected"
- [ ] `submittedAt`: Timestamp
- [ ] `reviewedAt`: Timestamp (null si pending, fecha si aprobado/rechazado)
- [ ] `reviewedBy`: "system" (para auto-aprobado) o null
- [ ] `notes`: Descripción del resultado

### Documento en `users`
Verificar que contenga:
- [ ] `identityVerified`: Boolean (true si aprobado, false si no)
- [ ] `identityVerificationId`: Referencia a documento de verificación
- [ ] `lastVerificationAttempt`: Timestamp

## Comportamiento del Contexto

- [ ] VerificationContext se actualiza después de verificación
- [ ] `useVerification()` hook retorna `isVerified: true` después de aprobación
- [ ] Badge en otros componentes se actualiza en tiempo real
- [ ] No necesita refresh de página para ver cambios

## Estilos y Responsividad

- [ ] En desktop, componentes centrados correctamente
- [ ] En móvil, componentes no se overflow
- [ ] Animaciones se ejecutan suavemente (no jerky)
- [ ] Colores son consistentes con tema de la app
- [ ] Transiciones funcionan correctamente

## Performance

- [ ] Análisis de gesto no congela UI (máximo 5s)
- [ ] Spinner anima suavemente durante procesamiento
- [ ] Animaciones de checkmark/error son fluidas
- [ ] Sin memory leaks (verificar en DevTools)

## Seguridad

- [ ] Token JWT se verifica en backend (middleware `verifyToken`)
- [ ] Usuario no puede verificar a otro usuario
- [ ] `identityVerified` no se puede setear directamente desde cliente
- [ ] Datos de verificación se guardan con timestamp para auditoría

## Flujos Adicionales

### Reintentos Exitosos
- [ ] Usuario rechazado puede reintentar
- [ ] Documento anterior se mantiene (historial)
- [ ] Nuevo documento se crea en `identity_verifications`
- [ ] Campo `identityVerified` se actualiza si nueva verificación es aprobada

### Cambio de Dispositivo
- [ ] Usuario verificado en laptop permanece verificado en móvil
- [ ] Badge se sincroniza entre dispositivos

### Logout/Login
- [ ] Estado de verificación persiste correctamente
- [ ] VerificationContext se recarga con datos nuevos
- [ ] Badge muestra estado correcto al volver a loguear

---

## Resultado Final ✅

Una vez completado este checklist, el sistema de verificación automática estará completamente funcional:

- ✅ Las verificaciones no quedan en "pendiente" indefinidamente
- ✅ Los usuarios reciben feedback inmediato (aprobado/rechazado)
- ✅ Badge se actualiza automáticamente en el perfil
- ✅ Sistema escalable sin revisión manual para casos claros
- ✅ UX mejorada con redirecciones automáticas

