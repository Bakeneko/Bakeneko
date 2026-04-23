import type { DashboardData } from './types';

// OpenWeatherMap icon code → emoji
const WEATHER_EMOJI: Record<string, string> = {
  '01d': '☀️',  '01n': '🌙',
  '02d': '🌤️', '02n': '🌤️',
  '03d': '⛅',  '03n': '⛅',
  '04d': '☁️',  '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️',  '11n': '⛈️',
  '13d': '❄️',  '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

function weatherEmoji(icon: string): string {
  return WEATHER_EMOJI[icon] ?? '🌡️';
}

export function generateReadme(data: DashboardData): string {
  const { profile, health, social } = data;

  const availability = profile.availableForHire
    ? '🟢&nbsp;Open to opportunities'
    : '🔴&nbsp;Not available';

  const liHandle = social.linkedin.replace(/.*linkedin\.com\/in\//, '').replace(/\//g, '');
  const bsHandle = social.bluesky.replace(/.*profile\//, '').replace(/\//g, '');
  const igHandle = social.instagram.replace(/.*instagram\.com\//, '').replace(/\//g, '');

  // HTML <a><img> required — Markdown badge syntax doesn't render inside HTML tags
  const badge = (label: string, message: string, color: string, logo: string, href: string) =>
    `<a href="${href}"><img src="https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=flat-square&logo=${logo}&logoColor=white" alt="${label}"/></a>`;

  const socialBlock = [
    badge('Website', 'bakeneko.app',  '555555', 'googlechrome', social.website),
    badge('LinkedIn', liHandle, '0A66C2', 'linkedin',     social.linkedin),
    badge('Bluesky', bsHandle, '0085ff', 'bluesky',      social.bluesky),
    badge('Instagram', igHandle, 'E4405F', 'instagram',    social.instagram),
  ].join('\n');

  const sleepTotalMin = Math.round(health.sleepHours * 60);
  const sleepFormatted = `${Math.floor(sleepTotalMin / 60)}h${String(sleepTotalMin % 60).padStart(2, '0')}`;

  return `# ${profile.name}

*${profile.title}*

<div align="center">
<img src="assets/generated/radar-attributes.svg" alt="Attributes"/>&nbsp;&nbsp;<img src="assets/generated/radar-skills.svg" alt="Skills"/>
</div>

<br>

<div align="center">${socialBlock}</div>

<br>

<p align="center">👤&nbsp;<strong>${profile.age}&nbsp;y/o</strong>&nbsp;&nbsp;·&nbsp;&nbsp;🏠&nbsp;${profile.residence}&nbsp;&nbsp;·&nbsp;&nbsp;📍&nbsp;${profile.location}&nbsp;&nbsp;·&nbsp;&nbsp;${weatherEmoji(profile.weatherIcon)}&nbsp;${profile.weatherTemp}°C&nbsp;&nbsp;·&nbsp;&nbsp;${availability}</p>

<p align="center">❤️&nbsp;<strong>${health.bpm}&nbsp;bpm</strong>&nbsp;&nbsp;·&nbsp;&nbsp;⚖️&nbsp;<strong>${health.weightKg}&nbsp;kg</strong>&nbsp;&nbsp;·&nbsp;&nbsp;👣&nbsp;<strong>${health.stepsToday}&nbsp;steps</strong>&nbsp;&nbsp;·&nbsp;&nbsp;😴&nbsp;<strong>${sleepFormatted}</strong>&nbsp;&nbsp;·&nbsp;&nbsp;🔥&nbsp;<strong>${health.caloriesToday}&nbsp;kcal</strong>&nbsp;&nbsp;·&nbsp;&nbsp;💻&nbsp;<strong>${profile.commitsLast30d}&nbsp;commits&nbsp;/&nbsp;30d</strong></p>

<br>

<div align="center">
<img src="assets/generated/chart-heartrate.svg" alt="Heart rate"/>&nbsp;<img src="assets/generated/chart-steps.svg" alt="Steps"/>&nbsp;<img src="assets/generated/chart-sleep.svg" alt="Sleep"/>&nbsp;<img src="assets/generated/chart-calories.svg" alt="Calories"/>
</div>

<br>

<div align="center">
<img src="assets/generated/media-watching.svg" alt="Watching"/>&nbsp;<img src="assets/generated/media-reading.svg" alt="Reading"/>&nbsp;<img src="assets/generated/media-gaming.svg" alt="Gaming"/>
</div>

<p align="center"><sub>updated ${new Date().toISOString()}</sub></p>
`;
}
