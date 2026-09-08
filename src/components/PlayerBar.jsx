import { useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { usePlayerStore, playRelative } from '../store/usePlayerStore';

function formatTime(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function PlayerBar() {
  const tracks = useStore((s) => s.tracks);
  const selectTrack = useStore((s) => s.selectTrack);
  const { trackId, isPlaying, currentTime, duration, play, togglePlay, stop, seekTo, seekBy, setQueue } = usePlayerStore();

  const orderedIds = useMemo(
    () => Object.values(tracks).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).map((t) => t.id),
    [tracks]
  );

  useEffect(() => {
    setQueue(orderedIds);
  }, [orderedIds, setQueue]);

  const track = trackId ? tracks[trackId] : null;

  if (!track) return null; // nada cargado todavía: la barra no ocupa espacio

  function handleSeekClick(e) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  }

  return (
    <div className="player-bar">
      <button className="player-track-info" onClick={() => selectTrack(track.id)} title="Ver ficha técnica">
        {track.artworkUrl ? <img src={track.artworkUrl} alt="" /> : <div className="player-art-placeholder" />}
        <span className="player-track-text">
          <span className="player-title">{track.title}</span>
          <span className="player-artist">{track.artist}</span>
        </span>
      </button>

      <div className="player-controls">
        <div className="player-buttons">
          <button title="Anterior" onClick={() => playRelative(tracks, -1)}>⏮</button>
          <button title="Retroceder 10s" onClick={() => seekBy(-10)}>⏪</button>
          <button className="player-play-btn" title={isPlaying ? 'Pausar' : 'Reproducir'} onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button title="Avanzar 10s" onClick={() => seekBy(10)}>⏩</button>
          <button title="Siguiente" onClick={() => playRelative(tracks, 1)}>⏭</button>
          <button title="Detener" onClick={stop}>⏹</button>
        </div>
        <div className="player-seek">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div className="player-seek-track" onClick={handleSeekClick}>
            <div className="player-seek-fill" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

/** Botón de play reutilizable para listas/ficha técnica. */
export function PlayButton({ track, size = 'normal' }) {
  const tracks = useStore((s) => s.tracks);
  const { trackId, isPlaying, play, togglePlay } = usePlayerStore();
  const isCurrent = trackId === track.id;

  if (!track.audioUrl) return null;

  const orderedIds = Object.values(tracks).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).map((t) => t.id);

  return (
    <button
      className={`play-btn play-btn-${size}`}
      title={isCurrent && isPlaying ? 'Pausar' : 'Reproducir'}
      onClick={(e) => {
        e.stopPropagation();
        if (isCurrent) togglePlay();
        else play(track, orderedIds);
      }}
    >
      {isCurrent && isPlaying ? '⏸' : '▶'}
    </button>
  );
}
