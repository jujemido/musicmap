import { create } from 'zustand';
import { loadState, saveState, exportStateToFile, parseImportedFile } from '../lib/storage';
import { resolveTrack, fetchStreamArrayBuffer, isSoundCloudUrl, SoundCloudError } from '../lib/soundcloud';
import { analyzeAudioBuffer, isWebAudioSupported } from '../lib/audioAnalysis';
import { classifyGenre } from '../lib/genreTaxonomy';
import { buildFeatureVector, recomputeAllAffinities, WEIGHT_PROFILES } from '../lib/affinity';
import { generateDemoTracks } from '../lib/demoData';

const initial = loadState();

function persist(state) {
  saveState({
    schemaVersion: state.schemaVersion,
    tracks: state.tracks,
    affinities: state.affinities,
    settings: state.settings,
  });
}

export const useStore = create((set, get) => ({
  ...initial,
  selectedTrackId: null,
  ingest: { status: 'idle', stage: '', pct: 0, error: null },

  selectTrack: (id) => set({ selectedTrackId: id }),

  setSettings: (patch) => set((s) => {
    const settings = { ...s.settings, ...patch };
    const next = { ...s, settings };
    persist(next);
    return next;
  }),

  removeTrack: (id) => set((s) => {
    const tracks = { ...s.tracks };
    delete tracks[id];
    const affinities = Object.fromEntries(Object.entries(s.affinities).filter(([k]) => !k.includes(id)));
    const next = { ...s, tracks, affinities, selectedTrackId: s.selectedTrackId === id ? null : s.selectedTrackId };
    persist(next);
    return next;
  }),

  loadDemoDataset: () => set((s) => {
    const demoTracks = generateDemoTracks();
    const tracks = { ...s.tracks, ...demoTracks };
    const weights = WEIGHT_PROFILES[s.settings.weightProfile] || WEIGHT_PROFILES.todo;
    const affinities = recomputeAllAffinities(tracks, weights);
    const next = { ...s, tracks, affinities };
    persist(next);
    return next;
  }),

  clearAll: () => set((s) => {
    const next = { ...s, tracks: {}, affinities: {}, selectedTrackId: null };
    persist(next);
    return next;
  }),

  exportData: () => {
    const s = get();
    exportStateToFile({ schemaVersion: s.schemaVersion, tracks: s.tracks, affinities: s.affinities, settings: s.settings });
  },

  importData: async (file) => {
    const text = await file.text();
    const parsed = parseImportedFile(text);
    set((s) => {
      const tracks = { ...s.tracks, ...parsed.tracks };
      const weights = WEIGHT_PROFILES[s.settings.weightProfile] || WEIGHT_PROFILES.todo;
      const affinities = recomputeAllAffinities(tracks, weights);
      const next = { ...s, tracks, affinities };
      persist(next);
      return next;
    });
  },

  recomputeAffinities: () => set((s) => {
    const weights = WEIGHT_PROFILES[s.settings.weightProfile] || WEIGHT_PROFILES.todo;
    const affinities = recomputeAllAffinities(s.tracks, weights);
    const next = { ...s, affinities };
    persist(next);
    return next;
  }),

  /** Añade un track a partir de un enlace de SoundCloud. */
  addTrackFromUrl: async (url) => {
    set({ ingest: { status: 'working', stage: 'resolviendo enlace', pct: 5, error: null } });
    try {
      if (!isSoundCloudUrl(url)) throw new Error('Eso no parece un enlace de SoundCloud.');
      const clientId = get().settings.soundcloudClientId;
      const meta = await resolveTrack(url, clientId);

      if (get().tracks[meta.id]) {
        set({ ingest: { status: 'idle', stage: '', pct: 0, error: 'Ese track ya está en tu colección.' } });
        return;
      }

      let analysis = null;
      let analysisMode = 'sin_audio';
      try {
        set({ ingest: { status: 'working', stage: 'descargando audio del stream', pct: 15, error: null } });
        const buffer = await fetchStreamArrayBuffer(meta, clientId);
        analysis = await analyzeAudioBuffer(buffer, (stage, pct) =>
          set({ ingest: { status: 'working', stage, pct, error: null } })
        );
        analysisMode = 'completo';
      } catch (audioErr) {
        console.warn('Análisis de audio no disponible, se guarda solo con metadatos', audioErr);
        analysisMode = 'solo_metadatos';
      }

      finalizeAndAddTrack(set, get, meta, analysis, analysisMode);
      set({ ingest: { status: 'done', stage: '', pct: 100, error: null } });
    } catch (e) {
      const msg = e instanceof SoundCloudError ? e.message : e.message || 'Error desconocido';
      set({ ingest: { status: 'error', stage: '', pct: 0, error: msg } });
    }
  },

  /** Añade un track a partir de un fichero de audio local (garantiza análisis completo). */
  addTrackFromFile: async (file) => {
    set({ ingest: { status: 'working', stage: 'leyendo fichero', pct: 5, error: null } });
    try {
      if (!isWebAudioSupported()) throw new Error('Este navegador no soporta Web Audio API.');
      const buffer = await file.arrayBuffer();
      const analysis = await analyzeAudioBuffer(buffer, (stage, pct) =>
        set({ ingest: { status: 'working', stage, pct, error: null } })
      );
      const id = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const meta = {
        id,
        soundcloudUrl: null,
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Archivo local',
        artworkUrl: null,
        durationMs: analysis.durationSec * 1000,
        rawGenreTag: '',
        rawTags: [],
      };
      finalizeAndAddTrack(set, get, meta, analysis, 'completo');
      set({ ingest: { status: 'done', stage: '', pct: 100, error: null } });
    } catch (e) {
      set({ ingest: { status: 'error', stage: '', pct: 0, error: e.message } });
    }
  },

  /** Añade un track manualmente (sin poder analizarlo por audio): título/artista/género a mano. */
  addTrackManual: (fields) => {
    const id = `manual-${Date.now()}`;
    finalizeAndAddTrack(set, get, { id, soundcloudUrl: fields.url || null, ...fields }, null, 'sin_audio');
  },

  dismissIngestError: () => set({ ingest: { status: 'idle', stage: '', pct: 0, error: null } }),
}));

function finalizeAndAddTrack(set, get, meta, analysis, analysisMode) {
  const genre = classifyGenre(meta, analysis);
  const featureVector = analysis ? buildFeatureVector(analysis) : null;
  const track = {
    ...meta,
    addedAt: new Date().toISOString(),
    analysisMode,
    analysis,
    genre,
    featureVector,
  };
  set((s) => {
    const tracks = { ...s.tracks, [track.id]: track };
    const weights = WEIGHT_PROFILES[s.settings.weightProfile] || WEIGHT_PROFILES.todo;
    const affinities = recomputeAllAffinities(tracks, weights);
    const next = { ...s, tracks, affinities, selectedTrackId: track.id };
    persist(next);
    return next;
  });
}
