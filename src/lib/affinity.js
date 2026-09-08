// Construcción del vector de features y cálculo de afinidad ponderada por categoría.

export const CATEGORY_WEIGHTS_DEFAULT = {
  rhythm: 0.22,
  spectrum: 0.18,
  production: 0.16,
  tonality: 0.14,
  dynamics: 0.10,
  structure: 0.08,
  vocals: 0.08,
  meta: 0.04,
};

export const WEIGHT_PROFILES = {
  todo: CATEGORY_WEIGHTS_DEFAULT,
  dj: { rhythm: 0.35, tonality: 0.30, dynamics: 0.15, spectrum: 0.10, production: 0.05, structure: 0.02, vocals: 0.02, meta: 0.01 },
  produccion: { production: 0.30, spectrum: 0.25, dynamics: 0.15, rhythm: 0.15, tonality: 0.05, structure: 0.05, vocals: 0.03, meta: 0.02 },
  voz: { vocals: 0.40, rhythm: 0.20, spectrum: 0.15, tonality: 0.10, production: 0.05, dynamics: 0.05, structure: 0.03, meta: 0.02 },
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const norm = (v, max) => clamp01((v || 0) / max);

function bandVec(b) {
  if (!b) return [0, 0, 0];
  return [norm(b.mean, 1), norm(b.std, 0.5), norm(Math.abs(b.introMidOutro?.[2] - b.introMidOutro?.[0]) || 0, 1)];
}

/** Devuelve { rhythm:[...], spectrum:[...], ... } por categoría, ya normalizado 0-1 */
export function buildFeatureVector(analysis) {
  if (!analysis) return null;
  const { rhythm, spectrum, tonality, vocals, production, dynamics, structure } = analysis;

  const spectrumVec = [
    ...bandVec(spectrum.bands.subBass),
    ...bandVec(spectrum.bands.bass),
    ...bandVec(spectrum.bands.lowMid),
    ...bandVec(spectrum.bands.mid),
    ...bandVec(spectrum.bands.highMid),
    ...bandVec(spectrum.bands.presence),
    ...bandVec(spectrum.bands.brilliance),
    norm(spectrum.centroidMean, 8000),
    norm(spectrum.centroidStd, 3000),
    norm(spectrum.rolloffMean, 12000),
    norm(spectrum.flatnessMean, 1),
    norm(spectrum.fluxMean, 5),
    norm((spectrum.brightnessTrend + 4000) / 8000, 1),
  ];

  const rhythmVec = [
    norm(rhythm.bpm, 200),
    rhythm.bpmConfidence,
    norm(rhythm.onsetDensityPerSec, 10),
    norm(rhythm.bassOnsetDensity, 5),
    norm(rhythm.highOnsetDensity, 10),
    rhythm.regularity,
    norm(rhythm.swing, 1),
    rhythm.danceability,
    norm(Math.abs((rhythm.tempoStabilityThirds?.[2] || 0) - (rhythm.tempoStabilityThirds?.[0] || 0)), 40),
  ];

  const tonalityVec = [
    Math.sin((2 * Math.PI * noteIndex(tonality.key)) / 12),
    Math.cos((2 * Math.PI * noteIndex(tonality.key)) / 12),
    tonality.mode === 'major' ? 1 : 0,
    tonality.confidence,
    norm(tonality.chromaVariance, 2),
    norm(tonality.harmonicRichness, 12),
  ];

  const vocalsVec = [
    vocals.presenceRatioMean,
    norm(vocals.modulationScore, 1),
    vocals.isLikelyInstrumental ? 0 : 1,
    vocals.percentTrackWithVocals,
    norm(Math.abs((vocals.presenceRatioIntroMidOutro?.[2] || 0) - (vocals.presenceRatioIntroMidOutro?.[0] || 0)), 1),
  ];

  const productionVec = [
    production.reverbScore,
    production.distortionScore,
    norm(production.clippingRatio, 0.05),
    norm(production.crestFactor, 20),
    production.compressionScore,
    production.stereoWidth,
  ];

  const dynamicsVec = [
    norm(dynamics.rmsMean, 0.5),
    norm(dynamics.rmsStd, 0.3),
    norm(dynamics.dynamicRange, 0.5),
    dynamics.climaxPositionRatio,
    dynamics.silenceRatio,
    norm(Math.abs((dynamics.energyThirds?.[2] || 0) - (dynamics.energyThirds?.[0] || 0)), 0.3),
  ];

  const structureVec = [
    norm(structure.sectionCount, 12),
    structure.repetitiveness,
    norm((structure.boundariesRatio || []).length, 12),
  ];

  return {
    spectrum: spectrumVec,
    rhythm: rhythmVec,
    tonality: tonalityVec,
    vocals: vocalsVec,
    production: productionVec,
    dynamics: dynamicsVec,
    structure: structureVec,
    meta: [0.5],
  };
}

function noteIndex(key) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const i = names.indexOf(key);
  return i < 0 ? 0 : i;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na * nb);
  return den > 1e-9 ? dot / den : 0;
}

/** Similitud 0-1 entre dos feature vectors por categoría, ponderada. */
export function weightedSimilarity(vecA, vecB, weights = CATEGORY_WEIGHTS_DEFAULT) {
  if (!vecA || !vecB) return 0;
  let total = 0, weightSum = 0;
  for (const cat of Object.keys(weights)) {
    if (!vecA[cat] || !vecB[cat]) continue;
    const sim = (cosine(vecA[cat], vecB[cat]) + 1) / 2; // llevar de [-1,1] a [0,1]
    total += sim * weights[cat];
    weightSum += weights[cat];
  }
  return weightSum > 0 ? total / weightSum : 0;
}

export function affinityKey(idA, idB) {
  return [idA, idB].sort().join('|');
}

/** Devuelve las N canciones más afines a `trackId`, ordenadas de mayor a
 * menor similitud, leyendo del mapa de afinidades ya cacheado. */
export function getSimilarTracks(trackId, tracks, affinities, n = 5) {
  const scored = [];
  for (const otherId of Object.keys(tracks)) {
    if (otherId === trackId) continue;
    const score = affinities[affinityKey(trackId, otherId)];
    if (score === undefined) continue;
    scored.push({ id: otherId, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

export function recomputeAllAffinities(tracks, weights = CATEGORY_WEIGHTS_DEFAULT) {
  const ids = Object.keys(tracks);
  const affinities = {};
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = tracks[ids[i]], b = tracks[ids[j]];
      if (!a.featureVector || !b.featureVector) continue;
      affinities[affinityKey(ids[i], ids[j])] = weightedSimilarity(a.featureVector, b.featureVector, weights);
    }
  }
  return affinities;
}
