import { create } from 'zustand';

// Un único <audio> compartido para toda la app (evita solapar reproducciones
// y simplifica el control de transporte). Solo se reproduce audio real
// (fichero local subido, o el stream de SoundCloud que ya se descargó para
// analizar) — nunca el audio "de mentira" del dataset demo, ni tracks que
// solo tienen metadatos.
const audioEl = typeof Audio !== 'undefined' ? new Audio() : null;

export const usePlayerStore = create((set, get) => ({
  trackId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  queue: [], // ids en el orden en que se puede navegar con siguiente/anterior

  setQueue: (ids) => set({ queue: ids }),

  play: (track, queue) => {
    if (!audioEl || !track?.audioUrl) return;
    const state = get();
    if (state.trackId !== track.id) {
      audioEl.src = track.audioUrl;
      set({ trackId: track.id, currentTime: 0, duration: 0 });
    }
    if (queue) set({ queue });
    audioEl.play().catch(() => {});
    set({ isPlaying: true });
  },

  togglePlay: () => {
    if (!audioEl || !get().trackId) return;
    if (audioEl.paused) {
      audioEl.play().catch(() => {});
      set({ isPlaying: true });
    } else {
      audioEl.pause();
      set({ isPlaying: false });
    }
  },

  stop: () => {
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
    set({ isPlaying: false, currentTime: 0 });
  },

  seekTo: (seconds) => {
    if (!audioEl || !Number.isFinite(seconds)) return;
    audioEl.currentTime = Math.max(0, Math.min(seconds, audioEl.duration || seconds));
    set({ currentTime: audioEl.currentTime });
  },

  seekBy: (delta) => {
    if (!audioEl) return;
    get().seekTo(audioEl.currentTime + delta);
  },

  _syncTime: () => {
    if (!audioEl) return;
    set({ currentTime: audioEl.currentTime, duration: audioEl.duration || 0 });
  },

  _onEnded: () => {
    set({ isPlaying: false, currentTime: 0 });
  },
}));

if (audioEl) {
  audioEl.addEventListener('timeupdate', () => usePlayerStore.getState()._syncTime());
  audioEl.addEventListener('loadedmetadata', () => usePlayerStore.getState()._syncTime());
  audioEl.addEventListener('ended', () => usePlayerStore.getState()._onEnded());
}

/** Reproduce el siguiente/anterior track de la cola que tenga audio
 * reproducible; si ninguno lo tiene, no hace nada. `tracksById` es el mapa
 * de tracks del store principal, necesario para resolver audioUrl. */
export function playRelative(tracksById, delta) {
  const { queue, trackId, play } = usePlayerStore.getState();
  if (!queue.length || !trackId) return;
  const idx = queue.indexOf(trackId);
  if (idx === -1) return;
  for (let i = 1; i <= queue.length; i++) {
    const nextIdx = (idx + delta * i + queue.length * 10) % queue.length;
    const candidate = tracksById[queue[nextIdx]];
    if (candidate?.audioUrl) {
      play(candidate, queue);
      return;
    }
  }
}
