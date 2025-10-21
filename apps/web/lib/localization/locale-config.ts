/**
 * Localization Configuration (v0.11.14)
 * 
 * PLACEHOLDER: Multi-language support configuration.
 */

export const SUPPORTED_LOCALES = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  cs: {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    flag: "🇨🇿",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  jp: {
    code: "jp",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
  },
} as const;

export const DEFAULT_LOCALE = "en";

export type LocaleCode = keyof typeof SUPPORTED_LOCALES;

/**
 * Get user's preferred locale
 */
export async function getUserLocale(userId: string): Promise<string> {
  console.log("[Locale] PLACEHOLDER: Would get user locale", { userId });
  
  // PLACEHOLDER: Would execute
  // const preference = await prisma.languagePreference.findUnique({
  //   where: { userId },
  // });
  // 
  // return preference?.locale || DEFAULT_LOCALE;
  
  return DEFAULT_LOCALE;
}

/**
 * Set user's preferred locale
 */
export async function setUserLocale(userId: string, locale: string) {
  console.log("[Locale] PLACEHOLDER: Would set user locale", {
    userId,
    locale,
  });
  
  // PLACEHOLDER: Would execute
  // await prisma.languagePreference.upsert({
  //   where: { userId },
  //   update: { locale },
  //   create: {
  //     userId,
  //     locale,
  //     fallbackLocale: DEFAULT_LOCALE,
  //   },
  // });
}

/**
 * Detect locale from browser headers
 */
export function detectLocaleFromHeaders(
  acceptLanguage?: string | null
): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  
  // Parse Accept-Language header
  // Example: "en-US,en;q=0.9,cs;q=0.8"
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      const locale = code.split("-")[0].toLowerCase();
      const quality = qValue ? parseFloat(qValue) : 1.0;
      return { locale, quality };
    })
    .sort((a, b) => b.quality - a.quality);
  
  // Find first supported locale
  for (const { locale } of languages) {
    if (locale in SUPPORTED_LOCALES) {
      return locale;
    }
  }
  
  return DEFAULT_LOCALE;
}











