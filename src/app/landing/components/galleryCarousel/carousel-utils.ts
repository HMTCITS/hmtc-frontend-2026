/** Wraps any integer into the range [0, n). Works for negative numbers too. */
export const wrapIndex = (i: number, n: number) => ((i % n) + n) % n;

/** +1 = forward, -1 = backward, 0 = no move. Picks the shortest way round the loop. */
export function getDirection(
  prev: number,
  next: number,
  n: number,
): -1 | 0 | 1 {
  if (n <= 1 || prev === next) return 0;
  const diff = wrapIndex(next - prev, n);
  return diff <= n / 2 ? 1 : -1;
}
