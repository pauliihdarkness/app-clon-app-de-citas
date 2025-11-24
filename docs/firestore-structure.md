# Estructura de Datos de Firestore

## Colecciones Principales

### 📁 `users` (Colección)

Almacena la información **pública** del perfil de usuario que es visible para otros usuarios.

#### Documento: `users/{userId}`

```javascript
{
  // Información Básica
  uid: string,                    // ID único del usuario (Firebase Auth UID)
  name: string,                   // Nombre del usuario
  age: number,                    // Edad (calculada automáticamente desde birthDate)
  
  // Identidad y Orientación
  gender: string,                 // Género del usuario
  sexualOrientation: string,      // Orientación sexual
  
  // Perfil
  bio: string,                    // Biografía del usuario (máx 500 caracteres)
  interests: string[],            // Array de intereses (máx 8)

  // Estilo de Vida
  lifestyle: {
    drink: string,                // "Frecuentemente", "Socialmente", etc.
    smoke: string,                // "Fumador", "No fumador", etc.
    workout: string,              // "Diario", "A veces", etc.
    zodiac: string,               // Signo zodiacal
    height: string                // Altura en cm
  },

  // Información Profesional
  job: {
    title: string,                // Ocupación / Puesto
    company: string,              // Empresa
    education: string             // Nivel educativo
  },

  // Intenciones
  searchIntent: string,           // "Relación seria", "Algo casual", etc.
  
  // Multimedia
  images: string[],               // URLs de imágenes de Cloudinary (máx 9)
  
  // Ubicación
  location: {
    country: string,              // País
    state: string,                // Estado/Provincia
    city: string                  // Ciudad
  },
  
  // Metadata
  createdAt: timestamp,           // Fecha de creación del perfil
  updatedAt: timestamp            // Última actualización (opcional)
}
```

---

### 🔒 `users/{userId}/private` (Subcolección)

Almacena información **privada y sensible** del usuario que NO es visible para otros usuarios.

#### Documento: `users/{userId}/private/data`

```javascript
{
  // Información de Cuenta
  email: string,                  // Email del usuario (Firebase Auth)
  
  // Información Sensible
  birthDate: string,              // Fecha de nacimiento en formato YYYY-MM-DD
                                  // ⚠️ NO EDITABLE después del registro
                                  // Se usa para calcular la edad automáticamente
  
  // Metadata de Autenticación
  authMethod: string,             // Método de autenticación: "email" | "google"
  emailVerified: boolean,         // Si el email está verificado (opcional)
  
  // Preferencias (futuro)
  notifications: {                // Configuración de notificaciones
    matches: boolean,
    messages: boolean,
    likes: boolean
  }
}
```

---

##  `likes` (Colección)

Almacena los "me gusta" y "no me gusta" entre usuarios.

```javascript
{
  fromUserId: string,             // Usuario que da el like/dislike
  toUserId: string,               // Usuario que recibe el like/dislike
  type: "like" | "pass",          // Tipo de interacción
  createdAt: timestamp            // Fecha de la interacción
}
```

**Índices necesarios:**
- `fromUserId` + `toUserId` (compuesto, único)
- `toUserId` + `type`

---

## 📁 `matches` (Colección)

Almacena los matches (likes mutuos) entre usuarios y contiene la subcolección de mensajes.

```javascript
{
  users: string[],                // Array con los 2 UIDs de los participantes [uid1, uid2]
  createdAt: timestamp,           // Fecha del match
  lastMessage: string | null,     // Último mensaje enviado (preview)
  lastMessageTime: timestamp | null // Timestamp del último mensaje
}
```

**Índices necesarios:**
- `users` (array-contains) para buscar matches de un usuario

### 📁 `matches/{matchId}/messages` (Subcolección)

Almacena el historial de chat de cada match.

```javascript
{
  senderId: string,               // UID del usuario que envió el mensaje
  text: string,                   // Contenido del mensaje
  timestamp: timestamp            // Fecha y hora del mensaje
}
```

**Índices necesarios:**
- `timestamp` (ascendente) para ordenar mensajes

---

## � Reglas de Seguridad de Firestore

### Reglas Actuales Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar para verificar si es el dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Colección de usuarios (pública)
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
      allow delete: if isOwner(userId);
      
      // Subcolección privada
      match /private/data {
        allow read, write: if isOwner(userId);
        allow update: if isOwner(userId) 
                      && (!request.resource.data.keys().hasAny(['birthDate']) 
                          || request.resource.data.birthDate == resource.data.birthDate);
      }
    }
    
    // Colección de likes
    match /likes/{likeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.fromUserId;
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.fromUserId;
    }
    
    // Colección de matches
    match /matches/{matchId} {
      allow read: if isAuthenticated() 
                  && request.auth.uid in resource.data.users;
      allow create: if isAuthenticated(); // Creado por backend (admin sdk) pero mantenemos por si acaso
      
      // Subcolección de mensajes
      match /messages/{messageId} {
        allow read: if isAuthenticated() 
                    && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.users;
        allow create: if isAuthenticated() 
                      && request.auth.uid == request.resource.data.senderId
                      && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.users;
      }
    }
  }
}

---

## �📊 Diagrama de Relaciones

```
users (collection)
├── {userId} (document)
│   ├── uid, name, age, gender, etc.
│   └── private (subcollection)
│       └── data (document)
│           └── email, birthDate, authMethod
│
likes (collection)
├── {likeId}
│   └── fromUserId, toUserId, type
│
matches (collection)
├── {matchId}
│   ├── users, lastMessage, lastMessageTime
│   └── messages (subcollection)
│       └── {messageId}
│           └── senderId, text, timestamp
```

---

## 🔄 Flujo de Datos: Edad y Fecha de Nacimiento

### Registro de Usuario

1. Usuario ingresa **fecha de nacimiento** en `CreateProfile`
2. Se valida que tenga al menos 18 años
3. Se calcula la **edad** desde la fecha de nacimiento
4. Se guarda:
   - `birthDate` en `users/{userId}/private/data` 🔒
   - `age` (calculada) en `users/{userId}` 📋

### Visualización de Perfil

1. Se obtiene `age` desde `users/{userId}` (dato público)
2. La edad se muestra en el perfil
3. La fecha de nacimiento NO es visible públicamente

### Actualización de Perfil

1. Usuario edita su perfil en `EditProfile`
2. **NO puede editar** la fecha de nacimiento (campo no disponible)
3. La edad se **recalcula automáticamente** en el backend desde `birthDate`
4. Se actualiza `age` en `users/{userId}`

### Información de Cuenta

1. Usuario accede a `Settings → Información de la cuenta`
2. Se obtiene `birthDate` desde `users/{userId}/private/data`
3. Se muestra la fecha de nacimiento formateada
4. Se indica que NO es editable por seguridad

---

## 📝 Notas Importantes

### Seguridad y Privacidad

- ✅ La fecha de nacimiento está en una subcolección **privada**
- ✅ Solo el usuario puede ver su propia fecha de nacimiento
- ✅ La edad es pública pero se calcula automáticamente
- ✅ No se puede modificar la fecha de nacimiento después del registro

### Validaciones

- ✅ Edad mínima: 18 años
- ✅ Fecha de nacimiento: formato YYYY-MM-DD
- ✅ Rango válido: últimos 100 años

### Cálculo de Edad

La edad se calcula automáticamente en:
- **Registro**: Al crear el perfil
- **Actualización**: Al actualizar cualquier campo del perfil
- **Visualización**: Al obtener el perfil del usuario

Esto garantiza que la edad siempre esté actualizada sin necesidad de intervención manual.

---

**Última actualización**: 21 de noviembre de 2025
