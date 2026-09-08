// Integración con SoundCloud. No hay backend propio: todo se llama directo
// desde el cliente.
//
// Vía principal (por defecto, sin configuración): el endpoint público de
// oEmbed (`soundcloud.com/oembed`) — es un estándar abierto pensado para que
// cualquier sitio pueda incrustar el reproductor, no requiere client_id ni
// autenticación de ningún tipo. Con esto basta para añadir un track solo
// pegando el enlace: título, artista y carátula. No da tags/género ni acceso
// al audio, así que la clasificación de ese track dependerá del título y,
// si no hay señal, caerá en la estimación por hash (ver genreTaxonomy.js).
//
// Vía opcional (mejora, requiere client_id en Ajustes): la API v2 no
// oficial de SoundCloud, que si funciona añade género/tags/waveform y el
// stream de audio real para el análisis DSP completo. El client_id no
// oficial puede caducar sin aviso — por eso es opcional, no obligatorio.

const DEFAULT_CLIENT_ID = '';

export function isSoundCloudUrl(url) {
  try {
    const u = new URL(url);
    return /soundcloud\.com$/i.test(u.hostname.replace(/^www\./, '')) || u.hostname.endsWith('soundcloud.com');
  } catch {
    return false;
  }
}

function stableHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/** Vía principal: oEmbed público, sin client_id. */
async function resolveViaOEmbed(url) {
  const endpoint = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  let res;
  try {
    res = await fetch(endpoint);
  } catch (e) {
    throw new SoundCloudError('NETWORK', 'No se pudo contactar el oEmbed público de SoundCloud (posible bloqueo de red o CORS).', e);
  }
  if (!res.ok) {
    throw new SoundCloudError('HTTP', `oEmbed respondió ${res.status}. El track puede ser privado o no existir.`);
  }
  const data = await res.json();
  if (data.type && data.type !== 'rich' && data.type !== 'video') {
    throw new SoundCloudError('NOT_A_TRACK', 'El enlace no parece ser un track individual soportado por oEmbed.');
  }
  return {
    id: `sc-${stableHash(url)}`,
    soundcloudUrl: url,
    title: data.title || 'Sin título',
    artist: data.author_name || 'Desconocido',
    artworkUrl: data.thumbnail_url || null,
    durationMs: null,
    rawGenreTag: '',
    rawTags: [],
    description: '',
    playbackCount: 0,
    likesCount: 0,
    createdAt: null,
    bpmDeclared: null,
    waveformUrl: null,
    media: null,
    _raw: { source: 'oembed' },
  };
}

/** Vía opcional: API v2 no oficial (requiere client_id), da metadatos ricos
 * (género, tags, waveform) y la info necesaria para descargar el stream. */
async function resolveViaApi(url, clientId) {
  const endpoint = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${encodeURIComponent(clientId)}`;
  let res;
  try {
    res = await fetch(endpoint);
  } catch (e) {
    throw new SoundCloudError('NETWORK', 'No se pudo contactar la API de SoundCloud (posible bloqueo CORS o de red).', e);
  }
  if (!res.ok) {
    throw new SoundCloudError('HTTP', `SoundCloud respondió ${res.status}. El client_id puede haber caducado o el track no es accesible.`);
  }
  const data = await res.json();
  if (data.kind !== 'track') {
    throw new SoundCloudError('NOT_A_TRACK', 'El enlace no es una pista individual (¿playlist o usuario?). De momento solo se soportan tracks.');
  }
  return normalizeApiTrackMeta(data);
}

function normalizeApiTrackMeta(data) {
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
    _raw: { source: 'api', id: data.id },
  };
}

/**
 * Resuelve un enlace de SoundCloud a metadatos de track. Funciona sin
 * ninguna configuración (oEmbed). Si hay un client_id en Ajustes, además
 * intenta enriquecer con la API v2 (género/tags/waveform/stream real); si
 * esa vía falla pero oEmbed funcionó, se sigue con los datos de oEmbed en
 * vez de fallar del todo.
 */
export async function resolveTrack(url, clientId) {
  const cid = clientId || DEFAULT_CLIENT_ID;
  let base = null;
  let baseError = null;
  try {
    base = await resolveViaOEmbed(url);
  } catch (e) {
    baseError = e;
  }

  if (cid) {
    try {
      const rich = await resolveViaApi(url, cid);
      // el id "rico" (numérico real) es mejor para deduplicar/pedir el stream
      return { ...(base || {}), ...rich };
    } catch (apiError) {
      if (base) return base; // oEmbed sí funcionó, seguimos con eso
      throw apiError;
    }
  }

  if (base) return base;
  throw baseError;
}

export async function fetchStreamArrayBuffer(trackMeta, clientId) {
  const cid = clientId || DEFAULT_CLIENT_ID;
  const progressive = trackMeta.media?.transcodings?.find((t) => t.format?.protocol === 'progressive');
  if (!progressive) {
    throw new SoundCloudError('NO_STREAM', 'Este track no expone un stream progresivo accesible (sin client_id, o requiere Go+/está restringido).');
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
