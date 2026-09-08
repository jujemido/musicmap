// Clasificación automática por audio: cada uno de los ~520 subgéneros recibe
// una "huella" de 9 dimensiones (BPM, graves, brillo, distorsión,
// bailabilidad, presencia vocal, reverb, regularidad rítmica, repetitividad
// estructural, anchura estéreo y sesgo tonal mayor/menor) derivada de dos
// fuentes, ambas deterministas y escritas a mano — nada entrenado, nada de IA:
//
//  1. Un perfil BASE por macro-género (42 entradas, autoría manual con
//     conocimiento del dominio).
//  2. Modificadores léxicos: si el nombre del subgénero contiene palabras
//     como "hard", "deep", "dark", "minimal", "melodic", "loopy",
//     "progressive"... se ajusta el perfil base con reglas fijas.
//
// classifyGenre() (en genreTaxonomy.js) compara el audio real contra las 516
// huellas de golpe — cada una ya lleva sus propios modificadores léxicos
// (bpmShift, distorsión, etc.), así que un "Hard Techno" ya "sabe" que va
// más rápido y sucio que el Techno medio sin necesitar preseleccionar antes
// una familia por un perfil "medio" ciego a esos matices (se probó esa vía
// jerárquica y empeoraba casos límite — un techno duro y rápido perdía
// contra Hardcore antes de que su propia huella, ya ajustada, entrara en
// juego). Las dimensiones fluidas (swing, repetitividad estructural,
// tonalidad mayor/menor) añaden matices reales que las 8 dimensiones
// anteriores no capturaban.

