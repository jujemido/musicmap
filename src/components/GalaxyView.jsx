import { useEffect, useRef, useState } from 'react';
import { forceSimulation, forceManyBody, forceCollide, forceCenter, forceLink } from 'd3-force';
import { useStore } from '../store/useStore';

const AFFINITY_THRESHOLD = 0.55;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

function hueToColor(hue, alpha = 1) {
  return `hsla(${hue}, 70%, 60%, ${alpha})`;
}

function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    text: style.getPropertyValue('--text').trim() || '#e8e9f5',
    linkBase: document.documentElement.getAttribute('data-theme') === 'light'
      ? '60,66,110'
      : '150,160,200',
    selectRing: style.getPropertyValue('--accent-a').trim() || '#8b6bf0',
  };
}

export default function GalaxyView() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const viewRef = useRef({ x: 0, y: 0, k: 1 });
  const tracks = useStore((s) => s.tracks);
  const affinities = useStore((s) => s.affinities);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const selectTrack = useStore((s) => s.selectTrack);
  const theme = useStore((s) => s.settings.theme);
  const nodesRef = useRef([]);
  const [hovered, setHovered] = useState(null); // { id, title, sub, bpm, x, y } en coords de pantalla
  const [zoomPct, setZoomPct] = useState(100);

  function applyZoom(newK, pivotScreenX, pivotScreenY, container) {
    const view = viewRef.current;
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newK));
    const cx = pivotScreenX ?? container.clientWidth / 2;
    const cy = pivotScreenY ?? container.clientHeight / 2;
    const worldX = (cx - view.x) / view.k;
    const worldY = (cy - view.y) / view.k;
    view.k = clamped;
    view.x = cx - worldX * view.k;
    view.y = cy - worldY * view.k;
    setZoomPct(Math.round(view.k * 100));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = window.devicePixelRatio || 1;
    let colors = readThemeColors();

    function resize() {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ids = Object.keys(tracks);
    const existing = new Map(nodesRef.current.map((n) => [n.id, n]));
    const nodes = ids.map((id) => {
      const prev = existing.get(id);
      const t = tracks[id];
      return prev
        ? { ...prev, track: t }
        : { id, track: t, x: width / 2 + (Math.random() - 0.5) * 100, y: height / 2 + (Math.random() - 0.5) * 100 };
    });
    nodesRef.current = nodes;

    const links = [];
    for (const key of Object.keys(affinities)) {
      const [a, b] = key.split('|');
      if (!ids.includes(a) || !ids.includes(b)) continue;
      const score = affinities[key];
      if (score >= AFFINITY_THRESHOLD) links.push({ source: a, target: b, score });
    }

    const sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-120))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide().radius((d) => radiusFor(d.track) + 4))
      .force('link', forceLink(links).id((d) => d.id).distance((l) => 160 * (1 - l.score) + 20).strength(0.4))
      .alpha(1)
      .alphaDecay(0.03);

    simRef.current = sim;

    let animId;
    let hoveredIdRef = null;

    function draw() {
      const view = viewRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.k, view.k);

      // links
      for (const l of links) {
        const s = typeof l.source === 'object' ? l.source : nodes.find((n) => n.id === l.source);
        const t = typeof l.target === 'object' ? l.target : nodes.find((n) => n.id === l.target);
        if (!s || !t) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = `rgba(${colors.linkBase},${0.08 + l.score * 0.25})`;
        ctx.lineWidth = 1 / view.k;
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        const r = radiusFor(n.track);
        const hue = n.track.genre?.hue ?? 0;
        const isHovered = n.id === hoveredIdRef;
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? r + 2 : r, 0, Math.PI * 2);
        ctx.fillStyle = hueToColor(hue, n.id === selectedTrackId ? 1 : isHovered ? 0.95 : 0.85);
        ctx.fill();
        if (n.id === selectedTrackId || isHovered) {
          ctx.lineWidth = 2 / view.k;
          ctx.strokeStyle = n.id === selectedTrackId ? colors.selectRing : colors.text;
          ctx.stroke();
        }
        if (r > 10) {
          ctx.fillStyle = colors.text;
          ctx.font = '11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(truncate(n.track.title, 18), n.x, n.y + r + 12);
        }
      }
      ctx.restore();
      animId = requestAnimationFrame(draw);
    }
    draw();

    function toWorld(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const view = viewRef.current;
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return { x: (sx - view.x) / view.k, y: (sy - view.y) / view.k, sx, sy };
    }

    function pick(clientX, clientY) {
      const { x, y } = toWorld(clientX, clientY);
      for (const n of nodes) {
        const r = radiusFor(n.track);
        if ((n.x - x) ** 2 + (n.y - y) ** 2 <= (r + 3 / viewRef.current.k) ** 2) return n;
      }
      return null;
    }

    let dragNode = null;
    let panning = null; // { startClientX, startClientY, startViewX, startViewY }

    function onDown(e) {
      const p = e.touches ? e.touches[0] : e;
      const hit = pick(p.clientX, p.clientY);
      if (hit) {
        dragNode = hit;
        const { x, y } = toWorld(p.clientX, p.clientY);
        hit.fx = x;
        hit.fy = y;
        selectTrack(hit.id);
        sim.alphaTarget(0.3).restart();
      } else {
        const view = viewRef.current;
        panning = { startClientX: p.clientX, startClientY: p.clientY, startViewX: view.x, startViewY: view.y };
      }
    }
    function onMove(e) {
      const p = e.touches ? e.touches[0] : e;
      if (dragNode) {
        const { x, y } = toWorld(p.clientX, p.clientY);
        dragNode.fx = x;
        dragNode.fy = y;
        return;
      }
      if (panning) {
        const view = viewRef.current;
        view.x = panning.startViewX + (p.clientX - panning.startClientX);
        view.y = panning.startViewY + (p.clientY - panning.startClientY);
        return;
      }
      if (e.touches) return; // sin hover en táctil
      const hit = pick(p.clientX, p.clientY);
      const nextId = hit ? hit.id : null;
      if (nextId !== hoveredIdRef) {
        hoveredIdRef = nextId;
        if (hit) {
          const view = viewRef.current;
          setHovered({
            id: hit.id,
            title: hit.track.title,
            sub: hit.track.genre?.subgenre || hit.track.genre?.primary || 'Sin clasificar',
            bpm: hit.track.analysis ? Math.round(hit.track.analysis.rhythm.bpm) : null,
            x: hit.x * view.k + view.x,
            y: hit.y * view.k + view.y,
          });
        } else {
          setHovered(null);
        }
      } else if (hit) {
        const view = viewRef.current;
        setHovered((prev) => (prev && prev.id === hit.id
          ? { ...prev, x: hit.x * view.k + view.x, y: hit.y * view.k + view.y }
          : prev));
      }
    }
    function onUp() {
      if (dragNode) {
        dragNode.fx = null;
        dragNode.fy = null;
        sim.alphaTarget(0);
      }
      dragNode = null;
      panning = null;
    }
    function onLeave() {
      hoveredIdRef = null;
      setHovered(null);
    }
    function onWheel(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.001);
      applyZoom(viewRef.current.k * factor, e.clientX - rect.left, e.clientY - rect.top, container);
    }
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animId);
      sim.stop();
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [tracks, affinities, selectedTrackId, selectTrack, theme]);

  return (
    <div ref={containerRef} className="galaxy-container">
      <canvas ref={canvasRef} />
      {hovered && (
        <div className="node-tooltip" style={{ left: hovered.x, top: hovered.y }}>
          <strong>{hovered.title}</strong>
          <span>{hovered.sub}{hovered.bpm ? ` · ${hovered.bpm} BPM` : ''}</span>
        </div>
      )}
      <div className="zoom-controls">
        <button onClick={() => applyZoom(viewRef.current.k * 1.3, undefined, undefined, containerRef.current)}>+</button>
        <span>{zoomPct}%</span>
        <button onClick={() => applyZoom(viewRef.current.k / 1.3, undefined, undefined, containerRef.current)}>−</button>
        <button
          className="zoom-reset"
          title="Restablecer vista"
          onClick={() => { viewRef.current = { x: 0, y: 0, k: 1 }; setZoomPct(100); }}
        >
          ⟲
        </button>
      </div>
      {Object.keys(tracks).length === 0 && (
        <div className="galaxy-empty">Añade una canción para empezar a construir tu galaxia musical.</div>
      )}
    </div>
  );
}

function radiusFor(track) {
  const base = 10;
  const pop = Math.log10((track.playbackCount || 0) + 10);
  return Math.min(28, base + pop * 1.5);
}

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : str;
}
