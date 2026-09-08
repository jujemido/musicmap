// Clasificación automática por audio: cada uno de los ~520 subgéneros recibe
// una "huella" (BPM esperado, énfasis de graves, brillo, distorsión,
// bailabilidad, presencia vocal, reverb) derivada de dos fuentes, ambas
// deterministas y escritas a mano — nada entrenado, nada de IA:
//
//  1. Un perfil BASE por macro-género (42 entradas, autoría manual con
//     conocimiento del dominio: rango de BPM típico, densidad de graves,
//     brillo, etc.)
//  2. Modificadores léxicos: si el nombre del subgénero contiene palabras
//     como "hard", "deep", "dark", "minimal", "melodic"... se ajusta el
//     perfil base con reglas fijas (p.ej. "hard" sube distorsión y energía,
//     "deep" sube graves y baja brillo). Así los 500+ subgéneros obtienen
//     una huella propia sin tener que escribir 500 objetos a mano.
//
// La clasificación final combina esta huella de audio (comparada contra las
// métricas reales extraídas por audioAnalysis.js) con las keywords de tags/
// título cuando existen, dando prioridad al audio real cuando no hay tags
// fiables — que es exactamente "identificar automáticamente por análisis
// profundo" en vez de depender de que el uploader haya etiquetado bien.

