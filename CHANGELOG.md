# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.9.0-beta] - 2025-11-24

### 🎉 Añadido
- **Chat UI Rediseñado**: Layout de pantalla completa, sin headers duplicados
- **Navegación en Chat**: Avatares y nombres clickables que llevan al perfil
- **MatchesList UI**: Diseño consistente con Chat, badges de mensajes no leídos
- **Badges de Notificación**: Punto rojo para mensajes nuevos (sin números)
- **Timestamps**: Formato relativo (Ahora, 5m, 2h) en lista de matches

### 🐛 Corregido
- **Feed Self-Profile**: Filtro crítico para evitar que el propio usuario aparezca en su feed
- **Chat Layout**: Eliminado BaseLayout redundante en Chat
- **Consola**: Limpieza de logs de debug en Chat y MatchesList
- **Timestamps**: Corrección de formato de hora en mensajes individuales

### 🔄 Cambiado
- **AppRouter**: Wrapper `FeedWithProvider` para inyectar userId al contexto
- **FeedContext**: Actualizado para recibir y usar userId en filtros

## [0.8.0-beta] - 2025-11-22

### 🎉 Añadido
- **Feed Optimizado**: Sistema de batch loading con caché local (IndexedDB)
- **Backend Node.js**: Servidor Express con worker de matches
- **Middleware de Autenticación**: Verificación de tokens Firebase en backend
- **Índices Compuestos**: 6 índices optimizados en Firestore
- **Prefetch Inteligente**: Carga anticipada de perfiles
- **FeedContext**: Contexto React para gestión del feed
- **UserCache**: Sistema de caché local con Map + localforage
- **CORS Seguro**: Configuración restrictiva por dominios
- **Scripts de Deployment**: Scripts para desplegar índices de Firebase
- **Documentación Completa**:
  - `Backend-Config.md` - Guía de configuración del servidor
  - `FIREBASE_SETUP.md` - Pasos de despliegue de Firebase
  - `PROJECT_STATUS.md` - Estado del proyecto con métricas
  - `PRE_COMMIT_CHECKLIST.md` - Checklist de seguridad

### 🔄 Cambiado
- **Detección de Matches**: Migrada del cliente al backend (Node.js worker)
- **Feed Loading**: De `onSnapshot` a `getDocs` con paginación
- **Estructura de Matches**: Cambio de `{user1Id, user2Id}` a `{users: []}` para queries optimizadas
- **README.md**: Actualizado con nueva arquitectura y deployment
- **Arquitectura.md**: Agregada sección de backend Node.js
- **Requisitos.md**: Progreso actualizado a 75%
- **global.css**: Reorganizado con secciones claras

### ⚡ Optimizado
- **Lecturas de Firestore**: Reducción del 60% en lecturas iniciales
- **Tiempo de Carga**: Mejora del 68% (de ~2.5s a ~0.8s)
- **Cache Hit Rate**: 85% de perfiles servidos desde caché
- **Queries de Matches**: 10x más rápidas con índices compuestos

### 🔒 Seguridad
- **Reglas de Firestore**: Desplegadas y actualizadas
- **Reglas de Storage**: Desplegadas con validaciones
- **Variables de Entorno**: Credenciales movidas a `.env`
- **.gitignore**: Mejorado con patrones de seguridad completos
- **Service Account**: Eliminado del repositorio

### 🐛 Corregido
- Problema de autenticación con Firebase CLI (token expirado)
- Sintaxis en `deploy-indexes.ps1`
- Importación incorrecta en `FeedContext.jsx`
- Falta de dependencia `localforage` en `package.json`

### 📚 Documentación
- Actualizado README con instrucciones de backend
- Agregada guía de configuración de Firebase
- Creado checklist de pre-commit
- Documentada arquitectura híbrida (Frontend + Backend)

## [0.7.0-beta] - 2025-11-21

### 🎉 Añadido
- Sistema completo de Likes y Matches
- Notificación animada de match
- Colecciones `likes` y `matches` en Firestore
- Reglas de seguridad para likes y matches

### 🔄 Cambiado
- Estructura de datos de perfiles
- Sistema de edad (ahora calculado desde fecha de nacimiento)

## [0.6.0-beta] - 2025-11-20

### 🎉 Añadido
- Feed de usuarios con sistema de tarjetas
- Componente UserCard con diseño glassmorphism
- Botones Like y Pass
- Filtrado de usuarios ya vistos

## [0.5.0-beta] - 2025-11-19

### 🎉 Añadido
- Sistema de edición de perfil con modales
- Subida de múltiples fotos con crop interactivo
- Integración con Cloudinary
- Página de Settings
- Página de Account Info

## [0.4.0-beta] - 2025-11-18

### 🎉 Añadido
- Creación de perfil completo
- Sistema de fecha de nacimiento seguro
- Validación de edad mínima (18 años)
- Separación de datos públicos/privados

## [0.3.0-beta] - 2025-11-17

### 🎉 Añadido
- Autenticación con Google OAuth
- Rutas protegidas
- Redirección inteligente según estado de autenticación

## [0.2.0-beta] - 2025-11-16

### 🎉 Añadido
- Login con Email/Password
- Registro con Email/Password
- Gestión de sesiones con Firebase Auth

## [0.1.0-beta] - 2025-11-15

### 🎉 Añadido
- Configuración inicial del proyecto
- Estructura de carpetas
- Configuración de Vite
- Configuración de Firebase
- Diseño base con Glassmorphism
- Navegación por tabs
- Componentes UI reutilizables (Button, Input, Modal)

---

## Leyenda

- 🎉 **Añadido**: Nuevas funcionalidades
- 🔄 **Cambiado**: Cambios en funcionalidades existentes
- ⚡ **Optimizado**: Mejoras de rendimiento
- 🔒 **Seguridad**: Mejoras de seguridad
- 🐛 **Corregido**: Corrección de bugs
- 📚 **Documentación**: Cambios en documentación
- ❌ **Eliminado**: Funcionalidades eliminadas
- 🚨 **Deprecado**: Funcionalidades que serán eliminadas
