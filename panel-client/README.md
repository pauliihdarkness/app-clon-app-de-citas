# Panel - Vite + Firebase

Un proyecto moderno con Vite y Firebase configurado del lado del cliente.

## 🚀 Características

- ⚡ **Vite** - Build tool ultrarrápido
- 🔐 **Autenticación con Google** - Login seguro con Firebase Auth
- 🔥 **Firebase** - Backend as a Service
  - Authentication (Google Provider)
  - Firestore Database
  - Cloud Storage
- 🎨 **Diseño Moderno** - UI premium con glassmorphism y animaciones
- 🔒 **Seguridad** - Variables de entorno para credenciales
- 📱 **Responsive** - Adaptado a todos los dispositivos

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

## 🛠️ Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En la configuración del proyecto, obtén tus credenciales
4. Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

5. Edita el archivo `.env` y agrega tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Habilitar Autenticación con Google en Firebase

1. Ve a Firebase Console → Authentication
2. Haz clic en "Get Started" (si es la primera vez)
3. En la pestaña "Sign-in method", habilita **Google**
4. Configura el correo de soporte del proyecto
5. Guarda los cambios

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Panel/
├── src/
│   ├── components/
│   │   ├── LoginPage.js      # Página de inicio de sesión
│   │   └── Dashboard.js      # Panel principal (protegido)
│   ├── services/
│   │   └── auth.js           # Servicio de autenticación
│   ├── firebase/
│   │   └── config.js         # Configuración de Firebase
│   ├── main.js               # Punto de entrada principal
│   └── style.css             # Estilos globales
├── public/                   # Archivos estáticos
├── .env                      # Variables de entorno (no commitear)
├── .env.example              # Ejemplo de variables de entorno
├── index.html                # HTML principal
├── package.json              # Dependencias del proyecto
└── vite.config.js            # Configuración de Vite
```

## 🔥 Uso de Firebase

### Importar Servicios

```javascript
import { auth, db, storage } from './firebase/config';
```

### Authentication

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

// Iniciar sesión
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario:', userCredential.user);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Firestore

```javascript
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Agregar documento
const addData = async () => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name: 'Juan',
      email: 'juan@example.com'
    });
    console.log('Documento ID:', docRef.id);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Leer documentos
const getData = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
  });
};
```

### Storage

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Subir archivo
const uploadFile = async (file) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    console.log('URL del archivo:', url);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🔍 Preview de Producción

```bash
npm run preview
```

## 📚 Recursos

- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📄 Licencia

MIT

---

Hecho con ❤️ usando Vite y Firebase