export const FAMILY_AUDIO_PROFILE = {
  Techno: { bpm: [120, 138], bass: 0.65, brightness: 0.45, distortion: 0.35, dance: 0.7, vocal: 0.1, reverb: 0.35, energy: 0.65 },
  House: { bpm: [118, 128], bass: 0.55, brightness: 0.5, distortion: 0.2, dance: 0.75, vocal: 0.35, reverb: 0.3, energy: 0.6 },
  Trance: { bpm: [130, 145], bass: 0.45, brightness: 0.7, distortion: 0.15, dance: 0.75, vocal: 0.3, reverb: 0.45, energy: 0.7 },
  'Drum & Bass': { bpm: [160, 180], bass: 0.7, brightness: 0.5, distortion: 0.3, dance: 0.65, vocal: 0.2, reverb: 0.25, energy: 0.75 },
  Dubstep: { bpm: [135, 145], bass: 0.85, brightness: 0.4, distortion: 0.55, dance: 0.55, vocal: 0.15, reverb: 0.3, energy: 0.75 },
  Trap: { bpm: [130, 160], bass: 0.75, brightness: 0.45, distortion: 0.3, dance: 0.55, vocal: 0.3, reverb: 0.3, energy: 0.6 },
  'Footwork / Juke': { bpm: [155, 165], bass: 0.65, brightness: 0.4, distortion: 0.2, dance: 0.6, vocal: 0.15, reverb: 0.2, energy: 0.6 },
  'Global Bass': { bpm: [95, 130], bass: 0.7, brightness: 0.45, distortion: 0.2, dance: 0.75, vocal: 0.4, reverb: 0.25, energy: 0.65 },
  'Club / Ballroom': { bpm: [128, 145], bass: 0.6, brightness: 0.5, distortion: 0.25, dance: 0.8, vocal: 0.35, reverb: 0.25, energy: 0.7 },
  Phonk: { bpm: [130, 145], bass: 0.8, brightness: 0.35, distortion: 0.45, dance: 0.6, vocal: 0.2, reverb: 0.3, energy: 0.65 },
  'Hardcore / Hard Dance': { bpm: [150, 220], bass: 0.7, brightness: 0.55, distortion: 0.7, dance: 0.6, vocal: 0.1, reverb: 0.3, energy: 0.9 },
  Breakbeat: { bpm: [125, 140], bass: 0.55, brightness: 0.5, distortion: 0.3, dance: 0.65, vocal: 0.2, reverb: 0.3, energy: 0.65 },
  'UK Garage': { bpm: [130, 140], bass: 0.55, brightness: 0.55, distortion: 0.15, dance: 0.75, vocal: 0.45, reverb: 0.3, energy: 0.6 },
  Grime: { bpm: [130, 140], bass: 0.65, brightness: 0.45, distortion: 0.3, dance: 0.55, vocal: 0.55, reverb: 0.2, energy: 0.65 },
  Electro: { bpm: [120, 135], bass: 0.6, brightness: 0.55, distortion: 0.3, dance: 0.65, vocal: 0.15, reverb: 0.25, energy: 0.6 },
  'IDM / Experimental': { bpm: [90, 160], bass: 0.4, brightness: 0.5, distortion: 0.3, dance: 0.3, vocal: 0.1, reverb: 0.35, energy: 0.4 },
  'Ambient / Downtempo': { bpm: [60, 100], bass: 0.35, brightness: 0.35, distortion: 0.1, dance: 0.15, vocal: 0.1, reverb: 0.6, energy: 0.25 },
  Synthwave: { bpm: [85, 118], bass: 0.5, brightness: 0.55, distortion: 0.2, dance: 0.5, vocal: 0.2, reverb: 0.4, energy: 0.5 },
  Vaporwave: { bpm: [60, 95], bass: 0.4, brightness: 0.4, distortion: 0.15, dance: 0.25, vocal: 0.15, reverb: 0.55, energy: 0.3 },
  'Industrial / EBM': { bpm: [120, 140], bass: 0.6, brightness: 0.4, distortion: 0.6, dance: 0.55, vocal: 0.2, reverb: 0.3, energy: 0.65 },
  'Darkwave / Coldwave': { bpm: [100, 130], bass: 0.5, brightness: 0.35, distortion: 0.3, dance: 0.45, vocal: 0.35, reverb: 0.45, energy: 0.45 },
  'Hyperpop / Digicore': { bpm: [130, 180], bass: 0.5, brightness: 0.75, distortion: 0.4, dance: 0.6, vocal: 0.55, reverb: 0.25, energy: 0.7 },
  Disco: { bpm: [110, 125], bass: 0.5, brightness: 0.55, distortion: 0.1, dance: 0.75, vocal: 0.45, reverb: 0.25, energy: 0.6 },
  'Electro Swing': { bpm: [100, 130], bass: 0.4, brightness: 0.55, distortion: 0.1, dance: 0.6, vocal: 0.4, reverb: 0.3, energy: 0.5 },
  'Livetronica / Jam': { bpm: [90, 120], bass: 0.5, brightness: 0.5, distortion: 0.2, dance: 0.5, vocal: 0.25, reverb: 0.35, energy: 0.5 },
  'Chiptune / 8-bit': { bpm: [100, 155], bass: 0.35, brightness: 0.7, distortion: 0.15, dance: 0.55, vocal: 0.05, reverb: 0.15, energy: 0.55 },
  'Dungeon Synth': { bpm: [55, 90], bass: 0.4, brightness: 0.3, distortion: 0.15, dance: 0.1, vocal: 0.05, reverb: 0.65, energy: 0.2 },
  'Festival EDM / Mainstage': { bpm: [125, 130], bass: 0.55, brightness: 0.6, distortion: 0.25, dance: 0.8, vocal: 0.4, reverb: 0.3, energy: 0.75 },
  'Neurobass / Glitch Bass': { bpm: [85, 170], bass: 0.7, brightness: 0.45, distortion: 0.35, dance: 0.5, vocal: 0.15, reverb: 0.25, energy: 0.6 },
  'Speed / Hi-Energy Bass': { bpm: [130, 150], bass: 0.65, brightness: 0.5, distortion: 0.35, dance: 0.7, vocal: 0.2, reverb: 0.25, energy: 0.7 },
  'Tekno / Free Party': { bpm: [150, 200], bass: 0.65, brightness: 0.5, distortion: 0.55, dance: 0.65, vocal: 0.05, reverb: 0.3, energy: 0.85 },
  'Hip-Hop': { bpm: [70, 100], bass: 0.6, brightness: 0.4, distortion: 0.2, dance: 0.4, vocal: 0.8, reverb: 0.25, energy: 0.45 },
  Pop: { bpm: [100, 130], bass: 0.4, brightness: 0.6, distortion: 0.1, dance: 0.6, vocal: 0.85, reverb: 0.3, energy: 0.55 },
  Reggaeton: { bpm: [85, 100], bass: 0.6, brightness: 0.45, distortion: 0.15, dance: 0.7, vocal: 0.75, reverb: 0.25, energy: 0.55 },
  Indie: { bpm: [90, 140], bass: 0.35, brightness: 0.45, distortion: 0.2, dance: 0.4, vocal: 0.7, reverb: 0.4, energy: 0.4 },
  'Rock / Metal': { bpm: [100, 180], bass: 0.45, brightness: 0.45, distortion: 0.55, dance: 0.35, vocal: 0.7, reverb: 0.3, energy: 0.7 },
  'Funk / Soul': { bpm: [90, 120], bass: 0.55, brightness: 0.4, distortion: 0.15, dance: 0.6, vocal: 0.75, reverb: 0.25, energy: 0.5 },
  'Jazz / Fusion': { bpm: [70, 140], bass: 0.4, brightness: 0.5, distortion: 0.1, dance: 0.35, vocal: 0.4, reverb: 0.35, energy: 0.4 },
  'R&B': { bpm: [60, 100], bass: 0.5, brightness: 0.4, distortion: 0.1, dance: 0.4, vocal: 0.85, reverb: 0.3, energy: 0.4 },
  'World / Folk': { bpm: [80, 130], bass: 0.35, brightness: 0.45, distortion: 0.1, dance: 0.45, vocal: 0.6, reverb: 0.3, energy: 0.45 },
  'Reggae / Dub': { bpm: [65, 95], bass: 0.7, brightness: 0.35, distortion: 0.15, dance: 0.4, vocal: 0.5, reverb: 0.5, energy: 0.4 },
  'Classical / Neoclassical': { bpm: [40, 140], bass: 0.3, brightness: 0.45, distortion: 0.05, dance: 0.1, vocal: 0.1, reverb: 0.45, energy: 0.35 },
};

