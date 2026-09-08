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

1. **Enlace de SoundCloud**: requiere un `client_id` (Ajustes ⚙️). La API
   pública de SoundCloud no admite registro de apps nuevas desde hace años, así
   que no hay uno "oficial" que dar por defecto. Si el `client_id` falla o el
   CDN bloquea la descarga del stream (CORS), el track se guarda igualmente
   con los metadatos que sí se pudieron resolver, marcado como "solo
   metadatos" (sin ficha técnica de audio).
2. **Archivo de audio local** (🎵 Subir audio local): la vía más fiable para
   obtener el análisis de audio *completo* (espectro, ritmo, voz, efectos...),
   ya que no depende de CORS ni de SoundCloud.
3. **Manual** (✍️): título/artista/género a mano, sin análisis de audio, para
   catalogar algo aunque no se pueda analizar.
4. **🌌 Cargar demo**: genera ~15 canciones de ejemplo con datos sintéticos
   (no auditivos reales) para ver el mapa funcionando de inmediato.

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

- El acceso al stream de audio de SoundCloud desde el navegador depende de un
  `client_id` no oficial y de que el CDN permita CORS — puede dejar de
  funcionar sin aviso. La vía de archivo local no tiene ese problema.
- Sin key exacta garantizada: la estimación de tonalidad es una aproximación
  clásica de MIR, no un análisis perfecto.
- La calidad de género/subgénero depende de lo completa que esté la taxonomía
  manual en `genreTaxonomy.js`.
- Todo vive en el `localStorage` del navegador: sin exportar, se pierde si se
  borra el sitio.
