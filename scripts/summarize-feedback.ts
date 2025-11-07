/**
 * Feedback Summarization Script
 * Analyzes feedback and generates markdown summary
 * v0.13.2l - Feedback Review System
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface FeedbackSummary {
  total: number;
  byCategory: {
    bug: number;
    idea: number;
    praise: number;
  };
  byStatus: {
    pending: number;
    reviewed: number;
    in_progress: number;
    resolved: number;
  };
  topThemes: {
    bugs: string[];
    features: string[];
    praise: string[];
  };
  examples: {
    bugs: Array<{ title: string; description: string }>;
    ideas: Array<{ title: string; description: string }>;
    praise: Array<{ title: string; description: string }>;
  };
}

/**
 * Simple keyword extraction (replaces sentiment analysis if OpenAI not available)
 */
function extractKeywords(text: string): string[] {
  const common Words = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'her',
    'us', 'them', 'not', 'no', 'yes', 'very', 'too', 'so', 'just', 'also',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count word frequency
  const freq: { [key: string]: number } = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Analyze feedback with OpenAI (if API key available)
 */
async function analyzeSentiment(feedback: string[]): Promise<string | null> {
  const openaiKey = process.env.GPT_GEN_KEY;
  
  if (!openaiKey || openaiKey.startsWith('sk_your_')) {
    console.log('⚠️  OpenAI API key not configured, skipping sentiment analysis');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a product analyst. Analyze the following user feedback and identify the top 5 themes or patterns. Be concise and specific.',
          },
          {
            role: 'user',
            content: `Analyze this feedback:\n\n${feedback.join('\n\n')}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return null;
  }
}

/**
 * Main summarization function
 */
async function summarizeFeedback() {
  console.log('📊 Starting feedback summarization...\n');

  // Fetch all feedback
  const allFeedback = await prisma.feedbackSubmission.findMany({
    orderBy: { submittedAt: 'desc' },
  });

  console.log(`✅ Loaded ${allFeedback.length} feedback submissions\n`);

  // Initialize summary
  const summary: FeedbackSummary = {
    total: allFeedback.length,
    byCategory: {
      bug: 0,
      idea: 0,
      praise: 0,
    },
    byStatus: {
      pending: 0,
      reviewed: 0,
      in_progress: 0,
      resolved: 0,
    },
    topThemes: {
      bugs: [],
      features: [],
      praise: [],
    },
    examples: {
      bugs: [],
      ideas: [],
      praise: [],
    },
  };

  // Categorize feedback
  const bugTexts: string[] = [];
  const ideaTexts: string[] = [];
  const praiseTexts: string[] = [];

  allFeedback.forEach(item => {
    // Count by category
    if (item.category === 'bug') {
      summary.byCategory.bug++;
      bugTexts.push(item.description);
      if (summary.examples.bugs.length < 5) {
        summary.examples.bugs.push({ title: item.title, description: item.description });
      }
    } else if (item.category === 'idea') {
      summary.byCategory.idea++;
      ideaTexts.push(item.description);
      if (summary.examples.ideas.length < 5) {
        summary.examples.ideas.push({ title: item.title, description: item.description });
      }
    } else if (item.category === 'praise') {
      summary.byCategory.praise++;
      praiseTexts.push(item.description);
      if (summary.examples.praise.length < 5) {
        summary.examples.praise.push({ title: item.title, description: item.description });
      }
    }

    // Count by status
    const status = item.status as keyof typeof summary.byStatus;
    if (summary.byStatus[status] !== undefined) {
      summary.byStatus[status]++;
    }
  });

  // Extract themes using keyword analysis
  console.log('🔍 Analyzing themes...\n');

  if (bugTexts.length > 0) {
    const allBugText = bugTexts.join(' ');
    summary.topThemes.bugs = extractKeywords(allBugText);
  }

  if (ideaTexts.length > 0) {
    const allIdeaText = ideaTexts.join(' ');
    summary.topThemes.features = extractKeywords(allIdeaText);
  }

  if (praiseTexts.length > 0) {
    const allPraiseText = praiseTexts.join(' ');
    summary.topThemes.praise = extractKeywords(allPraiseText);
  }

  // Optional: OpenAI sentiment analysis
  let aiAnalysis: { bugs?: string; ideas?: string; praise?: string } = {};
  
  if (bugTexts.length > 0) {
    console.log('🤖 Running AI analysis on bugs...');
    const analysis = await analyzeSentiment(bugTexts.slice(0, 20));
    if (analysis) aiAnalysis.bugs = analysis;
  }
  
  if (ideaTexts.length > 0) {
    console.log('🤖 Running AI analysis on ideas...');
    const analysis = await analyzeSentiment(ideaTexts.slice(0, 20));
    if (analysis) aiAnalysis.ideas = analysis;
  }

  // Generate markdown report
  console.log('\n📝 Generating markdown report...\n');

  const markdown = `# Feedback Summary - PareL v0.13.2l

**Generated:** ${new Date().toISOString()}

---

## 📊 Overview

- **Total Submissions:** ${summary.total}
- **Bug Reports:** ${summary.byCategory.bug}
- **Feature Ideas:** ${summary.byCategory.idea}
- **Praise:** ${summary.byCategory.praise}

### Status Breakdown

- **Pending:** ${summary.byStatus.pending}
- **Reviewed:** ${summary.byStatus.reviewed}
- **In Progress:** ${summary.byStatus.in_progress}
- **Resolved:** ${summary.byStatus.resolved}

---

## 🐛 Bug Reports

### Top Themes
${summary.topThemes.bugs.length > 0 ? summary.topThemes.bugs.map(t => `- ${t}`).join('\n') : '- No themes identified'}

${aiAnalysis.bugs ? `\n### AI Analysis\n${aiAnalysis.bugs}\n` : ''}

### Examples
${summary.examples.bugs.length > 0 ? summary.examples.bugs.map((b, i) => `\n#### ${i + 1}. ${b.title}\n${b.description}\n`).join('\n') : 'No bug reports yet.'}

---

## 💡 Feature Ideas

### Top Themes
${summary.topThemes.features.length > 0 ? summary.topThemes.features.map(t => `- ${t}`).join('\n') : '- No themes identified'}

${aiAnalysis.ideas ? `\n### AI Analysis\n${aiAnalysis.ideas}\n` : ''}

### Examples
${summary.examples.ideas.length > 0 ? summary.examples.ideas.map((b, i) => `\n#### ${i + 1}. ${b.title}\n${b.description}\n`).join('\n') : 'No feature ideas yet.'}

---

## 🎉 Praise

### Top Themes
${summary.topThemes.praise.length > 0 ? summary.topThemes.praise.map(t => `- ${t}`).join('\n') : '- No themes identified'}

### Examples
${summary.examples.praise.length > 0 ? summary.examples.praise.map((b, i) => `\n#### ${i + 1}. ${b.title}\n${b.description}\n`).join('\n') : 'No praise yet.'}

---

## 📈 Recommendations

Based on the feedback analysis:

### High Priority
1. Address critical bug reports (${summary.byStatus.pending} pending)
2. Review top feature requests
3. Acknowledge positive feedback

### Medium Priority
1. Investigate recurring themes
2. Plan UX improvements
3. Update documentation

### Low Priority
1. Nice-to-have features
2. Minor UI tweaks
3. Performance optimizations

---

**Next Steps:** Review individual feedback items in admin dashboard at \`/admin/feedback\`
`;

  // Write to file
  const outputPath = path.join(process.cwd(), 'FEEDBACK_SUMMARY_v0.13.2l.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`✅ Summary written to: ${outputPath}\n`);
  console.log('📊 Summary:');
  console.log(`   Total: ${summary.total}`);
  console.log(`   Bugs: ${summary.byCategory.bug}`);
  console.log(`   Ideas: ${summary.byCategory.idea}`);
  console.log(`   Praise: ${summary.byCategory.praise}`);
  console.log(`   Pending: ${summary.byStatus.pending}`);
  console.log('\n✅ Feedback summarization complete!');

  return summary;
}

// Run if called directly
if (require.main === module) {
  summarizeFeedback()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Summarization failed:', error);
      process.exit(1);
    });
}

export { summarizeFeedback };

