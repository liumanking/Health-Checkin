import { describe, expect, it } from 'vitest';
import { checkGoal, goalProgress } from './goal';

describe('checkGoal', () => {
  it('reaches weekly goal', () => {
    expect(checkGoal({ goalWeekly: 3 }, 'weekly', 3)).toBe(true);
    expect(checkGoal({ goalWeekly: 3 }, 'weekly', 2)).toBe(false);
  });

  it('no goal set → false', () => {
    expect(checkGoal({}, 'monthly', 100)).toBe(false);
  });
});

describe('goalProgress', () => {
  it('returns ratio clamped to 1', () => {
    expect(goalProgress({ goalMonthly: 20 }, 'monthly', 5)).toBe(0.25);
    expect(goalProgress({ goalMonthly: 20 }, 'monthly', 25)).toBe(1);
  });

  it('no goal → undefined', () => {
    expect(goalProgress({}, 'daily', 5)).toBeUndefined();
  });
});
