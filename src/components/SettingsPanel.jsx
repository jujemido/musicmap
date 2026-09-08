import { useStore } from '../store/useStore';
import { WEIGHT_PROFILES } from '../lib/affinity';

const PROFILE_LABELS = {
  todo: 'Todo (equilibrado)',
  dj: 'Modo DJ (mezcla armónica)',
  produccion: 'Modo Producción/Sonido',
  voz: 'Modo Voz/Instrumental',
};

export default function SettingsPanel({ onClose }) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const recomputeAffinities = useStore((s) => s.recomputeAffinities);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const clearAll = useStore((s) => s.clearAll);

  function handleProfileChange(e) {
    setSettings({ weightProfile: e.target.value });
    setTimeout(recomputeAffinities, 0);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (file) importData(file);
    e.target.value = '';
  }

  function handleClear() {
    if (window.confirm('¿Borrar toda tu colección de este navegador? Esto no se puede deshacer (exporta antes si quieres conservarla).')) {
      clearAll();
    }
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Ajustes</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <label className="settings-field">
        <span>client_id de SoundCloud</span>
        <input
          type="text"
          value={settings.soundcloudClientId}
          placeholder="Necesario para resolver enlaces"
          onChange={(e) => setSettings({ soundcloudClientId: e.target.value })}
        />
        <small>
          La API pública de SoundCloud no admite registros nuevos. Usa un client_id propio si lo tienes;
          si no, el análisis por enlace puede fallar y tendrás que subir el audio manualmente o rellenar
          los datos a mano.
        </small>
      </label>

      <label className="settings-field">
        <span>Perfil de afinidad</span>
        <select value={settings.weightProfile} onChange={handleProfileChange}>
          {Object.keys(WEIGHT_PROFILES).map((k) => (
            <option key={k} value={k}>{PROFILE_LABELS[k] || k}</option>
          ))}
        </select>
        <small>Cambia qué categorías de análisis pesan más al calcular qué canciones se atraen en el mapa.</small>
      </label>

      <div className="settings-field">
        <span>Datos (localStorage)</span>
        <div className="settings-actions">
          <button onClick={exportData}>⬇️ Exportar JSON</button>
          <label className="file-btn">
            ⬆️ Importar JSON
            <input type="file" accept="application/json" hidden onChange={handleImport} />
          </label>
        </div>
        <small>Todo vive solo en este navegador. Exporta regularmente para tener una copia de seguridad.</small>
      </div>

      <button className="danger-btn" onClick={handleClear}>Borrar toda la colección</button>
    </div>
  );
}
