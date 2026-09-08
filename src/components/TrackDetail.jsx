import { useStore } from '../store/useStore';
import { getSimilarTracks } from '../lib/affinity';

const BAND_LABELS = [
  ['subBass', 'Sub-bass'], ['bass', 'Bass'], ['lowMid', 'Low-mid'], ['mid', 'Mid'],
  ['highMid', 'High-mid'], ['presence', 'Presence'], ['brilliance', 'Brilliance'],
];

const RADAR_CATEGORIES = ['rhythm', 'spectrum', 'tonality', 'vocals', 'production', 'dynamics', 'structure'];
const RADAR_LABELS = { rhythm: 'Ritmo', spectrum: 'Espectro', tonality: 'Tonalidad', vocals: 'Voz', production: 'Producción', dynamics: 'Dinámica', structure: 'Estructura' };

function radarScore(analysis, cat) {
  if (!analysis) return 0;
  switch (cat) {
    case 'rhythm': return analysis.rhythm.danceability;
    case 'spectrum': return Math.min(1, analysis.spectrum.centroidMean / 6000);
    case 'tonality': return analysis.tonality.confidence;
    case 'vocals': return analysis.vocals.percentTrackWithVocals;
    case 'production': return analysis.production.stereoWidth;
    case 'dynamics': return Math.min(1, analysis.dynamics.dynamicRange * 2);
    case 'structure': return Math.min(1, analysis.structure.sectionCount / 10);
    default: return 0;
  }
}

function RadarChart({ analysis }) {
  const size = 160;
  const c = size / 2;
  const n = RADAR_CATEGORIES.length;
  const points = RADAR_CATEGORIES.map((cat, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radarScore(analysis, cat) * (c - 20);
    return [c + r * Math.cos(angle), c + r * Math.sin(angle)];
  });
  const path = points.map((p) => p.join(',')).join(' ');
  return (
    <svg width={size} height={size} className="radar-chart">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle key={f} cx={c} cy={c} r={(c - 20) * f} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      <polygon points={path} fill="var(--accent-a)" fillOpacity="0.35" stroke="var(--accent-a)" strokeWidth="2" />
      {RADAR_CATEGORIES.map((cat, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = c + (c - 6) * Math.cos(angle);
        const y = c + (c - 6) * Math.sin(angle);
        return (
          <text key={cat} x={x} y={y} fontSize="9" textAnchor="middle" fill="var(--text-dim)">
            {RADAR_LABELS[cat]}
          </text>
        );
      })}
    </svg>
  );
}

