/**
 * Flow Topic config (P6)
 * Single source for mood presentation + lightweight emotional routing.
 */

export type FlowMoodIntensity = 'light' | 'medium' | 'heavy';

export type FlowMoodKey =
  | 'funny'
  | 'deep'
  | 'spicy'
  | 'chaotic'
  | 'comfort'
  | 'wildcard'
  | 'late-night'
  | 'social'
  | 'reflective'
  | 'light';

export interface FlowMoodProfile {
  key: FlowMoodKey;
  label: string;
  subtitle: string;
  moodClass: string;
  intensity: FlowMoodIntensity;
  safeForGeneralAudience: boolean;
}

export interface FlowTopicMood {
  subtitle: string;
  moodClass: string;
  tag?: string;
}

const FLOW_MOOD_CONFIG: Record<FlowMoodKey, Omit<FlowMoodProfile, 'key'>> = {
  funny: {
    label: 'Funny',
    subtitle: 'Unexpected, playful questions',
    moodClass: 'bg-violet-500/10 border-violet-500/30',
    intensity: 'light',
    safeForGeneralAudience: true,
  },
  deep: {
    label: 'Deep',
    subtitle: 'Thoughtful and personal prompts',
    moodClass: 'bg-amber-500/10 border-amber-500/30',
    intensity: 'heavy',
    safeForGeneralAudience: true,
  },
  spicy: {
    label: 'Spicy',
    subtitle: 'Sharpened, boundary-pushing choices',
    moodClass: 'bg-red-500/10 border-red-500/30',
    intensity: 'heavy',
    safeForGeneralAudience: false,
  },
  chaotic: {
    label: 'Chaotic',
    subtitle: 'Wild twists and strange turns',
    moodClass: 'bg-fuchsia-500/10 border-fuchsia-500/30',
    intensity: 'medium',
    safeForGeneralAudience: true,
  },
  comfort: {
    label: 'Comfort',
    subtitle: 'Gentle, familiar self-checks',
    moodClass: 'bg-emerald-500/10 border-emerald-500/30',
    intensity: 'light',
    safeForGeneralAudience: true,
  },
  wildcard: {
    label: 'Wildcard',
    subtitle: 'Unexpected cards from any lane',
    moodClass: 'bg-indigo-500/10 border-indigo-500/30',
    intensity: 'medium',
    safeForGeneralAudience: true,
  },
  'late-night': {
    label: 'Late Night',
    subtitle: 'Raw, unfiltered late-hour energy',
    moodClass: 'bg-slate-500/20 border-slate-400/40',
    intensity: 'heavy',
    safeForGeneralAudience: false,
  },
  social: {
    label: 'Social',
    subtitle: 'People, dynamics, and connection',
    moodClass: 'bg-rose-500/10 border-rose-500/30',
    intensity: 'medium',
    safeForGeneralAudience: true,
  },
  reflective: {
    label: 'Reflective',
    subtitle: 'Identity, values, and perspective',
    moodClass: 'bg-sky-500/10 border-sky-500/30',
    intensity: 'medium',
    safeForGeneralAudience: true,
  },
  light: {
    label: 'Light',
    subtitle: 'Quick and easy to answer',
    moodClass: 'bg-accent/10 border-accent/30',
    intensity: 'light',
    safeForGeneralAudience: true,
  },
};

function profile(mood: FlowMoodKey): FlowMoodProfile {
  return {
    key: mood,
    ...FLOW_MOOD_CONFIG[mood],
  };
}

const TOPIC_MOOD_MAP: Record<string, FlowMoodKey> = {
  starter: 'light',
  work: 'deep',
  career: 'deep',
  family: 'social',
  relationships: 'social',
  lifestyle: 'comfort',
  habits: 'comfort',
  fun: 'funny',
  weird: 'chaotic',
  personal: 'reflective',
  alpha: 'light',
  wildcard: 'wildcard',
  spicy: 'spicy',
  adult: 'spicy',
  nsfw: 'spicy',
  'late_night': 'late-night',
  community: 'social',
};

function keyFrom(name: string, slug?: string | null): string {
  const s = (slug || name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const parts = [...new Set([s, ...n.split(/\s+/)])];
  for (const p of parts) {
    if (p && TOPIC_MOOD_MAP[p]) return p;
  }
  return parts[0] || 'default';
}

export function getFlowTopicMood(name: string, slug?: string | null): FlowTopicMood {
  const mood = getFlowMoodProfile(name, slug);
  return {
    subtitle: mood.subtitle || `${name} - themed questions`,
    moodClass: mood.moodClass,
    tag: mood.key,
  };
}

export function getFlowMoodProfile(name: string, slug?: string | null): FlowMoodProfile {
  const key = keyFrom(name, slug);
  const moodKey = TOPIC_MOOD_MAP[key] ?? 'reflective';
  return profile(moodKey);
}

export function getContrastingMood(currentMood: FlowMoodKey | string | undefined | null): FlowMoodKey[] {
  switch (currentMood) {
    case 'deep':
      return ['light', 'funny', 'comfort'];
    case 'funny':
      return ['reflective', 'deep'];
    case 'spicy':
      return ['comfort', 'light'];
    case 'wildcard':
      return ['light'];
    case 'comfort':
      return ['deep', 'social'];
    case 'chaotic':
      return ['reflective', 'comfort'];
    case 'late-night':
      return ['light', 'comfort'];
    case 'social':
      return ['reflective', 'deep'];
    case 'light':
      return ['deep', 'social'];
    case 'reflective':
      return ['light', 'social'];
    default:
      return ['reflective'];
  }
}
