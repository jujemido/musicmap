# Plan: MusicMap Social (RRSS de SoundCloud)

> Nota: se pidió usar `impeccable.style` como referencia visual. El proxy de
> red de este entorno bloquea ese dominio (`EGRESS_BLOCKED`), así que este
> plan no incorpora nada de su estética. Si querés que el diseño se acerque
> a algo puntual de ahí, la vía más rápida es pasar una captura de pantalla.

## 1. Qué se pide

Una red social centrada en música donde cada usuario:
- Tiene perfil (foto, nombre, bio).
- Publica canciones pegando su **URL de SoundCloud** (se reproducen dentro de la app).
- Puede **comentar** en las publicaciones de otros.
- Tiene **"matches"** con otros usuarios según afinidad musical (como el
  "68% match" de la captura que mandaste antes).
- (De la conversación anterior) puede tener un **Podium**: top 3 de tracks,
  filtrable a "solo SoundCloud".

## 2. El cambio de arquitectura que esto implica

MusicMap hoy es **100% cliente, sin backend, sin cuentas**: todo vive en el
`localStorage` de cada navegador (`src/lib/storage.js`), no hay noción de
"otro usuario". Una red social requiere por definición que los datos de un
usuario sean visibles para otros, lo cual **no es posible solo con
localStorage** — cada persona tiene el suyo, aislado.

Esto no es una feature más: es un salto de "app de análisis personal" a
"app multiusuario con backend". Opciones:

- **Opción A — Añadir backend (recomendada)**: Supabase (Postgres + Auth +
  Realtime + Storage). Ya hay tooling de Supabase disponible en esta sesión,
  encaja bien con una SPA React sin necesidad de escribir un servidor propio,
  y da auth, base de datos relacional, y realtime (útil para comentarios/
  notificaciones de match) de forma gestionada.
- **Opción B — Backend propio** (Node/Express + Postgres, etc.): más control,
  mucho más trabajo de infraestructura, sin beneficio claro para el alcance
  pedido.
- **Opción C — Fake-social sobre export/import JSON** (sin backend real):
  simular "otros usuarios" importando/exportando el JSON que ya existe en
  `storage.js`. Sirve para prototipar la UI de feed/comentarios/match con
  datos de ejemplo, pero no es una red social real (nadie ve el post de
  nadie más sin pasarse el archivo a mano).

Recomiendo **A**, con **C como paso intermedio de UI** si se quiere validar
el diseño antes de meter backend.

## 3. Reutilización de lo que ya existe

Buena parte de la lógica de audio/gustos ya está construida y es
reutilizable tal cual:

- `src/lib/soundcloud.js` → `resolveTrack(url)` ya resuelve cualquier URL de
  SoundCloud a metadatos (título, artista, carátula) vía oEmbed público, sin
  configuración. Esto es exactamente lo que necesita un "pegá tu URL de
  SoundCloud" en el composer de posts.
- `src/lib/genreTaxonomy.js` + `src/lib/affinity.js` → ya calculan un vector
  de features por track y similitud coseno entre tracks. El **% de match**
  entre dos usuarios puede construirse igual: vector agregado (promedio o
  centroide) de los tracks que cada uno publicó, comparado con coseno →
  mismo mecanismo que ya afina canciones entre sí, aplicado a personas.
- `src/components/PlayerBar.jsx` → reproductor persistente ya funciona con
  `soundcloudUrl`/`audioUrl`; se reutiliza para reproducir posts del feed.
- `src/store/useStore.js` → patrón de store con Zustand se mantiene, pero
  pasa de tener un store "local" a tener stores que leen/escriben contra
  Supabase (con optimistic updates).

Lo que NO existe y hay que construir desde cero: identidad de usuario, feed,
follows, comentarios, likes, cálculo y ranking de matches, notificaciones.

## 4. Modelo de datos (Supabase / Postgres)

```
users            id, handle, display_name, avatar_url, bio, taste_vector (jsonb), created_at
posts            id, user_id, soundcloud_url, title, artist, artwork_url,
                  duration_ms, genre, subgenre, comment (texto del usuario), created_at
comments         id, post_id, user_id, body, created_at
likes            id, post_id, user_id, created_at
follows          follower_id, followee_id, created_at
matches          user_a_id, user_b_id, score (0-100), computed_at   -- o vista materializada
podium_entries   user_id, post_id, rank (1-3), source_filter ('soundcloud' | 'all')
```

- `taste_vector` en `users`: centroide de los `featureVector` (ya definidos
  en `affinity.js`) de los tracks que publicó. Se recalcula on-write (nuevo
  post) o con un job periódico.
- `matches`: se puede calcular on-demand (comparar contra los N usuarios
  seguidos/sugeridos) en vez de precomputar todos-contra-todos, que no
  escala. Empezar simple: match solo entre usuarios que se siguen mutuamente
  o que aparecen en "sugeridos".
- RLS (Row Level Security) de Supabase: cada usuario solo puede
  insertar/editar sus propios `posts`/`comments`/`likes`; lectura pública
  (o restringida a followers, según se decida la privacidad).

## 5. Pantallas / flujo (basado en la captura de referencia)

1. **Auth**: login/signup (email o OAuth — Supabase Auth lo da gratis).
2. **Perfil** (`/u/:handle`): avatar, bio, contador reviews/followers/
   following, badge de "% match" con el usuario logueado, botón Follow,
   **Podium** (top 3, con toggle "solo SoundCloud" reusando el filtro por
   `soundcloud_url != null` del plan anterior), grid/timeline de posts.
3. **Feed** (home): posts de gente que sigo, ordenados por fecha; cada post
   trae reproductor inline (SoundCloud embed o el `PlayerBar` existente),
   like, comentar, compartir.
4. **Composer**: pegar URL de SoundCloud → preview automática (reusa
   `resolveTrack`) → añadir comentario/rating opcional → publicar.
5. **Comentarios**: hilo simple bajo cada post.
6. **Matches**: lista de usuarios ordenados por `score` de afinidad, con el
   mismo % que se ve en el perfil.

## 6. Fases de implementación propuestas

1. **Fase 0 — Infra**: crear proyecto Supabase, definir schema de arriba,
   RLS, Auth. Añadir router (`react-router`) porque hoy la app no tiene
   rutas (es una sola vista).
2. **Fase 1 — Identidad + Posts**: signup/login, crear post pegando URL de
   SoundCloud (reusa `soundcloud.js`), feed simple, reproducción.
3. **Fase 2 — Social**: follows, likes, comentarios.
4. **Fase 3 — Matches**: cálculo de `taste_vector` y `score` reusando
   `affinity.js`, UI de % match en perfil y feed.
5. **Fase 4 — Podium**: top 3 por usuario con filtro "solo SoundCloud"
   (esto es lo que ya habíamos hablado antes, ahora encaja como feature
   dentro del perfil).

## 7. Preguntas abiertas antes de empezar a picar código

- ¿Esto convive con el MusicMap actual (galaxia/Every Noise personal) como
  una sección más, o es una app/producto aparte?
- ¿Auth con email+password alcanza, o hace falta login social (Google, etc.)?
- ¿El feed es público o solo entre follows?
- ¿Cómo se calcula exactamente el "match" — todos los tracks publicados, o
  también los que el usuario tiene en su colección privada (galaxia)?
