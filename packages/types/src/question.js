/**
 * Question Type Definitions with Localization Support
 * v0.23.0 - Phase G: Localization & Regional Logic
 */
/**
 * Helper to extract localization from question metadata
 */
export function getQuestionLocalization(question) {
    if (question.metadata?.localization) {
        return question.metadata.localization;
    }
    // Fallback to top-level fields if present
    return {
        lang: question.lang || undefined,
        region: question.region || undefined,
        excludeRegions: question.excludeRegions || undefined,
    };
}
/**
 * Helper to check if question matches language
 */
export function matchesLanguage(question, targetLang) {
    const langs = question.lang || question.metadata?.localization?.lang;
    if (!langs || langs.length === 0)
        return true; // no restriction = global
    return langs.includes(targetLang);
}
/**
 * Helper to check if question matches region
 */
export function matchesRegion(question, targetRegion) {
    const regions = question.region || question.metadata?.localization?.region;
    const excludes = question.excludeRegions || question.metadata?.localization?.excludeRegions;
    // If no restrictions, it's global
    if ((!regions || regions.length === 0) && (!excludes || excludes.length === 0)) {
        return true;
    }
    // Check inclusion
    const regionOk = !regions || regions.length === 0 || regions.includes(targetRegion) || regions.includes('GLOBAL');
    // Check exclusion
    const notExcluded = !excludes || !excludes.includes(targetRegion);
    return regionOk && notExcluded;
}
/**
 * Filter questions by language and region
 */
export function filterQuestionsByLocale(questions, lang = 'en', region = 'GLOBAL') {
    return questions.filter(q => {
        const langOk = matchesLanguage(q, lang);
        const regionOk = matchesRegion(q, region);
        return langOk && regionOk;
    });
}
