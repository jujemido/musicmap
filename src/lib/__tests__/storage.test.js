import { describe, it, expect, beforeEach, vi } from 'vitest';

// storage.js usa `localStorage` global (API de navegador). En este entorno de
// test Node no la provee, así que se stubea con un Map en memoria — permite
// probar la lógica real de storage.js sin añadir una dependencia de DOM.
function makeLocalStorageStub() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorageStub());
});

describe('storage: schema y persistencia', () => {
  it('loadState devuelve un estado vacío válido cuando no hay nada guardado', async () => {
    const { loadState, emptyState, SCHEMA_VERSION } = await import('../storage');
    const state = loadState();
    expect(state).toEqual(emptyState());
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.tracks).toEqual({});
  });

  it('saveState + loadState hace un roundtrip fiel', async () => {
    const { loadState, saveState } = await import('../storage');
    const state = loadState();
    state.tracks['t1'] = { id: 't1', title: 'Test Track' };
    state.settings.weightProfile = 'dj';
    saveState(state);

    const reloaded = loadState();
    expect(reloaded.tracks.t1.title).toBe('Test Track');
    expect(reloaded.settings.weightProfile).toBe('dj');
  });

  it('loadState no revienta con JSON corrupto en localStorage', async () => {
    localStorage.setItem('musicmap.v1', '{not valid json');
    const { loadState, emptyState } = await import('../storage');
    expect(loadState()).toEqual(emptyState());
  });

  it('parseImportedFile rechaza un JSON sin campo tracks', async () => {
    const { parseImportedFile } = await import('../storage');
    expect(() => parseImportedFile(JSON.stringify({ foo: 'bar' }))).toThrow();
  });

  it('parseImportedFile acepta un export válido y normaliza schemaVersion', async () => {
    const { parseImportedFile, SCHEMA_VERSION } = await import('../storage');
    const exported = { schemaVersion: 1, tracks: { a: { id: 'a' } }, affinities: {}, settings: {} };
    const parsed = parseImportedFile(JSON.stringify(exported));
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION);
    expect(parsed.tracks.a.id).toBe('a');
  });
});
