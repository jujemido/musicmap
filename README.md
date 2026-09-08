# MusicMap

App 100% cliente (sin backend, sin IA) que analiza canciones de SoundCloud (o
audio local) con DSP/MIR clásico —espectro, ritmo, tonalidad, voz, efectos de
producción, dinámica y estructura— y las coloca en un mapa tipo galaxia donde
las canciones afines se atraen, más una vista tipo Every Noise por
género/subgénero. Todo se guarda en `localStorage`, con export/import JSON y
un dataset de demo generable sin red.

## Arrancar

```bash
npm install
npm run dev
```

## Cómo añadir canciones

1. **Enlace de SoundCloud**: funciona de inmediato, **sin configurar nada**.
   Se resuelve primero por el **oEmbed público** de SoundCloud
   (`soundcloud.com/oembed`), un estándar abierto para incrustar reproductores
   que no requiere client_id ni autenticación — da título, artista y carátula.
   Con eso el track ya se añade y clasifica (por título/descripción, o por
   estimación si no hay señal). Si además configuras un `client_id` propio en
   Ajustes ⚙️ (opcional, mejora pero no es necesario), se intenta enriquecer
   con la API v2 no oficial: género/tags reales, waveform y el stream de audio
   para el análisis DSP y la reproducción completos. Sin client_id, el track
   queda con metadatos únicamente (sin ficha de audio ni reproducción propia).
2. **Archivo de audio local** (🎵 Subir audio local): la vía más fiable para
   obtener el análisis de audio *completo* y poder reproducirlo desde la app,
   ya que no depende de CORS ni de SoundCloud.
3. **Manual** (✍️): título/artista/género a mano, sin análisis de audio, para
   catalogar algo aunque no se pueda analizar.
4. **🌌 Cargar demo**: genera ~15 canciones de ejemplo con datos sintéticos
   (no auditivos reales) para ver el mapa funcionando de inmediato.

## Reproducción

Barra de reproducción persistente (play/pausa, detener, siguiente/anterior
track, avanzar/retroceder 10s, barra de progreso con seek) para cualquier
track con audio real disponible — subido como archivo local, o descargado
del stream de SoundCloud cuando hay client_id configurado y funciona. El
audio se mantiene como Blob URL **solo en memoria** (no se persiste en
localStorage: no cabría, y no sobreviviría a una recarga), así que tras
recargar la página los tracks previamente añadidos quedan sin audio
reproducible hasta volver a añadirlos. Los tracks del dataset demo (datos
sintéticos, no auditivos reales) no son reproducibles.

## Mapa: zoom y navegación

Rueda del ratón para zoom (centrado en el cursor), arrastrar sobre el fondo
vacío del mapa para desplazar la vista (paneo), arrastrar un nodo para
moverlo dentro de la simulación de fuerzas, y controles +/−/reset en la
esquina inferior derecha. Al pasar el ratón por un nodo aparece un tooltip
con título, subgénero y BPM.

## Qué se analiza y cómo (honesto, sin IA)

Todo el análisis es DSP/MIR determinista (FFT propia, autocorrelación,
Krumhansl-Schmuckler para tonalidad, novelty de Foote para estructura, etc.),
implementado en `src/lib/dsp.js` y orquestado en `src/lib/audioAnalysis.js`.
No hay modelos entrenados ni llamadas a APIs de IA en ningún punto.

- **Espectro**: 7 bandas de frecuencia, centroide, rolloff, flatness, flux.
- **Ritmo**: BPM (autocorrelación sobre onsets por flujo espectral),
  regularidad, swing, densidad rítmica por banda.
- **Tonalidad**: chromagram + algoritmo Krumhansl-Schmuckler → key/modo/Camelot.
- **Voz**: heurística por energía en banda de formantes + modulación silábica
  4-8Hz (no es reconocimiento de voz, es una estimación de presencia).
