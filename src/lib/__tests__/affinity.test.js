import { describe, it, expect } from 'vitest';
import { buildFeatureVector, weightedSimilarity, recomputeAllAffinities, affinityKey, getSimilarTracks, CATEGORY_WEIGHTS_DEFAULT } from '../affinity';

function makeAnalysis(overrides = {}) {
  const band = (v) => ({ mean: v, std: 0.1, introMidOutro: [v, v, v] });
  return {
    spectrum: {
      bands: { subBass: band(0.5), bass: band(0.5), lowMid: band(0.3), mid: band(0.3), highMid: band(0.3), presence: band(0.3), brilliance: band(0.3) },
      centroidMean: 2000, centroidStd: 500, rolloffMean: 4000, flatnessMean: 0.3, fluxMean: 1, brightnessTrend: 0,
    },
    rhythm: { bpm: 128, bpmConfidence: 0.8, onsetDensityPerSec: 4, bassOnsetDensity: 2, highOnsetDensity: 3, regularity: 0.7, swing: 0.1, danceability: 0.7, tempoStabilityThirds: [128, 128, 128] },
    tonality: { key: 'C', mode: 'major', confidence: 0.6, chromaVariance: 0.5, harmonicRichness: 6 },
    vocals: { presenceRatioMean: 0.3, modulationScore: 0.2, isLikelyInstrumental: false, percentTrackWithVocals: 0.4, presenceRatioIntroMidOutro: [0.2, 0.4, 0.3] },
    production: { reverbScore: 0.3, distortionScore: 0.2, clippingRatio: 0.01, crestFactor: 8, compressionScore: 0.4, stereoWidth: 0.5, stereoCorrelation: 0.7 },
    dynamics: { rmsMean: 0.2, rmsStd: 0.05, dynamicRange: 0.2, energyThirds: [0.2, 0.2, 0.2], climaxPositionRatio: 0.6, silenceRatio: 0.02 },
    structure: { sectionCount: 5, repetitiveness: 0.5, boundariesRatio: [0.2, 0.5, 0.8] },
    ...overrides,
  };
}

describe('buildFeatureVector', () => {
  it('produce un vector con todas las categorías esperadas', () => {
    const vec = buildFeatureVector(makeAnalysis());
    for (const cat of Object.keys(CATEGORY_WEIGHTS_DEFAULT)) {
      expect(vec[cat], `falta categoría ${cat}`).toBeDefined();
      expect(Array.isArray(vec[cat])).toBe(true);
      expect(vec[cat].length).toBeGreaterThan(0);
    }
  });

  it('devuelve null si no hay análisis', () => {
    expect(buildFeatureVector(null)).toBeNull();
  });

  it('todos los valores del vector están en un rango razonable (-1.5..1.5)', () => {
    const vec = buildFeatureVector(makeAnalysis());
    for (const arr of Object.values(vec)) {
      for (const v of arr) {
        expect(Number.isFinite(v), 'valor no finito en el vector').toBe(true);
        expect(v).toBeGreaterThanOrEqual(-1.5);
        expect(v).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('weightedSimilarity', () => {
  it('un track es idéntico a sí mismo (similitud 1)', () => {
    const vec = buildFeatureVector(makeAnalysis());
    expect(weightedSimilarity(vec, vec)).toBeCloseTo(1, 5);
  });

  it('dos tracks con perfiles muy distintos tienen menor similitud que dos idénticos', () => {
    const vecA = buildFeatureVector(makeAnalysis());
    const vecB = buildFeatureVector(makeAnalysis({
      rhythm: { bpm: 70, bpmConfidence: 0.9, onsetDensityPerSec: 1, bassOnsetDensity: 0.5, highOnsetDensity: 0.5, regularity: 0.9, swing: 0.3, danceability: 0.1, tempoStabilityThirds: [70, 70, 70] },
      vocals: { presenceRatioMean: 0.9, modulationScore: 0.8, isLikelyInstrumental: false, percentTrackWithVocals: 0.9, presenceRatioIntroMidOutro: [0.9, 0.9, 0.9] },
    }));
    const simSelf = weightedSimilarity(vecA, vecA);
    const simOther = weightedSimilarity(vecA, vecB);
    expect(simOther).toBeLessThan(simSelf);
  });

  it('devuelve 0 si falta algún vector', () => {
    expect(weightedSimilarity(null, buildFeatureVector(makeAnalysis()))).toBe(0);
  });
});

describe('recomputeAllAffinities', () => {
  it('calcula afinidad para cada par de tracks con featureVector', () => {
    const tracks = {
      a: { featureVector: buildFeatureVector(makeAnalysis()) },
      b: { featureVector: buildFeatureVector(makeAnalysis({ rhythm: { bpm: 130, bpmConfidence: 0.7, onsetDensityPerSec: 4, bassOnsetDensity: 2, highOnsetDensity: 3, regularity: 0.65, swing: 0.12, danceability: 0.72, tempoStabilityThirds: [130, 130, 130] } })) },
      c: { featureVector: null }, // sin análisis (solo metadatos)
    };
    const affinities = recomputeAllAffinities(tracks);
    expect(affinities[affinityKey('a', 'b')]).toBeGreaterThan(0);
    expect(affinities[affinityKey('a', 'c')]).toBeUndefined();
    expect(affinities[affinityKey('b', 'c')]).toBeUndefined();
  });

  it('affinityKey es simétrica (mismo resultado sin importar el orden)', () => {
    expect(affinityKey('x', 'y')).toBe(affinityKey('y', 'x'));
  });
});

describe('getSimilarTracks', () => {
  const tracks = { a: {}, b: {}, c: {}, d: {} };
  const affinities = {
    [affinityKey('a', 'b')]: 0.9,
    [affinityKey('a', 'c')]: 0.4,
    [affinityKey('a', 'd')]: 0.7,
  };

  it('ordena de mayor a menor afinidad y excluye el propio track', () => {
    const result = getSimilarTracks('a', tracks, affinities, 5);
    expect(result.map((r) => r.id)).toEqual(['b', 'd', 'c']);
    expect(result.find((r) => r.id === 'a')).toBeUndefined();
  });

  it('respeta el límite n', () => {
    expect(getSimilarTracks('a', tracks, affinities, 2)).toHaveLength(2);
  });

  it('ignora pares sin afinidad calculada', () => {
    const result = getSimilarTracks('b', { a: {}, b: {}, x: {} }, affinities, 5);
    expect(result.map((r) => r.id)).toEqual(['a']);
  });
});
