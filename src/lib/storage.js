const STORAGE_KEY = 'musicmap.v1';
const SCHEMA_VERSION = 1;

const emptyState = () => ({
  schemaVersion: SCHEMA_VERSION,
  tracks: {},
  affinities: {},
  settings: {
    soundcloudClientId: '',
    weightProfile: 'todo',
    layout: 'galaxy',
    theme: 'dark',
  },
});

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      // migración simple: si cambia el schema en el futuro, tratar aquí.
      return { ...emptyState(), ...parsed, schemaVersion: SCHEMA_VERSION };
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('No se pudo guardar en localStorage (¿lleno?)', e);
    return false;
  }
}

export function exportStateToFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `musicmap-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedFile(text) {
  const parsed = JSON.parse(text);
  if (!parsed.tracks) throw new Error('El fichero no parece un export válido de MusicMap.');
  return { ...emptyState(), ...parsed, schemaVersion: SCHEMA_VERSION };
}

export { SCHEMA_VERSION, emptyState };
