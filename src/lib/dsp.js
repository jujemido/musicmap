// Núcleo DSP/MIR: todo determinista, sin IA ni modelos entrenados.
import { fftMagnitude, hannWindow, nextPow2 } from './fft';

export const FFT_SIZE = 2048;
export const HOP_SIZE = 1024;

const BANDS = [
  ['subBass', 20, 60],
  ['bass', 60, 250],
  ['lowMid', 250, 500],
  ['mid', 500, 2000],
  ['highMid', 2000, 4000],
  ['presence', 4000, 6000],
  ['brilliance', 6000, 20000],
];
const VOCAL_BAND = [300, 3400];

// --- STFT ---
export function computeSTFT(channelData, sampleRate, fftSize = FFT_SIZE, hopSize = HOP_SIZE) {
  const window = hannWindow(fftSize);
  const n = channelData.length;
  const frameCount = Math.max(1, Math.floor((n - fftSize) / hopSize) + 1);
  const frames = new Array(frameCount);
  const buf = new Float32Array(fftSize);
  for (let f = 0; f < frameCount; f++) {
    const start = f * hopSize;
    for (let i = 0; i < fftSize; i++) {
      const s = start + i < n ? channelData[start + i] : 0;
      buf[i] = s * window[i];
    }
    frames[f] = fftMagnitude(buf);
  }
  return {
    frames,
    sampleRate,
    fftSize,
    hopSize,
    frameCount,
    frameDurationSec: hopSize / sampleRate,
    binHz: sampleRate / fftSize,
  };
}

function binForHz(hz, binHz, maxBin) {
  return Math.min(maxBin - 1, Math.max(0, Math.round(hz / binHz)));
}

export function bandEnergySeries(stft, loHz, hiHz) {
  const { frames, binHz } = stft;
  const maxBin = frames[0].length;
  const lo = binForHz(loHz, binHz, maxBin);
  const hi = Math.max(lo + 1, binForHz(hiHz, binHz, maxBin));
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f++) {
    let sum = 0;
    const mag = frames[f];
    for (let b = lo; b < hi; b++) sum += mag[b] * mag[b];
    out[f] = Math.sqrt(sum / (hi - lo));
  }
  return out;
}

export function allBandSeries(stft) {
  const out = {};
  for (const [name, lo, hi] of BANDS) out[name] = bandEnergySeries(stft, lo, hi);
  out.vocalFormant = bandEnergySeries(stft, VOCAL_BAND[0], VOCAL_BAND[1]);
  return out;
}

export const stats = {
  mean(arr) {
    if (!arr.length) return 0;
    let s = 0;
    for (const v of arr) s += v;
    return s / arr.length;
  },
  std(arr) {
    if (arr.length < 2) return 0;
    const m = stats.mean(arr);
    let s = 0;
    for (const v of arr) s += (v - m) * (v - m);
    return Math.sqrt(s / arr.length);
  },
  percentile(arr, p) {
    if (!arr.length) return 0;
    const sorted = Float32Array.from(arr).sort();
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  },
  skewness(arr) {
    const m = stats.mean(arr);
    const s = stats.std(arr) || 1e-9;
    let sum = 0;
    for (const v of arr) sum += Math.pow((v - m) / s, 3);
    return sum / arr.length;
  },
  thirds(arr) {
    const n = arr.length;
    const t = Math.max(1, Math.floor(n / 3));
    return [stats.mean(arr.slice(0, t)), stats.mean(arr.slice(t, 2 * t)), stats.mean(arr.slice(2 * t))];
  },
  normVariant(base, dyn) {
    return { value: base, variability: dyn };
  },
};

// --- Espectro global (centroide, rolloff, flatness, flux) ---
export function spectralCentroidSeries(stft) {
  const { frames, binHz } = stft;
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f++) {
    const mag = frames[f];
    let num = 0, den = 0;
    for (let b = 0; b < mag.length; b++) {
      num += b * binHz * mag[b];
      den += mag[b];
    }
    out[f] = den > 1e-9 ? num / den : 0;
  }
  return out;
}

