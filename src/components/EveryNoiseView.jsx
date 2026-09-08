import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { TAXONOMY } from '../lib/genreTaxonomy';

// Coordenadas fijas y deterministas por género/subgénero (no física, no IA):
// X = energía media del track, Y = ratio de brillo espectral (agudos vs graves).
export default function EveryNoiseView() {
  const tracks = useStore((s) => s.tracks);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const selectTrack = useStore((s) => s.selectTrack);

  const points = useMemo(() => {
    return Object.values(tracks).map((t) => {
      const energy = t.analysis?.dynamics?.rmsMean ?? 0.5;
      const brightness = t.analysis?.spectrum
        ? (t.analysis.spectrum.bands.brilliance.mean + t.analysis.spectrum.bands.presence.mean) /
          (t.analysis.spectrum.bands.bass.mean + t.analysis.spectrum.bands.subBass.mean + 0.001)
        : 1;
      return {
        id: t.id,
        title: t.title,
        artist: t.artist,
        genre: t.genre?.primary || 'Sin clasificar',
        subgenre: t.genre?.subgenre,
        hue: t.genre?.hue ?? 0,
        x: Math.min(1, energy * 2),
        y: Math.min(1, brightness / 4),
      };
    });
  }, [tracks]);

  const genres = Object.keys(TAXONOMY);

  return (
    <div className="everynoise-container">
      <div className="everynoise-legend">
        {genres.map((g) => (
          <div key={g} className="legend-item">
            <span className="legend-dot" style={{ background: `hsl(${TAXONOMY[g].hue},70%,60%)` }} />
            {g}
          </div>
        ))}
      </div>
      <div className="everynoise-grid">
        <div className="axis-label axis-x">energía →</div>
        <div className="axis-label axis-y">brillo →</div>
        {points.map((p) => (
          <button
            key={p.id}
            className={`en-point${p.id === selectedTrackId ? ' selected' : ''}`}
            style={{
              left: `${p.x * 100}%`,
              bottom: `${p.y * 100}%`,
              background: `hsl(${p.hue}, 70%, 60%)`,
            }}
            title={`${p.title} — ${p.subgenre || p.genre}`}
            onClick={() => selectTrack(p.id)}
          >
            <span className="en-label">{p.subgenre || p.genre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
