/** @parel/story stub - build resolution only */
export interface StoryTemplateData {
  name: string;
  description: string;
  panelCount: number;
  layoutMode: 'vertical' | 'grid';
  panelLabels: string[];
  panelHelpTexts?: string[];
  isPublic: boolean;
}
export declare function createStoryTemplate(
  userId: string,
  data: StoryTemplateData
): Promise<unknown>;
export declare function getUserTemplates(userId: string): Promise<unknown[]>;
export declare function getTemplateById(templateId: string): Promise<unknown>;
