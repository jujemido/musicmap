import { useEffect, useRef } from 'react';
import { forceSimulation, forceManyBody, forceCollide, forceCenter, forceLink } from 'd3-force';
import { useStore } from '../store/useStore';

const AFFINITY_THRESHOLD = 0.55;

function hueToColor(hue, alpha = 1) {
  return `hsla(${hue}, 70%, 60%, ${alpha})`;
}

export default function GalaxyView() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const tracks = useStore((s) => s.tracks);
  const affinities = useStore((s) => s.affinities);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const selectTrack = useStore((s) => s.selectTrack);
  const nodesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = window.devicePixelRatio || 1;

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
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0,0,0,0)';

      // links
      for (const l of links) {
        const s = typeof l.source === 'object' ? l.source : nodes.find((n) => n.id === l.source);
        const t = typeof l.target === 'object' ? l.target : nodes.find((n) => n.id === l.target);
        if (!s || !t) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = `rgba(150,160,200,${0.08 + l.score * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        const r = radiusFor(n.track);
        const hue = n.track.genre?.hue ?? 0;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = hueToColor(hue, n.id === selectedTrackId ? 1 : 0.85);
        ctx.fill();
        if (n.id === selectedTrackId) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
        }
        if (r > 10) {
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = '11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(truncate(n.track.title, 18), n.x, n.y + r + 12);
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    function pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (const n of nodes) {
        const r = radiusFor(n.track);
        if ((n.x - x) ** 2 + (n.y - y) ** 2 <= r * r) return n;
      }
      return null;
    }

    let dragNode = null;
    function onDown(e) {
      const p = e.touches ? e.touches[0] : e;
      const hit = pick(p.clientX, p.clientY);
      if (hit) {
        dragNode = hit;
        hit.fx = hit.x;
        hit.fy = hit.y;
        selectTrack(hit.id);
        sim.alphaTarget(0.3).restart();
      }
    }
    function onMove(e) {
      if (!dragNode) return;
      const p = e.touches ? e.touches[0] : e;
      const rect = canvas.getBoundingClientRect();
      dragNode.fx = p.clientX - rect.left;
      dragNode.fy = p.clientY - rect.top;
    }
    function onUp() {
      if (dragNode) {
        dragNode.fx = null;
        dragNode.fy = null;
        sim.alphaTarget(0);
      }
      dragNode = null;
    }
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onUp);

    return () => {
      cancelAnimationFrame(animId);
      sim.stop();
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
  }, [tracks, affinities, selectedTrackId, selectTrack]);

  return (
    <div ref={containerRef} className="galaxy-container">
      <canvas ref={canvasRef} />
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
