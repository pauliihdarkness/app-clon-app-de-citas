# Reporte de Deuda Técnica

Este documento detalla la deuda técnica identificada en el proyecto si se desplegara en su estado actual (28 de Noviembre, 2025).

## 🚨 1. Seguridad (Crítico)

Esta es el área con mayor deuda técnica y riesgo. Existen vulnerabilidades conocidas que comprometen la integridad de la aplicación.

*   **Credenciales Expuestas**: Las credenciales de Cloudinary (`VITE_PRESET_NAME`, `VITE_CLOUD_NAME`) están expuestas en el cliente, permitiendo subidas arbitrarias de archivos.
*   **Falta de App Check**: Firebase App Check no está inicializado en `client/src/api/firebase.js`, dejando la base de datos expuesta a tráfico no verificado y bots.
*   **Sin Rate Limiting**: No hay límites en la frecuencia de acciones críticas (likes, mensajes), lo que permite abuso de recursos y costos elevados en Firestore.
*   **Validación de Archivos**: No hay validación robusta del tipo de archivo en el cliente antes de subir a Cloudinary (riesgo de subir malware).
*   **Datos Privados**: El cliente accede directamente a subcolecciones privadas (`/users/{id}/private/data`), lo cual es un riesgo si las reglas de seguridad fallan.
*   **Sanitización**: Falta sanitización de inputs en el chat y perfiles, riesgo de XSS.

## 🏗️ 2. Arquitectura y Estructura

La arquitectura actual presenta inconsistencias y falta de separación de responsabilidades.

*   **Lógica Dispersa**: Archivos de API como `client/src/api/matches.js` y `client/src/api/messages.js` están vacíos (solo comentarios). La lógica de negocio (fetches, sockets) está hardcodeada dentro de los componentes (ej. `Chat.jsx`), lo que dificulta el mantenimiento y testing.
*   **Código Muerto**: El archivo `client/src/App.jsx` existe pero no se usa realmente (el entry point es `main.jsx` que llama a `AppRouter`). Debería eliminarse o refactorizarse.
*   **Componentes Monolíticos**: Componentes como `Chat.jsx` mezclan lógica de conexión (sockets), lógica de datos (fetch) y presentación (UI con estilos en línea).
*   **Manejo de Estado**: Se usa `FeedContext` y `AuthContext`, pero mucha lógica de estado local podría elevarse o manejarse mejor para evitar prop drilling o re-renders innecesarios.

## 🧹 3. Calidad de Código (Clean Code)

*   **Estilos en Línea**: Uso excesivo de `style={{...}}` en componentes (ej. `Chat.jsx`). Esto hace que el código sea verboso, difícil de leer y previene la reutilización de estilos CSS.
*   **Hardcoded Values**: Hay strings mágicos y valores hardcodeados dispersos en los componentes.
*   **Logs en Producción**: Presencia de `console.log` con datos sensibles (UIDs) que serían visibles en la consola del navegador en producción.
*   **Manejo de Errores**: El manejo de errores es básico (muchos `console.error` sin feedback visual al usuario).

## ⚡ 4. Rendimiento

*   **Consultas Ineficientes**: Se detectaron consultas a Firestore con límites altos (50 docs) y filtrado en cliente, lo que desperdicia lecturas y ancho de banda.
*   **Carga de Imágenes**: Aunque se usa compresión, no parece haber una estrategia de carga diferida (lazy loading) o tamaños responsivos para las imágenes de perfil en listas largas.
*   **Bundle Size**: No hay evidencia de code splitting granular (ej. `React.lazy` para rutas) más allá de lo que Vite haga por defecto.

## 📝 5. Documentación

*   **Vulnerabilidades Conocidas**: Existe un documento `client-vulnerabilities.md` muy completo, pero las acciones correctivas no se han aplicado.
*   **API Docs**: Falta documentación de los endpoints del backend y contratos de datos.

## ✅ Recomendaciones Prioritarias

1.  **Inmediato**: Implementar Firebase App Check y mover las credenciales de Cloudinary a un backend/Cloud Function.
2.  **Corto Plazo**: Centralizar la lógica de API en la carpeta `api/` y limpiar `Chat.jsx` y otros componentes grandes.
3.  **Medio Plazo**: Refactorizar estilos en línea a archivos CSS/Módulos o Tailwind (si se decide usar).
