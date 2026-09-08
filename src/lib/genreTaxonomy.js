// Taxonomía curada a mano (editable) estilo Every Noise. Clasificación por
// coincidencia de keywords + reglas sobre el análisis DSP. Nada de IA.

export const TAXONOMY = {
  Techno: {
    hue: 260,
    keywords: ['techno'],
    subgenres: {
      'Peak Time / Driving Techno': ['driving', 'peak time', 'hard techno', 'banger', 'raw techno'],
      'Melodic Techno': ['melodic techno', 'afterlife', 'emotional techno'],
      'Dub Techno': ['dub techno', 'chain reaction', 'deep dub'],
      'Minimal Techno': ['minimal', 'microhouse', 'minimal techno'],
      'Industrial Techno': ['industrial techno', 'ebm', 'warehouse'],
    },
  },
  House: {
    hue: 200,
    keywords: ['house'],
    subgenres: {
      'Deep House': ['deep house'],
      'Tech House': ['tech house'],
      'Afro House': ['afro house', 'amapiano'],
      'Progressive House': ['progressive house'],
      'Funky / Soulful House': ['funky house', 'soulful house', 'disco house'],
      'Bass House': ['bass house', 'g-house'],
    },
  },
  'Drum & Bass': {
    hue: 140,
    keywords: ['drum and bass', 'dnb', 'drum & bass', 'jungle'],
    subgenres: {
      Liquid: ['liquid dnb', 'liquid funk'],
      Neurofunk: ['neurofunk', 'neuro'],
      Jungle: ['jungle', 'ragga jungle'],
      Jump_up: ['jump up'],
    },
  },
  Dubstep: {
    hue: 100,
    keywords: ['dubstep'],
    subgenres: {
      Riddim: ['riddim'],
      Melodic_Dubstep: ['melodic dubstep', 'future riddim'],
      Brostep: ['brostep'],
    },
  },
  Trap: {
    hue: 20,
    keywords: ['trap'],
    subgenres: {
      Hybrid_Trap: ['hybrid trap'],
      Latin_Trap: ['trap latino', 'latin trap'],
      Trap_Soul: ['trap soul'],
    },
  },
  'Hip-Hop': {
    hue: 30,
    keywords: ['hip hop', 'hip-hop', 'rap'],
    subgenres: {
      Boom_Bap: ['boom bap'],
      Lofi_HipHop: ['lofi', 'lo-fi', 'chillhop'],
      Drill: ['drill'],
      Cloud_Rap: ['cloud rap'],
    },
  },
  Pop: {
    hue: 330,
    keywords: ['pop'],
    subgenres: {
      Synth_Pop: ['synthpop', 'synth pop'],
      Indie_Pop: ['indie pop'],
      Dance_Pop: ['dance pop'],
      Hyperpop: ['hyperpop'],
    },
  },
  Reggaeton: {
    hue: 350,
    keywords: ['reggaeton', 'reggaetón'],
    subgenres: {
      Perreo: ['perreo'],
      Reggaeton_Melodico: ['reggaeton romantico', 'melodic reggaeton'],
      Dembow: ['dembow'],
    },
  },
  Ambient: {
    hue: 210,
    keywords: ['ambient'],
    subgenres: {
      Dark_Ambient: ['dark ambient'],
      Drone: ['drone'],
      Chillout: ['chillout', 'downtempo'],
    },
  },
  Indie: {
    hue: 40,
    keywords: ['indie', 'alternative'],
    subgenres: {
      Indie_Rock: ['indie rock'],
      Indie_Folk: ['indie folk'],
      Bedroom_Pop: ['bedroom pop'],
    },
  },
  'Drum-less / Experimental': {
    hue: 280,
    keywords: ['experimental', 'idm', 'glitch'],
    subgenres: {
      IDM: ['idm'],
      Glitch: ['glitch'],
      Noise: ['noise'],
    },
  },
};

function normalize(text) {
  return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

  // Refuerzo con perfil de audio si hay análisis y hubo match de género pero no de subgénero
  if (analysis && best.genre && !best.subgenre) {
    const { rhythm, spectrum, vocals } = analysis;
    if (best.genre === 'House' || best.genre === 'Techno') {
      const bassHeavy = spectrum?.bands?.bass?.mean > spectrum?.bands?.brilliance?.mean;
      if (rhythm?.bpm >= 120 && rhythm?.bpm <= 128 && bassHeavy) {
        best.subgenre = best.genre === 'House' ? 'Deep House' : 'Minimal Techno';
        confidence = Math.max(confidence, 0.5);
      } else if (rhythm?.bpm > 135) {
        best.subgenre = 'Peak Time / Driving Techno';
        confidence = Math.max(confidence, 0.5);
      }
    }
    if (vocals?.isLikelyInstrumental === false && best.genre === 'Hip-Hop' && !best.subgenre) {
      best.subgenre = 'Boom_Bap';
    }
  }

  if (!best.genre) {
    return { primary: 'Sin clasificar', subgenre: null, confidence: 0, matchedKeywords: [], hue: 0 };
  }

  return {
    primary: best.genre,
    subgenre: best.subgenre,
    confidence,
    matchedKeywords: best.matched,
    hue: TAXONOMY[best.genre].hue,
  };
}

export function listAllGenres() {
  return Object.keys(TAXONOMY);
}
