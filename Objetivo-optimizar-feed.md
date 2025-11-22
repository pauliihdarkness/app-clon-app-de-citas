# 🚀 Objetivo

Diseñar un **Feed escalable, rápido y barato** para tu app de citas: mínimo de lecturas Firestore, UX instantánea (swipe sin delay) y compatibilidad con tus reglas de seguridad actuales. 

---

# 🧩 Resumen alto nivel (qué va a hacer)

1. Cargar perfiles en **batches** (15–25) y mantenerlos en **cache** (memoria + IndexedDB).
2. Usar **getDocs** (fetch puntual) en lugar de `onSnapshot` para el feed. `onSnapshot` sólo para chat / notifs. 
3. Evitar lecturas duplicadas con un **UserCache** global (Map) y fallback persistente (localForage/IndexedDB).
4. Filtrar con **queries indexadas** (índices compuestos) y paginar con `startAfter`. 
5. Delegar match-detection a **Cloud Functions** para minimizar lecturas cliente. 

---

# 🗂️ Estructura FE relevante

(agrego solo lo que impacta el feed)

```
client/src/
 ├─ context/
 │   ├─ AuthContext.jsx
 │   ├─ FeedContext.jsx      <-- nuevo (cache + batches)
 │   └─ UserCache.js         <-- util de cache (Map + IndexedDB)
 ├─ hooks/
 │   └─ useFeed.js           <-- hook que usa FeedContext
 ├─ api/
 │   └─ firestore/           <-- queries pre-hechas (getBatchProfiles, markSeen)
 ├─ pages/
 │   └─ Feed.jsx
 └─ components/
     └─ Card, SwipeDeck, Filters, Skeleton
```

---

# 🔁 Flujo de datos (end-to-end)

1. `Feed.jsx` monta `FeedContext` y pide `loadBatch()` (limit 15).
2. `getBatchProfiles()` hace 1 consulta compuesta a `users` (where + limit + startAfter) — devuelve 15 docs.
3. Los perfiles llegan, se guardan en `FeedContext.cache` y en `IndexedDB` (background).
4. El usuario swipea localmente: UI actualiza estado sin peticiones.
5. Al Like → cliente escribe 1 doc en `likes/` (create) y marca localmente el perfil como visto (no read extra).
6. Cloud Function `onCreate(like)` detecta reciprocidad y crea `matches/` si corresponde — cliente se entera vía notificación o polling ligero. 

---

# ✅ Reglas clave de diseño (para ahorrar lecturas)

* **Batch size**: 15–25.
* **Prefetch**: cuando quede <5 en cache, disparar loadBatch() en background.
* **Cache key**: `feed:filters:uid:pageToken` — facilita reuso por filtro.
* **No onSnapshot** en feed/profile (solo chat/notif). 
* **SeenProfiles**: mantener ids en `/users/{uid}/meta.seenProfiles` (o en subdoc privado) para excluirlos en queries. 

---

# 🔍 Consultas Firestore sugeridas (ejemplos)

**Índices compuestos recomendados**

* `gender + age`
* `gender + location.city`
* `orientation + age`
  (Crear estos en Firebase console). 

**Query ejemplo (modular v9)**

```js
// api/firestore/feed.js
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getProfilesBatch({ filters, pageSize = 15, lastDoc = null, excludeIds = [] }) {
  let q = query(
    collection(db, "users"),
    where("active", "==", true),
    where("gender", "in", filters.genders),
    // agregar más where según filtros (edad, orientation...)
    orderBy("popularity", "desc"),
    limit(pageSize)
  );

  if (lastDoc) q = query(q, startAfter(lastDoc));

  // Nota: 'not-in' / 'array-contains' tienen limitaciones; para excludeIds usa client filter si es poco.
  const snap = await getDocs(q);
  return { docs: snap.docs, lastDoc: snap.docs[snap.docs.length - 1] || null };
}
```

**Consideraciones**

* Si `excludeIds` es grande (>10) Firestore no soporta `not-in` con arrays grandes — filtra client-side usando cache.
* Ordena por un campo indexable (`popularity`, `createdAt`) para consistencia en `startAfter`.

---

# 🧠 Cache: UserCache + FeedContext (código)

### 1) `UserCache.js` (Map + localForage fallback)

