export const THEMES = {
  default: { bg: "bg-neutral-100", text: "text-neutral-900" },
  modern: { bg: "bg-white", text: "text-black" },
  kawaii: { bg: "bg-pink-100", text: "text-pink-800" },
  neon: { bg: "bg-slate-900", text: "text-cyan-400" },
  classic: { bg: "bg-gray-50", text: "text-gray-900" },
};

export type ThemeName = keyof typeof THEMES;

