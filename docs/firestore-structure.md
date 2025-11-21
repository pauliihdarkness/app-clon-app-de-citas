# Estructura de Datos - Firestore

## Colección: `users`

### Documento Principal: `users/{uid}`

**Datos Públicos del Perfil** (visibles para otros usuarios)

```javascript
{
  // Identificación
  "uid": "string",                    // ID único del usuario (Firebase Auth UID)
  
  // Información Personal
  "name": "string",                   // Nombre del usuario
  "age": number,                      // Edad calculada
  "birthdate": "string",              // Fecha de nacimiento (formato: YYYY-MM-DD)
  "gender": "string",                 // Género (ej: "Hombre", "Mujer", "No binario", etc.)
  "sexualOrientation": "string",      // Orientación sexual (ej: "Heterosexual", "Homosexual", etc.)
  
  // Perfil
  "bio": "string",                    // Biografía del usuario (máx 500 caracteres)
  "interests": ["string"],            // Array de intereses (máx 5)
  
  // Ubicación
  "location": {
    "country": "string",              // País (ej: "Argentina")
    "state": "string",                // Provincia/Estado
    "city": "string"                  // Ciudad
  },
  
  // Imágenes
  "images": ["string"],               // Array de URLs de Cloudinary (máx 6)
                                      // Organizadas en: app-de-citas/users/{uid}/
  
  // Metadatos
  "CreationDate": Timestamp,          // Fecha de creación del perfil
  "createdAt": Timestamp              // Fecha de creación del documento (desde login)
}
```

**Ejemplo:**
```json
{
  "uid": "abc123xyz",
  "name": "María García",
  "age": 28,
  "birthdate": "1996-05-15",
  "gender": "Mujer",
  "sexualOrientation": "Bisexual",
  "bio": "Amante de los viajes y la fotografía. Me encanta conocer gente nueva y compartir experiencias.",
  "interests": ["Fotografía", "Viajes", "Yoga", "Cine", "Cocina"],
  "location": {
    "country": "Argentina",
    "state": "Buenos Aires",
    "city": "La Plata"
  },
  "images": [
    "https://res.cloudinary.com/dgswnms90/image/upload/v1234567890/app-de-citas/users/abc123xyz/photo1.jpg",
    "https://res.cloudinary.com/dgswnms90/image/upload/v1234567890/app-de-citas/users/abc123xyz/photo2.jpg"
  ],
  "CreationDate": "2025-11-20T19:00:00.000Z",
  "createdAt": "2025-11-20T18:55:00.000Z"
}
```

---

### Subcolección: `users/{uid}/private/auth`

**Datos Sensibles** (solo accesibles por el usuario autenticado)

```javascript
{
  // Autenticación
  "email": "string",                  // Email del usuario
  "photoURL": "string",               // URL de foto de perfil de Google/Auth
  "authMethod": "string"              // Método de autenticación: "google" | "email"
}
```

**Ejemplo:**
```json
{
  "email": "maria.garcia@example.com",
  "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocK...",
  "authMethod": "google"
}
```

---

## Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      // Lectura pública (para mostrar perfiles)
      allow read: if true;
      
      // Escritura solo del dueño
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Subcolección de datos privados
      match /private/{document} {
        // Solo el dueño puede leer y escribir sus datos privados
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Flujo de Datos

### 1. Login / Registro

**Google Sign-In:**
```javascript
// 1. Usuario inicia sesión con Google
const user = await signInWithPopup(auth, googleProvider);

// 2. Se crea documento público básico
await createUserProfile(user.uid, {
  uid: user.uid,
  createdAt: new Date()
});

// 3. Se guardan datos sensibles en subcolección privada
await createPrivateData(user.uid, {
  email: user.email,
  photoURL: user.photoURL,
  authMethod: "google"
});

// 4. Redirigir a /create-profile para completar perfil
```

**Email/Password Sign-In:**
```javascript
// Similar al flujo de Google, pero authMethod: "email"
await createPrivateData(user.uid, {
  email: user.email,
  photoURL: "",
  authMethod: "email"
});
```

### 2. Crear Perfil Completo

```javascript
// Usuario completa su perfil en /create-profile
await createUserProfile(user.uid, {
  name: "María García",
  birthdate: "1996-05-15",
  age: 28,
  gender: "Mujer",
  sexualOrientation: "Bisexual",
  bio: "Amante de los viajes...",
  interests: ["Fotografía", "Viajes", "Yoga"],
  location: {
    country: "Argentina",
    state: "Buenos Aires",
    city: "La Plata"
  },
  uid: user.uid,
  images: [
    "https://res.cloudinary.com/.../photo1.jpg",
    "https://res.cloudinary.com/.../photo2.jpg"
  ],
  CreationDate: new Date()
});

// Redirigir a /feed
```

### 3. Leer Perfil Público

```javascript
// Cualquier usuario autenticado puede leer perfiles públicos
const profile = await getUserProfile(userId);
// Retorna: { name, age, bio, interests, location, images, etc. }
// NO incluye: email, photoURL, authMethod
```

### 4. Leer Datos Privados

```javascript
// Solo el usuario autenticado puede leer sus propios datos privados
const privateData = await getPrivateData(currentUser.uid);
// Retorna: { email, photoURL, authMethod }
```

---

## Cloudinary - Organización de Imágenes

**Estructura de carpetas:**
```
app-de-citas/
└── users/
    └── {uid}/
        ├── image_1.jpg
        ├── image_2.jpg
        ├── image_3.jpg
        ├── image_4.jpg
        ├── image_5.jpg
        └── image_6.jpg
```

**Configuración:**
- Preset: `app-citas`
- Cloud Name: `dgswnms90`
- Compresión: Máx 1MB, 1500px
- Formato: JPEG

---

## Campos Opcionales vs Requeridos

### Requeridos para perfil completo:
- ✅ `name`
- ✅ `age`
- ✅ `birthdate`
- ✅ `gender`
- ✅ `CreationDate`

### Opcionales:
- `sexualOrientation`
- `bio`
- `interests`
- `location` (puede estar vacío)
- `images` (puede estar vacío)

---

## Notas de Implementación

1. **Privacidad**: Email y photoURL nunca se exponen en el documento público
2. **Seguridad**: Reglas de Firestore protegen la subcolección `private`
3. **Escalabilidad**: Estructura permite agregar más subcolecciones privadas en el futuro
4. **Trazabilidad**: Se guarda el método de autenticación para analytics
5. **Merge**: Todas las escrituras usan `{ merge: true }` para evitar sobrescribir datos
