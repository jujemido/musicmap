// Taxonomía curada a mano, estilo Every Noise, con foco muy fuerte en
// electrónica: ~30 macro-géneros y ~250 subgéneros con sus keywords típicas
// (tags de SoundCloud/Beatport/Discogs). Clasificación 100% por reglas
// (keyword matching + heurísticas sobre el análisis DSP) — nada de IA.
//
// Estructura: TAXONOMY[genero] = { hue, keywords: [...], subgenres: { nombre: [keywords] } }
// El color final de un track es hue(género) + un pequeño offset determinista
// por subgénero, para que cada subgénero tenga su propio matiz dentro de la
// familia de color de su género (igual que en Every Noise).

export const TAXONOMY = {
  // ---------------------------------------------------------------------
  // TECHNO (familia violeta/azul)
  // ---------------------------------------------------------------------
  Techno: {
    hue: 262,
    keywords: ['techno'],
    subgenres: {
      'Peak Time / Driving Techno': ['driving techno', 'peak time', 'banger', 'club techno'],
      'Melodic Techno': ['melodic techno', 'afterlife', 'emotional techno', 'organic techno'],
      'Hard Techno': ['hard techno', 'raw techno', 'warehouse techno'],
      'Industrial Techno': ['industrial techno', 'ebm techno', 'berlin techno'],
      'Dub Techno': ['dub techno', 'chain reaction', 'deep dub techno'],
      'Minimal Techno': ['minimal techno', 'microhouse', 'minimal'],
      'Acid Techno': ['acid techno', 'tb-303', '303 acid'],
      'Detroit Techno': ['detroit techno', 'motor city'],
      'Hypnotic Techno': ['hypnotic techno', 'trippy techno'],
      Schranz: ['schranz'],
      'Ambient Techno': ['ambient techno', 'atmospheric techno'],
      'Techno Trance': ['techno trance', 'trancey techno'],
      'Rave / Old School Techno': ['oldschool techno', 'rave techno', '90s techno'],
      'Colombian / Latin Techno': ['guaracha', 'aleteo', 'latin techno'],
    },
  },

  // ---------------------------------------------------------------------
  // HOUSE (familia azul cian)
  // ---------------------------------------------------------------------
  House: {
    hue: 198,
    keywords: ['house'],
    subgenres: {
      'Deep House': ['deep house'],
      'Tech House': ['tech house'],
      'Progressive House': ['progressive house'],
      'Afro House': ['afro house'],
      Amapiano: ['amapiano', 'yanos'],
      'Tribal House': ['tribal house'],
      'Funky House': ['funky house'],
      'Soulful House': ['soulful house'],
      'Disco House': ['disco house'],
      'Electro House': ['electro house'],
      'Bass House': ['bass house', 'g-house'],
      'Future House': ['future house'],
      'Chicago House': ['chicago house', 'jack house'],
      'Acid House': ['acid house'],
      'Slap House': ['slap house'],
      'Organic House': ['organic house', 'downtempo house'],
      'Lo-fi House': ['lofi house', 'lo-fi house'],
      'Vocal House': ['vocal house', 'diva house'],
      'Jackin House': ['jackin house'],
      'Melodic House': ['melodic house'],
      'Piano House': ['piano house'],
      'UK Bass House': ['uk bass house'],
      'Baile House': ['baile house', 'brazilian bass'],
    },
  },

  // ---------------------------------------------------------------------
  // TRANCE (familia azul-violeta)
  // ---------------------------------------------------------------------
  Trance: {
    hue: 235,
    keywords: ['trance'],
    subgenres: {
      'Uplifting Trance': ['uplifting trance'],
      'Progressive Trance': ['progressive trance'],
      Psytrance: ['psytrance', 'psy trance'],
      'Full-On Psytrance': ['full-on psy', 'fullon psytrance'],
      'Dark Psy': ['dark psy', 'darkpsy'],
      'Forest Psy': ['forest psy', 'forest psytrance'],
      'Goa Trance': ['goa trance'],
      'Vocal Trance': ['vocal trance'],
      'Tech Trance': ['tech trance'],
      'Hard Trance': ['hard trance'],
      'Acid Trance': ['acid trance'],
      'Balearic Trance': ['balearic trance'],
      'Melodic Trance': ['melodic trance'],
      'Deep Trance': ['deep trance'],
      'Progressive Psytrance': ['progressive psy'],
    },
  },

  // ---------------------------------------------------------------------
  // DRUM & BASS / JUNGLE (familia verde)
  // ---------------------------------------------------------------------
  'Drum & Bass': {
    hue: 142,
    keywords: ['drum and bass', 'dnb', 'drum & bass'],
    subgenres: {
      Liquid: ['liquid dnb', 'liquid funk'],
      Neurofunk: ['neurofunk', 'neuro'],
      'Jump-Up': ['jump up dnb', 'jump-up'],
      Jungle: ['jungle', 'ragga jungle'],
      Techstep: ['techstep'],
      Darkstep: ['darkstep'],
      Drumfunk: ['drumfunk'],
      Halftime: ['halftime dnb'],
      'Deep DnB': ['deep dnb', 'atmospheric dnb'],
      Autonomic: ['autonomic dnb'],
      Sambass: ['sambass'],
      Jazzstep: ['jazzstep', 'jazzy dnb'],
      Minimal_DnB: ['minimal dnb'],
    },
  },

  // ---------------------------------------------------------------------
  // DUBSTEP / BASS (familia verde-amarillo)
  // ---------------------------------------------------------------------
  Dubstep: {
    hue: 108,
    keywords: ['dubstep'],
    subgenres: {
      Riddim: ['riddim'],
      'Melodic Dubstep': ['melodic dubstep', 'future riddim'],
      Brostep: ['brostep'],
      Deathstep: ['deathstep'],
      Tearout: ['tearout'],
      Chillstep: ['chillstep'],
      'UK Dubstep': ['uk dubstep', 'dub-influenced dubstep'],
      'Halftime Bass': ['halftime bass'],
      Colour_Bass: ['colour bass', 'color bass'],
    },
  },

  // ---------------------------------------------------------------------
  // BASS / TRAP / FOOTWORK (familia naranja)
  // ---------------------------------------------------------------------
  'Bass / Trap Music': {
    hue: 24,
    keywords: ['trap', 'bass music'],
    subgenres: {
      'Hybrid Trap': ['hybrid trap'],
      'Festival Trap': ['festival trap'],
      'Wave / Soundcloud Trap': ['wave trap', 'soundcloud trap'],
      'Future Bass': ['future bass'],
      Complextro: ['complextro'],
      Moombahton: ['moombahton'],
      'Jersey Club': ['jersey club'],
      'Baltimore Club': ['baltimore club'],
      'Footwork / Juke': ['footwork', 'juke'],
      'Ghetto House': ['ghetto house'],
      'UK Bass': ['uk bass'],
      Wonky: ['wonky'],
    },
  },

  // ---------------------------------------------------------------------
  // PHONK (propio, muy en auge)
  // ---------------------------------------------------------------------
  Phonk: {
    hue: 12,
    keywords: ['phonk'],
    subgenres: {
      'Drift Phonk': ['drift phonk'],
      'Memphis Phonk': ['memphis phonk', 'memphis rap'],
      'House Phonk': ['house phonk', 'phonk house'],
      'Brazilian Phonk': ['brazilian phonk', 'phonk brasil'],
      'Aggressive Phonk': ['aggressive phonk', 'dark phonk'],
    },
  },

  // ---------------------------------------------------------------------
  // HARDCORE / HARD DANCE (familia roja)
  // ---------------------------------------------------------------------
  'Hardcore / Hard Dance': {
    hue: 355,
    keywords: ['hardcore', 'hard dance'],
    subgenres: {
      Gabber: ['gabber'],
      'Uptempo Hardcore': ['uptempo hardcore', 'uptempo'],
      Hardstyle: ['hardstyle'],
      Rawstyle: ['rawstyle'],
      Frenchcore: ['frenchcore'],
      Speedcore: ['speedcore'],
      'Happy Hardcore': ['happy hardcore'],
      'UK Hardcore': ['uk hardcore'],
      Terrorcore: ['terrorcore'],
      'Industrial Hardcore': ['industrial hardcore'],
      Freeform: ['freeform hardcore', 'freeform'],
      Euphoric_Hardstyle: ['euphoric hardstyle'],
      Raw_Hardstyle: ['raw hardstyle'],
    },
  },

  // ---------------------------------------------------------------------
  // BREAKBEAT (familia oliva)
  // ---------------------------------------------------------------------
  Breakbeat: {
    hue: 72,
    keywords: ['breakbeat', 'breaks'],
    subgenres: {
      'Big Beat': ['big beat'],
      'Nu Skool Breaks': ['nu skool breaks', 'nuskool breaks'],
      'Broken Beat': ['broken beat', 'bruk'],
      'Florida Breaks': ['florida breaks'],
      'Progressive Breaks': ['progressive breaks'],
      'Electro Breaks': ['electro breaks'],
      Acid_Breaks: ['acid breaks'],
    },
  },

  // ---------------------------------------------------------------------
  // UK GARAGE / BASSLINE (familia turquesa)
  // ---------------------------------------------------------------------
  'UK Garage': {
    hue: 175,
    keywords: ['uk garage', 'ukg'],
    subgenres: {
      '2-Step': ['2-step', '2 step garage'],
      'Speed Garage': ['speed garage'],
      Bassline: ['bassline', 'niche bassline'],
      'Future Garage': ['future garage'],
      'Deep Garage': ['deep garage'],
      'UKG Revival': ['ukg revival', 'modern ukg'],
    },
  },

  // ---------------------------------------------------------------------
  // ELECTRO (familia índigo)
  // ---------------------------------------------------------------------
  Electro: {
    hue: 250,
    keywords: ['electro'],
    subgenres: {
      'Electro Funk': ['electro funk', 'electrofunk'],
      'Egyptian Electro': ['egyptian electro'],
      'Minimal Electro': ['minimal electro'],
      'Nu Electro': ['nu electro'],
      'Dark Electro': ['dark electro'],
      Bass_Electro: ['bass electro'],
    },
  },

  // ---------------------------------------------------------------------
  // IDM / EXPERIMENTAL ELECTRONIC (familia púrpura)
  // ---------------------------------------------------------------------
  'IDM / Experimental': {
    hue: 285,
    keywords: ['idm', 'experimental electronic'],
    subgenres: {
      IDM: ['idm', 'intelligent dance music'],
      Glitch: ['glitch'],
      Braindance: ['braindance'],
      Modular_Synth: ['modular synth', 'eurorack'],
      Generative: ['generative music', 'algorithmic'],
      Noise: ['noise music', 'harsh noise'],
      Musique_Concrete: ['musique concrete', 'acousmatic'],
    },
  },

  // ---------------------------------------------------------------------
  // AMBIENT / DOWNTEMPO (familia azul grisáceo)
  // ---------------------------------------------------------------------
  'Ambient / Downtempo': {
    hue: 212,
    keywords: ['ambient', 'downtempo'],
    subgenres: {
      'Dark Ambient': ['dark ambient'],
      Drone: ['drone'],
      Chillout: ['chillout'],
      Downtempo: ['downtempo'],
      'Berlin School': ['berlin school'],
      'Space Ambient': ['space ambient', 'spacemusic'],
      Illbient: ['illbient'],
      'New Age': ['new age'],
      Trip_Hop: ['trip hop', 'trip-hop'],
      Lowercase: ['lowercase ambient'],
    },
  },

  // ---------------------------------------------------------------------
  // SYNTHWAVE / RETRO ELECTRONIC (familia magenta)
  // ---------------------------------------------------------------------
  Synthwave: {
    hue: 305,
    keywords: ['synthwave', 'retrowave'],
    subgenres: {
      Retrowave: ['retrowave'],
      Darksynth: ['darksynth'],
      Outrun: ['outrun'],
      Vaporwave: ['vaporwave'],
      Chillsynth: ['chillsynth'],
      Cyberpunk_Synth: ['cyberpunk synth', 'cyberpunk'],
      Nu_Disco_Synth: ['synth disco'],
    },
  },

  // ---------------------------------------------------------------------
  // INDUSTRIAL / EBM (familia roja oscura)
  // ---------------------------------------------------------------------
  'Industrial / EBM': {
    hue: 340,
    keywords: ['industrial', 'ebm'],
    subgenres: {
      EBM: ['ebm', 'electronic body music'],
      Industrial: ['industrial music'],
      Power_Noise: ['power noise', 'powernoise'],
      Rhythmic_Noise: ['rhythmic noise'],
      Dark_Electro_Industrial: ['dark electro'],
      Aggrotech: ['aggrotech'],
      Futurepop: ['futurepop'],
    },
  },

  // ---------------------------------------------------------------------
  // HYPERPOP / DIGICORE (familia rosa)
  // ---------------------------------------------------------------------
  'Hyperpop / Digicore': {
    hue: 318,
    keywords: ['hyperpop', 'digicore'],
    subgenres: {
      Hyperpop: ['hyperpop'],
      Digicore: ['digicore'],
      Glitchcore: ['glitchcore'],
      PC_Music: ['pc music'],
      Nightcore: ['nightcore'],
    },
  },

  // ---------------------------------------------------------------------
  // DISCO / NU-DISCO (familia dorada)
  // ---------------------------------------------------------------------
  Disco: {
    hue: 44,
    keywords: ['disco'],
    subgenres: {
      'Nu-Disco': ['nu-disco', 'nu disco'],
      'Italo Disco': ['italo disco'],
      'Space Disco': ['space disco'],
      Boogie: ['boogie'],
      Cosmic_Disco: ['cosmic disco'],
    },
  },

  // ---------------------------------------------------------------------
  // GÉNEROS NO ELECTRÓNICOS (menos exhaustivos, mismo mecanismo)
  // ---------------------------------------------------------------------
  'Hip-Hop': {
    hue: 30,
    keywords: ['hip hop', 'hip-hop', 'rap'],
    subgenres: {
      Boom_Bap: ['boom bap'],
      Lofi_HipHop: ['lofi', 'lo-fi', 'chillhop'],
      Drill: ['drill'],
      Cloud_Rap: ['cloud rap'],
      Trap_Rap: ['trap rap'],
      Conscious_HipHop: ['conscious rap'],
      Emo_Rap: ['emo rap'],
    },
  },
  Pop: {
    hue: 330,
    keywords: ['pop'],
    subgenres: {
      Synth_Pop: ['synthpop', 'synth pop'],
      Indie_Pop: ['indie pop'],
      Dance_Pop: ['dance pop'],
      Electropop: ['electropop'],
      Dream_Pop: ['dream pop'],
      Bedroom_Pop: ['bedroom pop'],
    },
  },
  Reggaeton: {
    hue: 358,
    keywords: ['reggaeton', 'reggaetón'],
    subgenres: {
      Perreo: ['perreo'],
      Reggaeton_Melodico: ['reggaeton romantico', 'melodic reggaeton'],
      Dembow: ['dembow'],
      Reggaeton_Trap: ['trapeaton'],
    },
  },
  Indie: {
    hue: 40,
    keywords: ['indie', 'alternative'],
    subgenres: {
      Indie_Rock: ['indie rock'],
      Indie_Folk: ['indie folk'],
      Indie_Electronic: ['indie electronic', 'indietronica'],
      Shoegaze: ['shoegaze'],
    },
  },
  'Rock / Metal': {
    hue: 8,
    keywords: ['rock', 'metal'],
    subgenres: {
      Alternative_Rock: ['alternative rock'],
      Post_Rock: ['post rock', 'post-rock'],
      Punk: ['punk'],
      Metalcore: ['metalcore'],
      Industrial_Rock: ['industrial rock'],
    },
  },
  'Funk / Soul': {
    hue: 50,
    keywords: ['funk', 'soul'],
    subgenres: {
      Nu_Funk: ['nu funk'],
      Neo_Soul: ['neo soul'],
      Gfunk: ['g-funk', 'g funk'],
    },
  },
  'Jazz / Fusion': {
    hue: 60,
    keywords: ['jazz'],
    subgenres: {
      Nu_Jazz: ['nu jazz'],
      Jazz_Fusion: ['jazz fusion'],
      Jazztronica: ['jazztronica'],
    },
  },
  'R&B': {
    hue: 15,
    keywords: ['r&b', 'rnb'],
    subgenres: {
      Alt_RnB: ['alternative r&b'],
      Future_RnB: ['future r&b', 'futuristic rnb'],
    },
  },
  'World / Folk': {
    hue: 90,
    keywords: ['world music', 'folk'],
    subgenres: {
      Afrobeat: ['afrobeat', 'afrobeats'],
      Cumbia: ['cumbia'],
      Balkan: ['balkan'],
    },
  },
};

