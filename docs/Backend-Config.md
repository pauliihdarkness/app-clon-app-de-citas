# 🛠️ Configuración del Backend

Este documento explica cómo configurar y desplegar el servidor backend (Node.js + Express + Firebase Admin).

## 📋 Requisitos Previos

*   Node.js instalado.
*   Cuenta en Firebase con un proyecto activo.
*   Cuenta en Render (para despliegue).

## 🔐 Variables de Entorno (.env)

Crea un archivo `.env` en la carpeta `server/` con las siguientes claves:

```properties
# Credenciales de Firebase (Service Account)
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=tu-client-email@app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Seguridad CORS (Dominios permitidos)
# Separa los dominios con comas, sin espacios.
# Incluye localhost para desarrollo y tu dominio de Render/Vercel para producción.
ALLOWED_ORIGINS=http://localhost:5173,https://tu-app-frontend.vercel.app
```

> **Nota:** Para obtener las credenciales de Firebase, ve a *Project Settings > Service Accounts > Generate New Private Key*.

## 🚀 Ejecución Local

1.  Entra a la carpeta del servidor:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor:
    ```bash
    npm start
    ```
    Deberías ver:
    > 🚀 Server starting...
    > 🌍 Web server listening on port 3000
    > ❤️ Match Worker started... listening for new likes.

## ☁️ Despliegue en Render

1.  Crea un nuevo **Web Service** en Render.
2.  Conecta tu repositorio de GitHub.
3.  Configura el servicio:
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4.  **Variables de Entorno:**
    *   Agrega manualmente las mismas variables que en tu `.env` (`FIREBASE_PRIVATE_KEY`, `ALLOWED_ORIGINS`, etc.).
    *   *Tip:* Para la `FIREBASE_PRIVATE_KEY` en Render, asegúrate de copiar todo el contenido, incluyendo los saltos de línea.

## 🤖 Evitar que se duerma (Keep-Alive)

Render duerme los servicios gratuitos tras 15 min de inactividad. Para evitarlo:
1.  Usa un servicio como **UptimeRobot** o **cron-job.org**.
2.  Configura un ping HTTP cada 5 minutos a la URL de tu backend: `https://tu-backend.onrender.com/`
3.  El servidor responderá "I am alive! 🤖" y se mantendrá activo.