- **Producción/efectos**: reverb (decaimiento post-onset), distorsión/clipping,
  compresión (crest factor), anchura estéreo.
- **Dinámica**: RMS, rango dinámico, curva de energía, posición del clímax.
- **Estructura**: matriz de auto-similitud + detección de secciones.

El género/subgénero (estilo Every Noise) se identifica **automáticamente por
análisis de audio**, no solo por los tags del uploader. Cada uno de los ~520
subgéneros tiene una "huella" de audio esperada (BPM, graves, brillo,
distorsión, bailabilidad, presencia vocal, reverb) derivada de un perfil por
familia + modificadores léxicos deterministas sobre el propio nombre del
subgénero (`src/lib/audioFingerprint.js`: p.ej. "hard"/"uptempo" suben BPM y
distorsión, "deep"/"ambient" los bajan). La clasificación (`genreTaxonomy.js`)
compara esa huella contra las métricas reales extraídas del audio y la
combina con las keywords de tags/título cuando existen (como prior, no como
única fuente): sin tags fiables, el sistema igualmente identifica el
subgénero más parecido solo a partir de lo que suena. Es una comparación de
huellas escritas a mano, no un modelo entrenado — con las limitaciones
lógicas de eso: entre subgéneros muy próximos en sonido (p.ej. "Deep House"
vs. "Dark Disco House") puede confundir el vecino más cercano en vez de
acertar el nombre exacto, algo que en la práctica ninguna heurística de 8
dimensiones puede evitar del todo. La ficha técnica de cada track muestra el
**% de coincidencia de audio** para que quede claro cuánta confianza tiene esa
clasificación automática.

Actualmente cubre
**42 macro-géneros y 516 subgéneros (558 nodos)**, con un foco muy fuerte y
muy profundo en electrónica: Techno (46 subs), House (58), Trance (41),
Drum & Bass (32), Dubstep (23), Trap (15), Hardcore/Hard Dance (33),
Footwork/Juke, Global Bass (gqom, kuduro, moombahton, baile funk...),
Club/Ballroom, Phonk, Breakbeat, UK Garage, Grime, Electro,
IDM/Experimental, Ambient/Downtempo, Synthwave, Vaporwave, Industrial/EBM,
Darkwave/Coldwave, Hyperpop/Digicore, Disco, Electro Swing, Livetronica,
Chiptune, Dungeon Synth, Festival EDM/Mainstage, Neurobass/Glitch Bass,
Speed/Hi-Energy Bass (donk, bounce), Tekno/Free Party... Cada
subgénero recibe además su propio matiz de color dentro de la familia de su
género (offset determinista sobre el hue base), como en Every Noise. Es el
activo más importante para seguir ampliando con el tiempo.

## Afinidad entre canciones

`src/lib/affinity.js` construye un vector de features normalizado por
categoría y calcula similitud coseno ponderada. Hay 4 perfiles de pesos
(Todo / DJ / Producción / Voz) seleccionables en Ajustes.

## Limitaciones que hay que tener presentes

- El oEmbed público de SoundCloud da metadatos básicos (título/artista/
  carátula) sin necesitar nada configurado, pero no da tags/género ni acceso
  al audio — para el análisis DSP y la reproducción completos hace falta un
  `client_id` (no oficial, puede caducar sin aviso) y que el CDN permita CORS.
  La vía de archivo local no depende de ninguna de las dos cosas.
- Sin key exacta garantizada: la estimación de tonalidad es una aproximación
  clásica de MIR, no un análisis perfecto.
- La calidad de género/subgénero depende de lo completa que esté la taxonomía
  manual en `genreTaxonomy.js`, y de que haya tags/descripción/audio con
  señal real — sin nada de eso, se usa una estimación por hash marcada como
  tal (🎲) en vez de dejar el track sin clasificar.
- Todo vive en el `localStorage` del navegador (excepto el audio reproducible,
  que es efímero por sesión — ver arriba): sin exportar, se pierde si se
  borra el sitio.
