import { useStore } from '../store/useStore';

export default function TrackList() {
  const tracks = useStore((s) => s.tracks);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const selectTrack = useStore((s) => s.selectTrack);
  const list = Object.values(tracks).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

  if (!list.length) return <p className="track-list-empty">Todavía no hay canciones.</p>;

  return (
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
  );
}
