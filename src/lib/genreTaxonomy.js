// Taxonomía curada a mano, estilo Every Noise, con foco muy fuerte y muy
// profundo en electrónica: decenas de macro-géneros y varios cientos de
// subgéneros electrónicos (con keywords típicas de Beatport/Discogs/
// SoundCloud), más un set moderado de géneros no electrónicos. Clasificación
// 100% por reglas (keyword matching + heurísticas sobre el análisis DSP de
// audio) — nada de IA, nada entrenado.
//
// Estructura: TAXONOMY[genero] = { hue, keywords: [...], subgenres: { nombre: [keywords] } }
// El color final de un track es hue(género) + un offset determinista por
// subgénero (rueda de color propia dentro de la familia), igual que en
// Every Noise.

export const TAXONOMY = {
  // =======================================================================
  // TECHNO (familia violeta)
  // =======================================================================
  Techno: {
    hue: 262,
    keywords: ['techno'],
    subgenres: {
      'Peak Time / Driving Techno': ['driving techno', 'peak time', 'banger', 'club techno'],
      'Melodic Techno': ['melodic techno', 'afterlife', 'emotional techno', 'organic techno'],
      'Hard Techno': ['hard techno', 'raw techno', 'warehouse techno'],
      'Industrial Techno': ['industrial techno', 'ebm techno', 'berlin techno'],
      'Dub Techno': ['dub techno', 'chain reaction', 'deep dub techno'],
      'Minimal Techno': ['minimal techno', 'microhouse'],
      'Acid Techno': ['acid techno', 'tb-303', '303 acid'],
      'Detroit Techno': ['detroit techno', 'motor city'],
      'Hypnotic Techno': ['hypnotic techno', 'trippy techno'],
      Schranz: ['schranz'],
      'Ambient Techno': ['ambient techno', 'atmospheric techno'],
      'Techno Trance': ['techno trance', 'trancey techno'],
      'Rave / Old School Techno': ['oldschool techno', 'rave techno', '90s techno'],
      'Latin / Guaracha Techno': ['guaracha', 'aleteo', 'latin techno'],
      'Free Tekno': ['free tekno', 'freetekno', 'teknival'],
      'Hardgroove Techno': ['hardgroove'],
      'Trance Techno Crossover': ['trantech'],
      'Dungeon Techno': ['dungeon techno'],
      'Deep Techno': ['deep techno'],
      'Progressive Techno': ['progressive techno'],
      'Broken Techno': ['broken techno'],
      'Percussive Techno': ['percussive techno', 'tribal techno'],
      'Cinematic Techno': ['cinematic techno'],
      'UK Techno': ['uk techno'],
      'Warehouse Rave': ['warehouse rave'],
      'Colored Noise Techno': ['tech noise'],
      'Slamming Techno': ['slamming techno'],
      'Retro Techno': ['retro techno', 'oldskool techno'],
      'Modular Techno': ['modular techno'],
      'Afro Techno': ['afro techno'],
      'Belgian Techno': ['belgian techno'],
      'Berlin Minimal': ['berlin minimal'],
      'Tribal Techno': ['tribal techno'],
      'Ghosttrap Techno': ['ghosttrap'],
      'Trance-Techno Peaktime': ['peak trance techno'],
      'Wave Techno': ['wavetechno'],
      'Dark Disco Techno': ['dark disco techno'],
      'Analog Techno': ['analog techno'],
      'Breaks Techno': ['breakstechno', 'techno breaks'],
      'Kick-Driven Techno': ['kickdriven techno'],
      'Spacey Techno': ['space techno'],
      'Post-Industrial Techno': ['post-industrial techno'],
      'Ravecore Techno': ['ravecore'],
      'Tunnel Techno': ['tunnel techno'],
      'Highspeed Techno': ['highspeed techno'],
    },
  },

  // =======================================================================
  // HOUSE (familia azul cian)
  // =======================================================================
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
      'Organic House': ['organic house'],
      'Lo-fi House': ['lofi house', 'lo-fi house'],
      'Vocal House': ['vocal house', 'diva house'],
      'Jackin House': ['jackin house'],
      'Melodic House': ['melodic house'],
      'Piano House': ['piano house'],
      'UK Bass House': ['uk bass house'],
      'Baile House': ['baile house', 'brazilian bass'],
      'Tropical House': ['tropical house'],
      'Deep Tech': ['deep tech'],
      'Future Rave': ['future rave'],
      'Big Room House': ['big room house', 'big room'],
      'Melbourne Bounce': ['melbourne bounce'],
      'Balearic House': ['balearic house'],
      'Filter House': ['filter house', 'french touch'],
      'Ghetto House': ['ghetto house'],
      'Micro House': ['microhouse'],
      'Outsider House': ['outsider house'],
      'Kwaito': ['kwaito'],
      'Latin House': ['latin house'],
      'Hard House': ['hard house'],
      'NRG / Hi-NRG House': ['hi-nrg', 'hi nrg'],
      'Speed House': ['speed house'],
      'Dark Disco House': ['dark disco'],
      'Percussive House': ['percussive house'],
      'Deep Progressive': ['deep progressive'],
      'House Techno Hybrid': ['tech-house crossover'],
      'Afro Tech': ['afro tech'],
      'Latin House': ['latin house rhythm'],
      'Rominimal': ['rominimal'],
      'Dutch House': ['dutch house'],
      'Fidget House': ['fidget house'],
      'Electro-Disco House': ['electro disco house'],
      'Diva House': ['diva house classic'],
      'Garage House': ['garage house'],
      'Raw House': ['raw house'],
      'Broken House': ['broken house'],
      'Spiritual House': ['spiritual house'],
      'Sample House': ['sample house', 'chop house'],
      'Tech Trance House': ['tech trance house'],
      'French House': ['french house'],
      'UK Deep House': ['uk deep house'],
      'Vocal Deep House': ['vocal deep house'],
      'Percussion House': ['percussion house'],
    },
  },

  // =======================================================================
  // TRANCE (familia azul-violeta)
  // =======================================================================
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
      'Suomisaundi': ['suomisaundi'],
      'Nitzhonot': ['nitzhonot'],
      'Zenonesque': ['zenonesque'],
      'Hi-Tech Psytrance': ['hi-tech psy', 'hitech psy'],
      'Minimal Psytrance': ['minimal psy'],
      'Twilight Psy': ['twilight psy'],
      'Morning Trance': ['morning trance'],
      'Euro Trance': ['eurotrance'],
      'Classic Trance': ['classic trance', '90s trance'],
      'Big Room Trance': ['big room trance'],
      'Orchestral Trance': ['orchestral trance'],
      'Chill Trance': ['chill trance'],
      'Neurotrance': ['neurotrance'],
      'Ambient Psy': ['ambient psy'],
      Raggatek: ['raggatek'],
      Psystep: ['psystep'],
      'Progressive Psy Twilight': ['twilight progressive'],
      'Deep Psy': ['deep psy'],
      'Zenon / Israeli Trance': ['israeli trance'],
      'German Trance': ['german trance'],
      'Dutch Trance': ['dutch trance'],
      'Vocal Uplifting': ['vocal uplifting trance'],
      'Emotional Trance': ['emotional trance'],
      'Coldharbour / Tech Uplifting': ['coldharbour sound'],
      'Psycore': ['psycore'],
      'Darkpsy Hitech': ['hitech darkpsy'],
    },
  },

  // =======================================================================
  // DRUM & BASS / JUNGLE (familia verde)
  // =======================================================================
  'Drum & Bass': {
    hue: 142,
    keywords: ['drum and bass', 'dnb', 'drum & bass'],
    subgenres: {
      Liquid: ['liquid dnb', 'liquid funk'],
      Neurofunk: ['neurofunk', 'neuro dnb', 'neuro funk'],
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
      'Minimal DnB': ['minimal dnb'],
      'Rollers / Rollers DnB': ['rollers dnb', 'dancefloor dnb'],
      Ragga_DnB: ['raggacore dnb', 'ragga dnb'],
      'Intelligent DnB': ['intelligent dnb'],
      'Hardstep DnB': ['hardstep'],
      Clownstep: ['clownstep'],
      'Dark Jungle': ['dark jungle'],
      'Ambient Jungle': ['ambient jungle'],
      'Drill n Bass': ['drill n bass', "drill'n'bass"],
      'Sound System DnB': ['sound system dnb'],
      'Circuit Bent DnB': ['circuit bent'],
      'Fusion DnB': ['fusion dnb'],
      'Old Skool Jungle': ['oldskool jungle', '93 jungle'],
      'Neurohop': ['neurohop'],
      'Deep Rollers': ['deep rollers'],
      'Liquid Funk Soul': ['liquid soul'],
      'Amen Break Jungle': ['amen jungle'],
      'Steppers DnB': ['steppers dnb'],
      'Crossbreed DnB': ['dnb crossbreed'],
      'Dark Liquid': ['dark liquid dnb'],
      'Future DnB': ['future dnb'],
    },
  },

  // =======================================================================
  // DUBSTEP / BASS CORE (familia verde-amarillo)
  // =======================================================================
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
      'UK Dubstep': ['uk dubstep'],
      'Halftime Bass': ['halftime bass'],
      'Colour Bass': ['colour bass', 'color bass'],
      Drumstep: ['drumstep'],
      'Deep Dubstep': ['deep dubstep'],
      Wonky_Dubstep: ['wonky dubstep'],
      'Post-Dubstep': ['post-dubstep', 'post dubstep'],
      'Dub-influenced Dubstep': ['dub influenced'],
      'Trap-Dubstep Hybrid': ['trapstep'],
      'Grime-Dubstep Crossover': ['grimestep'],
      'Space Bass': ['space bass'],
      'Bass Music': ['uk bass music'],
      'Purple Sound': ['purple sound bristol'],
      'Bristol Sound': ['bristol sound'],
      'Future Riddim': ['future riddim heavy'],
      'Slap Dubstep': ['slap dubstep'],
      'Screwstep': ['screwstep'],
    },
  },

  // =======================================================================
  // TRAP / BASS (familia naranja)
  // =======================================================================
  Trap: {
    hue: 24,
    keywords: ['trap'],
    subgenres: {
      'Hybrid Trap': ['hybrid trap'],
      'Festival Trap': ['festival trap'],
      'Wave / Soundcloud Trap': ['wave trap', 'soundcloud trap'],
      'Future Bass': ['future bass'],
      Complextro: ['complextro'],
      'Trap Metal': ['trap metal'],
      'Dark Trap': ['dark trap'],
      Sigilkore: ['sigilkore'],
      Vaportrap: ['vaportrap'],
      'Chill Trap': ['chill trap'],
      'Trap Soul': ['trap soul'],
      'Latin Trap': ['trap latino', 'latin trap'],
      'Cinematic Trap': ['cinematic trap'],
      'Orchestral Trap': ['orchestral trap'],
      'Trap Reggaeton Crossover': ['trapeton'],
    },
  },

  // =======================================================================
  // FOOTWORK / JUKE / GHETTO HOUSE (familia naranja-rojo)
  // =======================================================================
  'Footwork / Juke': {
    hue: 14,
    keywords: ['footwork', 'juke'],
    subgenres: {
      Footwork: ['footwork'],
      Juke: ['juke'],
      'Ghetto House': ['ghetto house'],
      'Machine Drum Footwork': ['footwork edit'],
      'Ambient Footwork': ['ambient footwork'],
      'Experimental Footwork': ['experimental footwork'],
      'Jungle Footwork Crossover': ['footwork jungle'],
      'Bop / Chicago Bop': ['chicago bop', 'bop house'],
    },
  },

  // =======================================================================
  // GLOBAL BASS / MOOMBAHTON / TROPICAL BASS (familia mostaza)
  // =======================================================================
  'Global Bass': {
    hue: 34,
    keywords: ['global bass', 'tropical bass'],
    subgenres: {
      Moombahton: ['moombahton'],
      'Moombahcore': ['moombahcore'],
      'Tropical Bass': ['tropical bass'],
      Kuduro: ['kuduro'],
      Gqom: ['gqom'],
      Shangaan_Electro: ['shangaan electro'],
      Baile_Funk: ['baile funk', 'funk carioca'],
      Dembow_Electronic: ['dembow electronico'],
      Cumbia_Electronica: ['cumbia electronica', 'digital cumbia'],
      Balkan_Bass: ['balkan bass', 'balkan beats'],
      Bhangra_Electronic: ['bhangra electronic'],
      Afrobeats_Electronic: ['afrobeats electronic', 'afro fusion'],
    },
  },

  // =======================================================================
  // JERSEY / BALTIMORE / UK CLUB (familia rojo anaranjado)
  // =======================================================================
  'Club / Ballroom': {
    hue: 4,
    keywords: ['club music', 'ballroom'],
    subgenres: {
      'Jersey Club': ['jersey club'],
      'Baltimore Club': ['baltimore club'],
      'Philly Club': ['philly club'],
      'Ballroom / Vogue': ['ballroom', 'vogue beat'],
      'UK Funky': ['uk funky'],
      Grime_Club_Crossover: ['grime club'],
      Bmore: ['bmore'],
    },
  },

  // =======================================================================
  // PHONK (propio, muy en auge)
  // =======================================================================
  Phonk: {
    hue: 12,
    keywords: ['phonk'],
    subgenres: {
      'Drift Phonk': ['drift phonk'],
      'Memphis Phonk': ['memphis phonk', 'memphis rap'],
      'House Phonk': ['house phonk', 'phonk house'],
      'Brazilian Phonk': ['brazilian phonk', 'phonk brasil'],
      'Aggressive Phonk': ['aggressive phonk', 'dark phonk'],
      'Cowbell Phonk': ['cowbell phonk'],
      'Rage Phonk': ['rage phonk'],
      'Lo-fi Phonk': ['lofi phonk'],
    },
  },

  // =======================================================================
  // HARDCORE / HARD DANCE (familia roja)
  // =======================================================================
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
      'Euphoric Hardstyle': ['euphoric hardstyle'],
      'Raw Hardstyle': ['raw hardstyle'],
      'Early Hardcore': ['early hardcore', 'oldschool hardcore'],
      Doomcore: ['doomcore'],
      Flashcore: ['flashcore'],
      Splittercore: ['splittercore'],
      Lolicore: ['lolicore'],
      Bouncy_Techno: ['bouncy techno', 'bouncy hardcore'],
      Powerstomp: ['powerstomp'],
      J_Core: ['j-core', 'jcore'],
      Crossbreed: ['crossbreed'],
      Nu_Style_Gabber: ['nu style gabber'],
      Digital_Hardcore: ['digital hardcore'],
      Breakcore: ['breakcore'],
      Hardtekk: ['hardtekk', 'tekk'],
      Jumpstyle: ['jumpstyle'],
      Trapcore: ['trapcore hardcore'],
      Hard_NRG: ['hard nrg'],
      UK_Hard_House: ['uk hard house'],
      Acidcore: ['acidcore'],
      Mainstream_Hardcore: ['mainstream hardcore'],
      Deathcore_Electronic: ['electronic deathcore'],
    },
  },

  // =======================================================================
  // BREAKBEAT (familia oliva)
  // =======================================================================
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
      'Acid Breaks': ['acid breaks'],
      'Psy Breaks': ['psy breaks', 'psybreaks'],
      'Trap Breaks': ['trap breaks'],
      'Funky Breaks': ['funky breaks'],
      'Tribal Breaks': ['tribal breaks'],
      'Rave Breaks': ['rave breaks', 'oldskool breakbeat'],
    },
  },

  // =======================================================================
  // UK GARAGE / BASSLINE / GRIME (familia turquesa)
  // =======================================================================
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
      'Sublow': ['sublow'],
      'Breakstep': ['breakstep'],
      'Grimy Garage': ['dark garage'],
      'Vocal Garage': ['vocal garage'],
    },
  },

  Grime: {
    hue: 160,
    keywords: ['grime'],
    subgenres: {
      'Classic Grime': ['classic grime', '8-bar grime'],
      'Instrumental Grime': ['instrumental grime'],
      'Eskibeat': ['eskibeat', 'eski'],
      'Sublow Grime': ['sublow grime'],
      'Grime Trap Hybrid': ['grimetrap'],
      'Wonky Grime': ['wonky grime'],
    },
  },

  // =======================================================================
  // ELECTRO (familia índigo)
  // =======================================================================
  Electro: {
    hue: 250,
    keywords: ['electro'],
    subgenres: {
      'Electro Funk': ['electro funk', 'electrofunk'],
      'Egyptian Electro': ['egyptian electro'],
      'Minimal Electro': ['minimal electro'],
      'Nu Electro': ['nu electro'],
      'Dark Electro': ['dark electro'],
      'Bass Electro': ['bass electro'],
      'Electroclash': ['electroclash'],
      'Miami Bass': ['miami bass'],
      'Ghettotech': ['ghettotech'],
      'Wave / Electro Wave': ['electrowave'],
      'Detroit Electro': ['detroit electro'],
      'Old School Electro': ['oldschool electro', '80s electro'],
    },
  },

  // =======================================================================
  // IDM / EXPERIMENTAL ELECTRONIC (familia púrpura)
  // =======================================================================
  'IDM / Experimental': {
    hue: 285,
    keywords: ['idm', 'experimental electronic'],
    subgenres: {
      IDM: ['idm', 'intelligent dance music'],
      Glitch: ['glitch'],
      Braindance: ['braindance'],
      'Modular Synth': ['modular synth', 'eurorack'],
      Generative: ['generative music', 'algorithmic'],
      Noise: ['noise music', 'harsh noise'],
      'Musique Concrète': ['musique concrete', 'acousmatic'],
      'Granular Synthesis': ['granular synthesis'],
      Microsound: ['microsound'],
      'Circuit Bending': ['circuit bending'],
      'Deconstructed Club': ['deconstructed club'],
      'Drill and Bass': ['drill and bass'],
      'Skweee': ['skweee'],
      'Plunderphonics': ['plunderphonics'],
      'Sound Art': ['sound art'],
    },
  },

  // =======================================================================
  // AMBIENT / DOWNTEMPO (familia azul grisáceo)
  // =======================================================================
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
      'Trip Hop': ['trip hop', 'trip-hop'],
      Lowercase: ['lowercase ambient'],
      'Ambient Dub': ['ambient dub'],
      'Drone Ambient': ['drone ambient'],
      'Dark Downtempo': ['dark downtempo'],
      'Psybient': ['psybient', 'psychill'],
      'Psydub': ['psydub'],
      'Ethereal Wave Ambient': ['ethereal ambient'],
      'Nature Ambient': ['field recording ambient'],
      'Sleep / Drone Music': ['sleep music', 'sound bath'],
    },
  },

  // =======================================================================
  // SYNTHWAVE / RETRO ELECTRONIC (familia magenta)
  // =======================================================================
  Synthwave: {
    hue: 305,
    keywords: ['synthwave', 'retrowave'],
    subgenres: {
      Retrowave: ['retrowave'],
      Darksynth: ['darksynth'],
      Outrun: ['outrun'],
      Chillsynth: ['chillsynth'],
      'Cyberpunk Synth': ['cyberpunk synth', 'cyberpunk'],
      'Synth Disco': ['synth disco'],
      Spacesynth: ['spacesynth'],
      Horrorsynth: ['horrorsynth'],
      Dreamwave: ['dreamwave'],
      Futuresynth: ['futuresynth'],
      Italo_Synth: ['italo synth'],
      Synthpop_Retro: ['80s synthpop'],
    },
  },

  Vaporwave: {
    hue: 292,
    keywords: ['vaporwave'],
    subgenres: {
      'Classic Vaporwave': ['classic vaporwave', 'vaporwave classic'],
      Mallsoft: ['mallsoft'],
      'Vaportrap': ['vaportrap'],
      Barofunk: ['barofunk', 'future funk'],
      Hardvapour: ['hardvapour', 'hard vapour'],
      Seapunk: ['seapunk'],
      Signalwave: ['signalwave'],
      Utopian_Virtual: ['utopian virtual'],
    },
  },

  // =======================================================================
  // INDUSTRIAL / EBM / DARKWAVE (familia roja oscura)
  // =======================================================================
  'Industrial / EBM': {
    hue: 340,
    keywords: ['industrial', 'ebm'],
    subgenres: {
      EBM: ['ebm', 'electronic body music'],
      Industrial: ['industrial music'],
      'Power Noise': ['power noise', 'powernoise'],
      'Rhythmic Noise': ['rhythmic noise'],
      'Dark Electro': ['dark electro industrial'],
      Aggrotech: ['aggrotech'],
      Futurepop: ['futurepop'],
      Electro_Industrial: ['electro-industrial'],
      Neofolk_Industrial: ['neofolk'],
      Death_Industrial: ['death industrial'],
      Martial_Industrial: ['martial industrial'],
    },
  },

  'Darkwave / Coldwave': {
    hue: 268,
    keywords: ['darkwave', 'coldwave'],
    subgenres: {
      Darkwave: ['darkwave'],
      Coldwave: ['coldwave'],
      'Minimal Wave': ['minimal wave', 'minimal synth'],
      'Witch House': ['witch house'],
      'Deathrock Electronic': ['deathrock synth'],
      'Post-Punk Electronic': ['post-punk electronic'],
    },
  },

  // =======================================================================
  // HYPERPOP / DIGICORE (familia rosa)
  // =======================================================================
  'Hyperpop / Digicore': {
    hue: 318,
    keywords: ['hyperpop', 'digicore'],
    subgenres: {
      Hyperpop: ['hyperpop'],
      Digicore: ['digicore'],
      Glitchcore: ['glitchcore'],
      'PC Music': ['pc music'],
      Nightcore: ['nightcore'],
      Sigilkore_Pop: ['pop sigilkore'],
      Dariacore: ['dariacore'],
      Breakcore_Pop: ['pop breakcore'],
    },
  },

  // =======================================================================
  // DISCO / NU-DISCO / FUNK ELECTRONIC (familia dorada)
  // =======================================================================
  Disco: {
    hue: 44,
    keywords: ['disco'],
    subgenres: {
      'Nu-Disco': ['nu-disco', 'nu disco'],
      'Italo Disco': ['italo disco'],
      'Space Disco': ['space disco'],
      Boogie: ['boogie'],
      'Cosmic Disco': ['cosmic disco'],
      'Euro Disco': ['euro disco'],
      'French Touch': ['french touch'],
      'Disco Edit': ['disco edit', 'disco re-edit'],
      'Balearic Disco': ['balearic disco'],
    },
  },

  'Electro Swing': {
    hue: 52,
    keywords: ['electro swing'],
    subgenres: {
      'Classic Electro Swing': ['electro swing classic'],
      Swinghop: ['swinghop'],
      Balkan_Swing: ['balkan swing'],
      Nu_Jazz_Swing: ['nu jazz swing'],
    },
  },

  'Livetronica / Jam': {
    hue: 122,
    keywords: ['livetronica', 'jamtronica'],
    subgenres: {
      Livetronica: ['livetronica'],
      Jamtronica: ['jamtronica'],
      'Funk Jam Electronic': ['funk jam'],
      'Glitch Hop': ['glitch hop'],
    },
  },

  'Chiptune / 8-bit': {
    hue: 152,
    keywords: ['chiptune', '8-bit', 'bitpop'],
    subgenres: {
      Chiptune: ['chiptune'],
      Bitpop: ['bitpop'],
      Nintendocore: ['nintendocore'],
      Demoscene: ['demoscene music'],
      Gameboy_Music: ['gameboy music', 'lsdj'],
    },
  },

  'Dungeon Synth': {
    hue: 275,
    keywords: ['dungeon synth'],
    subgenres: {
      'Classic Dungeon Synth': ['classic dungeon synth'],
      'Comfy Synth': ['comfy synth'],
      'Battle Ambient': ['battle ambient'],
      'Winter Synth': ['winter synth'],
      'Fantasy Synth': ['fantasy synth'],
      'Black Metal Ambient': ['black ambient'],
    },
  },

  'Festival EDM / Mainstage': {
    hue: 312,
    keywords: ['festival edm', 'mainstage', 'edm'],
    subgenres: {
      'Big Room EDM': ['big room edm'],
      'Progressive EDM': ['progressive edm'],
      'Electro Pop EDM': ['electropop edm'],
      'Future Rave EDM': ['future rave edm'],
      'Mainstage Anthem': ['mainstage anthem'],
      'Festival Trap Crossover': ['festival trap edm'],
      'Pop Dance': ['pop dance'],
    },
  },

  'Neurobass / Glitch Bass': {
    hue: 118,
    keywords: ['neurobass', 'glitch bass'],
    subgenres: {
      'Neurobass': ['neurobass'],
      'Glitch Hop': ['glitch hop'],
      'Wonky Bass': ['wonky bass'],
      'Twerk / Trap Glitch': ['twerk beat'],
      'Deep Glitch': ['deep glitch'],
    },
  },

  'Speed / Hi-Energy Bass': {
    hue: 6,
    keywords: ['speed bass', 'hi-energy bass'],
    subgenres: {
      'Speedcore Bass': ['speed bass core'],
      'Donk': ['donk', 'scouse house'],
      'Bounce': ['bounce electronic', 'niche bounce'],
      'Hard Bass': ['hard bass russian'],
    },
  },

  'Tekno / Free Party': {
    hue: 268,
    keywords: ['tekno', 'freetekno', 'sound system tekno'],
    subgenres: {
      'Acidcore Tekno': ['acid tekno'],
      'Freeform Tekno': ['freeform tekno'],
      'Zenon Tekno': ['zenon tekno'],
      'Raggacore Tekno': ['raggacore tekno'],
    },
  },

  // =======================================================================
  // GÉNEROS NO ELECTRÓNICOS (profundidad moderada)
  // =======================================================================
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
      Mumble_Rap: ['mumble rap'],
      UK_Drill: ['uk drill'],
      Horrorcore: ['horrorcore'],
      Abstract_HipHop: ['abstract hip hop'],
      Instrumental_HipHop: ['instrumental hip hop', 'beat tape'],
      East_Coast: ['east coast rap'],
      West_Coast: ['west coast rap'],
      Phonk_Rap: ['phonk rap'],
      Plugg: ['plugg', 'pluggnb'],
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
      Art_Pop: ['art pop'],
      City_Pop: ['city pop'],
      K_Pop: ['k-pop', 'kpop'],
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
      Old_School_Reggaeton: ['reggaeton old school'],
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
      Slowcore: ['slowcore'],
      Math_Rock: ['math rock'],
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
      Djent: ['djent'],
      Post_Metal: ['post-metal'],
    },
  },
  'Funk / Soul': {
    hue: 50,
    keywords: ['funk', 'soul'],
    subgenres: {
      Nu_Funk: ['nu funk'],
      Neo_Soul: ['neo soul'],
      Gfunk: ['g-funk', 'g funk'],
      Psychedelic_Soul: ['psychedelic soul'],
    },
  },
  'Jazz / Fusion': {
    hue: 60,
    keywords: ['jazz'],
    subgenres: {
      Nu_Jazz: ['nu jazz'],
      Jazz_Fusion: ['jazz fusion'],
      Jazztronica: ['jazztronica'],
      Spiritual_Jazz: ['spiritual jazz'],
    },
  },
  'R&B': {
    hue: 15,
    keywords: ['r&b', 'rnb'],
    subgenres: {
      Alt_RnB: ['alternative r&b'],
      Future_RnB: ['future r&b', 'futuristic rnb'],
      Contemporary_RnB: ['contemporary rnb'],
    },
  },
  'World / Folk': {
    hue: 90,
    keywords: ['world music', 'folk'],
    subgenres: {
      Afrobeat: ['afrobeat', 'afrobeats'],
      Cumbia: ['cumbia'],
      Balkan: ['balkan'],
      Flamenco_Fusion: ['flamenco fusion'],
      Celtic: ['celtic'],
    },
  },
  'Reggae / Dub': {
    hue: 130,
    keywords: ['reggae', 'dub'],
    subgenres: {
      Roots_Reggae: ['roots reggae'],
      Dub: ['dub reggae'],
      Dancehall: ['dancehall'],
      Steppers_Dub: ['steppers dub'],
    },
  },
  'Classical / Neoclassical': {
    hue: 220,
    keywords: ['classical', 'neoclassical'],
    subgenres: {
      Neoclassical: ['neoclassical'],
      Modern_Classical: ['modern classical'],
      Soundtrack_Score: ['soundtrack', 'film score'],
      Minimalist_Composition: ['minimalism classical'],
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
  const span = 48; // grados de variación total dentro de la familia
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
    const has = (n) => subNames.includes(n);

    if (best.genre === 'House' && has('Deep House')) {
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
