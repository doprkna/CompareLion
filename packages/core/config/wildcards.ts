export type WildcardEvent = {
  title: string;
  reward: string;
  tags?: string[];
};

export type WildcardConfig = Record<string, Record<string, WildcardEvent>>;

// File-based config replacement (TS) to avoid JSON in ignored zones
export const WILDCARDS: WildcardConfig = {
  '2025-10-30': {
    global: { title: 'Take a photo of your breakfast!', reward: '10 karma if funny' },
    CZ: { title: 'Sdílej svůj ranní rohlík!', reward: '10 karma za úsměv' },
  },
};