function normalize(text) {
  return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Offset de matiz determinista por subgénero (para que cada uno tenga su
// propio color dentro de la familia del género, sin física ni azar real).
function subHueOffset(genreName, subName) {
  const genreDef = TAXONOMY[genreName];
  const names = Object.keys(genreDef.subgenres);
  const idx = names.indexOf(subName);
  if (idx < 0) return 0;
  const span = 30; // grados de variación total dentro de la familia
  return -span / 2 + (span * idx) / Math.max(1, names.length - 1);
}

/**
 * Clasifica un track por keywords (tags, título, género declarado) y
 * refuerza/desempata con el perfil de audio (BPM, bandas, ratio vocal).
 */
export function classifyGenre({ rawGenreTag, rawTags = [], title = '' }, analysis = null) {
  const haystack = normalize([rawGenreTag, ...rawTags, title].filter(Boolean).join(' '));

  let best = { genre: null, subgenre: null, score: 0, matched: [] };

  for (const [genreName, genreDef] of Object.entries(TAXONOMY)) {
    let genreScore = 0;
    const matched = [];
    for (const kw of genreDef.keywords) {
      if (haystack.includes(kw)) { genreScore += 2; matched.push(kw); }
    }
    for (const [subName, subKeywords] of Object.entries(genreDef.subgenres)) {
      let subScore = genreScore;
      const subMatched = [...matched];
      for (const kw of subKeywords) {
        if (haystack.includes(kw)) { subScore += 3; subMatched.push(kw); }
      }
      if (subScore > best.score) {
        best = { genre: genreName, subgenre: subScore > genreScore ? subName : null, score: subScore, matched: subMatched };
      }
    }
  }

  let confidence = Math.min(1, best.score / 6);

  // Refuerzo con perfil de audio si hubo match de género pero no de subgénero.
  if (analysis && best.genre && !best.subgenre) {
    const { rhythm, spectrum, vocals } = analysis;
    const bassHeavy = spectrum?.bands?.bass?.mean > spectrum?.bands?.brilliance?.mean;
    const bpm = rhythm?.bpm || 0;

    const genreDef = TAXONOMY[best.genre];
    const subNames = Object.keys(genreDef.subgenres);

    if (best.genre === 'House' && subNames.includes('Deep House')) {
      if (bpm >= 118 && bpm <= 124 && bassHeavy) { best.subgenre = 'Deep House'; confidence = Math.max(confidence, 0.5); }
      else if (bpm > 128) { best.subgenre = 'Tech House'; confidence = Math.max(confidence, 0.45); }
    } else if (best.genre === 'Techno') {
      if (bpm >= 120 && bpm <= 128 && bassHeavy) { best.subgenre = 'Minimal Techno'; confidence = Math.max(confidence, 0.45); }
      else if (bpm > 138) { best.subgenre = 'Hard Techno'; confidence = Math.max(confidence, 0.5); }
      else if (bpm >= 128 && bpm <= 138) { best.subgenre = 'Peak Time / Driving Techno'; confidence = Math.max(confidence, 0.5); }
    } else if (best.genre === 'Drum & Bass') {
      if (bpm >= 160 && bpm <= 180) { best.subgenre = vocals?.isLikelyInstrumental ? 'Neurofunk' : 'Liquid'; confidence = Math.max(confidence, 0.4); }
    } else if (best.genre === 'Hardcore / Hard Dance') {
      if (bpm > 180) { best.subgenre = 'Uptempo Hardcore'; confidence = Math.max(confidence, 0.5); }
      else if (bpm >= 150 && bpm <= 160) { best.subgenre = 'Hardstyle'; confidence = Math.max(confidence, 0.45); }
    } else if (best.genre === 'Trance') {
      if (bpm >= 138 && bpm <= 145) { best.subgenre = 'Uplifting Trance'; confidence = Math.max(confidence, 0.4); }
      else if (bpm > 145) { best.subgenre = 'Psytrance'; confidence = Math.max(confidence, 0.4); }
    } else if (best.genre === 'Hip-Hop' && vocals?.isLikelyInstrumental === false) {
      best.subgenre = 'Boom_Bap';
    }
  }

  if (!best.genre) {
    return { primary: 'Sin clasificar', subgenre: null, confidence: 0, matchedKeywords: [], hue: 0 };
  }

  const baseHue = TAXONOMY[best.genre].hue;
  const offset = best.subgenre ? subHueOffset(best.genre, best.subgenre) : 0;
  const hue = ((baseHue + offset) % 360 + 360) % 360;

  return {
    primary: best.genre,
    subgenre: best.subgenre ? best.subgenre.replace(/_/g, ' ') : null,
    confidence,
    matchedKeywords: best.matched,
    hue,
  };
}

export function listAllGenres() {
  return Object.keys(TAXONOMY);
}

export function listAllSubgenres() {
  const out = [];
  for (const [genre, def] of Object.entries(TAXONOMY)) {
    for (const sub of Object.keys(def.subgenres)) out.push({ genre, subgenre: sub.replace(/_/g, ' ') });
  }
  return out;
}

export function taxonomyStats() {
  const genres = Object.keys(TAXONOMY).length;
  const subgenres = Object.values(TAXONOMY).reduce((sum, def) => sum + Object.keys(def.subgenres).length, 0);
  return { genres, subgenres, total: genres + subgenres };
}
