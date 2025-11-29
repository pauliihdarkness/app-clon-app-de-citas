# 🧪 Verificación de Cloudflare Turnstile

## Pasos para Verificar

### 1. Obtener Credenciales de Cloudflare

Si aún no tienes las credenciales:

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Turnstile**
3. Crea un nuevo sitio
4. Copia tu **Site Key** y **Secret Key**

### 2. Configurar Variables de Entorno

**Cliente (`client/.env`):**
```env
VITE_TURNSTILE_SITE_KEY=tu_site_key_aqui
```

**Servidor (`server/.env`):**
```env
TURNSTILE_SECRET_KEY=tu_secret_key_aqui
```

### 3. Acceder a la Página de Prueba

He creado una página de prueba especial en:

**URL:** `http://localhost:5173/test-turnstile`

Esta página te permitirá:
- ✅ Ver si el widget de Turnstile se carga correctamente
- ✅ Verificar que las credenciales están configuradas
- ✅ Probar la verificación del token en el servidor
- ✅ Ver mensajes de error detallados si algo falla

### 4. Qué Esperar

**Si TODO está configurado correctamente:**
1. Verás el widget de Turnstile (puede ser invisible o un checkbox)
2. Al completar el desafío, aparecerá un token
3. Al hacer clic en "Verificar Token", el servidor validará el token
4. Verás un mensaje de éxito ✅

**Si falta configuración:**
- Sin `VITE_TURNSTILE_SITE_KEY`: El widget no se cargará
- Sin `TURNSTILE_SECRET_KEY`: La verificación del servidor fallará
- Claves incorrectas: Verás errores específicos

### 5. Servidor Backend

Asegúrate de que el servidor esté corriendo:

```bash
cd server
npm start
```

El servidor debe estar en `http://localhost:3000`

---

## Checklist de Verificación

- [ ] Credenciales de Cloudflare obtenidas
- [ ] `VITE_TURNSTILE_SITE_KEY` configurado en `client/.env`
- [ ] `TURNSTILE_SECRET_KEY` configurado en `server/.env`
- [ ] Cliente corriendo (`npm run dev`)
- [ ] Servidor corriendo (`npm start`)
- [ ] Página de prueba accesible en `/test-turnstile`
- [ ] Widget de Turnstile se renderiza
- [ ] Token se genera correctamente
- [ ] Verificación del servidor funciona

---

## Siguiente Paso

**Abre tu navegador y ve a:**
```
http://localhost:5173/test-turnstile
```

La página te guiará paso a paso y te mostrará exactamente qué está funcionando y qué no.