export const FAMILY_AUDIO_PROFILE = {
  //                      bpm          bass  bright dist  dance vocal reverb energy  reg  rep  ster major
  Techno: { bpm: [120, 138], bass: 0.65, brightness: 0.45, distortion: 0.35, dance: 0.7, vocal: 0.1, reverb: 0.35, energy: 0.65, regularity: 0.85, repetitiveness: 0.75, stereoWidth: 0.5, major: 0.35 },
  House: { bpm: [118, 128], bass: 0.55, brightness: 0.5, distortion: 0.2, dance: 0.75, vocal: 0.35, reverb: 0.3, energy: 0.6, regularity: 0.8, repetitiveness: 0.65, stereoWidth: 0.55, major: 0.5 },
  Trance: { bpm: [130, 145], bass: 0.45, brightness: 0.7, distortion: 0.15, dance: 0.75, vocal: 0.3, reverb: 0.45, energy: 0.7, regularity: 0.85, repetitiveness: 0.55, stereoWidth: 0.65, major: 0.65 },
  'Drum & Bass': { bpm: [160, 180], bass: 0.7, brightness: 0.5, distortion: 0.3, dance: 0.65, vocal: 0.2, reverb: 0.25, energy: 0.75, regularity: 0.6, repetitiveness: 0.45, stereoWidth: 0.55, major: 0.4 },
  Dubstep: { bpm: [135, 145], bass: 0.85, brightness: 0.4, distortion: 0.55, dance: 0.55, vocal: 0.15, reverb: 0.3, energy: 0.75, regularity: 0.55, repetitiveness: 0.4, stereoWidth: 0.5, major: 0.35 },
  Trap: { bpm: [130, 160], bass: 0.75, brightness: 0.45, distortion: 0.3, dance: 0.55, vocal: 0.3, reverb: 0.3, energy: 0.6, regularity: 0.7, repetitiveness: 0.5, stereoWidth: 0.45, major: 0.4 },
  'Footwork / Juke': { bpm: [155, 165], bass: 0.65, brightness: 0.4, distortion: 0.2, dance: 0.6, vocal: 0.15, reverb: 0.2, energy: 0.6, regularity: 0.5, repetitiveness: 0.35, stereoWidth: 0.45, major: 0.4 },
  'Global Bass': { bpm: [95, 130], bass: 0.7, brightness: 0.45, distortion: 0.2, dance: 0.75, vocal: 0.4, reverb: 0.25, energy: 0.65, regularity: 0.65, repetitiveness: 0.5, stereoWidth: 0.55, major: 0.5 },
  'Club / Ballroom': { bpm: [128, 145], bass: 0.6, brightness: 0.5, distortion: 0.25, dance: 0.8, vocal: 0.35, reverb: 0.25, energy: 0.7, regularity: 0.75, repetitiveness: 0.5, stereoWidth: 0.5, major: 0.5 },
  Phonk: { bpm: [130, 145], bass: 0.8, brightness: 0.35, distortion: 0.45, dance: 0.6, vocal: 0.2, reverb: 0.3, energy: 0.65, regularity: 0.7, repetitiveness: 0.55, stereoWidth: 0.4, major: 0.35 },
  'Hardcore / Hard Dance': { bpm: [150, 220], bass: 0.7, brightness: 0.55, distortion: 0.7, dance: 0.6, vocal: 0.1, reverb: 0.3, energy: 0.9, regularity: 0.9, repetitiveness: 0.8, stereoWidth: 0.45, major: 0.3 },
  Breakbeat: { bpm: [125, 140], bass: 0.55, brightness: 0.5, distortion: 0.3, dance: 0.65, vocal: 0.2, reverb: 0.3, energy: 0.65, regularity: 0.55, repetitiveness: 0.45, stereoWidth: 0.5, major: 0.45 },
  'UK Garage': { bpm: [130, 140], bass: 0.55, brightness: 0.55, distortion: 0.15, dance: 0.75, vocal: 0.45, reverb: 0.3, energy: 0.6, regularity: 0.55, repetitiveness: 0.45, stereoWidth: 0.5, major: 0.5 },
  Grime: { bpm: [130, 140], bass: 0.65, brightness: 0.45, distortion: 0.3, dance: 0.55, vocal: 0.55, reverb: 0.2, energy: 0.65, regularity: 0.6, repetitiveness: 0.4, stereoWidth: 0.45, major: 0.35 },
  Electro: { bpm: [120, 135], bass: 0.6, brightness: 0.55, distortion: 0.3, dance: 0.65, vocal: 0.15, reverb: 0.25, energy: 0.6, regularity: 0.8, repetitiveness: 0.6, stereoWidth: 0.5, major: 0.4 },
  'IDM / Experimental': { bpm: [90, 160], bass: 0.4, brightness: 0.5, distortion: 0.3, dance: 0.3, vocal: 0.1, reverb: 0.35, energy: 0.4, regularity: 0.35, repetitiveness: 0.3, stereoWidth: 0.6, major: 0.4 },
  'Ambient / Downtempo': { bpm: [60, 100], bass: 0.35, brightness: 0.35, distortion: 0.1, dance: 0.15, vocal: 0.1, reverb: 0.6, energy: 0.25, regularity: 0.3, repetitiveness: 0.35, stereoWidth: 0.65, major: 0.45 },
  Synthwave: { bpm: [85, 118], bass: 0.5, brightness: 0.55, distortion: 0.2, dance: 0.5, vocal: 0.2, reverb: 0.4, energy: 0.5, regularity: 0.7, repetitiveness: 0.5, stereoWidth: 0.55, major: 0.5 },
  Vaporwave: { bpm: [60, 95], bass: 0.4, brightness: 0.4, distortion: 0.15, dance: 0.25, vocal: 0.15, reverb: 0.55, energy: 0.3, regularity: 0.3, repetitiveness: 0.4, stereoWidth: 0.5, major: 0.5 },
  'Industrial / EBM': { bpm: [120, 140], bass: 0.6, brightness: 0.4, distortion: 0.6, dance: 0.55, vocal: 0.2, reverb: 0.3, energy: 0.65, regularity: 0.85, repetitiveness: 0.75, stereoWidth: 0.45, major: 0.3 },
  'Darkwave / Coldwave': { bpm: [100, 130], bass: 0.5, brightness: 0.35, distortion: 0.3, dance: 0.45, vocal: 0.35, reverb: 0.45, energy: 0.45, regularity: 0.55, repetitiveness: 0.45, stereoWidth: 0.5, major: 0.3 },
  'Hyperpop / Digicore': { bpm: [130, 180], bass: 0.5, brightness: 0.75, distortion: 0.4, dance: 0.6, vocal: 0.55, reverb: 0.25, energy: 0.7, regularity: 0.7, repetitiveness: 0.4, stereoWidth: 0.55, major: 0.55 },
  Disco: { bpm: [110, 125], bass: 0.5, brightness: 0.55, distortion: 0.1, dance: 0.75, vocal: 0.45, reverb: 0.25, energy: 0.6, regularity: 0.8, repetitiveness: 0.55, stereoWidth: 0.55, major: 0.6 },
  'Electro Swing': { bpm: [100, 130], bass: 0.4, brightness: 0.55, distortion: 0.1, dance: 0.6, vocal: 0.4, reverb: 0.3, energy: 0.5, regularity: 0.6, repetitiveness: 0.45, stereoWidth: 0.5, major: 0.55 },
  'Livetronica / Jam': { bpm: [90, 120], bass: 0.5, brightness: 0.5, distortion: 0.2, dance: 0.5, vocal: 0.25, reverb: 0.35, energy: 0.5, regularity: 0.5, repetitiveness: 0.35, stereoWidth: 0.55, major: 0.5 },
  'Chiptune / 8-bit': { bpm: [100, 155], bass: 0.35, brightness: 0.7, distortion: 0.15, dance: 0.55, vocal: 0.05, reverb: 0.15, energy: 0.55, regularity: 0.75, repetitiveness: 0.55, stereoWidth: 0.4, major: 0.55 },
  'Dungeon Synth': { bpm: [55, 90], bass: 0.4, brightness: 0.3, distortion: 0.15, dance: 0.1, vocal: 0.05, reverb: 0.65, energy: 0.2, regularity: 0.25, repetitiveness: 0.4, stereoWidth: 0.6, major: 0.3 },
  'Festival EDM / Mainstage': { bpm: [125, 130], bass: 0.55, brightness: 0.6, distortion: 0.25, dance: 0.8, vocal: 0.4, reverb: 0.3, energy: 0.75, regularity: 0.85, repetitiveness: 0.6, stereoWidth: 0.55, major: 0.6 },
  'Neurobass / Glitch Bass': { bpm: [85, 170], bass: 0.7, brightness: 0.45, distortion: 0.35, dance: 0.5, vocal: 0.15, reverb: 0.25, energy: 0.6, regularity: 0.45, repetitiveness: 0.35, stereoWidth: 0.5, major: 0.35 },
  'Speed / Hi-Energy Bass': { bpm: [130, 150], bass: 0.65, brightness: 0.5, distortion: 0.35, dance: 0.7, vocal: 0.2, reverb: 0.25, energy: 0.7, regularity: 0.8, repetitiveness: 0.65, stereoWidth: 0.45, major: 0.4 },
  'Tekno / Free Party': { bpm: [150, 200], bass: 0.65, brightness: 0.5, distortion: 0.55, dance: 0.65, vocal: 0.05, reverb: 0.3, energy: 0.85, regularity: 0.85, repetitiveness: 0.8, stereoWidth: 0.4, major: 0.3 },
  'Hip-Hop': { bpm: [70, 100], bass: 0.6, brightness: 0.4, distortion: 0.2, dance: 0.4, vocal: 0.8, reverb: 0.25, energy: 0.45, regularity: 0.6, repetitiveness: 0.4, stereoWidth: 0.4, major: 0.4 },
  Pop: { bpm: [100, 130], bass: 0.4, brightness: 0.6, distortion: 0.1, dance: 0.6, vocal: 0.85, reverb: 0.3, energy: 0.55, regularity: 0.7, repetitiveness: 0.45, stereoWidth: 0.5, major: 0.65 },
  Reggaeton: { bpm: [85, 100], bass: 0.6, brightness: 0.45, distortion: 0.15, dance: 0.7, vocal: 0.75, reverb: 0.25, energy: 0.55, regularity: 0.75, repetitiveness: 0.55, stereoWidth: 0.45, major: 0.55 },
  Indie: { bpm: [90, 140], bass: 0.35, brightness: 0.45, distortion: 0.2, dance: 0.4, vocal: 0.7, reverb: 0.4, energy: 0.4, regularity: 0.5, repetitiveness: 0.35, stereoWidth: 0.5, major: 0.5 },
  'Rock / Metal': { bpm: [100, 180], bass: 0.45, brightness: 0.45, distortion: 0.55, dance: 0.35, vocal: 0.7, reverb: 0.3, energy: 0.7, regularity: 0.55, repetitiveness: 0.35, stereoWidth: 0.5, major: 0.4 },
  'Funk / Soul': { bpm: [90, 120], bass: 0.55, brightness: 0.4, distortion: 0.15, dance: 0.6, vocal: 0.75, reverb: 0.25, energy: 0.5, regularity: 0.6, repetitiveness: 0.4, stereoWidth: 0.5, major: 0.55 },
  'Jazz / Fusion': { bpm: [70, 140], bass: 0.4, brightness: 0.5, distortion: 0.1, dance: 0.35, vocal: 0.4, reverb: 0.35, energy: 0.4, regularity: 0.4, repetitiveness: 0.25, stereoWidth: 0.55, major: 0.5 },
  'R&B': { bpm: [60, 100], bass: 0.5, brightness: 0.4, distortion: 0.1, dance: 0.4, vocal: 0.85, reverb: 0.3, energy: 0.4, regularity: 0.55, repetitiveness: 0.35, stereoWidth: 0.45, major: 0.5 },
  'World / Folk': { bpm: [80, 130], bass: 0.35, brightness: 0.45, distortion: 0.1, dance: 0.45, vocal: 0.6, reverb: 0.3, energy: 0.45, regularity: 0.5, repetitiveness: 0.35, stereoWidth: 0.5, major: 0.55 },
  'Reggae / Dub': { bpm: [65, 95], bass: 0.7, brightness: 0.35, distortion: 0.15, dance: 0.4, vocal: 0.5, reverb: 0.5, energy: 0.4, regularity: 0.6, repetitiveness: 0.45, stereoWidth: 0.55, major: 0.5 },
  'Classical / Neoclassical': { bpm: [40, 140], bass: 0.3, brightness: 0.45, distortion: 0.05, dance: 0.1, vocal: 0.1, reverb: 0.45, energy: 0.35, regularity: 0.35, repetitiveness: 0.25, stereoWidth: 0.55, major: 0.55 },
};

