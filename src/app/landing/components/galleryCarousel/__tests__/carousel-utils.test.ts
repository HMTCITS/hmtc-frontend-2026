import { getDirection, wrapIndex } from '../carousel-utils';

describe('wrapIndex', () => {
  it('leaves in-range indexes unchanged', () => {
    expect(wrapIndex(0, 6)).toBe(0);
    expect(wrapIndex(5, 6)).toBe(5);
  });

  it('wraps negative indexes', () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(-6, 6)).toBe(0);
    expect(wrapIndex(-7, 6)).toBe(5);
  });

  it('wraps indexes past the end', () => {
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(13, 6)).toBe(1);
  });
});

describe('getDirection', () => {
  it('returns 1 when moving forward', () => {
    expect(getDirection(0, 1, 6)).toBe(1);
    expect(getDirection(2, 3, 6)).toBe(1);
  });

  it('returns -1 when moving backward', () => {
    expect(getDirection(3, 2, 6)).toBe(-1);
    expect(getDirection(1, 0, 6)).toBe(-1);
  });

  it('treats last → first as forward (wrap-around)', () => {
    expect(getDirection(5, 0, 6)).toBe(1);
  });

  it('treats first → last as backward (wrap-around)', () => {
    expect(getDirection(0, 5, 6)).toBe(-1);
  });

  it('returns 0 when the index does not change', () => {
    expect(getDirection(2, 2, 6)).toBe(0);
  });

  it('returns 0 when there is at most one slide', () => {
    expect(getDirection(0, 0, 1)).toBe(0);
    expect(getDirection(0, 1, 1)).toBe(0);
    expect(getDirection(0, 0, 0)).toBe(0);
  });

  it('breaks an exact half-way tie as forward', () => {
    expect(getDirection(0, 3, 6)).toBe(1);
  });
});
