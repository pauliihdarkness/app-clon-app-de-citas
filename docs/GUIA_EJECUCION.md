# Guía de Ejecución - Sistema de Verificación Automática

## 📋 Requisitos Previos

- ✅ Node.js 18+ instalado
- ✅ Firebase configurado en proyecto
- ✅ Firestore habilitado
- ✅ Credenciales de Firebase disponibles
- ✅ Puerto 3000 (backend) disponible
- ✅ Puerto 5173 (frontend) disponible

---

## 🚀 Instalación y Ejecución

### 1️⃣ Clonar/Preparar Repositorio

```bash
# Navegar a carpeta del proyecto
cd "c:\Users\Ladyt\Paulii Darkness Dev\Aplicación 123"
```

### 2️⃣ Instalar Dependencias del Backend

```bash
cd server
npm install
```

**Dependencias necesarias:**
- `express`
- `firebase-admin`
- `cors`
- `dotenv`
- `jsonwebtoken`

### 3️⃣ Configurar Variables de Entorno (Backend)

**Archivo**: `server/.env`

```env
# Firebase
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY=tu-private-key
FIREBASE_CLIENT_EMAIL=tu-email@project.iam.gserviceaccount.com

# JWT
JWT_SECRET=tu-secret-key-random

# Puerto
PORT=3000

# URL del cliente (para CORS)
CLIENT_URL=http://localhost:5173
```

### 4️⃣ Instalar Dependencias del Frontend

```bash
cd client
npm install
```

**Dependencias necesarias:**
- `react` 19+
- `react-router-dom`
- `axios`
- `firebase`
- `vite`

### 5️⃣ Configurar Variables de Entorno (Frontend)

**Archivo**: `client/.env`

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Firebase
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id

# Otras configuraciones
VITE_APP_NAME=Paulii Darkness
```

### 6️⃣ Iniciar Backend

```bash
cd server
npm start

# O con nodemon para desarrollo
npm install -D nodemon
npx nodemon index.js
```

**Esperado**: 
```
Server running on port 3000
Firebase initialized
```

### 7️⃣ Iniciar Frontend

**En otra terminal:**

```bash
cd client
npm run dev
```

**Esperado**:
```
VITE v4.x.x  ready in xx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## ✅ Verificar que todo funciona

### 1. Acceder a la aplicación
```
http://localhost:5173
```

### 2. Login/Registro
- Crear o acceder con una cuenta
- Verificar que Firebase Authentication funciona

### 3. Navegar a Verificación
```
http://localhost:5173/verify-identity
```

### 4. Realizar una verificación
- Seleccionar un gesto
- Completar la acción durante 5 segundos
- Esperar feedback automático

### 5. Verificar en DevTools
- Abrir F12 → Network
- Buscar request `identity`
- Ver respuesta con `status: "approved"` o `rejected`

### 6. Verificar en Firestore
- Ir a Firebase Console → Firestore
- Verificar colección `identity_verifications`
- Ver documento creado con status correcto

---

## 🛠️ Troubleshooting

### Error: "CORS policy blocked"
**Causa**: Backend no está corriendo o URL es incorrecta  
**Solución**:
1. Verificar que backend está en puerto 3000
2. Verificar `VITE_API_URL` en `.env`
3. Reiniciar frontend

```env
VITE_API_URL=http://localhost:3000/api
```

### Error: "Firebase not initialized"
**Causa**: Credenciales de Firebase no configuradas  
**Solución**:
1. Descargar `serviceAccountKey.json` desde Firebase Console
2. Copiar valores a `.env` del backend
3. Reiniciar servidor

### Error: "usuario no encontrado"
**Causa**: Usuario no está logueado  
**Solución**: Hacer login primero antes de verificar identidad

### Error: "Verificación rechazada siempre"
**Causa**: Confianza < 0.4 (movimiento muy leve)  
**Solución**: Hacer gestos más notables con mejor iluminación

### Error: "timeout de respuesta"
**Causa**: Backend está lento o no responde  
**Solución**:
1. Verificar logs en terminal del backend
2. Reiniciar servidor
3. Verificar conexión a Firestore

---

## 📊 Logs Útiles para Debugging

