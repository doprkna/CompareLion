/**
 * Question Summary Service
 * Generate AI summaries of question answer threads
 * v0.37.8 - AI Summary Snippet
 */
/**
 * Generate a short AI summary of all answers to a question
 *
 * @param questionTemplateId - Question template ID
 * @returns Summary text (1-2 sentences)
 */
export declare function generateSummarySnippet(questionTemplateId: string): Promise<string>;
