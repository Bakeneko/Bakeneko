import type { BpmPoint } from '../types';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // 0=Sunday
const W = 200;
const BAR_AREA_H = 52;
const PADDING_X = 8;
const BAR_GAP = 3;
const TITLE_H = 20;

function titleEl(title: string | undefined): string {
  if (!title) return '';
  return `<text x="${W / 2}" y="14" text-anchor="middle" font-size="11" font-weight="500" font-family="sans-serif" fill="#ffffff">${title}</text>`;
}

export function barChartSvg(values: number[], color: string, title?: string): string {
  const H = title ? 108 : 90;
  const LABEL_Y = H - 3;
  const CHART_TOP = H - BAR_AREA_H - 14;

  const n = values.length;
  const barW = (W - PADDING_X * 2 - BAR_GAP * (n - 1)) / n;
  const max = Math.max(...values, 1);
  const todayDay = new Date().getDay();

  const bars = values.map((v, i) => {
    const barH = Math.max(2, Math.round((v / max) * BAR_AREA_H));
    const x = PADDING_X + i * (barW + BAR_GAP);
    const y = CHART_TOP + BAR_AREA_H - barH;
    const opacity = i === n - 1 ? 1 : 0.35; // today at full opacity; earlier days dimmed
    const dayIndex = (todayDay - (n - 1 - i) + 7) % 7;
    return [
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH}" rx="2" fill="${color}" opacity="${opacity}"/>`,
      `<text x="${(x + barW / 2).toFixed(1)}" y="${LABEL_Y}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#8b949e">${DAYS[dayIndex]}</text>`,
    ].join('\n  ');
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="6" fill="#161b22"/>
  ${titleEl(title)}
  ${bars}
</svg>`;
}

export function lineChartSvg(data: BpmPoint[], color: string, title?: string): string {
  const H = title ? 108 : 90;
  const PAD_X = 10;
  const PAD_TOP = title ? TITLE_H + 4 : 8;
  const PAD_BOTTOM = 16;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  if (data.length < 2) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="6" fill="#161b22"/>
  ${titleEl(title)}
</svg>`;
  }

  const allVals = data.flatMap(d => [d.min, d.avg, d.max]);
  const minVal = Math.min(...allVals) - 3;
  const maxVal = Math.max(...allVals) + 3;
  const range = maxVal - minVal || 1;
  const n = data.length;

  function toX(i: number): number {
    return PAD_X + (i / (n - 1)) * chartW;
  }
  function toY(v: number): number {
    return PAD_TOP + chartH - ((v - minVal) / range) * chartH;
  }

  const bandTop = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.max).toFixed(1)}`).join(' ');
  const bandBot = data.map((_d, i) => `${toX(n - 1 - i).toFixed(1)},${toY(data[n - 1 - i].min).toFixed(1)}`).join(' ');
  const bandPath = `M ${bandTop.split(' ')[0]} L ${bandTop.split(' ').slice(1).join(' L ')} L ${bandBot.split(' ')[0]} L ${bandBot.split(' ').slice(1).join(' L ')} Z`;

  const avgPts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.avg).toFixed(1)}`);
  const linePath = `M ${avgPts[0]} L ${avgPts.slice(1).join(' L ')}`;
  const areaPath = `M ${avgPts[0]} L ${avgPts.slice(1).join(' L ')} L ${toX(n - 1).toFixed(1)},${(PAD_TOP + chartH).toFixed(1)} L ${PAD_X},${(PAD_TOP + chartH).toFixed(1)} Z`;

  const hourLabels = [0, 6, 12, 18]
    .map(target => {
      const idx = data.findIndex(d => d.hour === target);
      if (idx === -1) return null;
      return `<text x="${toX(idx).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#8b949e">${String(target).padStart(2, '0')}</text>`;
    })
    .filter((s): s is string => s !== null)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="6" fill="#161b22"/>
  ${titleEl(title)}
  <path d="${bandPath}" fill="${color}" fill-opacity="0.08"/>
  <path d="${areaPath}" fill="${color}" fill-opacity="0.12"/>
  <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  ${hourLabels}
</svg>`;
}
