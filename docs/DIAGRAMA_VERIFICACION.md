# Diagrama Visual - Sistema de Aprobación Automática

## 🔄 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VERIFICACIÓN DE IDENTIDAD                        │
└─────────────────────────────────────────────────────────────────────┘

1️⃣  INICIO
    ┌──────────────────────────┐
    │ /verify-identity         │
    │ IdentityVerificationPage │
    └──────────────┬───────────┘
                   │
2️⃣  SELECCIÓN DE GESTO
    ┌──────────────────────────────────────┐
    │ IdentityVerification.jsx             │
    │ • Sonrisa                            │
    │ • Parpadeo                           │
    │ • Asentimiento                       │
    │ • Negación                           │
    └──────────────┬──────────────────────┘
                   │
3️⃣  DETECCIÓN DE MOVIMIENTO (5 segundos)
    ┌──────────────────────────────────────┐
    │ GestureDetection.jsx                 │
    │ • Canvas API                         │
    │ • Analiza 10 frames                  │
    │ • Calcula confianza (0-1)            │
    └──────────────┬──────────────────────┘
                   │
4️⃣  ENVÍO AL SERVIDOR
    ┌──────────────────────────────────────┐
    │ POST /api/verification/identity      │
    │ {                                    │
    │   userId, gestureType,               │
    │   timestamp, confidence              │
    │ }                                    │
    └──────────────┬──────────────────────┘
                   │
5️⃣  EVALUACIÓN AUTOMÁTICA (Backend)
    ┌──────────────────────────────────────┐
    │ server/routes/verification.js        │
    │                                      │
    │ SI confidence >= 0.6                 │
    │   ➜ status = "approved"              │
    │   ➜ identityVerified = true          │
    │                                      │
    │ SI 0.4 <= confidence < 0.6           │
    │   ➜ status = "pending"               │
    │   ➜ identityVerified = false         │
    │                                      │
    │ SI confidence < 0.4                  │
    │   ➜ status = "rejected"              │
    │   ➜ identityVerified = false         │
    │                                      │
    │ Guardar en Firestore                 │
    │ Actualizar documento usuario         │
    └──────────────┬──────────────────────┘
                   │
6️⃣  RESPUESTA DEL SERVIDOR
    ┌──────────────────────────────────────┐
    │ {                                    │
    │   success: true,                     │
    │   status: "approved" | "pending" |   │
    │           "rejected",                │
    │   data: {...}                        │
    │ }                                    │
    └──────────────┬──────────────────────┘
                   │
7️⃣  RENDERIZADO DE RESULTADO (Frontend)
    │
    ├─ SI status === "approved"
    │  ┌──────────────────────────────────┐
    │  │ ✅ ¡Verificación Completada!    │
    │  │ "Tu identidad verificada"        │
    │  │ Redirige a /profile en 3 segundos│
    │  │ Badge se actualiza en tiempo real│
    │  └──────────────────────────────────┘
    │
    ├─ SI status === "rejected"
    │  ┌──────────────────────────────────┐
    │  │ ⚠️  Verificación Rechazada       │
    │  │ "Confianza: 38%"                │
    │  │ Botón: Intentar de Nuevo         │
    │  │ Auto-reset en 5 segundos         │
    │  └──────────────────────────────────┘
    │
    └─ SI status === "pending"
       ┌──────────────────────────────────┐
       │ ⏳ Verificación Enviada          │
       │ "En revisión..."                 │
       │ Redirige a /profile en 3 segundos│
       │ Badge muestra "Pendiente"        │
       └──────────────────────────────────┘

8️⃣  ACTUALIZACIÓN DE PERFIL
    ┌──────────────────────────────────────┐
    │ Profile.jsx / VerificationBadge.jsx  │
    │                                      │
    │ ✓ Verificado (verde)                 │
    │ ⏳ Pendiente (naranja)              │
    │ 🔒 Verificar Identidad (rosa)       │
    └──────────────────────────────────────┘

