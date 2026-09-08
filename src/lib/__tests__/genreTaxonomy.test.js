import { describe, it, expect } from 'vitest';
import { classifyGenre, taxonomyStats, listAllSubgenres, TAXONOMY } from '../genreTaxonomy';

describe('taxonomía: integridad estructural', () => {
  it('cada género tiene al menos un subgénero y un keyword', () => {
    for (const [name, def] of Object.entries(TAXONOMY)) {
      expect(def.keywords.length, `${name} sin keywords`).toBeGreaterThan(0);
      expect(Object.keys(def.subgenres).length, `${name} sin subgéneros`).toBeGreaterThan(0);
      expect(typeof def.hue).toBe('number');
    }
  });

  it('taxonomyStats cuenta correctamente géneros y subgéneros', () => {
    const stats = taxonomyStats();
    const bySubList = listAllSubgenres().length;
    expect(stats.subgenres).toBe(bySubList);
    expect(stats.total).toBe(stats.genres + stats.subgenres);
    expect(stats.genres).toBeGreaterThan(30);
    expect(stats.subgenres).toBeGreaterThan(300);
  });

  it('todos los hue están en el rango 0-360', () => {
    for (const def of Object.values(TAXONOMY)) {
      expect(def.hue).toBeGreaterThanOrEqual(0);
      expect(def.hue).toBeLessThan(360);
    }
  });
});

describe('classifyGenre: solo keywords (sin audio)', () => {
  it('clasifica un track con tag exacto de subgénero', () => {
    const r = classifyGenre({ rawGenreTag: 'Techno', rawTags: ['hard techno'], title: '' });
    expect(r.primary).toBe('Techno');
    expect(r.subgenre).toBe('Hard Techno');
    expect(r.confidence).toBeGreaterThan(0);
  });

  it('clasifica correctamente varios subgéneros de nicho por tag único', () => {
    const cases = [
      [['amapiano'], 'House', 'Amapiano'],
      [['neurofunk'], 'Drum & Bass', 'Neurofunk'],
      [['drift phonk'], 'Phonk', 'Drift Phonk'],
      [['gqom'], 'Global Bass', 'Gqom'],
      [['chiptune'], 'Chiptune / 8-bit', 'Chiptune'],
    ];
    for (const [tags, genre, sub] of cases) {
      const r = classifyGenre({ rawGenreTag: '', rawTags: tags, title: '' });
      expect(r.primary, tags.join(',')).toBe(genre);
      expect(r.subgenre, tags.join(',')).toBe(sub);
    }
  });

  it('sin ningún tag ni análisis, igualmente asigna un género concreto (nunca "Sin clasificar")', () => {
    const r = classifyGenre({ rawGenreTag: '', rawTags: [], title: '' });
    expect(r.primary).not.toBe('Sin clasificar');
    expect(r.primary).toBeTruthy();
    expect(r.subgenre).toBeTruthy();
    expect(r.isGuess).toBe(true);
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThan(0.2);
  });

  it('el fallback por hash es determinista: mismo input -> mismo resultado', () => {
    const a = classifyGenre({ rawGenreTag: '', rawTags: [], title: 'Untitled Track 47' });
    const b = classifyGenre({ rawGenreTag: '', rawTags: [], title: 'Untitled Track 47' });
    expect(a.primary).toBe(b.primary);
    expect(a.subgenre).toBe(b.subgenre);
  });

  it('un tag genérico de SoundCloud sin match ("Dance & EDM") no deja el track sin clasificar', () => {
    const r = classifyGenre({ rawGenreTag: 'Dance & EDM', rawTags: [], title: 'Untitled' });
    expect(r.primary).not.toBe('Sin clasificar');
  });

  it('el hue del resultado varía entre distintos subgéneros de la misma familia', () => {
    const a = classifyGenre({ rawGenreTag: '', rawTags: ['hard techno'], title: '' });
    const b = classifyGenre({ rawGenreTag: '', rawTags: ['dub techno'], title: '' });
    expect(a.primary).toBe(b.primary);
    expect(a.hue).not.toBe(b.hue);
  });
});

describe('classifyGenre: no revienta con entradas raras', () => {
  it('acepta tags vacíos, título largo y caracteres especiales', () => {
    expect(() => classifyGenre({ rawGenreTag: undefined, rawTags: [], title: 'a'.repeat(500) })).not.toThrow();
    expect(() => classifyGenre({ rawGenreTag: 'Ñañó Técno 🎵', rawTags: [], title: '' })).not.toThrow();
    expect(() => classifyGenre({})).not.toThrow();
  });
});
