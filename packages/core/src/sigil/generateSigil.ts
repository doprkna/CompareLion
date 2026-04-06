export interface SigilStats {
  archetypeScore: number;
  streak: number;
  percentileBuckets: number[]; // values 0-100
}

export interface SigilResult {
  seed: string;
  svg: string;
}

const PRIMARY_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'] as const;
const BORDER_COLORS = ['#9CA3AF', '#4B5563', '#F97316', '#22C55E', '#EF4444'] as const;
const BG_COLOR = '#020617';

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function simpleHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

export function generateSigil(userId: string, stats: SigilStats): SigilResult {
  const seed = `${userId}|${stats.archetypeScore}|${stats.streak}|${stats.percentileBuckets.join(',')}`;
  const baseHash = simpleHash(seed);

  const primaryIndex = Math.floor(clamp(stats.archetypeScore, 0, 99) / (100 / PRIMARY_COLORS.length));
  const primaryColor = PRIMARY_COLORS[primaryIndex] ?? PRIMARY_COLORS[0];

  const streak = clamp(stats.streak, 0, 365);
  const borderIndex =
    streak === 0 ? 0 :
    streak < 3 ? 1 :
    streak < 7 ? 2 :
    streak < 14 ? 3 :
    4;
  const borderColor = BORDER_COLORS[borderIndex] ?? BORDER_COLORS[0];

  const size = 5;
  const cell = 16;
  const padding = 4;
  const svgSize = padding * 2 + size * cell;

  const rows: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      const bitIndex = y * Math.ceil(size / 2) + x;
      const bitHash = simpleHash(`${baseHash}:${bitIndex}`);
      row.push(bitHash & 1);
    }
    const mirrored = [...row, ...row.slice(0, size - row.length).reverse()];
    rows.push(mirrored.slice(0, size));
  }

  const cells: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!rows[y][x]) continue;
      const px = padding + x * cell;
      const py = padding + y * cell;
      cells.push(
        `<rect x="${px}" y="${py}" width="${cell}" height="${cell}" rx="3" ry="3" fill="${primaryColor}" />`
      );
    }
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" role="img" aria-hidden="true">`,
    `<rect x="0" y="0" width="${svgSize}" height="${svgSize}" fill="${BG_COLOR}" stroke="${borderColor}" stroke-width="2"/>`,
    ...cells,
    `</svg>`,
  ].join('');

  return { seed, svg };
}

