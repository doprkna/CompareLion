/**
 * Parel Story Generator Service 2.0
 * Generates 1-3 panel and 4-8 panel stories with narrative arcs
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */
export type StoryMode = '1panel' | '3panel';
export type LayoutMode = 'vertical' | 'grid';
export interface StoryPanel {
    imageUrl: string;
    text?: string;
    caption: string;
    vibeTag: string;
    microStory: string;
    category?: string;
    role?: 'intro' | 'build' | 'peak' | 'outro';
}
export interface Story {
    panels: StoryPanel[];
    throughline?: string;
    title?: string;
    logline?: string;
}
export interface ExtendedStory {
    title: string;
    logline: string;
    panels: Array<{
        role: 'intro' | 'build' | 'peak' | 'outro';
        caption: string;
        vibeTag: string;
        microStory: string;
        imageUrl: string;
        text?: string;
        category?: string;
    }>;
}
/**
 * Generate story panels from images/texts
 */
export declare function generateStoryPanels(panelImages: string[], panelTexts: (string | null)[], mode: StoryMode): Promise<Story>;
/**
 * Generate extended story (4-8 panels) with narrative arc
 */
export declare function generateExtendedStory(panelImages: string[], panelTexts: (string | null)[], requestIds?: string[]): Promise<ExtendedStory>;