function EqBars({ analysis }) {
  if (!analysis) return null;
  return (
    <div className="eq-bars">
      {BAND_LABELS.map(([key, label]) => (
        <div className="eq-bar-col" key={key}>
          <div className="eq-bar-track">
            <div className="eq-bar-fill" style={{ height: `${Math.min(100, analysis.spectrum.bands[key].mean * 100)}%` }} />
          </div>
          <span className="eq-bar-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function TrackDetail() {
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const track = useStore((s) => (selectedTrackId ? s.tracks[selectedTrackId] : null));
  const tracks = useStore((s) => s.tracks);
  const affinities = useStore((s) => s.affinities);
  const removeTrack = useStore((s) => s.removeTrack);
  const selectTrack = useStore((s) => s.selectTrack);

  if (!track) {
    return <div className="track-detail empty">Selecciona una canción del mapa o de la lista para ver su ficha técnica.</div>;
  }

  const a = track.analysis;
  const similar = getSimilarTracks(track.id, tracks, affinities, 5);

  return (
    <div className="track-detail">
      <button className="close-btn" onClick={() => selectTrack(null)}>✕</button>
      <div className="track-detail-header">
        {track.artworkUrl ? <img src={track.artworkUrl} alt="" className="artwork" /> : <div className="artwork placeholder" />}
        <div>
          <h3>{track.title}</h3>
          <p className="artist">{track.artist}</p>
          <p className="genre-line">
            <span className="genre-dot" style={{ background: `hsl(${track.genre?.hue || 0},70%,60%)` }} />
            {track.genre?.subgenre || track.genre?.primary}
            {track.genre?.primary && track.genre.subgenre && <span className="genre-parent"> · {track.genre.primary}</span>}
          </p>
          {track.genre?.isGuess ? (
            <p className="audio-match-note">🎲 Estimación sin señal fiable (sin tags útiles ni audio analizado)</p>
          ) : track.genre?.audioMatch != null && (
            <p className="audio-match-note">🔬 {track.genre.audioMatch}% de coincidencia por análisis de audio automático</p>
          )}
        </div>
      </div>

      {track.soundcloudUrl && (
        <iframe
          title="soundcloud-player"
          className="sc-player"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.soundcloudUrl)}&color=%236e56cf&auto_play=false&show_comments=false`}
        />
      )}

      {!a && (
        <p className="no-analysis-note">
          Sin análisis de audio (solo metadatos). {track.analysisMode === 'solo_metadatos' && 'El stream no estuvo disponible (CORS/permiso).'}
        </p>
      )}

      {a && (
        <>
          <div className="detail-grid">
            <RadarChart analysis={a} />
            <div className="badges">
              <Badge tone="accent">{a.rhythm.bpm} BPM</Badge>
              <Badge>{a.tonality.key} {a.tonality.mode === 'major' ? 'Mayor' : 'menor'} ({a.tonality.camelot})</Badge>
              <Badge>{Math.round(a.rhythm.danceability * 100)}% bailable</Badge>
              <Badge>{a.vocals.isLikelyInstrumental ? 'Instrumental' : `${Math.round(a.vocals.percentTrackWithVocals * 100)}% con voz`}</Badge>
              {a.production.reverbScore > 0.5 && <Badge tone="info">🌀 Mucha reverb</Badge>}
              {a.production.distortionScore > 0.3 && <Badge tone="warn">🔥 Distorsión</Badge>}
              {a.production.compressionScore > 0.6 && <Badge tone="warn">🎚️ Muy comprimido</Badge>}
              {a.production.stereoWidth > 0.5 && <Badge tone="info">🎧 Estéreo ancho</Badge>}
              <Badge>{a.structure.sectionCount} secciones</Badge>
            </div>
          </div>

          <h4>Espectro de frecuencias</h4>
          <EqBars analysis={a} />

          <h4>Estructura de la canción</h4>
          <StructureTimeline analysis={a} />

          <h4>Métricas exhaustivas</h4>
          <div className="metrics-table">
            <MetricRow label="Regularidad rítmica" value={a.rhythm.regularity} />
            <MetricRow label="Swing" value={a.rhythm.swing} />
            <MetricRow label="Densidad onsets/seg" value={a.rhythm.onsetDensityPerSec} raw />
            <MetricRow label="Confianza tempo" value={a.rhythm.bpmConfidence} />
            <MetricRow label="Confianza tonalidad" value={a.tonality.confidence} />
            <MetricRow label="Riqueza armónica" value={a.tonality.harmonicRichness / 12} />
            <MetricRow label="Rango dinámico" value={Math.min(1, a.dynamics.dynamicRange * 2)} />
            <MetricRow label="Posición del clímax" value={a.dynamics.climaxPositionRatio} />
            <MetricRow label="Ratio de silencios" value={a.dynamics.silenceRatio} />
            <MetricRow label="Repetitividad estructural" value={a.structure.repetitiveness} />
            <MetricRow label="Anchura estéreo" value={a.production.stereoWidth} />
            <MetricRow label="Crest factor (norm.)" value={Math.min(1, a.production.crestFactor / 20)} />
          </div>
        </>
      )}

      {similar.length > 0 && (
        <>
          <h4>Canciones afines</h4>
          <ul className="similar-list">
            {similar.map(({ id, score }) => {
              const t = tracks[id];
              if (!t) return null;
              return (
                <li key={id}>
                  <button className="similar-item" onClick={() => selectTrack(id)}>
                    <span className="genre-dot" style={{ background: `hsl(${t.genre?.hue || 0},70%,60%)` }} />
                    <span className="tl-text">
                      <span className="tl-title">{t.title}</span>
                      <span className="tl-sub">{t.genre?.subgenre || t.genre?.primary || 'Sin clasificar'}</span>
                    </span>
                    <span className="similar-score">{Math.round(score * 100)}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <button className="danger-btn" onClick={() => removeTrack(track.id)}>Eliminar de la colección</button>
    </div>
  );
}

function StructureTimeline({ analysis }) {
  const boundaries = analysis.structure.boundariesRatio || [];
  const energyThirds = analysis.dynamics.energyThirds || [0.5, 0.5, 0.5];
  const climax = analysis.dynamics.climaxPositionRatio ?? 0.5;
  // segmentos entre fronteras, coloreados por una interpolación simple de
  // energía a lo largo del track (usando los tercios como referencia).
  const points = [0, ...boundaries, 1].sort((a, b) => a - b);
  const energyAt = (ratio) => {
    if (ratio < 0.33) return energyThirds[0];
    if (ratio < 0.66) return energyThirds[1];
    return energyThirds[2];
  };
  return (
    <div className="structure-timeline">
      <div className="structure-bar">
        {points.slice(0, -1).map((start, i) => {
          const end = points[i + 1];
          const e = energyAt((start + end) / 2);
          return (
            <div
              key={i}
              className="structure-segment"
              style={{ width: `${(end - start) * 100}%`, opacity: 0.35 + Math.min(1, e) * 0.65 }}
              title={`Sección ${i + 1}`}
            />
          );
        })}
        <div className="structure-climax-marker" style={{ left: `${climax * 100}%` }} title="Pico de energía" />
      </div>
      <div className="structure-labels">
        <span>inicio</span>
        <span>{points.length - 1} secciones</span>
        <span>final</span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, raw }) {
  const pct = raw ? null : Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      {raw ? (
        <span className="metric-raw">{value.toFixed(2)}</span>
      ) : (
        <div className="metric-bar-track">
          <div className="metric-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
