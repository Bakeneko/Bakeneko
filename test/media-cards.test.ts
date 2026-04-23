import { describe, it, expect } from 'vitest';
import { mediaCardSvg } from '../src/svg/media-cards';

describe('mediaCardSvg', () => {
  it('returns a string starting with <svg', () => {
    const svg = mediaCardSvg('The Double', 'S01E18', '🎬', null);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it('includes the title text', () => {
    const svg = mediaCardSvg('The Double', 'S01E18', '🎬', null);
    expect(svg).toContain('The Double');
  });

  it('includes the subtitle text', () => {
    const svg = mediaCardSvg('The Double', 'S01E18', '🎬', null);
    expect(svg).toContain('S01E18');
  });

  it('renders a gradient fallback when coverBase64 is null', () => {
    const svg = mediaCardSvg('Test', 'Ch.1', '📖', null);
    expect(svg).toContain('linearGradient');
    expect(svg).toContain('📖');
  });

  it('embeds a base64 cover image when provided', () => {
    const cover = 'data:image/jpeg;base64,/9j/abc123';
    const svg = mediaCardSvg('Test', 'Ch.1', '📖', cover);
    expect(svg).toContain('data:image/jpeg;base64,/9j/abc123');
  });

  it('truncates titles longer than 36 characters', () => {
    const svg = mediaCardSvg('A Very Very Long Title That Overflows', 'ep1', '🎬', null);
    expect(svg).toContain('…');
  });

  it('produces no NaN in output', () => {
    const svg = mediaCardSvg('Title', 'Sub', '🎮', null);
    expect(svg).not.toContain('NaN');
  });
});
