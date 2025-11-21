# 🔥 Citas & Conexiones - Dating App

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Purple?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Orange?style=for-the-badge&logo=firebase)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Blue?style=for-the-badge&logo=cloudinary)

Una aplicación moderna de citas y conexiones sociales construida con React y Firebase, diseñada con un enfoque "Mobile First" y una estética Glassmorphism premium.

## ✨ Características Principales

### 👤 Gestión de Perfiles
- **Registro y Login**: Autenticación segura con Email/Password y Google (Firebase Auth).
- **Perfil Completo**: Edición de nombre, edad, género, orientación sexual, biografía e intereses.
- **Galería de Fotos**: Subida de hasta 9 fotos con recorte (crop) integrado y optimización automática (Cloudinary).
- **Geolocalización**: Selector de ubicación (País, Provincia, Ciudad).

### 🎨 UI/UX Premium
- **Diseño Glassmorphism**: Estética moderna con transparencias y desenfoques.
- **Navegación Intuitiva**: Barra de navegación inferior (Tab Bar) para acceso rápido a Feed, Chat y Perfil.
- **Gestos Táctiles**: Navegación por carrusel de fotos con gestos de deslizamiento (swipe).
- **Animaciones**: Transiciones suaves y micro-interacciones.
- **Responsive**: Totalmente optimizado para dispositivos móviles, tablets y escritorio.

### 🔒 Seguridad y Privacidad
- **Datos Privados**: Separación estricta de datos públicos y privados en Firestore.
- **Validaciones**: Verificación robusta de formularios y tipos de datos.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, React Router DOM.
- **Estilos**: CSS3 Moderno (Variables, Flexbox, Grid), Glassmorphism.
- **Backend (Serverless)**: Firebase Authentication, Firestore Database.
- **Almacenamiento de Imágenes**: Cloudinary (Upload Widget & API).
- **Utilidades**: `react-easy-crop` (recorte de imágenes).

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- NPM

### Pasos

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/tu-repo.git
    cd tu-repo
    ```

2.  **Instalar dependencias**
    ```bash
    cd client
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la carpeta `client` con las siguientes credenciales:

    ```env
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=tu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id

    # Cloudinary Configuration
    VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
    ```

4.  **Ejecutar en desarrollo**
    ```bash
    npm run dev
    ```

## 📂 Estructura del Proyecto

```
client/src/
├── api/            # Conexiones a Firebase y Cloudinary
├── assets/         # Imágenes, iconos y datos estáticos (JSON)
├── components/     # Componentes reutilizables (UI, Layout, Profile)
├── context/        # Contexto de React (AuthContext)
├── hooks/          # Custom Hooks
├── pages/          # Vistas principales (Home, Login, Profile, etc.)
└── utils/          # Funciones de utilidad
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request para mejoras y correcciones.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
<div align="center">
    <sub>Hecho con 💜 por Paulii Darkness Dev</sub>
</div>
