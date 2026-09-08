import {
  computeSTFT, allBandSeries, spectralCentroidSeries, spectralRolloffSeries,
  spectralFlatnessSeries, spectralFluxSeries, estimateTempo, onsetIntervalStats,
  chromagram, estimateKey, toCamelot, rmsSeries, crestFactor, clippingRatio,
  stereoCorrelation, reverbScore, vocalPresenceSeries, downsampleSeries,
  selfSimilarityMatrix, noveltyCurve, detectSections, stats,
} from './dsp';

const TARGET_SAMPLE_RATE = 22050;

async function decodeToMonoAndStereo(arrayBuffer) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
  const offline = new OfflineAudioContext(
    decoded.numberOfChannels,
    Math.ceil(decoded.duration * TARGET_SAMPLE_RATE),
    TARGET_SAMPLE_RATE
  );
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  ctx.close();
  const left = rendered.getChannelData(0);
  const right = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : null;
  const mono = new Float32Array(left.length);
  if (right) {
    for (let i = 0; i < left.length; i++) mono[i] = (left[i] + right[i]) / 2;
  } else {
    mono.set(left);
  }
  return { mono, left, right, sampleRate: TARGET_SAMPLE_RATE, duration: decoded.duration };
}

const yield_ = () => new Promise((r) => setTimeout(r, 0));

/**
 * Análisis exhaustivo de audio real (Tier 1+2+3 combinados).
 * onProgress(stage, pct) opcional para UI.
 */
