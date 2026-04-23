import { describe, it, expect } from 'vitest';
import { barChartSvg, lineChartSvg } from '../src/svg/charts';

describe('barChartSvg', () => {
  const values = [4000, 6500, 3200, 8100, 5400, 7200, 4589];

  it('returns a string starting with <svg', () => {
    const svg = barChartSvg(values, '#58a6ff');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it('contains at least 7 rect elements', () => {
    const svg = barChartSvg(values, '#58a6ff');
    const rects = svg.match(/<rect /g);
    expect(rects?.length).toBeGreaterThanOrEqual(7);
  });

  it('uses the provided color', () => {
    const svg = barChartSvg(values, '#f85149');
    expect(svg).toContain('#f85149');
  });

  it('highlights the last bar at full opacity', () => {
    const svg = barChartSvg(values, '#58a6ff');
    expect(svg).toContain('opacity="1"');
  });

  it('includes day label text elements', () => {
    const svg = barChartSvg(values, '#58a6ff');
    expect(svg).toContain('<text');
  });

  it('renders the optional title when provided', () => {
    const svg = barChartSvg(values, '#58a6ff', 'Steps');
    expect(svg).toContain('Steps');
  });

  it('handles all-zero values without throwing', () => {
    expect(() => barChartSvg([0, 0, 0, 0, 0, 0, 0], '#58a6ff')).not.toThrow();
  });

  it('produces no NaN in output', () => {
    const svg = barChartSvg(values, '#58a6ff');
    expect(svg).not.toContain('NaN');
  });
});

describe('lineChartSvg', () => {
  // Simulate 23 hours starting at 02:00 local (UTC+2) → hours 2..23, 0
  const data = Array.from({ length: 23 }, (_, i) => ({
    avg:  65 + Math.round(Math.sin(i / 3) * 8),
    min:  55 + i % 5,
    max:  75 + i % 6,
    hour: (i + 2) % 24,
  }));

  it('returns a string starting with <svg', () => {
    const svg = lineChartSvg(data, '#f85149');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it('contains a line path element', () => {
    const svg = lineChartSvg(data, '#f85149');
    expect(svg).toContain('<path ');
    expect(svg).toContain('stroke="#f85149"');
  });

  it('includes hour labels (00, 06, 12, 18)', () => {
    const svg = lineChartSvg(data, '#f85149');
    expect(svg).toContain('>00<');
    expect(svg).toContain('>06<');
    expect(svg).toContain('>12<');
    expect(svg).toContain('>18<');
  });

  it('uses the provided color', () => {
    const svg = lineChartSvg(data, '#bc8cff');
    expect(svg).toContain('#bc8cff');
  });

  it('handles empty data without throwing', () => {
    expect(() => lineChartSvg([], '#f85149')).not.toThrow();
  });

  it('handles a single data point without throwing', () => {
    expect(() => lineChartSvg([{ avg: 70, min: 60, max: 80, hour: 12 }], '#f85149')).not.toThrow();
  });

  it('produces no NaN in output', () => {
    const svg = lineChartSvg(data, '#f85149');
    expect(svg).not.toContain('NaN');
  });
});
