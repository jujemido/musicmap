// Generador de dataset de ejemplo: no requiere red ni audio real. Sirve para
// probar/demostrar la app (mapa, afinidad, taxonomía) sin pegar enlaces.
import { classifyGenre } from './genreTaxonomy';
import { buildFeatureVector } from './affinity';

const DEMO_SEEDS = [
  { title: 'Driving Nightshift', artist: 'Voidwalker', genre: 'Techno', tags: ['techno', 'driving', 'peak time'], bpm: 132 },
  { title: 'Afterlife Skies', artist: 'Lumen Aire', genre: 'Techno', tags: ['melodic techno', 'emotional techno'], bpm: 124 },
  { title: 'Deep Water', artist: 'Selin Roux', genre: 'House', tags: ['deep house'], bpm: 122 },
  { title: 'Amapiano Sunrise', artist: 'Thabo K', genre: 'House', tags: ['afro house', 'amapiano'], bpm: 115 },
  { title: 'Jungle Terminal', artist: 'Break Sygnal', genre: 'Drum & Bass', tags: ['jungle', 'ragga jungle'], bpm: 174 },
  { title: 'Liquid Horizon', artist: 'Mellow Frame', genre: 'Drum & Bass', tags: ['liquid dnb'], bpm: 172 },
  { title: 'Riddim Machine', artist: 'Gravel Bass', genre: 'Dubstep', tags: ['riddim'], bpm: 140 },
  { title: 'Cloudy Feelings', artist: 'Nova Rhyme', genre: 'Hip-Hop', tags: ['lofi', 'chillhop'], bpm: 84 },
  { title: 'Boom Bap Diaries', artist: 'MC Solace', genre: 'Hip-Hop', tags: ['boom bap'], bpm: 90 },
  { title: 'Perreo Eterno', artist: 'La Mera Mera', genre: 'Reggaeton', tags: ['perreo', 'dembow'], bpm: 96 },
  { title: 'Hyperglow', artist: 'Pixel Bloom', genre: 'Pop', tags: ['hyperpop'], bpm: 150 },
  { title: 'Bedroom Static', artist: 'Soft Antenna', genre: 'Indie', tags: ['bedroom pop'], bpm: 100 },
  { title: 'Drone Cathedral', artist: 'Null Chamber', genre: 'Ambient', tags: ['dark ambient', 'drone'], bpm: 60 },
  { title: 'Chillwave Tide', artist: 'Coastal Drift', genre: 'Ambient', tags: ['chillout', 'downtempo'], bpm: 92 },
  { title: 'Glitch Anatomy', artist: 'Error 404', genre: 'Drum-less / Experimental', tags: ['idm', 'glitch'], bpm: 138 },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function fakeAnalysisFor(seed, bpm) {
  const rnd = seededRandom(seed);
  const band = () => ({ mean: rnd(), std: rnd() * 0.3, introMidOutro: [rnd(), rnd(), rnd()] });
  return {
    schemaVersion: 2,
    durationSec: 150 + rnd() * 120,
    spectrum: {
      bands: { subBass: band(), bass: band(), lowMid: band(), mid: band(), highMid: band(), presence: band(), brilliance: band() },
      centroidMean: 1500 + rnd() * 4000,
      centroidStd: rnd() * 1500,
      fluxMean: rnd() * 2,
      fluxSkewness: rnd() * 2 - 1,
      rolloffMean: 3000 + rnd() * 6000,
      flatnessMean: rnd(),
      brightnessTrend: rnd() * 2000 - 1000,
    },
    rhythm: {
      bpm,
      bpmConfidence: 0.6 + rnd() * 0.4,
      onsetDensityPerSec: 1 + rnd() * 6,
      bassOnsetDensity: rnd() * 4,
      highOnsetDensity: rnd() * 8,
      regularity: 0.4 + rnd() * 0.6,
      swing: rnd() * 0.3,
      danceability: 0.3 + rnd() * 0.7,
      tempoStabilityThirds: [bpm - rnd() * 3, bpm, bpm + rnd() * 3],
    },
    tonality: {
      key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(rnd() * 7)],
      mode: rnd() > 0.5 ? 'major' : 'minor',
      confidence: 0.3 + rnd() * 0.6,
      chromaVariance: rnd(),
      harmonicRichness: Math.floor(rnd() * 12),
    },
    vocals: {
      presenceRatioMean: rnd() * 0.6,
      presenceRatioIntroMidOutro: [rnd() * 0.5, rnd() * 0.6, rnd() * 0.5],
      modulationScore: rnd(),
      isLikelyInstrumental: rnd() > 0.55,
      percentTrackWithVocals: rnd(),
    },
    production: {
      reverbScore: rnd(),
      distortionScore: rnd() * 0.5,
      clippingRatio: rnd() * 0.02,
      crestFactor: 4 + rnd() * 10,
      compressionScore: rnd(),
      stereoWidth: rnd(),
      stereoCorrelation: 1 - rnd() * 0.6,
    },
    dynamics: {
      rmsMean: 0.05 + rnd() * 0.3,
      rmsStd: rnd() * 0.1,
      dynamicRange: rnd() * 0.4,
      energyThirds: [rnd(), rnd(), rnd()],
      climaxPositionRatio: rnd(),
      silenceRatio: rnd() * 0.1,
    },
    structure: {
      sectionCount: 2 + Math.floor(rnd() * 8),
      repetitiveness: rnd(),
      boundariesRatio: Array.from({ length: 3 + Math.floor(rnd() * 5) }, () => rnd()),
    },
  };
}

export function generateDemoTracks() {
  const tracks = {};
  DEMO_SEEDS.forEach((seed, i) => {
    const id = `demo-${i}`;
    const analysis = fakeAnalysisFor(i + 1, seed.bpm);
    const genre = classifyGenre({ rawGenreTag: seed.genre, rawTags: seed.tags, title: seed.title }, analysis);
    tracks[id] = {
      id,
      soundcloudUrl: null,
      title: seed.title,
      artist: seed.artist,
      artworkUrl: null,
      durationMs: analysis.durationSec * 1000,
      rawGenreTag: seed.genre,
      rawTags: seed.tags,
      addedAt: new Date().toISOString(),
      isDemo: true,
      analysis,
      genre,
      featureVector: buildFeatureVector(analysis),
    };
  });
  return tracks;
}