export async function analyzeAudioBuffer(arrayBuffer, onProgress = () => {}) {
  onProgress('decodificando audio', 5);
  const { mono, left, right, sampleRate, duration } = await decodeToMonoAndStereo(arrayBuffer);

  onProgress('calculando espectro (STFT)', 15);
  const stft = computeSTFT(mono, sampleRate);
  await yield_();

  onProgress('analizando bandas de frecuencia', 25);
  const bands = allBandSeries(stft);
  const totalSeries = new Float32Array(stft.frameCount);
  for (let i = 0; i < stft.frameCount; i++) {
    let s = 0;
    for (const name of Object.keys(bands)) if (name !== 'vocalFormant') s += bands[name][i];
    totalSeries[i] = s || 1e-9;
  }
  await yield_();

  const centroid = spectralCentroidSeries(stft);
  const rolloff = spectralRolloffSeries(stft);
  const flatness = spectralFlatnessSeries(stft);
  const flux = spectralFluxSeries(stft);
  await yield_();

  onProgress('detectando ritmo (onsets/tempo)', 40);
  const tempoResult = estimateTempo(flux, stft.frameDurationSec);
  const onsetStats = onsetIntervalStats(tempoResult.onsetFrames, stft.frameDurationSec);
  const bassOnsets = estimateTempo(bands.bass, stft.frameDurationSec).onsetFrames;
  const highOnsets = estimateTempo(bands.presence, stft.frameDurationSec).onsetFrames;
  await yield_();

  onProgress('analizando tonalidad (chroma)', 55);
  const chroma = chromagram(stft);
  const chromaMean = new Array(12).fill(0);
  for (const row of chroma) for (let i = 0; i < 12; i++) chromaMean[i] += row[i] / chroma.length;
  const keyResult = estimateKey(chromaMean);
  const chromaVariance = stats.mean(chroma.map((row) => stats.std(Array.from(row))));
  await yield_();

  onProgress('midiendo dinámica y estéreo', 65);
  const rms = rmsSeries(mono);
  const crest = crestFactor(mono, rms);
  const clipRatio = clippingRatio(mono);
  const dynamicRange = stats.percentile(rms, 90) - stats.percentile(rms, 10);
  const stereoCorr = right ? stereoCorrelation(left, right) : 1;
  await yield_();

  onProgress('detectando reverb/voz', 78);
  const reverb = reverbScore(rms, tempoResult.onsetFrames, stft.frameDurationSec);
  const vocal = vocalPresenceSeries(bands.vocalFormant, totalSeries, stft.frameDurationSec);
  const vocalRatioMean = stats.mean(Array.from(vocal.ratioSeries));
  const vocalRatioThirds = stats.thirds(Array.from(vocal.ratioSeries));
  await yield_();

  onProgress('detectando estructura', 90);
  const featureFrames = [];
  const dsFactor = Math.max(1, Math.floor(stft.frameCount / 300));
  for (let i = 0; i < stft.frameCount; i += dsFactor) {
    featureFrames.push([
      bands.subBass[i], bands.bass[i], bands.lowMid[i], bands.mid[i],
      bands.highMid[i], bands.presence[i], bands.brilliance[i],
      chroma[i] ? chroma[i][0] : 0,
    ]);
  }
  const downsampled = downsampleSeries(featureFrames, 60);
  const simMatrix = selfSimilarityMatrix(downsampled);
  const novelty = noveltyCurve(simMatrix);
  const sectionBoundaries = detectSections(novelty);
  const repetitiveness = stats.mean(simMatrix.flat());
  await yield_();

  onProgress('finalizando', 98);

  const bandThirds = {};
  for (const name of Object.keys(bands)) bandThirds[name] = stats.thirds(Array.from(bands[name]));

  const climaxFrame = rms.reduce((best, v, i) => (v > rms[best] ? i : best), 0);

  const analysis = {
    schemaVersion: 2,
    durationSec: duration,

    // A. Espectro y frecuencia
    spectrum: {
      bands: Object.fromEntries(Object.entries(bands).filter(([k]) => k !== 'vocalFormant').map(([k, v]) => [k, {
        mean: stats.mean(Array.from(v)),
        std: stats.std(Array.from(v)),
        introMidOutro: bandThirds[k],
      }])),
      centroidMean: stats.mean(Array.from(centroid)),
      centroidStd: stats.std(Array.from(centroid)),
      centroidDeltaMean: stats.mean(Array.from(centroid).slice(1).map((v, i) => Math.abs(v - centroid[i]))),
      rolloffMean: stats.mean(Array.from(rolloff)),
      rolloffStd: stats.std(Array.from(rolloff)),
      flatnessMean: stats.mean(Array.from(flatness)),
      flatnessStd: stats.std(Array.from(flatness)),
      fluxMean: stats.mean(Array.from(flux)),
      fluxSkewness: stats.skewness(Array.from(flux)),
      brightnessTrend: (stats.mean(Array.from(centroid).slice(-Math.floor(centroid.length / 3))) -
        stats.mean(Array.from(centroid).slice(0, Math.floor(centroid.length / 3)))),
    },

    // B. Ritmo
    rhythm: {
      bpm: tempoResult.bpm,
      bpmConfidence: tempoResult.confidence,
      onsetDensityPerSec: onsetStats.densityPerSec,
      bassOnsetDensity: bassOnsets.length / Math.max(1, duration),
      highOnsetDensity: highOnsets.length / Math.max(1, duration),
      regularity: onsetStats.regularity,
      swing: onsetStats.swing,
      danceability: Math.max(0, Math.min(1,
        (onsetStats.regularity * 0.5) +
        (tempoResult.bpm >= 90 && tempoResult.bpm <= 140 ? 0.5 : 0.15))),
      tempoStabilityThirds: (() => {
        const t = Math.floor(flux.length / 3);
        const seg = (s, e) => estimateTempo(flux.slice(s, e), stft.frameDurationSec).bpm;
        return [seg(0, t), seg(t, 2 * t), seg(2 * t, flux.length)];
      })(),
    },

    // C. Tonalidad
    tonality: {
      key: keyResult.key,
      mode: keyResult.mode,
      camelot: toCamelot(keyResult.key, keyResult.mode),
      confidence: keyResult.confidence,
      chromaVariance,
      harmonicRichness: chromaMean.filter((v) => v > stats.mean(chromaMean) * 0.5).length,
    },

    // D. Voz
    vocals: {
      presenceRatioMean: vocalRatioMean,
      presenceRatioIntroMidOutro: vocalRatioThirds,
      modulationScore: vocal.modulationScore,
      isLikelyInstrumental: vocalRatioMean < 0.12 || vocal.modulationScore < 0.05,
      percentTrackWithVocals: Math.min(1, vocalRatioMean * 2.2),
    },

    // E. Timbre / efectos
    production: {
      reverbScore: reverb,
      distortionScore: Math.max(0, Math.min(1, clipRatio * 20 + (1 - stats.mean(Array.from(flatness))) * 0.1)),
      clippingRatio: clipRatio,
      crestFactor: crest,
      compressionScore: Math.max(0, Math.min(1, 1 - (crest - 3) / 12)),
      stereoWidth: 1 - Math.abs(stereoCorr),
      stereoCorrelation: stereoCorr,
    },

    // F. Dinámica y energía
    dynamics: {
      rmsMean: stats.mean(Array.from(rms)),
      rmsStd: stats.std(Array.from(rms)),
      dynamicRange,
      energyThirds: stats.thirds(Array.from(rms)),
      climaxPositionRatio: climaxFrame / rms.length,
      silenceRatio: Array.from(rms).filter((v) => v < stats.mean(Array.from(rms)) * 0.1).length / rms.length,
    },

    // G. Estructura
    structure: {
      sectionCount: sectionBoundaries.length + 1,
      repetitiveness,
      boundariesRatio: sectionBoundaries.map((b) => b / downsampled.length),
    },
  };

  onProgress('completo', 100);
  return analysis;
}

export function isWebAudioSupported() {
  return typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
}
