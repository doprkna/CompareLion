/**
 * Audio Track List
 * v0.22.7 - Central track configuration
 */

export type Track = { 
  id: string; 
  title: string; 
  artist?: string; 
  src: string; 
  loop?: boolean 
};

export const DEFAULT_TRACKS: Track[] = [
  // Safe placeholder - 1s silent WAV data URI prevents crashes if no assets exist
  // This ensures the player works even without actual audio files
  {
    id: "silent-1s",
    title: "Silent Placeholder",
    artist: "System",
    src: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=",
    loop: true,
  },
  
  // Uncomment and populate when real audio files are added to /public/audio/
  // {
  //   id: "lofi-1",
  //   title: "Lofi Loop",
  //   artist: "PAREL",
  //   src: "/audio/lofi-loop.mp3",
  //   loop: true,
  // },
];