export function spectralRolloffSeries(stft, ratio = 0.85) {
  const { frames, binHz } = stft;
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f++) {
    const mag = frames[f];
    let total = 0;
    for (const v of mag) total += v;
    const target = total * ratio;
    let acc = 0, idx = mag.length - 1;
    for (let b = 0; b < mag.length; b++) {
      acc += mag[b];
      if (acc >= target) { idx = b; break; }
    }
    out[f] = idx * binHz;
  }
  return out;
}

export function spectralFlatnessSeries(stft) {
  const { frames } = stft;
  const out = new Float32Array(frames.length);
  for (let f = 0; f < frames.length; f++) {
    const mag = frames[f];
    let logSum = 0, sum = 0, n = 0;
    for (const v of mag) {
      const x = v + 1e-9;
      logSum += Math.log(x);
      sum += x;
      n++;
    }
    const geo = Math.exp(logSum / n);
    const ari = sum / n;
    out[f] = ari > 1e-9 ? geo / ari : 0;
  }
  return out;
}

export function spectralFluxSeries(stft) {
  const { frames } = stft;
  const out = new Float32Array(frames.length);
  for (let f = 1; f < frames.length; f++) {
    let sum = 0;
    const cur = frames[f], prev = frames[f - 1];
    for (let b = 0; b < cur.length; b++) {
      const d = cur[b] - prev[b];
      if (d > 0) sum += d;
    }
    out[f] = sum;
  }
  return out;
}

// --- Onsets y tempo ---
export function pickPeaks(envelope, { windowSize = 8, k = 1.3 } = {}) {
  const peaks = [];
  for (let i = 2; i < envelope.length - 2; i++) {
    const lo = Math.max(0, i - windowSize);
    const hi = Math.min(envelope.length, i + windowSize);
    let local = 0;
    for (let j = lo; j < hi; j++) local += envelope[j];
    const localMean = local / (hi - lo);
    if (envelope[i] > envelope[i - 1] && envelope[i] >= envelope[i + 1] && envelope[i] > localMean * k) {
      peaks.push(i);
    }
  }
  return peaks;
}

