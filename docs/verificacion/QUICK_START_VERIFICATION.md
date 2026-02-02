# ⚡ Quick Start - Verificación de Identidad

## 🚀 En 2 Minutos

### 1️⃣ Acceder a la página
```
URL: http://localhost:5173/verify-identity
```

### 2️⃣ Seleccionar gesto
```
Opciones:
- Sonreír 😊
- Parpadear 👁️
- Asentir (cabeza arriba-abajo)
- Negar (cabeza lado-lado)
```

### 3️⃣ Permitir cámara
```
El navegador te pedirá permisos
Haz click en "Permitir"
```

### 4️⃣ Realizar gesto
```
Espera el contador: 3, 2, 1
Haz el gesto durante la grabación (5 segundos)
Se detiene automáticamente
```

### 5️⃣ Ver resultado
```
✅ Éxito → Redirige a tu perfil
❌ Error → Opción de reintentar
```

---

## 💻 Para Desarrolladores

### Usar en Tus Componentes

**Mostrar si está verificado:**
```jsx
import { useVerification } from './context/VerificationContext';

function MiComponente() {
    const { isVerified, verificationStatus } = useVerification();
    
    return (
        <div>
            {isVerified ? (
                <p>✅ Verificado</p>
            ) : (
                <p>⏳ No verificado</p>
            )}
        </div>
    );
}
```

**Mostrar badge:**
```jsx
import VerificationBadge from './components/UI/VerificationBadge';

<VerificationBadge size="medium" />
```

**Redirigir a verificación:**
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/verify-identity');
```

---

## 🔍 Verificar que Funciona

### En el Frontend
```bash
npm run dev
```
Navega a: http://localhost:5173/verify-identity

### En el Backend
```bash
npm start
```
Verifica: http://localhost:3000/api/status

### En Firestore
1. Abre Firebase Console
2. Ve a Firestore Database
3. Busca colección: `identity_verifications`
4. Verifica que se creen documentos

---

## 🎯 Casos de Uso Comunes

### Caso 1: Requerir verificación para hacer match
```jsx
function MatchButton({ match }) {
    const { isVerified } = useVerification();
    
    if (!isVerified) {
        return <button disabled>Verifica tu identidad primero</button>;
    }
    
    return <button onClick={handleMatch}>Hacer Match</button>;
}
```

### Caso 2: Mostrar badge en perfil
```jsx
function ProfileHeader({ user }) {
    return (
        <div className="header">
            <img src={user.photo} />
            <div>
                <h1>{user.name}</h1>
                <VerificationBadge size="medium" />
            </div>
        </div>
    );
}
```

### Caso 3: Filtrar por verificados
```jsx
const Feed = ({ users }) => {
    const { isVerified } = useVerification();
    
    const filteredUsers = users.filter(u => u.identityVerified);
    
    return <UserList users={filteredUsers} />;
};
```

---

## 🆘 Si Algo Falla

### "Acceso a cámara denegado"
```
✓ Abre configuración del navegador
✓ Busca permisos de cámara
✓ Asegúrate que el sitio esté en HTTPS
✓ Intenta en navegador diferente
```

### "No se detectó el gesto"
```
✓ Realiza el gesto más notable
✓ Acércate más a la cámara
✓ Mejora la iluminación
✓ Intenta nuevamente
```

### "Error en el servidor"
```
✓ Verifica que el servidor esté corriendo
✓ Revisa los logs (npm start)
✓ Verifica Firestore está disponible
✓ Comprueba tokens de Firebase
```

### "No ve datos en Firestore"
```
✓ Confirma que se ejecutó la verificación
✓ Verifica que se envió al servidor
✓ Revisa la consola del navegador (F12)
✓ Revisa los logs del servidor
```

---

## 📱 Dispositivos

### Desktop
```
✅ Chrome 100+
✅ Firefox 100+
✅ Safari 14+
✅ Edge 100+
```

### Móvil
```
✅ Chrome Android
✅ Safari iOS (14+)
✅ Firefox Android
✅ Samsung Internet
```

### Requisito
```
- Acceso a cámara web
- Conexión a internet
- Usuario autenticado
```

---

## ⚙️ Configuración Rápida

### Variable Más Importante
En `useGestureDetection.js`, los umbrales:
```javascript
const thresholds = {
    smile: { min: 0.05, max: 0.2 },
    blink: { min: 0.15, max: 0.4 },
    nod: { min: 0.1, max: 0.35 },
    headShake: { min: 0.1, max: 0.35 }
};
```

Si cambias estos valores, cambia la sensibilidad de detección.

---

## 🔗 Enlaces Útiles

📖 Documentación completa:
→ `IDENTITY_VERIFICATION_README.md`

🔧 Documentación técnica:
→ `docs/IDENTITY_VERIFICATION.md`

🧪 Testing:
→ `VERIFICATION_TESTING_CHECKLIST.md`

💻 Ejemplos de código:
→ `client/src/examples/verification-integration-example.jsx`

---

## 💡 Tips Útiles

### Tip 1: Testing Rápido
Usa el modo incógnito para limpiar cache:
```
Ctrl+Shift+N (Windows) o Cmd+Shift+N (Mac)
```

### Tip 2: Debug
Abre la consola (F12) para ver logs:
```javascript
console.log('Gesto:', gestureType);
console.log('Confianza:', confidence);
console.log('Respuesta:', response);
```

### Tip 3: Forzar Nueva Verificación
En consola del navegador:
```javascript
localStorage.clear();
location.reload();
```

### Tip 4: Ver Datos Firestore
En Firebase Console → Firestore → `identity_verifications`

---

## 📊 Monitoreo

### ¿Cuántas verificaciones?
```
Firestore → identity_verifications → Contar documentos
```

### ¿Cuál es la tasa de éxito?
```
status: "approved" / total documentos
```

### ¿Cuál es la confianza promedio?
```
Suma de confidence / número de verificaciones
```

---

## 🎓 Aprender Más

### Cómo Funciona la Detección
Ver `useGestureDetection.js` líneas 40-80

### Estructura de Datos
Ver `server/routes/verification.js`

### Componentes UI
Ver `client/src/components/Auth/`

### Estilos Responsive
Ver archivos `.css`

---

## ✅ Checklist Rápido

Antes de usar en producción:

- [ ] Probé cada tipo de gesto
- [ ] Verificué que se guardan en Firestore
- [ ] Probé en móvil
- [ ] Probé en tablet
- [ ] Validé permisos de cámara
- [ ] Revisé los logs del servidor
- [ ] Probé error handling
- [ ] Validé seguridad

---

## 🎉 ¡Listo!

Si llegaste aquí, tu sistema está funcionando.

**Ahora:**
1. Integra en tus componentes
2. Personaliza según necesites
3. Despliega a producción
4. ¡Monitorea y disfruta!

---

**¿Necesitas ayuda?**
→ Ver documentación completa en carpeta `/docs`

**¿Tienes mejoras?**
→ El código es modular, puedes personalizarlo fácilmente

**¿Encontraste un bug?**
→ Revisa logs en navegador (F12) y servidor

---

Última actualización: 2 de febrero de 2026
Versión: 1.0.0
