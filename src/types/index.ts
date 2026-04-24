export interface UserProfile {
  username: string;
  avatar?: string;
  animeClass: string;
  animeClassJP: string;
  yearsWatching: number;
  totalShowsCompleted: number;
  totalEpisodesWatched: number;
  avgEpisodesPerDay: number;
  longestBingeStreak: number;
}

export interface TasteProfile {
  action: number;
  romance: number;
  sliceOfLife: number;
  psychological: number;
  comedy: number;
  fantasy: number;
  drama: number;
}

export interface TopAnime {
  id: string;
  animeId?: number;
  title: string;
  titleJP?: string;
  year?: number;
  colorAccent: string;
  rating?: number;
  episodes?: number;
  coverUrl?: string;
}

export interface AestheticColor {
  hex: string;
  label: string;
}

export interface EmotionalProfile {
  hype: number;
  melancholy: number;
  nostalgia: number;
  foundFamily: number;
  betrayal: number;
  sacrifice: number;
  philosophical: number;
  triggerTags: string[];
  vibeSummary: string;
}

export type TimelineEntryType = 'arc' | 'milestone' | 'countdown';
export type TimelineEntryStatus = 'completed' | 'in-progress' | 'upcoming';

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  titleJP?: string;
  description?: string;
  status: TimelineEntryStatus;
  type: TimelineEntryType;
  icon?: string;
}

export interface CountdownTarget {
  id: string;
  label: string;
  labelJP: string;
  targetDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  titleJP: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'binge' | 'emotional' | 'variety' | 'dedication';
}

export interface ArcRating {
  id: string;
  animeTitle: string;
  arcName: string;
  difficulty: number; // 1–5
}

export type ThemePreset = 'cream' | 'dark' | 'sakura' | 'ocean' | 'matcha';
export type BorderStyle = 'sketchy' | 'clean';
export type Language = 'jp' | 'en' | 'both';
export type Density = 'compact' | 'spacious';

export interface TweaksConfig {
  theme: ThemePreset;
  brightness: number;
  borderStyle: BorderStyle;
  language: Language;
  density: Density;
}

export interface KairoState {
  profile: UserProfile;
  taste: TasteProfile;
  topAnime: TopAnime[];
  aestheticColors: AestheticColor[];
  emotional: EmotionalProfile;
  timeline: TimelineEntry[];
  countdowns: CountdownTarget[];
  achievements: Achievement[];
  arcRatings: ArcRating[];
  tweaks: TweaksConfig;
}
