export const waveGenerators = [
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 1) * 7919 + i * 31337) * 177013;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 2) * 6271 + i * 57689) * 198491;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 3) * 4513 + i * 73417) * 154329;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 4) * 8221 + i * 61819) * 210943;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 5) * 3571 + i * 83497) * 167281;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
  (seed: number) => Array.from({ length: 300 }, (_, i) => {
    const x = Math.sin((seed + 6) * 5953 + i * 41263) * 189437;
    return 0.1 + 0.9 * (x - Math.floor(x));
  }),
];