// [regex sobre el nombre del subgénero en minúsculas, delta a aplicar]
// bpmShift (grados no clamp01) desplaza el rango de BPM esperado del
// subgénero respecto al de su familia — así "Hard Techno" corre más rápido
// que el Techno base y "Deep House" más lento que el House base.
const LEXICAL_MODIFIERS = [
  [/hard|raw|aggressive|gabber|terror|industrial|rawstyle|crossbreed|acid ?core/, { distortion: 0.25, energy: 0.15, bass: 0.05, bpmShift: 8 }],
  [/deep|dub(?!step)|sub\b/, { bass: 0.15, brightness: -0.1, bpmShift: -4 }],
  [/dark|doom|death|noir/, { brightness: -0.15, reverb: 0.1, vocal: -0.05 }],
  [/melodic|emotional|vocal|soulful|diva|singalong/, { vocal: 0.2, brightness: 0.08 }],
  [/minimal|micro/, { dance: 0.05, energy: -0.1, bpmShift: -3 }],
  [/acid/, { distortion: 0.08, brightness: 0.05 }],
  [/ambient|chill|downtempo|lofi|lo-fi|sleep|comfy/, { energy: -0.25, dance: -0.2, reverb: 0.1, bpmShift: -12 }],
  [/hyper|speed|uptempo|turbo|frenchcore/, { energy: 0.15, distortion: 0.1, bpmShift: 20 }],
  [/liquid|chillstep|smooth/, { reverb: 0.15, brightness: 0.08, distortion: -0.1, bpmShift: -5 }],
  [/future|nu |neo/, { brightness: 0.05 }],
  [/industrial|ebm|power ?noise|aggrotech/, { distortion: 0.2 }],
  [/instrumental/, { vocal: -0.3 }],
  [/vocal|diva|soul/, { vocal: 0.25 }],
  [/bass\b|bassline|sub ?bass/, { bass: 0.15 }],
  [/bright|uplifting|euphoric|energetic/, { brightness: 0.12, energy: 0.1 }],
  [/tribal|percussive|drum/, { dance: 0.1, bass: 0.05 }],
  [/glitch|broken|wonky|fidget/, { dance: -0.1, distortion: 0.1 }],
  [/old ?sk?ool|classic|retro|vintage/, { distortion: -0.05, bpmShift: -4 }],
  [/psy|goa|forest/, { brightness: 0.1, energy: 0.1, bpmShift: 5 }],
  [/half ?time|slowed/, { bpmShift: -30 }],
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const clampBpm = (v) => Math.max(40, Math.min(230, v));

const fingerprintCache = new Map();

/** Deriva la huella de audio de un subgénero a partir del perfil de su
 * familia + modificadores léxicos de su propio nombre. Determinista. */
export function subgenreFingerprint(genreName, subName) {
  const cacheKey = `${genreName}::${subName}`;
  if (fingerprintCache.has(cacheKey)) return fingerprintCache.get(cacheKey);

  const base = FAMILY_AUDIO_PROFILE[genreName] || FAMILY_AUDIO_PROFILE.Pop;
  const fp = {
    bpmMin: base.bpm[0],
    bpmMax: base.bpm[1],
    bass: base.bass,
    brightness: base.brightness,
    distortion: base.distortion,
    dance: base.dance,
    vocal: base.vocal,
    reverb: base.reverb,
    energy: base.energy,
  };

  const lower = subName.toLowerCase().replace(/_/g, ' ');
  for (const [pattern, delta] of LEXICAL_MODIFIERS) {
    if (pattern.test(lower)) {
      for (const [key, d] of Object.entries(delta)) {
        if (key === 'bpmShift') {
          fp.bpmMin = clampBpm(fp.bpmMin + d);
          fp.bpmMax = clampBpm(fp.bpmMax + d);
        } else {
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
  const { rhythm, spectrum, vocals, production, dynamics } = analysis;
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
  };
}

function bpmDistance(bpm, bpmMin, bpmMax) {
  if (!bpm) return 0.5;
  const candidates = [bpm, bpm * 2, bpm / 2]; // half/double-time (dubstep, trap, etc.)
  let best = Infinity;
  for (const c of candidates) {
    let d;
    if (c >= bpmMin && c <= bpmMax) d = 0;
    else d = Math.min(Math.abs(c - bpmMin), Math.abs(c - bpmMax));
    best = Math.min(best, d);
  }
  return clamp01(best / 40);
}

const DIM_WEIGHTS = { bpm: 0.3, bass: 0.15, brightness: 0.15, distortion: 0.1, dance: 0.12, vocal: 0.1, reverb: 0.05, energy: 0.03 };

/** Similitud 0-1 (1 = coincide perfecto) entre la huella de un subgénero y
 * el resumen de audio real de un track. */
export function fingerprintSimilarity(fingerprint, audioSummary) {
  if (!audioSummary) return 0;
  const dBpm = bpmDistance(audioSummary.bpm, fingerprint.bpmMin, fingerprint.bpmMax);
  let weightedDist = dBpm * DIM_WEIGHTS.bpm;
  for (const dim of ['bass', 'brightness', 'distortion', 'dance', 'vocal', 'reverb', 'energy']) {
    weightedDist += Math.abs(fingerprint[dim] - audioSummary[dim]) * DIM_WEIGHTS[dim];
  }
  return clamp01(1 - weightedDist);
}
