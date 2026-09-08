import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';

export default function TrackInput() {
  const [url, setUrl] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ title: '', artist: '', genre: '', tags: '' });
  const fileRef = useRef(null);

  const ingest = useStore((s) => s.ingest);
  const addTrackFromUrl = useStore((s) => s.addTrackFromUrl);
  const addTrackFromFile = useStore((s) => s.addTrackFromFile);
  const addTrackManual = useStore((s) => s.addTrackManual);
  const loadDemoDataset = useStore((s) => s.loadDemoDataset);
  const dismissIngestError = useStore((s) => s.dismissIngestError);

  const busy = ingest.status === 'working';

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim() || busy) return;
    addTrackFromUrl(url.trim());
    setUrl('');
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) addTrackFromFile(file);
    e.target.value = '';
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manual.title.trim()) return;
    addTrackManual({
      title: manual.title,
      artist: manual.artist || 'Desconocido',
      rawGenreTag: manual.genre,
      rawTags: manual.tags.split(',').map((t) => t.trim()).filter(Boolean),
      artworkUrl: null,
      durationMs: 0,
    });
    setManual({ title: '', artist: '', genre: '', tags: '' });
    setShowManual(false);
  }

  return (
    <div className="track-input">
      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="url"
          placeholder="Pega un enlace de SoundCloud…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !url.trim()}>Añadir</button>
      </form>

      <div className="input-actions">
        <button onClick={() => fileRef.current?.click()} disabled={busy}>🎵 Subir audio local</button>
        <input ref={fileRef} type="file" accept="audio/*" hidden onChange={handleFile} />
        <button onClick={() => setShowManual((v) => !v)} disabled={busy}>✍️ Manual</button>
        <button onClick={loadDemoDataset} disabled={busy}>🌌 Cargar demo</button>
      </div>

      {showManual && (
        <form onSubmit={handleManualSubmit} className="manual-form">
          <input placeholder="Título" value={manual.title} onChange={(e) => setManual((m) => ({ ...m, title: e.target.value }))} />
          <input placeholder="Artista" value={manual.artist} onChange={(e) => setManual((m) => ({ ...m, artist: e.target.value }))} />
          <input placeholder="Género" value={manual.genre} onChange={(e) => setManual((m) => ({ ...m, genre: e.target.value }))} />
          <input placeholder="Tags separados por coma" value={manual.tags} onChange={(e) => setManual((m) => ({ ...m, tags: e.target.value }))} />
          <button type="submit">Guardar (sin análisis de audio)</button>
        </form>
      )}

      {busy && (
        <div className="ingest-progress">
          <div className="ingest-bar"><div style={{ width: `${ingest.pct}%` }} /></div>
          <span>{ingest.stage}…</span>
        </div>
      )}

      {ingest.error && (
        <div className="ingest-error">
          <span>{ingest.error}</span>
          <button onClick={dismissIngestError}>✕</button>
        </div>
      )}
    </div>
  );
}
