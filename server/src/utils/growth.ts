export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100; // If previous is 0, growth is either 0% or 100%
  }
  return Number(((current - previous) / previous) * 100);
}