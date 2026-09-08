import { describe, it, expect } from 'vitest';
import { fftMagnitude, hannWindow } from '../fft';
import {
  computeSTFT, estimateTempo, spectralFluxSeries, chromagram, estimateKey,
  toCamelot, rmsSeries, crestFactor, stereoCorrelation, stats,
} from '../dsp';

function sine(freq, sr, seconds) {
  const n = Math.round(sr * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sr);
  return out;
}

function clickTrack({ sr = 22050, seconds = 8, bpm = 128, amplitude = 0.8 } = {}) {
  const n = sr * seconds;
  const signal = new Float32Array(n);
  const beatInterval = 60 / bpm;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = 0.05 * Math.sin(2 * Math.PI * 220 * t);
    const phase = (t % beatInterval) / beatInterval;
    if (phase < 0.02) s += amplitude * Math.exp(-phase * 200);
    signal[i] = s;
  }
  return { signal, sr };
}

describe('fft', () => {
  it('finds the correct bin for a pure sine tone', () => {
    const sr = 44100;
    const n = 2048;
    const w = hannWindow(n);
    const freq = 440;
    const s = sine(freq, sr, n / sr);
    const windowed = Float32Array.from(s.slice(0, n), (v, i) => v * w[i]);
    const mag = fftMagnitude(windowed);
    let peak = 0;
    for (let i = 1; i < mag.length; i++) if (mag[i] > mag[peak]) peak = i;
    const expectedBin = Math.round((freq * n) / sr);
    expect(Math.abs(peak - expectedBin)).toBeLessThanOrEqual(1);
  });

  it('is deterministic for the same input', () => {
    const s = sine(300, 22050, 0.1);
    const a = fftMagnitude(s.slice(0, 1024));
    const b = fftMagnitude(s.slice(0, 1024));
    expect(Array.from(a)).toEqual(Array.from(b));
  });
});

describe('tempo estimation', () => {
  it('recovers a known BPM from a synthetic click track within tolerance', () => {
    const { signal, sr } = clickTrack({ bpm: 128 });
    const stft = computeSTFT(signal, sr);
    const flux = spectralFluxSeries(stft);
    const { bpm, confidence } = estimateTempo(flux, stft.frameDurationSec);
    expect(bpm).toBeGreaterThan(120);
    expect(bpm).toBeLessThan(136);
    expect(confidence).toBeGreaterThan(0.5);
  });

  it('recovers a different known BPM (174, drum & bass range)', () => {
    const { signal, sr } = clickTrack({ bpm: 174, seconds: 6 });
    const stft = computeSTFT(signal, sr);
    const flux = spectralFluxSeries(stft);
    const { bpm } = estimateTempo(flux, stft.frameDurationSec);
    // el algoritmo puede normalizar a la mitad/doble dentro del rango 70-180
    const normalized = bpm < 100 ? bpm * 2 : bpm;
    expect(Math.abs(normalized - 174)).toBeLessThan(10);
  });
});

describe('key detection', () => {
  it('identifies A minor from a track built on a 220Hz (A3) drone', () => {
    const sr = 22050;
    const n = sr * 4;
    const signal = new Float32Array(n);
    for (let i = 0; i < n; i++) signal[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / sr);
    const stft = computeSTFT(signal, sr);
    const chroma = chromagram(stft);
    const mean = new Array(12).fill(0);
    for (const row of chroma) for (let i = 0; i < 12; i++) mean[i] += row[i] / chroma.length;
    const { key } = estimateKey(mean);
    expect(key).toBe('A');
  });

  it('maps every key/mode combination to a valid Camelot code', () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (const key of notes) {
      for (const mode of ['major', 'minor']) {
        const camelot = toCamelot(key, mode);
        expect(camelot).toMatch(/^\d{1,2}[AB]$/);
      }
    }
  });
});

describe('dinámica y estéreo', () => {
  it('crest factor of a click track is higher than a constant-amplitude tone', () => {
    const { signal: clicks, sr } = clickTrack({ bpm: 128 });
    const tone = sine(220, sr, 4);
    const rmsClicks = rmsSeries(clicks);
    const rmsTone = rmsSeries(tone);
    const crestClicks = crestFactor(clicks, rmsClicks);
    const crestTone = crestFactor(tone, rmsTone);
    expect(crestClicks).toBeGreaterThan(crestTone);
  });

  it('stereo correlation is 1 for identical mono-duplicated channels', () => {
    const s = sine(300, 22050, 1);
    expect(stereoCorrelation(s, s)).toBeCloseTo(1, 5);
  });

  it('stereo correlation is near -1 for perfectly out-of-phase channels', () => {
    const s = sine(300, 22050, 1);
    const inverted = Float32Array.from(s, (v) => -v);
    expect(stereoCorrelation(s, inverted)).toBeLessThan(-0.9);
  });
});

describe('stats', () => {
  it('mean/std/percentile are correct on a known array', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(stats.mean(arr)).toBe(3);
    expect(stats.std(arr)).toBeCloseTo(Math.sqrt(2), 5);
    expect(stats.percentile(arr, 100)).toBe(5);
  });

  it('handles empty arrays without throwing', () => {
    expect(stats.mean([])).toBe(0);
    expect(stats.std([])).toBe(0);
    expect(stats.percentile([], 50)).toBe(0);
  });
});