```js
// context/UserCache.js
import localforage from "localforage";

const memory = new Map();
const STORE_KEY = "userCache_v1";

export async function getUserCached(uid) {
  if (memory.has(uid)) return memory.get(uid);
  const blob = await localforage.getItem(STORE_KEY);
  if (blob && blob[uid]) {
    memory.set(uid, blob[uid]);
    return blob[uid];
  }
  return null;
}

export async function setUserCached(uid, data) {
  memory.set(uid, data);
  const blob = (await localforage.getItem(STORE_KEY)) || {};
  blob[uid] = data;
  await localforage.setItem(STORE_KEY, blob);
}

export function hasUser(uid) { return memory.has(uid); }
```

### 2) `FeedContext.jsx`

```js
// context/FeedContext.jsx
import React, { createContext, useContext, useState, useRef } from "react";
import { getProfilesBatch } from "../api/firestore/feed";
import { setUserCached } from "./UserCache";

const FeedContext = createContext();

export function FeedProvider({ children, initialFilters, pageSize = 15 }) {
  const [stack, setStack] = useState([]); // perfiles listos para mostrar
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);
  const filtersRef = useRef(initialFilters);

  async function loadBatch({ reset = false } = {}) {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      if (reset) {
        lastDocRef.current = null;
        setStack([]);
      }
      const { docs, lastDoc } = await getProfilesBatch({
        filters: filtersRef.current,
        pageSize,
        lastDoc: lastDocRef.current
      });

      const profiles = docs.map(d => ({ id: d.id, ...d.data() }));
      // cache individual users
      await Promise.all(profiles.map(p => setUserCached(p.id, p)));
      setStack(prev => [...prev, ...profiles]);
      lastDocRef.current = lastDoc;
    } finally {
      loadingRef.current = false;
    }
  }

  function popProfile() {
    setStack(prev => prev.slice(1));
  }

  // prefetch trigger: call loadBatch when stack.length < 5
  React.useEffect(() => {
    if (stack.length < 5) loadBatch();
  }, [stack.length]);

  return (
    <FeedContext.Provider value={{ stack, loadBatch, popProfile, reset: () => loadBatch({ reset: true }) }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
```

---

# 👍 Acción Like / Dislike (cliente)

* On Like: write `likes/{id}` with `{ fromUserId, toUserId, createdAt }`
* NO leer `likes` de destino desde cliente. Cloud Function se encarga del match. 

```js
// api/firestore/likes.js
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function sendLike(fromUserId, toUserId) {
  return await addDoc(collection(db, "likes"), {
    fromUserId, toUserId, createdAt: Date.now()
  });
}
```

---

# 🛠️ Cloud Function sugerida (pseudo)

* `onCreate` en `likes/` → busca like recíproco → si existe crea `matches/`. Esto evita que el cliente tenga que leer likes ajenos. 

---

# 🔐 Reglas de seguridad importantes (feed)

Asegurate que la regla `match /users/{userId} allow read: if isAuthenticated()` se mantenga y que los datos privados estén en `users/{userId}/private/data`. No uses reglas que permitan lecturas masivas anónimas. Tu `Arquitectura.md` ya tiene buena base; agrega límites si necesitas. 

---

# 📈 Métricas & observabilidad

* Meter eventos Analytics (Firebase) para: `batch_load`, `batch_size`, `likes_sent`, `prefetch_triggered`. 
* Track reads in dev: usar Firebase Emulator y contadores para validar lecturas por user flow.

---

# 🧪 Pruebas / Validación

1. Emulador Firebase: simular 1k usuarios y medir lecturas por minuto.
2. Escenarios a probar:

   * swiping a tope (no prefetch)
   * reconexión con cache local (offline -> online)
   * filtros aplicados (edad, distancia) y combinación de índices. 

---

# 💡 Extras / mejoras futuras (priorizadas)

1. **Serve cached feed** from a lightweight backend (Cloud Run) for extreme scale.
2. **Edge caching**: usar Redis o CDN para perfiles más visitados.
3. **GraphQL layer** para agregaciones complejas sin gastar lecturas.
4. **Optimizar payload**: almacenar solo campos necesarios para feed (`name, images[0], age, uid, lastActive`) y dejar resto para detalle. 

---

# ✅ Resultado: qué te entregué ahora

* Arquitectura del feed optimizada (cache + batches + Cloud Functions).
* Código funcional para `UserCache` y `FeedContext`.
* Ejemplos de queries, reglas y recomendaciones de índices.
* Integración con tu documentación existente (Resumen / Arquitectura / Requisitos).   

---
