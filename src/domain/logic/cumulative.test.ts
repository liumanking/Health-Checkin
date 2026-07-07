import { describe, expect, it } from 'vitest';
import { calcCumulative, calcStreak } from './cumulative';

describe('calcCumulative', () => {
  it('sums all amounts', () => {
    expect(calcCumulative([{ amount: 10 }, { amount: 20 }, { amount: 12 }])).toBe(42);
  });
});

describe('calcStreak', () => {
  it('counts consecutive days ending today', () => {
    const done = new Set(['2026-07-05', '2026-07-06', '2026-07-07']);
    expect(calcStreak(done, '2026-07-07')).toBe(3);
  });

  it('today 未完成時從昨天起算', () => {
    const done = new Set(['2026-07-05', '2026-07-06']);
    expect(calcStreak(done, '2026-07-07')).toBe(2);
  });

  it('breaks on gap', () => {
    const done = new Set(['2026-07-03', '2026-07-06', '2026-07-07']);
    expect(calcStreak(done, '2026-07-07')).toBe(2);
  });

  it('empty set → 0', () => {
    expect(calcStreak(new Set(), '2026-07-07')).toBe(0);
  });

  it('crosses month boundary', () => {
    const done = new Set(['2026-06-30', '2026-07-01']);
    expect(calcStreak(done, '2026-07-01')).toBe(2);
  });
});
