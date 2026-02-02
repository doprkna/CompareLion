/** @parel/story stub - build resolution only */
export type StoryMode = '1panel' | '3panel';
export type LayoutMode = 'vertical' | 'grid';
export declare function generateStoryPanels(
  panelImages: string[],
  panelTexts: (string | null)[],
  mode: StoryMode
): Promise<unknown>;
export declare function generateExtendedStory(
  userId: string,
  input: unknown,
  layoutMode?: LayoutMode
): Promise<unknown>;