// [regex sobre el nombre del subgénero en minúsculas, delta a aplicar]
// bpmShift (grados, no clamp01) desplaza el rango de BPM esperado del
// subgénero respecto al de su familia — así "Hard Techno" corre más rápido
// que el Techno base y "Deep House" más lento que el House base.
const LEXICAL_MODIFIERS = [
  [/hard|raw|aggressive|gabber|terror|industrial|rawstyle|crossbreed|acid ?core/, { distortion: 0.25, energy: 0.15, bass: 0.05, bpmShift: 8, major: -0.1 }],
  [/deep|dub(?!step)|sub\b/, { bass: 0.15, brightness: -0.1, bpmShift: -4 }],
  [/dark|doom|death|noir/, { brightness: -0.15, reverb: 0.1, vocal: -0.05, major: -0.2 }],
  [/melodic|emotional|vocal|soulful|diva|singalong/, { vocal: 0.2, brightness: 0.08, major: 0.1 }],
  [/minimal|micro/, { dance: 0.05, energy: -0.1, bpmShift: -3, repetitiveness: 0.15 }],
  [/acid/, { distortion: 0.08, brightness: 0.05 }],
  [/ambient|chill|downtempo|lofi|lo-fi|sleep|comfy/, { energy: -0.25, dance: -0.2, reverb: 0.1, bpmShift: -12, regularity: -0.15 }],
  [/hyper|speed|uptempo|turbo|frenchcore/, { energy: 0.15, distortion: 0.1, bpmShift: 20 }],
  [/liquid|chillstep|smooth/, { reverb: 0.15, brightness: 0.08, distortion: -0.1, bpmShift: -5, major: 0.1 }],
  [/future|nu |neo/, { brightness: 0.05 }],
  [/industrial|ebm|power ?noise|aggrotech/, { distortion: 0.2 }],
  [/instrumental/, { vocal: -0.3 }],
  [/vocal|diva|soul/, { vocal: 0.25 }],
  [/bass\b|bassline|sub ?bass/, { bass: 0.15 }],
  [/bright|uplifting|euphoric|energetic|anthem/, { brightness: 0.12, energy: 0.1, major: 0.2 }],
  [/tribal|percussive|drum/, { dance: 0.1, bass: 0.05 }],
  [/glitch|broken|wonky|fidget/, { dance: -0.1, distortion: 0.1, regularity: -0.2, repetitiveness: -0.15 }],
  [/old ?sk?ool|classic|retro|vintage/, { distortion: -0.05, bpmShift: -4 }],
  [/psy|goa|forest/, { brightness: 0.1, energy: 0.1, bpmShift: 5, minor: 0 }],
  [/half ?time|slowed/, { bpmShift: -30 }],
  [/progressive|evolving|journey/, { repetitiveness: -0.15, stereoWidth: 0.1 }],
  [/loop|hypnotic|repetitive|driving|rolling/, { repetitiveness: 0.15, regularity: 0.1 }],
  [/wide|space|cosmic|atmospheric|orchestral/, { stereoWidth: 0.15, reverb: 0.1 }],
  [/swing|shuffle|garage|jazzy|funky/, { regularity: -0.15 }],
  [/major|happy|feelgood/, { major: 0.25 }],
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const clampBpm = (v) => Math.max(40, Math.min(230, v));

const CONTINUOUS_DIMS = ['bass', 'brightness', 'distortion', 'dance', 'vocal', 'reverb', 'energy', 'regularity', 'repetitiveness', 'stereoWidth', 'major'];

const fingerprintCache = new Map();

/** Deriva la huella de audio de un subgénero a partir del perfil de su
 * familia + modificadores léxicos de su propio nombre. Determinista. */
export function subgenreFingerprint(genreName, subName) {
  const cacheKey = `${genreName}::${subName}`;
  if (fingerprintCache.has(cacheKey)) return fingerprintCache.get(cacheKey);

  const base = FAMILY_AUDIO_PROFILE[genreName] || FAMILY_AUDIO_PROFILE.Pop;
  const fp = { bpmMin: base.bpm[0], bpmMax: base.bpm[1], allowHalfDouble: HALFTIME_PRONE_FAMILIES.has(genreName) };
  for (const dim of CONTINUOUS_DIMS) fp[dim] = base[dim];

  const lower = subName.toLowerCase().replace(/_/g, ' ');
  for (const [pattern, delta] of LEXICAL_MODIFIERS) {
    if (pattern.test(lower)) {
      for (const [key, d] of Object.entries(delta)) {
        if (key === 'bpmShift') {
          fp.bpmMin = clampBpm(fp.bpmMin + d);
          fp.bpmMax = clampBpm(fp.bpmMax + d);
        } else if (CONTINUOUS_DIMS.includes(key)) {
          fp[key] = clamp01(fp[key] + d);
        }
      }
    }
  }

  fingerprintCache.set(cacheKey, fp);
  return fp;
}

/** Extrae del análisis DSP real el mismo conjunto de dimensiones normalizadas
 * 0-1 que usan las huellas, para poder compararlos directamente. */
export function extractAudioSummary(analysis) {
  if (!analysis) return null;
  const { rhythm, spectrum, vocals, production, dynamics, tonality, structure } = analysis;
  const bands = spectrum.bands;
  const bassTotal = bands.subBass.mean + bands.bass.mean;
  const brightTotal = bands.presence.mean + bands.brilliance.mean;
  const allBands = Object.values(bands).reduce((s, b) => s + b.mean, 0) || 1e-9;
  return {
    bpm: rhythm.bpm,
    bass: clamp01(bassTotal / allBands),
    brightness: clamp01(brightTotal / allBands),
    distortion: clamp01(production.distortionScore),
    dance: clamp01(rhythm.danceability),
    vocal: clamp01(vocals.percentTrackWithVocals),
    reverb: clamp01(production.reverbScore),
    energy: clamp01(dynamics.rmsMean * 2.5),
    regularity: clamp01(rhythm.regularity ?? 0.5),
    repetitiveness: clamp01(structure?.repetitiveness ?? 0.5),
    stereoWidth: clamp01(production.stereoWidth ?? 0.5),
    // confianza-ponderado: si la tonalidad detectada es poco fiable, el
    // sesgo mayor/menor se acerca a 0.5 (neutro) en vez de forzar 0 o 1.
    major: tonality ? 0.5 + (tonality.mode === 'major' ? 1 : -1) * 0.5 * clamp01(tonality.confidence) : 0.5,
  };
}

// Familias donde el "feel" a media/doble velocidad es un fenómeno real
// (halftime dubstep/trap se percibe y produce a la mitad del BPM métrico).
// Restringido a estas para no confundir géneros no relacionados: sin este
// filtro, CUALQUIER BPM "encuentra" coincidencia en CUALQUIER familia con
// rango amplio con solo dividir o multiplicar por 2 (p.ej. 172bpm/2=86
// "coincidiendo" con World/Folk, un falso positivo real que apareció en
// pruebas antes de este fix).
const HALFTIME_PRONE_FAMILIES = new Set([
  'Dubstep', 'Trap', 'Footwork / Juke', 'Grime', 'Neurobass / Glitch Bass', 'Global Bass', 'Phonk',
]);

function bpmDistance(bpm, bpmMin, bpmMax, allowHalfDouble) {
  if (!bpm) return 0.5;
  const candidates = allowHalfDouble ? [bpm, bpm * 2, bpm / 2] : [bpm];
  let best = Infinity;
  for (const c of candidates) {
    let d;
    if (c >= bpmMin && c <= bpmMax) d = 0;
    else d = Math.min(Math.abs(c - bpmMin), Math.abs(c - bpmMax));
    best = Math.min(best, d);
  }
  return clamp01(best / 40);
}

// Pesos sobre las 11 dimensiones al comparar la huella de un subgénero
// contra el audio real de un track. BPM y timbre general dominan por ser la
// señal más robusta; las dimensiones más sutiles (swing, repetitividad,
// tonalidad) aportan menos peso individual pero suman para desempatar entre
// subgéneros de una misma familia con BPM/timbre parecidos.
const DIM_WEIGHTS = {
  bpm: 0.26, bass: 0.13, brightness: 0.13, distortion: 0.1, dance: 0.1, vocal: 0.09,
  reverb: 0.05, energy: 0.03, regularity: 0.06, repetitiveness: 0.03, stereoWidth: 0.01, major: 0.01,
};

/** Similitud 0-1 (1 = coincide perfecto) entre la huella de un subgénero y
 * el resumen de audio real de un track. */
export function fingerprintSimilarity(fingerprint, audioSummary) {
  if (!audioSummary) return 0;
  const dBpm = bpmDistance(audioSummary.bpm, fingerprint.bpmMin, fingerprint.bpmMax, fingerprint.allowHalfDouble);
  let weightedDist = dBpm * DIM_WEIGHTS.bpm;
  for (const dim of CONTINUOUS_DIMS) {
    weightedDist += Math.abs(fingerprint[dim] - audioSummary[dim]) * (DIM_WEIGHTS[dim] || 0);
  }
  return clamp01(1 - weightedDist);
}
