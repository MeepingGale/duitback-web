import { describe, expect, it } from 'vitest';
import { CATS } from './tax';
import { RELIEF_FAQ, RELIEF_HELP } from './reliefHelp';

describe('what-counts help', () => {
  it('covers every relief category with can, cannot, proof and a Malay line', () => {
    for (const c of CATS) {
      const h = RELIEF_HELP[c.id];
      expect(h, c.id).toBeTruthy();
      expect(h.can.length, c.id).toBeGreaterThan(0);
      expect(h.cant.length, c.id).toBeGreaterThan(0);
      expect(h.proof, c.id).toBeTruthy();
      expect(h.bm, c.id).toMatch(/[a-z]/);
    }
  });
  it('has no orphan entries', () => {
    const ids = new Set(CATS.map((c) => c.id));
    for (const k of Object.keys(RELIEF_HELP)) expect(ids.has(k), k).toBe(true);
  });

  it('every FAQ answer belongs to a real category and is not a stub', () => {
    const ids = new Set(CATS.map((c) => c.id));
    for (const f of RELIEF_FAQ) { expect(ids.has(f.cat), f.q).toBe(true); expect(f.a.length, f.q).toBeGreaterThan(80); }
  });
});
