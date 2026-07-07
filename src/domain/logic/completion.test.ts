import { describe, expect, it } from 'vitest';
import { calcDailyProgress, calcDailyTotal, isCompleted } from './completion';

describe('calcDailyTotal', () => {
  it('sums log amounts', () => {
    expect(calcDailyTotal([{ amount: 1 }, { amount: 2.5 }])).toBe(3.5);
    expect(calcDailyTotal([])).toBe(0);
  });
});

describe('isCompleted', () => {
  it('check habit: 1 次即完成', () => {
    expect(isCompleted({ type: 'check' }, 1)).toBe(true);
    expect(isCompleted({ type: 'check' }, 0)).toBe(false);
  });

  it('count habit with goalDaily', () => {
    expect(isCompleted({ type: 'count', goalDaily: 8 }, 8)).toBe(true);
    expect(isCompleted({ type: 'count', goalDaily: 8 }, 7.9)).toBe(false);
  });

  it('count habit without goal: 有記錄即完成', () => {
    expect(isCompleted({ type: 'count' }, 0.5)).toBe(true);
    expect(isCompleted({ type: 'count' }, 0)).toBe(false);
  });
});

describe('calcDailyProgress', () => {
  it('clamps to 1', () => {
    expect(calcDailyProgress({ type: 'count', goalDaily: 10 }, 15)).toBe(1);
    expect(calcDailyProgress({ type: 'count', goalDaily: 10 }, 5)).toBe(0.5);
  });

  it('no goal: binary progress', () => {
    expect(calcDailyProgress({ type: 'timer' }, 30)).toBe(1);
    expect(calcDailyProgress({ type: 'timer' }, 0)).toBe(0);
  });
});
