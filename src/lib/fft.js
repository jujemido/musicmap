// Radix-2 iterative FFT (Cooley-Tukey). Determinista, sin dependencias.
// Requiere que el tamaño de entrada sea potencia de 2.

export function nextPow2(n) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calcula la FFT de una señal real (ventaneada) y devuelve el espectro de magnitud
 * (solo la mitad positiva, incluyendo DC y Nyquist).
 * @param {Float32Array} real - señal en el tiempo, longitud potencia de 2
 * @returns {Float32Array} magnitudes, longitud real.length/2
 */
export function fftMagnitude(real) {
  const n = real.length;
  const re = Float32Array.from(real);
  const im = new Float32Array(n);

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWRe = 1;
      let curWIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curWRe - im[i + k + len / 2] * curWIm;
        const vIm = re[i + k + len / 2] * curWIm + im[i + k + len / 2] * curWRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextWRe = curWRe * wRe - curWIm * wIm;
        const nextWIm = curWRe * wIm + curWIm * wRe;
        curWRe = nextWRe;
        curWIm = nextWIm;
      }
    }
  }

  const half = n / 2;
  const mag = new Float32Array(half);
  for (let i = 0; i < half; i++) {
    mag[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  }
  return mag;
}

export function hannWindow(size) {
  const w = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return w;
}