export function estimateTempo(fluxEnvelope, frameDurationSec) {
  const peaks = pickPeaks(fluxEnvelope);
  if (peaks.length < 2) return { bpm: 0, confidence: 0, onsetFrames: peaks };
  // autocorrelación del envelope en el rango 60-200 BPM
  const minLagSec = 60 / 200;
  const maxLagSec = 60 / 60;
  const minLag = Math.max(1, Math.round(minLagSec / frameDurationSec));
  const maxLag = Math.round(maxLagSec / frameDurationSec);
  let bestLag = minLag, bestScore = -Infinity;
  const n = fluxEnvelope.length;
  for (let lag = minLag; lag <= Math.min(maxLag, n - 1); lag++) {
    let score = 0;
    for (let i = 0; i < n - lag; i++) score += fluxEnvelope[i] * fluxEnvelope[i + lag];
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  const bpm = 60 / (bestLag * frameDurationSec);
  // normalizar a rango musical típico 70-180 doblando/mitad
  let norm = bpm;
  while (norm < 70) norm *= 2;
  while (norm > 180) norm /= 2;
  const maxPossible = fluxEnvelope.reduce((s, v) => s + v * v, 0) || 1;
  const confidence = Math.max(0, Math.min(1, bestScore / maxPossible));
  return { bpm: Math.round(norm * 10) / 10, confidence, onsetFrames: peaks };
}

export function onsetIntervalStats(onsetFrames, frameDurationSec) {
  if (onsetFrames.length < 3) return { regularity: 0, swing: 0, densityPerSec: 0 };
  const intervals = [];
  for (let i = 1; i < onsetFrames.length; i++) intervals.push((onsetFrames[i] - onsetFrames[i - 1]) * frameDurationSec);
  const m = stats.mean(intervals);
  const sd = stats.std(intervals);
  const regularity = m > 0 ? Math.max(0, 1 - sd / m) : 0;
  const totalDur = onsetFrames.length ? onsetFrames[onsetFrames.length - 1] * frameDurationSec : 1;
  const densityPerSec = onsetFrames.length / Math.max(1, totalDur);
  // swing: desviación media respecto a rejilla par/impar alterna
  let swingAcc = 0;
  for (let i = 0; i < intervals.length - 1; i += 2) {
    const a = intervals[i], b = intervals[i + 1];
    swingAcc += Math.abs(a - b) / (a + b || 1);
  }
  const swing = intervals.length > 1 ? swingAcc / Math.floor(intervals.length / 2) : 0;
  return { regularity, swing, densityPerSec };
}

// --- Chroma y tonalidad (Krumhansl-Schmuckler) ---
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4 = 440;

function hzToPitchClass(hz) {
  if (hz <= 0) return -1;
  const midi = 69 + 12 * Math.log2(hz / A4);
  const pc = Math.round(midi) % 12;
  return ((pc % 12) + 12) % 12;
}

export function chromaFrame(mag, binHz) {
  const chroma = new Float32Array(12);
  for (let b = 1; b < mag.length; b++) {
    const hz = b * binHz;
    if (hz < 27.5 || hz > 5000) continue;
    const pc = hzToPitchClass(hz);
    if (pc >= 0) chroma[pc] += mag[b];
  }
  return chroma;
}

export function chromagram(stft) {
  return stft.frames.map((mag) => chromaFrame(mag, stft.binHz));
}

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function correlate(a, b) {
  const ma = stats.mean(a), mb = stats.mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const den = Math.sqrt(da * db);
  return den > 1e-9 ? num / den : 0;
}

export function estimateKey(chromaMeanArr) {
  let best = { key: 'C', mode: 'major', score: -Infinity };
  for (let rot = 0; rot < 12; rot++) {
    const rotatedMajor = MAJOR_PROFILE.map((_, i) => MAJOR_PROFILE[(i - rot + 12) % 12]);
    const rotatedMinor = MINOR_PROFILE.map((_, i) => MINOR_PROFILE[(i - rot + 12) % 12]);
    const scoreMaj = correlate(chromaMeanArr, rotatedMajor);
    const scoreMin = correlate(chromaMeanArr, rotatedMinor);
    if (scoreMaj > best.score) best = { key: NOTE_NAMES[rot], mode: 'major', score: scoreMaj };
    if (scoreMin > best.score) best = { key: NOTE_NAMES[rot], mode: 'minor', score: scoreMin };
  }
  return { key: best.key, mode: best.mode, confidence: Math.max(0, Math.min(1, (best.score + 1) / 2)) };
}

const CAMELOT_MAJOR = { C: '8B', G: '9B', D: '10B', A: '11B', E: '12B', B: '1B', 'F#': '2B', 'C#': '3B', 'G#': '4B', 'D#': '5B', 'A#': '6B', F: '7B' };
const CAMELOT_MINOR = { A: '8A', E: '9A', B: '10A', 'F#': '11A', 'C#': '12A', 'G#': '1A', 'D#': '2A', 'A#': '3A', F: '4A', C: '5A', G: '6A', D: '7A' };
export function toCamelot(key, mode) {
  return mode === 'major' ? CAMELOT_MAJOR[key] : CAMELOT_MINOR[key];
}

// --- RMS / dinámica ---
export function rmsSeries(channelData, frameSize = HOP_SIZE) {
  const n = Math.floor(channelData.length / frameSize);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < frameSize; j++) {
      const v = channelData[i * frameSize + j];
      sum += v * v;
    }
    out[i] = Math.sqrt(sum / frameSize);
  }
  return out;
}

export function crestFactor(channelData, rms) {
  let peak = 0;
  for (const v of channelData) peak = Math.max(peak, Math.abs(v));
  const meanRms = stats.mean(rms) || 1e-9;
  return peak / meanRms;
}

export function clippingRatio(channelData, threshold = 0.98) {
  let count = 0;
  for (const v of channelData) if (Math.abs(v) >= threshold) count++;
  return count / channelData.length;
}

export function stereoCorrelation(left, right) {
  if (!right || !left || left.length !== right.length) return 1;
  const ml = stats.mean(left), mr = stats.mean(right);
  let num = 0, dl = 0, dr = 0;
  for (let i = 0; i < left.length; i++) {
    num += (left[i] - ml) * (right[i] - mr);
    dl += (left[i] - ml) ** 2;
    dr += (right[i] - mr) ** 2;
  }
  const den = Math.sqrt(dl * dr);
  return den > 1e-9 ? num / den : 1;
}