### Backend - Ver en terminal
```bash
# Verificación enviada
"Datos verificación guardados"

# Determinación automática
"Status determinado como: approved"
"Status determinado como: rejected"
"Status determinado como: pending"

# Errores
"Error en verificación de identidad:" [error details]
```

### Frontend - Ver en DevTools Console
```javascript
// Verificación completada
"Confidence:" 0.75
"Status:" "approved"

// API calls
"Submitting verification..."
"Response received:" {...}

// Errores
"Error submitting identity verification:" [error]
"Error fetching verification status:" [error]
```

---

## 🔍 Verificación de Integración

### Checklist Post-Setup

- [ ] Backend inicia sin errores (puerto 3000)
- [ ] Frontend inicia sin errores (puerto 5173)
- [ ] Página de login funciona
- [ ] Página de verificación carga correctamente
- [ ] Selección de gesto funciona
- [ ] Canvas se activa durante los 5 segundos
- [ ] Backend recibe POST a `/api/verification/identity`
- [ ] Backend retorna status: "approved/rejected/pending"
- [ ] Frontend muestra resultado correcto (checkmark/error)
- [ ] Firestore registra documento de verificación
- [ ] Usuario es redirigido a perfil automáticamente
- [ ] Badge aparece en perfil si fue aprobado
- [ ] Contexto se actualiza (isVerified = true)

---

## 📱 Testing en Móvil

### Acceder desde otro dispositivo
```
1. Obtener IP local del servidor
   ipconfig (Windows) / ifconfig (Mac/Linux)
   
2. Acceder desde móvil
   http://[TU_IP_LOCAL]:5173
   
3. Backend automáticamente usa puerto 3000
```

### Consideraciones
- ✅ Gestos funcionan mejor en móvil (menos sensible)
- ✅ Cámara de móvil captura mejor con luz natural
- ⚠️ Puede ser más lento según dispositivo

---

## 🔧 Configuración Avanzada

### Cambiar Umbrales de Confianza

**Archivo**: `server/routes/verification.js`  
**Líneas**: 40-42

```javascript
// Umbral de aprobación (0.6 → cambiar a tu valor)
if (confidence >= 0.6) {
    status = 'approved';
    
// Umbral de rechazo (0.4 → cambiar a tu valor)
} else if (confidence < 0.4) {
    status = 'rejected';
}
```

**Opciones de umbral**:
- `0.7+` - Muy estricto (pocas aprobaciones)
- `0.6` - Estándar (recomendado)
- `0.5` - Más flexible
- `0.4` - Muy flexible (muchas aprobaciones falsas)

### Cambiar Tiempo de Redirección

**Archivo**: `client/src/pages/profile/IdentityVerificationPage.jsx`

```javascript
// Tiempo en milisegundos (3000 = 3 segundos)
setTimeout(() => {
    window.location.href = '/profile';
}, 3000);  // ← Cambiar este número
```

---

## 📚 Documentación Relacionada

| Documento | Contenido |
|-----------|----------|
| `VERIFICACION_AUTO_APROBACION.md` | Explicación del sistema |
| `CAMBIOS_VERIFICACION_AUTOMATICA.md` | Cambios realizados |
| `QUICK_REFERENCE_VERIFICACION.md` | Referencia rápida |
| `VERIFICACION_CHECKLIST.md` | Checklist de pruebas |
| `DIAGRAMA_VERIFICACION.md` | Diagramas visuales |

---

## 🎯 Próximos Pasos

Una vez todo funciona:

1. **Testing exhaustivo** (ver VERIFICACION_CHECKLIST.md)
2. **Ajustar umbrales** según datos reales
3. **Monitoring en producción** (agregar logs)
4. **Backups de Firestore** regularmente
5. **Considerar mejoras** (admin dashboard, anti-deepfake, etc.)

---

## 📞 Soporte

Si algo no funciona:

1. Revisar logs en ambas terminales
2. Verificar DevTools → Network tab
3. Ver errores en DevTools → Console
4. Revisar Firestore directamente en Firebase Console
5. Considerar reiniciar ambos servidores

---

**Última actualización**: Enero 2024  
**Versión**: 2.0

