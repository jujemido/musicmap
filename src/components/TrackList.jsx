import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

const SORTERS = {
  recent: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
  title: (a, b) => a.title.localeCompare(b.title),
  bpm: (a, b) => (b.analysis?.rhythm.bpm || 0) - (a.analysis?.rhythm.bpm || 0),
  genre: (a, b) => (a.genre?.primary || '').localeCompare(b.genre?.primary || ''),
};

export default function TrackList() {
  const tracks = useStore((s) => s.tracks);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const selectTrack = useStore((s) => s.selectTrack);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = Object.values(tracks);
    if (q) {
      arr = arr.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.genre?.primary || '').toLowerCase().includes(q) ||
        (t.genre?.subgenre || '').toLowerCase().includes(q)
      );
    }
    return arr.sort(SORTERS[sortBy] || SORTERS.recent);
  }, [tracks, query, sortBy]);

  const total = Object.keys(tracks).length;
  if (!total) return <p className="track-list-empty">Todavía no hay canciones.</p>;

  return (
    <div className="track-list-wrap">
      <div className="track-list-controls">
        <input
          type="search"
          className="track-search"
          placeholder="Buscar por título, artista o género…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="track-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Recientes</option>
          <option value="title">Título</option>
          <option value="bpm">BPM</option>
          <option value="genre">Género</option>
        </select>
      </div>

      {list.length === 0 ? (
        <p className="track-list-empty">Sin resultados para "{query}".</p>
      ) : (
        <ul className="track-list">
          {list.map((t) => (
            <li key={t.id}>
              <button
                className={`track-list-item${t.id === selectedTrackId ? ' selected' : ''}`}
                onClick={() => selectTrack(t.id)}
              >
                <span className="tl-dot" style={{ background: `hsl(${t.genre?.hue || 0},70%,60%)` }} />
                <span className="tl-text">
                  <span className="tl-title">{t.title}</span>
                  <span className="tl-sub">{t.genre?.subgenre || t.genre?.primary || 'Sin clasificar'}</span>
                </span>
                {t.analysis && <span className="tl-bpm">{Math.round(t.analysis.rhythm.bpm)} BPM</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
