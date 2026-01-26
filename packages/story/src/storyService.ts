/**
 * Parel Story Generator Service 2.0
 * Generates 1-3 panel and 4-8 panel stories with narrative arcs
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { GEN_CONFIG } from '@parel/core';
import { detectImageCategory } from '@parel/rating';

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
export async function generateStoryPanels(
  panelImages: string[],
  panelTexts: (string | null)[],
  mode: StoryMode
): Promise<Story> {
  try {
    if (panelImages.length === 0) {
      throw new Error('At least one panel image is required');
    }

    const numPanels = mode === '1panel' ? 1 : 3;
    if (panelImages.length > numPanels) {
      throw new Error(`Too many panels for ${mode} mode`);
    }

    // Generate panels
    const panels: StoryPanel[] = await Promise.all(
      panelImages.map(async (imageUrl, index) => {
        const text = panelTexts[index] || null;

        // Detect category (optional)
        let category: string | undefined;
        try {
          const detection = await detectImageCategory(imageUrl);
          category = detection.final;
        } catch (error) {
          logger.debug('[Story] Category detection failed', { imageUrl, error });
        }

        // Generate panel content via AI
        const panelContent = await callAIForPanel(imageUrl, text, category);

        return {
          imageUrl,
          text: text || undefined,
          caption: panelContent.caption,
          vibeTag: panelContent.vibeTag,
          microStory: panelContent.microStory,
          category,
        };
      })
    );

    // Generate throughline for 3-panel stories
    let throughline: string | undefined;
    if (mode === '3panel' && panels.length === 3) {
      throughline = await callAIForThroughline(panels);
    }

    return {
      panels,
      throughline,
    };
  } catch (error) {
    logger.error('[Story] Failed to generate story panels', { error, panelImages, mode });
    throw error;
  }
}

/**
 * Call AI to generate panel content
 */
async function callAIForPanel(
  imageUrl: string,
  text: string | null,
  category: string | undefined
): Promise<{ caption: string; vibeTag: string; microStory: string }> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback
    return {
      caption: 'A moment captured',
      vibeTag: 'vibe',
      microStory: 'This tells a story.',
    };
  }

  try {
    const systemPrompt = `You are a creative storyteller for Parel Stories.
Generate short, engaging content for story panels.
Keep captions under 10 words, vibe tags 1-2 words, micro stories 1 sentence.`;

    const userPrompt = `Image: ${imageUrl}
${text ? `Text context: ${text}` : ''}
${category ? `Category: ${category}` : ''}

Generate:
1. Caption (under 10 words, engaging)
2. Vibe tag (1-2 words, like "cozy", "chaotic", "minimal")
3. Micro story (1 sentence narrative)

Return JSON:
{
  "caption": "...",
  "vibeTag": "...",
  "microStory": "..."
}`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse JSON
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    return {
      caption: parsed.caption || 'A moment captured',
      vibeTag: parsed.vibeTag || 'vibe',
      microStory: parsed.microStory || 'This tells a story.',
    };
  } catch (error) {
    logger.warn('[Story] AI panel generation failed, using fallback', { error });
    return {
      caption: 'A moment captured',
      vibeTag: 'vibe',
      microStory: 'This tells a story.',
    };
  }
}

/**
 * Call AI to generate throughline for 3-panel story
 */
async function callAIForThroughline(panels: StoryPanel[]): Promise<string> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    return 'These moments connect to tell a story.';
  }

  try {
    const systemPrompt = `You are a creative storyteller for Parel Stories.
Generate a short throughline (1-2 sentences) that connects 3 story panels.`;

    const userPrompt = `Panel 1: ${panels[0].caption} - ${panels[0].microStory}
Panel 2: ${panels[1].caption} - ${panels[1].microStory}
Panel 3: ${panels[2].caption} - ${panels[2].microStory}

Generate a short throughline (1-2 sentences) connecting these panels.`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    return content || 'These moments connect to tell a story.';
  } catch (error) {
    logger.warn('[Story] AI throughline generation failed, using fallback', { error });
    return 'These moments connect to tell a story.';
  }
}

/**
 * Generate extended story (4-8 panels) with narrative arc
 */
export async function generateExtendedStory(
  panelImages: string[],
  panelTexts: (string | null)[],
  requestIds?: string[]
): Promise<ExtendedStory> {
  try {
    if (panelImages.length < 4 || panelImages.length > 8) {
      throw new Error('Extended stories require 4-8 panels');
    }

    // Fetch AURE context if requestIds provided
    const aureContexts: Record<number, string> = {};
    if (requestIds && requestIds.length > 0) {
      try {
        const results = await prisma.ratingResult.findMany({
          where: {
            requestId: {
              in: requestIds.slice(0, panelImages.length),
            },
          },
          select: {
            requestId: true,
            summaryText: true,
          },
        });

        results.forEach((result, idx) => {
          const panelIndex = requestIds.indexOf(result.requestId);
          if (panelIndex >= 0) {
            aureContexts[panelIndex] = result.summaryText;
          }
        });
      } catch (error) {
        logger.debug('[Story] Failed to fetch AURE context', { error });
      }
    }

    // Detect categories for all panels
    const categories: (string | undefined)[] = await Promise.all(
      panelImages.map(async (imageUrl) => {
        try {
          const detection = await detectImageCategory(imageUrl);
          return detection.final;
        } catch (error) {
          logger.debug('[Story] Category detection failed', { imageUrl, error });
          return undefined;
        }
      })
    );

    // Generate extended story with narrative structure
    const story = await callAIForExtendedStory(
      panelImages,
      panelTexts,
      categories,
      aureContexts
    );

    return story;
  } catch (error) {
    logger.error('[Story] Failed to generate extended story', { error, panelImages });
    throw error;
  }
}

