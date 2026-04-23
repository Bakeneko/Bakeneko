import { describe, it, expect } from 'vitest';
import { radarSvg } from '../src/svg/radar';

describe('radarSvg', () => {
  const values = [0.7, 0.8, 0.6, 0.75, 0.9, 0.65]; // normalized 0–1
  const labels = ['Strength', 'Stamina', 'Charisma', 'Dexterity', 'Intelligence', 'Wisdom'];

  it('returns a string starting with <svg', () => {
    const svg = radarSvg(values, labels, '#f0883e');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it('contains a data polygon', () => {
    const svg = radarSvg(values, labels, '#f0883e');
    expect(svg).toContain('<polygon ');
  });

  it('includes all axis labels', () => {
    const svg = radarSvg(values, labels, '#f0883e');
    labels.forEach(label => expect(svg).toContain(label));
  });

  it('uses the provided color', () => {
    const svg = radarSvg(values, labels, '#f0883e');
    expect(svg).toContain('#f0883e');
  });

  it('handles zero values without NaN in output', () => {
    const svg = radarSvg([0, 0, 0, 0, 0, 0], labels, '#f0883e');
    expect(svg).not.toContain('NaN');
  });

  it('clamps values above 1 without throwing', () => {
    expect(() => radarSvg([1.2, 0.8, 0.6, 0.75, 0.9, 0.65], labels, '#f0883e')).not.toThrow();
  });
});
