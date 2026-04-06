/**
 * Sigil v0.1 - Mirrored heatmap-like profile flag.
 *
 * Grid: 7 rows × 8 cols (56 cells). Left 4 cols filled from buckets[0..27], mirrored
 * to right 4 cols for symmetry. 5 intensity levels (0–4) map to fixed hex palette.
 * No external deps. Safe for SSR; no browser APIs.
 */
export interface SigilHeatmapInput {
  buckets: number[];
  seed?: string | null;
}

export interface SigilHeatmapResult {
  svg: string;
}

const EXPECTED_LEN = 56;
/** 5 intensity levels: 0 (empty) .. 4 (max) */
const PALETTE = ['#0f172a', '#1e293b', '#334155', '#64748b', '#94a3b8'] as const;
const COLS = 8;
const ROWS = 7;
const HALF_COLS = 4;
const CELL_SIZE = 12;
const PADDING = 4;
const GAP = 2;

function normalizeBuckets(arr: unknown): number[] {
  if (!Array.isArray(arr)) return Array(EXPECTED_LEN).fill(0);
  if (arr.length === EXPECTED_LEN) return arr as number[];
  const out: number[] = [];
  for (let i = 0; i < EXPECTED_LEN; i++) {
    const v = arr[i];
    out.push(typeof v === 'number' && !Number.isNaN(v) ? Math.max(0, Math.min(4, Math.floor(v))) : 0);
  }
  return out;
}

export function generateSigilHeatmap(input: SigilHeatmapInput): SigilHeatmapResult {
  if (input == null || typeof input !== 'object') {
    throw new Error('generateSigilHeatmap: input must be an object');
  }
  if (!Array.isArray(input.buckets)) {
    throw new Error('generateSigilHeatmap: buckets must be an array');
  }
  const buckets = normalizeBuckets(input.buckets);
  const viewW = PADDING * 2 + COLS * CELL_SIZE + (COLS - 1) * GAP;
  const viewH = PADDING * 2 + ROWS * CELL_SIZE + (ROWS - 1) * GAP;

  const grid: number[][] = [];
  let bi = 0;
  for (let row = 0; row < ROWS; row++) {
    const r: number[] = [];
    for (let col = 0; col < HALF_COLS; col++) {
      const v = buckets[bi] ?? 0;
      const level = Math.max(0, Math.min(4, Math.floor(Number(v))));
      r.push(level);
      bi++;
    }
    const mirrored = [...r, ...[...r].reverse()];
    grid.push(mirrored);
  }

  const cells: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const level = grid[row]?.[col] ?? 0;
      const fill = PALETTE[level] ?? PALETTE[0];
      const x = PADDING + col * (CELL_SIZE + GAP);
      const y = PADDING + row * (CELL_SIZE + GAP);
      cells.push(
        `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${fill}" />`
      );
    }
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" role="img" aria-label="Activity sigil">`,
    `<rect x="0" y="0" width="${viewW}" height="${viewH}" fill="${PALETTE[0]}" stroke="#475569" stroke-width="1"/>`,
    ...cells,
    `</svg>`,
  ].join('');

  return { svg };
}
