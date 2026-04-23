export interface ProfileData {
  name: string;
  title: string;
  age: number;
  residence: string;
  location: string;
  weatherTemp: number;
  weatherIcon: string;
  availableForHire: boolean;
  commitsLast30d: number;
}

export interface BpmPoint {
  avg: number;
  min: number;
  max: number;
  hour: number; // local hour (0–23) derived from startTime timestamp
}

export interface HealthData {
  bpm: number;
  bpmHourlyData: BpmPoint[];
  weightKg: number;
  stepsToday: number;
  stepsHistory7d: number[];
  sleepHours: number;
  sleepHistory7d: number[];
  caloriesToday: number;
  caloriesHistory7d: number[];
}

export interface RadarEntry {
  label: string;
  value: number; // normalized 0–1
}

export type AttributesData = RadarEntry[];
export type SkillsData = RadarEntry[];

export interface MediaItem {
  title: string;
  subtitle: string;
  coverUrl: string;
}

export interface MediaData {
  watching: MediaItem;
  reading: MediaItem;
  gaming: MediaItem;
}

export interface SocialLinks {
  website: string;
  linkedin: string;
  bluesky: string;
  instagram: string;
}

export interface DashboardData {
  profile: ProfileData;
  social: SocialLinks;
  attributes: AttributesData;
  skills: SkillsData;
  health: HealthData;
  media: MediaData;
}
