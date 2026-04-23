import { describe, it, expect } from 'vitest';
import { generateReadme } from '../src/readme';
import type { DashboardData } from '../src/types';

const mockData: DashboardData = {
  profile: {
    name: 'Stéphane "Bakeneko" Dupont',
    age: 37,
    title: 'Ticket crusher, Git blamer, Goat farmer',
    residence: 'Prissé, France',
    location: 'Prissé, France',
    weatherTemp: 20.6,
    weatherIcon: '01d',
    availableForHire: true,
    commitsLast30d: 6,
  },
  health: {
    bpm: 72,
    bpmHourlyData: [{ avg: 70, min: 60, max: 82, hour: 12 }],
    weightKg: 82.4,
    stepsToday: 4589,
    stepsHistory7d: [5000, 6000, 4000, 7000, 3000, 8000, 4589],
    sleepHours: 7,
    sleepHistory7d: [7, 8, 6.5, 7.5, 8, 6, 7],
    caloriesToday: 1106,
    caloriesHistory7d: [1200, 900, 1100, 1300, 1000, 1400, 1106],
  },
  attributes: [
    { label: 'Strength', value: 0.7 }, { label: 'Stamina', value: 0.8 },
    { label: 'Charisma', value: 0.6 }, { label: 'Dexterity', value: 0.75 },
    { label: 'Intelligence', value: 0.9 }, { label: 'Wisdom', value: 0.65 },
  ],
  skills: [
    { label: 'Development', value: 0.85 }, { label: 'Cooking', value: 0.6 },
    { label: 'Dark Arts', value: 0.7 }, { label: 'Gaming', value: 0.75 },
    { label: 'Athletics', value: 0.55 }, { label: 'Social', value: 0.65 },
  ],
  media: {
    watching: { title: 'The Double', subtitle: 'S01E18', coverUrl: '' },
    reading: { title: 'Reveries', subtitle: 'Ch.28', coverUrl: '' },
    gaming: { title: 'Mecha BREAK', subtitle: '2h51', coverUrl: '' },
  },
  social: {
    website: 'https://bakeneko.app',
    linkedin: 'https://linkedin.com/in/bakeneko',
    bluesky: 'https://bsky.app/profile/bakeneko.fr',
    instagram: 'https://instagram.com/bakeneko_sama',
  },
};

describe('generateReadme', () => {
  it('includes the full name in the header', () => {
    expect(generateReadme(mockData)).toContain('Stéphane "Bakeneko" Dupont');
  });

  it('includes the city', () => {
    expect(generateReadme(mockData)).toContain('Prissé');
  });

  it('shows age in English (y/o)', () => {
    expect(generateReadme(mockData)).toContain('37');
    expect(generateReadme(mockData)).toContain('y/o');
  });

  it('shows Open to opportunities when true', () => {
    expect(generateReadme(mockData)).toContain('Open to opportunities');
  });

  it('shows Not available when availableForHire is false', () => {
    const data = { ...mockData, profile: { ...mockData.profile, availableForHire: false } };
    expect(generateReadme(data)).toContain('Not available');
  });

  it('includes current BPM value', () => {
    expect(generateReadme(mockData)).toContain('72');
  });

  it('shows steps in English', () => {
    expect(generateReadme(mockData)).toContain('steps');
  });

  it('shows commits in English (30d)', () => {
    expect(generateReadme(mockData)).toContain('30d');
  });

  it('references all 9 generated SVG files', () => {
    const md = generateReadme(mockData);
    [
      'assets/generated/radar-attributes.svg',
      'assets/generated/radar-skills.svg',
      'assets/generated/chart-heartrate.svg',
      'assets/generated/chart-steps.svg',
      'assets/generated/chart-sleep.svg',
      'assets/generated/chart-calories.svg',
      'assets/generated/media-watching.svg',
      'assets/generated/media-reading.svg',
      'assets/generated/media-gaming.svg',
    ].forEach(path => expect(md).toContain(path));
  });

  it('includes all social links including website', () => {
    const md = generateReadme(mockData);
    expect(md).toContain('https://bakeneko.app');
    expect(md).toContain('https://linkedin.com/in/bakeneko');
  });
});