// --- Reverb (RT60 aproximado) ---
export function reverbScore(rms, onsetFrames, frameDurationSec) {
  if (onsetFrames.length < 2) return 0;
  const decays = [];
  for (const onset of onsetFrames.slice(0, 40)) {
    const idx = Math.min(rms.length - 1, onset);
    const peakVal = rms[idx];
    if (peakVal < 1e-4) continue;
    let tailLen = 0;
    for (let i = idx; i < Math.min(rms.length, idx + 40); i++) {
      if (rms[i] < peakVal * 0.1) break;
      tailLen++;
    }
    decays.push(tailLen * frameDurationSec);
  }
  const avgDecay = stats.mean(decays);
  // normalizado: 0s -> 0, ~2s -> 1
  return Math.max(0, Math.min(1, avgDecay / 2));
}

// --- Voz: modulación silábica 4-8Hz sobre la banda de formantes ---
export function vocalPresenceSeries(vocalFormantSeries, totalBandsSeries, frameDurationSec) {
  const n = vocalFormantSeries.length;
  const ratio = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const total = totalBandsSeries[i] || 1e-9;
    ratio[i] = vocalFormantSeries[i] / total;
  }
  // modulación silábica: autocorrelación de la serie en el rango 4-8Hz
  const frameRate = 1 / frameDurationSec;
  const minLag = Math.max(1, Math.round(frameRate / 8));
  const maxLag = Math.max(minLag + 1, Math.round(frameRate / 4));
  let modScore = 0, count = 0;
  for (let lag = minLag; lag <= Math.min(maxLag, n - 1); lag++) {
    let s = 0;
    for (let i = 0; i < n - lag; i++) s += ratio[i] * ratio[i + lag];
    modScore += s;
    count++;
  }
  modScore = count ? modScore / count : 0;
  const energy = ratio.reduce((s, v) => s + v * v, 0) || 1e-9;
  const modulationNorm = Math.max(0, Math.min(1, modScore / energy));
  return { ratioSeries: ratio, modulationScore: modulationNorm };
}

// --- Estructura: self-similarity + novedad (Foote) ---
export function downsampleSeries(arr2D, targetLen = 60) {
  // arr2D: array de arrays (frames x features) -> reduce a targetLen promediando bloques
  const n = arr2D.length;
  if (n <= targetLen) return arr2D;
  const blockSize = Math.floor(n / targetLen);
  const out = [];
  for (let i = 0; i < targetLen; i++) {
    const block = arr2D.slice(i * blockSize, (i + 1) * blockSize);
    const dims = block[0].length;
    const avg = new Array(dims).fill(0);
    for (const row of block) for (let d = 0; d < dims; d++) avg[d] += row[d] / block.length;
    out.push(avg);
  }
  return out;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na * nb);
  return den > 1e-9 ? dot / den : 0;
}

export function selfSimilarityMatrix(featureFrames) {
  const n = featureFrames.length;
  const m = Array.from({ length: n }, () => new Float32Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const s = cosineSim(featureFrames[i], featureFrames[j]);
      m[i][j] = s;
      m[j][i] = s;
    }
  }
  return m;
}

export function noveltyCurve(simMatrix, kernelSize = 4) {
  const n = simMatrix.length;
  const novelty = new Float32Array(n);
  for (let i = kernelSize; i < n - kernelSize; i++) {
    let checker = 0;
    for (let a = -kernelSize; a < kernelSize; a++) {
      for (let b = -kernelSize; b < kernelSize; b++) {
        const sign = Math.sign(a * b) || 1;
        checker += sign * simMatrix[i + a][i + b];
      }
    }
    novelty[i] = Math.abs(checker);
  }
  return novelty;
}

export function detectSections(novelty, minGap = 4) {
  const peaks = pickPeaks(novelty, { windowSize: minGap, k: 1.2 });
  const filtered = [];
  for (const p of peaks) {
    if (!filtered.length || p - filtered[filtered.length - 1] >= minGap) filtered.push(p);
  }
  return filtered;
}
