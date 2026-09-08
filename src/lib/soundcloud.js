// Integración con SoundCloud. No hay backend propio: todo se llama directo
// desde el cliente. El client_id no oficial puede caducar; se puede sustituir
// desde Ajustes. Si el resolve o el stream fallan (CORS/ToS/track privado),
// se degrada a entrada manual y/o análisis por fichero de audio local.

const DEFAULT_CLIENT_ID = ''; // el usuario debe indicar el suyo en Ajustes

export function isSoundCloudUrl(url) {
  try {
    const u = new URL(url);
    return /soundcloud\.com$/i.test(u.hostname.replace(/^www\./, '')) || u.hostname.endsWith('soundcloud.com');
  } catch {
    return false;
  }
}

export async function resolveTrack(url, clientId) {
  const cid = clientId || DEFAULT_CLIENT_ID;
  if (!cid) {
    throw new SoundCloudError('NO_CLIENT_ID', 'No hay client_id configurado. Añádelo en Ajustes o introduce los datos manualmente.');
  }
  const endpoint = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${encodeURIComponent(cid)}`;
  let res;
  try {
    res = await fetch(endpoint);
  } catch (e) {
    throw new SoundCloudError('NETWORK', 'No se pudo contactar con SoundCloud (posible bloqueo CORS o de red).', e);
  }
  if (!res.ok) {
    throw new SoundCloudError('HTTP', `SoundCloud respondió ${res.status}. El client_id puede haber caducado o el track no es accesible.`);
  }
  const data = await res.json();
  if (data.kind !== 'track') {
    throw new SoundCloudError('NOT_A_TRACK', 'El enlace no es una pista individual (¿playlist o usuario?). De momento solo se soportan tracks.');
  }
  return normalizeTrackMeta(data);
}

function normalizeTrackMeta(data) {
  return {
    id: `sc-${data.id}`,
    soundcloudUrl: data.permalink_url,
    title: data.title,
    artist: data.user?.username || 'Desconocido',
    artworkUrl: data.artwork_url || data.user?.avatar_url || null,
    durationMs: data.duration,
    rawGenreTag: data.genre || '',
    rawTags: (data.tag_list || '').split(' ').map((t) => t.replace(/"/g, '')).filter(Boolean),
    description: data.description || '',
    playbackCount: data.playback_count || 0,
    likesCount: data.likes_count || data.favoritings_count || 0,
    createdAt: data.created_at || null,
    bpmDeclared: data.bpm || null,
    waveformUrl: data.waveform_url || null,
    media: data.media || null,
    _raw: { id: data.id },
  };
}

export async function fetchStreamArrayBuffer(trackMeta, clientId) {
  const cid = clientId || DEFAULT_CLIENT_ID;
  const progressive = trackMeta.media?.transcodings?.find((t) => t.format?.protocol === 'progressive');
  if (!progressive) {
    throw new SoundCloudError('NO_STREAM', 'Este track no expone un stream progresivo accesible (puede requerir Go+ o estar restringido).');
  }
  let streamInfoRes;
  try {
    streamInfoRes = await fetch(`${progressive.url}?client_id=${encodeURIComponent(cid)}`);
  } catch (e) {
    throw new SoundCloudError('NETWORK', 'Fallo de red al pedir la URL de streaming.', e);
  }
  if (!streamInfoRes.ok) throw new SoundCloudError('HTTP', `No se pudo obtener la URL de stream (${streamInfoRes.status}).`);
  const { url: mp3Url } = await streamInfoRes.json();

  let audioRes;
  try {
    audioRes = await fetch(mp3Url);
  } catch (e) {
    throw new SoundCloudError('CORS', 'El CDN de audio bloqueó la petición (CORS). Prueba a subir el archivo de audio manualmente para el análisis completo.', e);
  }
  if (!audioRes.ok) throw new SoundCloudError('HTTP', `Descarga de audio falló (${audioRes.status}).`);
  return audioRes.arrayBuffer();
}

export async function fetchWaveformPeaks(waveformUrl) {
  if (!waveformUrl) return null;
  try {
    const res = await fetch(waveformUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return data.samples || null;
  } catch {
    return null;
  }
}

export class SoundCloudError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}
