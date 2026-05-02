const WAVEFORM_BAR_COUNT = 300;

function createSeededRandom(seed: number) {
  let value = Math.floor(seed * 9973) || 1;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothSeries(values: number[], passes: number) {
  let output = values;
  for (let pass = 0; pass < passes; pass += 1) {
    output = output.map((value, index) => {
      const prev = output[index - 1] ?? value;
      const next = output[index + 1] ?? value;
      return prev * 0.25 + value * 0.5 + next * 0.25;
    });
  }
  return output;
}

function buildWaveform(
  seed: number,
  options: {
    floor: number;
    variance: number;
    smoothPasses: number;
    peaks: number;
    peakStrength: number;
    drift: number;
  },
) {
  const random = createSeededRandom(seed);
  const base = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, index) => {
    const progress = index / (WAVEFORM_BAR_COUNT - 1);
    const drift =
      Math.sin(progress * Math.PI * (1.2 + random() * options.drift) + random() * Math.PI) *
      0.09;
    const noise = (random() - 0.5) * options.variance;
    const texture = Math.sin(index * 1.91 + seed * 0.013) * 0.035;
    return clamp(options.floor + drift + noise + texture, 0.16, 0.9);
  });

  const withPeaks = [...base];
  for (let peakIndex = 0; peakIndex < options.peaks; peakIndex += 1) {
    const center = Math.floor(random() * WAVEFORM_BAR_COUNT);
    const spread = 8 + Math.floor(random() * 28);
    const strength = options.peakStrength * (0.55 + random() * 0.9);

    for (let index = 0; index < WAVEFORM_BAR_COUNT; index += 1) {
      const distance = Math.abs(index - center);
      if (distance > spread) continue;
      const influence = 1 - distance / spread;
      withPeaks[index] = clamp(withPeaks[index] + influence * strength, 0.16, 0.94);
    }
  }

  return smoothSeries(withPeaks, options.smoothPasses).map((value) =>
    clamp(value, 0.16, 0.94),
  );
}

export const waveGenerators = [
  (seed: number) =>
    buildWaveform(seed + 11, {
      floor: 0.42,
      variance: 0.28,
      smoothPasses: 1,
      peaks: 7,
      peakStrength: 0.18,
      drift: 2.2,
    }),
  (seed: number) =>
    buildWaveform(seed + 23, {
      floor: 0.5,
      variance: 0.2,
      smoothPasses: 2,
      peaks: 5,
      peakStrength: 0.16,
      drift: 1.8,
    }),
  (seed: number) =>
    buildWaveform(seed + 37, {
      floor: 0.34,
      variance: 0.34,
      smoothPasses: 1,
      peaks: 8,
      peakStrength: 0.22,
      drift: 2.8,
    }),
  (seed: number) =>
    buildWaveform(seed + 41, {
      floor: 0.56,
      variance: 0.16,
      smoothPasses: 2,
      peaks: 4,
      peakStrength: 0.12,
      drift: 1.3,
    }),
  (seed: number) =>
    buildWaveform(seed + 53, {
      floor: 0.38,
      variance: 0.24,
      smoothPasses: 1,
      peaks: 10,
      peakStrength: 0.15,
      drift: 3.1,
    }),
  (seed: number) =>
    buildWaveform(seed + 67, {
      floor: 0.46,
      variance: 0.26,
      smoothPasses: 2,
      peaks: 6,
      peakStrength: 0.19,
      drift: 2.4,
    }),
  (seed: number) =>
    buildWaveform(seed + 79, {
      floor: 0.3,
      variance: 0.36,
      smoothPasses: 1,
      peaks: 9,
      peakStrength: 0.24,
      drift: 3.6,
    }),
];
