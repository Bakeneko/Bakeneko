import * as fs from 'fs';
import * as path from 'path';
import { initFirestore, fetchDashboardData } from './firestore';
import { barChartSvg, lineChartSvg } from './svg/charts';
import { radarSvg } from './svg/radar';
import { mediaCardSvg, fetchCoverBase64 } from './svg/media-cards';
import { generateReadme } from './readme';

const ASSETS_DIR = path.join(process.cwd(), 'assets', 'generated');

function writeSvg(filename: string, content: string): void {
  fs.writeFileSync(path.join(ASSETS_DIR, filename), content, 'utf8');
}

async function main(): Promise<void> {
  console.log('🔄 Fetching data from Firestore...');
  const db = initFirestore();
  const data = await fetchDashboardData(db);
  console.log('✅ Data fetched');

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log('📊 Generating charts...');
  writeSvg('chart-heartrate.svg', lineChartSvg(data.health.bpmHourlyData,                                            '#f85149', 'Heart rate'));
  writeSvg('chart-steps.svg',     barChartSvg(data.health.stepsHistory7d,                                '#58a6ff', 'Steps'));
  writeSvg('chart-sleep.svg',     barChartSvg(data.health.sleepHistory7d.map(h => Math.round(h * 60)),   '#bc8cff', 'Sleep'));
  writeSvg('chart-calories.svg',  barChartSvg(data.health.caloriesHistory7d,                             '#f0883e', 'Calories'));

  console.log('🕸️  Generating radar charts...');
  writeSvg('radar-attributes.svg', radarSvg(
    data.attributes.map(a => a.value),
    data.attributes.map(a => a.label),
    '#2979ff',
  ));
  writeSvg('radar-skills.svg', radarSvg(
    data.skills.map(s => s.value),
    data.skills.map(s => s.label),
    '#ffc400',
  ));

  console.log('🎬 Fetching covers and generating media cards...');
  const [watchCover, readCover, gameCover] = await Promise.all([
    fetchCoverBase64(data.media.watching.coverUrl),
    fetchCoverBase64(data.media.reading.coverUrl),
    fetchCoverBase64(data.media.gaming.coverUrl),
  ]);
  writeSvg('media-watching.svg', mediaCardSvg(data.media.watching.title, data.media.watching.subtitle, '🎬', watchCover, 0.56));
  writeSvg('media-reading.svg',  mediaCardSvg(data.media.reading.title,  data.media.reading.subtitle,  '📖', readCover,  1.60));
  writeSvg('media-gaming.svg',   mediaCardSvg(data.media.gaming.title,   data.media.gaming.subtitle,   '🎮', gameCover,  0.46));

  console.log('📝 Generating README...');
  fs.writeFileSync(path.join(process.cwd(), 'README.md'), generateReadme(data), 'utf8');

  console.log('✅ Done');
  process.exit(0);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
