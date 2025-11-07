const TONES = {
  funny: (u: string, metric: string, value: number, region: string) => `${u}, your ${metric} is ${value}% spicier than ${region} average 🔥`,
  brag: (u: string, metric: string, value: number, region: string) => `${u}, your ${metric} is ${value}% better than ${region} average. Keep flexing.`,
  roast: (u: string, metric: string, value: number, region: string) => `${u}, ${metric} at +${value}% vs ${region}. Not bad... for a Tuesday. 😏`,
};

export function buildFunText(username: string, region: string, stats: { metric: string; valuePct: number }) {
  const keys = Object.keys(TONES) as (keyof typeof TONES)[];
  const tone = keys[Math.floor(Math.random() * keys.length)];
  const rounded = Math.max(0, Math.min(999, Math.round(stats.valuePct)));
  return TONES[tone](username, stats.metric, rounded, region || 'GLOBAL');
}

export function renderSvgCard(funText: string, bigNumber: string, bg = '#111827', fg = '#F9FAFB') {
  const width = 1200;
  const height = 630;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="60" y="200" fill="${fg}" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700">${funText}</text>
  <text x="60" y="420" fill="#60A5FA" font-family="Inter, Arial, sans-serif" font-size="180" font-weight="800">${bigNumber}</text>
</svg>`;
}


