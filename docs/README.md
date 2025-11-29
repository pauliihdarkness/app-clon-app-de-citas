# 📚 Documentación del Proyecto

Índice de toda la documentación técnica del proyecto de App de Citas.

## 📋 Requisitos y Planificación

- **[Requisitos.md](./Requisitos.md)** - Lista completa de requisitos del proyecto con estado de progreso (~92% completado)
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Estado actual del proyecto y roadmap
- **[Lista de tareas.md](./Lista%20de%20tareas.md)** - Tareas pendientes y en progreso
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios y versiones

## 🏗️ Arquitectura y Diseño

- **[Arquitectura.md](./Arquitectura.md)** - Arquitectura general del sistema, flujos de datos y componentes
- **[firestore-structure.md](./firestore-structure.md)** - Estructura de la base de datos Firestore

## ⚙️ Configuración y Despliegue

- **[Backend-Config.md](./Backend-Config.md)** - Configuración del servidor backend (Node.js + Express)
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Guía de configuración de Firebase
- **[TURNSTILE_SETUP.md](./TURNSTILE_SETUP.md)** - Configuración de Cloudflare Turnstile (protección contra bots)
- **[TURNSTILE_VERIFICATION.md](./TURNSTILE_VERIFICATION.md)** - Guía de testing de Turnstile

## 🔒 Seguridad

- **[security.md](./security.md)** - Documentación de seguridad general
- **[client-vulnerabilities.md](./client-vulnerabilities.md)** - Análisis de vulnerabilidades XSS en el cliente
- **[NSFW_MODERATION.md](./NSFW_MODERATION.md)** - Sistema de moderación de contenido NSFW

## 🚀 Optimización

- **[Objetivo-optimizar-feed.md](./Objetivo-optimizar-feed.md)** - Estrategias de optimización del feed de usuarios
- **[deuda_tecnica.md](./deuda_tecnica.md)** - Deuda técnica identificada y plan de acción

## 📁 Estructura de Carpetas

```
docs/
├── README.md (este archivo)
├── Requisitos.md
├── Arquitectura.md
├── firestore-structure.md
├── Backend-Config.md
├── FIREBASE_SETUP.md
├── TURNSTILE_SETUP.md
├── TURNSTILE_VERIFICATION.md
├── NSFW_MODERATION.md
├── security.md
├── client-vulnerabilities.md
├── Objetivo-optimizar-feed.md
├── deuda_tecnica.md
├── PROJECT_STATUS.md
├── CHANGELOG.md
└── Lista de tareas.md
```

## 🔗 Documentación Adicional

### Frontend (client/)
- **[client/DEPLOYMENT.md](../client/DEPLOYMENT.md)** - Guía de despliegue en Vercel
- **[client/README.md](../client/README.md)** - Documentación del frontend

### Landing Page
- **[landing/README.md](../landing/README.md)** - Documentación de la landing page
- **[landing/SEO_GUIDE.md](../landing/SEO_GUIDE.md)** - Guía de SEO

## 📊 Estado del Proyecto

**Progreso General**: ~92% completado

### ✅ Completado
- Autenticación (email + Google OAuth)
- Gestión de perfiles completa
- Feed optimizado con caché
- Sistema de matches y chat
- Backend con workers
- Seguridad (Turnstile, Helmet, CSP)
- Moderación NSFW
- Páginas legales
- Configuración de despliegue

### 🚧 En Progreso
- Despliegue a producción

### ⏳ Pendiente
- Recuperación de contraseña
- Notificaciones push
- PWA y modo offline
- Testing automatizado
- Analytics y monitoreo

---

**Última actualización**: 28 de noviembre de 2025