9️⃣  ACTUALIZACIÓN DE CONTEXTO
    ┌──────────────────────────────────────┐
    │ VerificationContext.jsx              │
    │ useVerification() hook               │
    │                                      │
    │ isVerified = true                    │
    │ verificationStatus = {...}           │
    │                                      │
    │ Se usa en:                           │
    │ • Badge en perfil                    │
    │ • Opciones de privacidad             │
    │ • Validaciones en la app             │
    └──────────────────────────────────────┘

🔟 BASE DE DATOS (Firestore)
    ┌───────────────────────────────────────────────┐
    │ Colección: identity_verifications             │
    │ {                                             │
    │   userId: "user123",                          │
    │   gestureType: "smile",                       │
    │   confidence: 0.75,                           │
    │   status: "approved",    ◄──── NUEVO ESTADO  │
    │   submittedAt: timestamp,                     │
    │   reviewedAt: timestamp,                      │
    │   reviewedBy: "system",  ◄──── AUTO-APROBADO │
    │   notes: "Aprobado automáticamente"           │
    │ }                                             │
    └───────────────────────────────────────────────┘
    
    ┌───────────────────────────────────────────────┐
    │ Colección: users / doc: user123               │
    │ {                                             │
    │   ...otrosCampos...,                          │
    │   identityVerified: true,  ◄──── ACTUALIZADO │
    │   identityVerificationId: "ref123",           │
    │   lastVerificationAttempt: timestamp          │
    │ }                                             │
    └───────────────────────────────────────────────┘
```

---

## 📊 Tabla de Estados

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ESTADOS DE VERIFICACIÓN                     │
└─────────────────────────────────────────────────────────────────────┘

Estado      │ Confianza  │ identityVerified │ Pantalla             │ Comportamiento
────────────┼────────────┼──────────────────┼──────────────────────┼──────────────────
pending     │ ninguno    │ false            │ Formulario gesto     │ Espera usuario
submitting  │ n/a        │ n/a              │ Spinner              │ Procesando...
approved    │ >= 0.6     │ true             │ Checkmark verde      │ Redirige perfil (3s)
rejected    │ < 0.4      │ false            │ Icono advertencia    │ Ofrece reintentar
error       │ n/a        │ n/a              │ Icono error          │ Ofrece reintentar
```

---

## 🎯 Matriz de Decisión

```
┌─────────────────────────────────────────────────┐
│  CONFIANZA DETECTADA → DECISIÓN AUTOMÁTICA      │
└─────────────────────────────────────────────────┘

                    CONFIANZA (0 a 1)
                    
    0 ─────┬─────────┬──────────────┬───── 1.0
          0.4        0.6            1.0
           │          │              │
        ───┼──────────┼──────────────┼───
           │          │              │
      RECHAZADO    PENDIENTE    APROBADO
        < 0.4      0.4 - 0.6     >= 0.6
           │          │              │
      Red ⚠️    Orange ⏳         Green ✓
           │          │              │
      "Rechazada"  "En Revisión"  "Completada"
           │          │              │
        Reintentar   Esperar     Perfil OK
```

---

## 🔗 Relaciones entre Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL SISTEMA                     │
└─────────────────────────────────────────────────────────────────┘

Frontend
────────────────────────────────────────────────────────────────

    IdentityVerificationPage.jsx (Página principal)
    ├── Estado: pending, submitting, approved, rejected, error
    ├── Lógica: Evalúa response.data.status
    ├── Acciones: Redirige o ofrece reintentar
    │
    ├─→ IdentityVerification.jsx (Selección)
    │   ├── 4 opciones de gesto
    │   └─→ onVerificationComplete(data)
    │
    ├─→ GestureDetection.jsx (Captura & análisis)
    │   ├── Canvas API
    │   ├── Analiza 10 frames
    │   └─→ Retorna confidence (0-1)
    │
    └─→ API: submitIdentityVerification()
        └─→ axios.post('/api/verification/identity')


