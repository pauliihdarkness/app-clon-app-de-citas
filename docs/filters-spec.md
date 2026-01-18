# Especificación: Filtros para Feed

Resumen rápido
- Objetivo: permitir a los usuarios filtrar perfiles en el `Feed` por criterios básicos (edad, género, orientación, distancia, con foto, intereses, online) de forma eficiente y compatible con paginación y cache.

Campos mínimos (MVP)
- `ageMin` (number)
- `ageMax` (number)
- `gender` (string | 'any')
- `orientation` (string | 'any')
- `hasPhoto` (boolean)
- `interests` (string[])
- `distanceKm` (number | 'any') — para MVP usar bounding-box simple; opcional backend luego
- `onlineOnly` (boolean)

Formato de `filters` (objeto que pasa frontend -> feed API)
{
  ageMin?: number,
  ageMax?: number,
  gender?: string,
  orientation?: string,
  hasPhoto?: boolean,
  interests?: string[],
  distanceKm?: number,
  coords?: { lat:number, lng:number },
  onlineOnly?: boolean
}

UI / UX
- `FilterPanel` (drawer o modal desde el feed) con campos controlados.
- Mostrar contador de resultados aproximado (opcional, con debounce).
- Botones: `Aplicar`, `Limpiar`, `Cancelar`.
- Persistir filtros en `localStorage` y en la URL (`?ageMin=...&gender=...`) para compartir/recargar.

Comportamiento de paginación
- Cuando cambian los filtros, invalidar `lastDoc`/cursor y recargar desde la primera página (`reset: true`).
- Prefetch y cache deben indexarse por `filtersKey` (hash de filtros) para evitar mezclar resultados.

Queries Firestore (MVP)
- Traducir filtros sencillos a cláusulas `where` y `orderBy`:
  - `where('age', '>=', ageMin)`, `where('age', '<=', ageMax)`
  - `where('gender', '==', gender)` (si != 'any')
  - `where('orientation', '==', orientation')`
  - `where('imagesCount', '>', 0)` para `hasPhoto`
  - `where('interests', 'array-contains-any', interests)` (máx 10)
- Para `distanceKm`: calcular bounding box lat/lng y `where('location.lat', '>=', minLat) ...` — nota: es aproximado.

Índices recomendados
- `age ASC, gender ASC` (compuesto con city si se filtra por ubicación)
- `gender ASC, age ASC, popularity DESC`
- `interests array-contains-any` no requiere índice adicional en Firestore, pero combinaciones con `where` sí.

Cache & keying
- `filtersKey = stableStringify(filters)` (ordenado) — usar como key en `UserProfilesContext`.
- Cache entries deben expirar (TTL corto, ej. 5 min) o invalidarse explícitamente al cambiar filtros.

Backend (opcional)
- Para distancia exacta, scoring o filtros complejos combinar en Cloud Function `profilesSearch(filters, pageToken)` que haga la lógica server-side y devuelva `docs, lastDocToken`.

Pruebas
- Unit: transformar filtros -> constraints esperadas (mapFilterToConstraints). Mock Firestore queries.
- Integration/e2e: aplicar filtros en UI y comprobar la lista y paginación.

Incremental rollout (sprints)
1. Implementar `filters` en `getProfilesBatch` y mapear filtros simples (edad, género, hasPhoto, interests).
2. Crear `FilterPanel` UI y conectar con `FeedContext` (`loadBatch({ reset: true, filters })`).
3. Añadir `filtersKey` cacheing y test básico.
4. Crear índices en Firebase y pruebas de rendimiento.
5. Opcional: backend search para distancia y scoring.

Mock UI (estructura básica)
- `FilterPanel`:
  - Rango edad: slider (min 18 - max 80)
  - Gender: select
  - Orientation: select
  - Has Photo: toggle
  - Interests: multi-select / chips
  - Distance: number + apply current location button
  - Buttons: `Aplicar` / `Limpiar` / `Cancelar`

---
Archivo generado por el asistente: especificación inicial para filtros del Feed.
