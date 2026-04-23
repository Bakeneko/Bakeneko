import * as admin from 'firebase-admin';
import type { DashboardData, ProfileData, HealthData, AttributesData, SkillsData, MediaData, SocialLinks } from './types';

let _app: admin.app.App | undefined;

export function initFirestore(): admin.firestore.Firestore {
  if (_app) return _app.firestore();
  const raw = process.env.FIRESTORE_SERVICE_ACCOUNT;
  if (raw) {
    let sa: object;
    try { sa = JSON.parse(raw); } catch { throw new Error('FIRESTORE_SERVICE_ACCOUNT is not valid JSON'); }
    _app = admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else {
    // ADC fallback for local development (requires GOOGLE_APPLICATION_CREDENTIALS)
    _app = admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'bakeneko-fr' });
  }
  return _app.firestore();
}

function calcAge(birthTimeSeconds: number): number {
  const birth = new Date(birthTimeSeconds * 1000);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function msToHours(ms: number): number {
  return Math.round((ms / 3600000) * 10) / 10;
}

function localHour(seconds: number, timezone: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: timezone })
      .format(new Date(seconds * 1000)),
    10,
  );
}

function formatPlayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}


export async function fetchDashboardData(db: admin.firestore.Firestore): Promise<DashboardData> {
  const [profileSnap, latestQuery] = await Promise.all([
    db.doc('profile/me').get(),
    db.collection('snapshots').orderBy('time', 'desc').limit(1).get(),
  ]);

  if (!profileSnap.exists) throw new Error('Firestore document not found: profile/me');
  if (latestQuery.empty) throw new Error('No documents found in snapshots collection');

  const p = profileSnap.data()!;
  const snap = latestQuery.docs[0].data();

  const profile: ProfileData = {
    name: p.name,
    age: calcAge(p.birthTime._seconds),
    title: p.title,
    residence: p.residence ?? 'Prissé, France',
    location: snap.location?.label ?? snap.location?.locality ?? 'Prissé, France',
    weatherTemp: Math.round((snap.weather?.temperature ?? 0) * 10) / 10,
    weatherIcon: snap.weather?.icon ?? '01d',
    availableForHire: p.available ?? false,
    commitsLast30d: (snap.monthlyCodeContributions as Array<{ contributionCount: number }> ?? [])
      .reduce((sum, c) => sum + (c.contributionCount ?? 0), 0),
  };

  const timezone = (snap.location?.timezone as string | undefined) ?? 'Europe/Paris';
  const bpmHourlyData = (snap.dailyHeartRates as Array<{ min: number; max: number; average: number; startTime: { _seconds: number } }> ?? [])
    .map(h => ({
      avg:  Math.round(h.average),
      min:  Math.round(h.min),
      max:  Math.round(h.max),
      hour: localHour(h.startTime._seconds, timezone),
    }));

  const health: HealthData = {
    bpm: snap.heartRate?.value ?? 0,
    bpmHourlyData,
    weightKg: Math.round((snap.weights?.[0]?.value ?? 0) * 10) / 10,
    stepsToday: snap.steps?.value ?? 0,
    stepsHistory7d: (snap.weeklySteps as Array<{ value: number }> ?? []).map(s => Math.round(s.value ?? 0)),
    sleepHours: msToHours(snap.sleep?.sleepDurationMillis ?? 0),
    sleepHistory7d: (snap.weeklySleeps as Array<{ sleepDurationMillis: number }> ?? []).map(s => msToHours(s.sleepDurationMillis ?? 0)),
    caloriesToday: Math.round(snap.calories?.value ?? 0),
    caloriesHistory7d: (snap.weeklyCalories as Array<{ value: number }> ?? []).map(s => Math.round(s.value ?? 0)),
  };

  type FirestoreRadarItem = { label: string; value: number; order: number };

  const attributes: AttributesData = (p.attributes as FirestoreRadarItem[] ?? [])
    .sort((a, b) => a.order - b.order)
    .map(a => ({ label: a.label, value: a.value }));

  const skills: SkillsData = (p.baseSkills as FirestoreRadarItem[] ?? [])
    .sort((a, b) => a.order - b.order)
    .map(s => ({ label: s.label, value: s.value }));

  const wm = snap.watchedMedia;
  const rb = snap.readBook;
  const pg = snap.playedGame;

  const media: MediaData = {
    watching: {
      title:    wm?.title ?? 'N/A',
      subtitle: wm?.subtitle?.split(' - ')?.[0] ?? wm?.subtitle ?? '',
      coverUrl: wm?.thumbnail ?? '',
    },
    reading: {
      title:    rb?.title ?? 'N/A',
      subtitle: rb?.chapter ? `Ch. ${rb.chapter}` : (rb?.subtitle ?? ''),
      coverUrl: rb?.thumbnail ?? '',
    },
    gaming: {
      title:    pg?.title ?? 'N/A',
      subtitle: pg?.playTimeForLastTwoWeeks ? formatPlayTime(pg.playTimeForLastTwoWeeks) + ' last 2 weeks' : '',
      coverUrl: pg?.thumbnail ?? '',
    },
  };

  const social: SocialLinks = {
    website:   'https://bakeneko.app',
    linkedin:  'https://www.linkedin.com/in/bakeneko/',
    bluesky:   'https://bsky.app/profile/bakeneko.fr',
    instagram: 'https://www.instagram.com/bakeneko_sama/',
  };

  return { profile, health, attributes, skills, media, social };
}
