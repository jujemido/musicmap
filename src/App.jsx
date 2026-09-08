import { useState } from 'react';
import GalaxyView from './components/GalaxyView';
import EveryNoiseView from './components/EveryNoiseView';
import TrackInput from './components/TrackInput';
import TrackList from './components/TrackList';
import TrackDetail from './components/TrackDetail';
import SettingsPanel from './components/SettingsPanel';
import { useStore } from './store/useStore';
import './App.css';

export default function App() {
  const [view, setView] = useState('galaxy');
  const [showSettings, setShowSettings] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const selectedTrackId = useStore((s) => s.selectedTrackId);
  const trackCount = Object.keys(useStore((s) => s.tracks)).length;

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>🌌 MusicMap</h1>
        <div className="view-switch">
          <button className={view === 'galaxy' ? 'active' : ''} onClick={() => setView('galaxy')}>Galaxia</button>
          <button className={view === 'everynoise' ? 'active' : ''} onClick={() => setView('everynoise')}>Every Noise</button>
        </div>
        <button className="settings-toggle" onClick={() => setShowSettings((v) => !v)}>⚙️</button>
      </header>

      <div className="main-layout">
        <aside className="sidebar desktop-only">
          <TrackInput />
          <div className="sidebar-scroll">
            <h4>Tu colección ({trackCount})</h4>
            <TrackList />
          </div>
        </aside>

        <main className="map-area">
          {view === 'galaxy' ? <GalaxyView /> : <EveryNoiseView />}
        </main>

        <aside className={`detail-panel ${selectedTrackId ? 'open' : ''} desktop-only`}>
          <TrackDetail />
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      <div className="mobile-only">
        <button className="mobile-fab" onClick={() => setMobilePanel((v) => !v)}>
          {mobilePanel ? '✕' : '☰'}
        </button>
        <div className={`bottom-sheet ${mobilePanel ? 'open' : ''}`}>
          <TrackInput />
          <h4>Tu colección ({trackCount})</h4>
          <TrackList />
        </div>
        <div className={`bottom-sheet detail-sheet ${selectedTrackId ? 'open' : ''}`}>
          <TrackDetail />
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