/**
 * Call AI to generate extended story with narrative arc
 */
async function callAIForExtendedStory(
  panelImages: string[],
  panelTexts: (string | null)[],
  categories: (string | undefined)[],
  aureContexts: Record<number, string>
): Promise<ExtendedStory> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback
    const roles: ('intro' | 'build' | 'peak' | 'outro')[] = ['intro', 'build', 'peak', 'outro'];
    const numPanels = panelImages.length;
    const roleMap = mapPanelsToRoles(numPanels);

    return {
      title: 'A Story',
      logline: 'A collection of moments that tell a story.',
      panels: panelImages.map((imageUrl, index) => ({
        role: roleMap[index],
        imageUrl,
        text: panelTexts[index] || undefined,
        caption: 'A moment captured',
        vibeTag: 'vibe',
        microStory: 'This tells a story.',
        category: categories[index],
      })),
    };
  }

  try {
    const systemPrompt = `You are a creative storyteller for Parel Stories.
Generate a narrative arc story from 4-8 panels with structure: intro → build → peak → outro.
Keep captions under 10 words, vibe tags 1-2 words, micro stories 1 sentence.`;

    // Build panel descriptions
    const panelDescriptions = panelImages.map((imageUrl, index) => {
      const text = panelTexts[index] || '';
      const category = categories[index] || '';
      const aureContext = aureContexts[index] || '';
      return `Panel ${index + 1}:
- Image: ${imageUrl}
${text ? `- Text: ${text}` : ''}
${category ? `- Category: ${category}` : ''}
${aureContext ? `- AURE Context: ${aureContext.substring(0, 100)}` : ''}`;
    }).join('\n\n');

    const numPanels = panelImages.length;
    const roleMap = mapPanelsToRoles(numPanels);
    const roleDescription = roleMap.map((role, idx) => `Panel ${idx + 1}: ${role}`).join(', ');

    const userPrompt = `Create a narrative arc story from ${numPanels} panels.

Panel Structure: ${roleDescription}

Panels:
${panelDescriptions}

Generate:
1. Title (short, catchy, 2-5 words)
2. Logline (1-2 sentences summarizing the story)
3. For each panel:
   - Caption (under 10 words)
   - Vibe tag (1-2 words)
   - Micro story (1 sentence that fits the narrative role)

Return JSON:
{
  "title": "...",
  "logline": "...",
  "panels": [
    {
      "role": "intro|build|peak|outro",
      "caption": "...",
      "vibeTag": "...",
      "microStory": "..."
    },
    ...
  ]
}`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse JSON
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and map to ExtendedStory
    if (!parsed.title || !parsed.logline || !Array.isArray(parsed.panels)) {
      throw new Error('Invalid extended story structure');
    }

    // Ensure panels match input count
    const panels = parsed.panels.slice(0, panelImages.length).map((panel: any, index: number) => ({
      role: (panel.role || roleMap[index]) as 'intro' | 'build' | 'peak' | 'outro',
      imageUrl: panelImages[index],
      text: panelTexts[index] || undefined,
      caption: panel.caption || 'A moment captured',
      vibeTag: panel.vibeTag || 'vibe',
      microStory: panel.microStory || 'This tells a story.',
      category: categories[index],
    }));

    return {
      title: parsed.title,
      logline: parsed.logline,
      panels,
    };
  } catch (error) {
    logger.warn('[Story] AI extended story generation failed, using fallback', { error });
    const numPanels = panelImages.length;
    const roleMap = mapPanelsToRoles(numPanels);
    return {
      title: 'A Story',
      logline: 'A collection of moments that tell a story.',
      panels: panelImages.map((imageUrl, index) => ({
        role: roleMap[index],
        imageUrl,
        text: panelTexts[index] || undefined,
        caption: 'A moment captured',
        vibeTag: 'vibe',
        microStory: 'This tells a story.',
        category: categories[index],
      })),
    };
  }
}

/**
 * Map panel indices to narrative roles
 */
function mapPanelsToRoles(numPanels: number): ('intro' | 'build' | 'peak' | 'outro')[] {
  const roles: ('intro' | 'build' | 'peak' | 'outro')[] = [];
  
  if (numPanels === 4) {
    return ['intro', 'build', 'peak', 'outro'];
  } else if (numPanels === 5) {
    return ['intro', 'build', 'build', 'peak', 'outro'];
  } else if (numPanels === 6) {
    return ['intro', 'intro', 'build', 'build', 'peak', 'outro'];
  } else if (numPanels === 7) {
    return ['intro', 'intro', 'build', 'build', 'peak', 'peak', 'outro'];
  } else if (numPanels === 8) {
    return ['intro', 'intro', 'build', 'build', 'build', 'peak', 'peak', 'outro'];
  }
  
  // Fallback: distribute evenly
  for (let i = 0; i < numPanels; i++) {
    if (i === 0) {
      roles.push('intro');
    } else if (i === numPanels - 1) {
      roles.push('outro');
    } else if (i === Math.floor(numPanels / 2)) {
      roles.push('peak');
    } else {
      roles.push('build');
    }
  }
  
  return roles;
}