Backend
────────────────────────────────────────────────────────────────

    server/routes/verification.js
    │
    ├─ POST /api/verification/identity
    │  ├── Recibe: userId, gestureType, timestamp, confidence
    │  ├── LÓGICA AUTOMÁTICA:
    │  │   ├─ SI confidence >= 0.6 → approved
    │  │   ├─ SI confidence < 0.4 → rejected
    │  │   └─ ELSE → pending
    │  ├── Actualiza: Firestore (identity_verifications + users)
    │  └─→ Retorna: { success, status, data, ... }
    │
    ├─ GET /api/verification/status/:userId
    │  ├── Valida: user.uid === userId
    │  ├── Busca: Último documento de verificación
    │  └─→ Retorna: { status, data }
    │
    └─ DELETE, PATCH... (otros endpoints)


Database
────────────────────────────────────────────────────────────────

    Firebase Firestore
    │
    ├─ Colección: identity_verifications
    │  └─ Doc: {
    │     userId, gestureType, confidence,
    │     status, submittedAt, reviewedAt,
    │     reviewedBy, notes
    │  }
    │
    └─ Colección: users
       └─ Doc: user123 {
          identityVerified: boolean ◄─ CLAVE
          identityVerificationId: ref
          lastVerificationAttempt: timestamp
       }
```

---

## 🎬 Secuencia de Eventos

```
Timeline de una verificación APROBADA (confidence = 0.75)

Usuario         │         Frontend              │         Backend         │    Firestore
────────────────┼──────────────────────────────┼───────────────────────┼──────────────────
                │                              │                       │
[1] Click ver   │ pending → IdentityVerif      │                       │
                │                              │                       │
[2] Selecciona  │ Muestra GestureDetection    │                       │
   "Sonrisa"    │                              │                       │
                │                              │                       │
[3] 5 segundos  │ Analiza canvas              │                       │
   sonriendo    │ Calcula confidence = 0.75   │                       │
                │                              │                       │
[4] Completado  │ submitting (spinner)        │                       │
                │ POST /api/verification/id   │                       │
                │ + body completo             ├──[5] Recibe request  │
                │                              │                       │
                │                              ├──[6] confidence 0.75 │
                │                              │ >= 0.6? SÍ           │
                │                              │ status = "approved"  │
                │                              │ isVerified = true    │
                │                              │                       ├──[7] Crea doc
                │                              │                       │ identity_verif
                │                              │ [8] Actualiza users  ├──[9] Update users
                │                              │ identityVerified=T   │
                │                              │                       │
                │ [10] Recibe response        │                       │
                │ { status: "approved", ... } │                       │
                │                              │                       │
[11] Renderiza  │ approved state              │                       │
     checkmark  │ h2: "¡Verificado!"        │                       │
                │ Inicia timeout 3s           │                       │
                │                              │                       │
[12] 3s después │ window.location.href=       │                       │
                │ "/profile"                  │                       │
                │                              │                       │
[13] Perfil     │ Profile.jsx se carga       │                       │
                │ VerificationBadge          │                       │
                │ ✓ Verificado (verde)       │                       │
```

---

## 🔄 Comparación: Antes vs Después

```
ANTES (Sin aprobación automática)
─────────────────────────────────────────

Usuario envía → Backend guarda 
status: "pending" → Usuario espera ⏳ → 
Admin revisa manualmente → Avatar actualizado 
(puede tardar horas o días) → 
Experiencia: Mala 😞


DESPUÉS (Con aprobación automática)
─────────────────────────────────────────

Usuario envía → Backend evalúa confianza → 
Aprueba/Rechaza automáticamente en <1s ⚡ → 
Frontend muestra resultado (checkmark o error) → 
Redirección automática a perfil → 
Badge se actualiza en tiempo real ✨ → 
Experiencia: Excelente 😊

                    ↓ 4 segundos ↓
            Badge visible en perfil
```

---

## 📈 Ventajas Visuales

```
MÉTRICA                    │  ANTES  │  DESPUÉS
───────────────────────────┼─────────┼──────────
Tiempo a feedback           │  24-48h │  < 1s  ⚡
Estados indefinidos         │   SÍ ❌ │  NO ✅
Intervención manual         │   SÍ   │   NO   (casos claros)
Escalabilidad              │  Limitada│ Ilimitada
UX - Redirecciones        │  Manual │ Automática
UX - Intención reintentos  │  Lenta  │ Inmediata
```

---

**Documentación visual última actualización**: Enero 2024
