const WIDTH = 200;
const HEIGHT = 160;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RADIUS = 60;
const LABEL_RADIUS = 68;

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

export function radarSvg(values: number[], labels: string[], color: string): string {
  const n = values.length;
  const step = 360 / n;

  const rings = [1, 0.66, 0.33].map(scale => {
    const pts = Array.from({ length: n }, (_, i) =>
      polarToXY(i * step, RADIUS * scale).map(v => v.toFixed(1)).join(',')
    ).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#30363d" stroke-width="1"/>`;
  }).join('\n  ');

  const axes = Array.from({ length: n }, (_, i) => {
    const [x, y] = polarToXY(i * step, RADIUS);
    return `<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#30363d" stroke-width="1"/>`;
  }).join('\n  ');

  const dataPoints = values.map((v, i) => {
    const clamped = Math.max(0, Math.min(1, v)); // values are normalized 0–1
    return polarToXY(i * step, RADIUS * clamped).map(p => p.toFixed(1)).join(',');
  }).join(' ');

  const labelElems = labels.map((label, i) => {
    const [x, y] = polarToXY(i * step, LABEL_RADIUS);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="500" font-family="sans-serif" fill="#ffffff">${label}</text>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="6" fill="#161b22"/>
  ${rings}
  ${axes}
  <polygon points="${dataPoints}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
  ${labelElems}
</svg>`;
}
