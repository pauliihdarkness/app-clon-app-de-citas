import { describe, it, expect, vi } from 'vitest';
import { throttle } from '../../src/utils/throttle';

describe('throttle', () => {
  it('prevents rapid consecutive calls within delay', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');
    throttled('c');

    // Only first call should have executed synchronously
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('allows call after delay', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    vi.advanceTimersByTime(150);
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
