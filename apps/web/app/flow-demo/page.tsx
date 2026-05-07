'use client';

/**
 * Flow Demo Page
 * Question step uses shared QuestionInput (RANGE slider, MULTI_CHOICE, NUMERIC alias, etc.)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@parel/ui';
import { useToast } from '@/components/ui/use-toast';
import { FeedbackPromptModal, wasFeedbackDismissedThisSession } from '@/components/feedback/FeedbackPromptModal';
import { ParallelsSection } from '@/components/parallels/ParallelsSection';
import { SkipTopicSuggestionModal } from '@/components/flow/SkipTopicSuggestionModal';
import {
  QuestionInput,
  getInitialValue,
  isValidAnswer,
  toApiPayload,
  normalizeFlowQuestionType,
  type FlowQuestion,
  type AnswerValue,
} from '@/components/flow/QuestionInput';
import { getContrastingMood, getFlowMoodProfile, getFlowTopicMood, type FlowMoodKey } from '@/lib/flowTopics';
import type { FlowReward } from '@parel/core';
import {
  DEMO_GHOST_FLOW_CATEGORY_ID,
  isClientOnlyDemoCategory,
  getDemoGhostQuestions,
  formatLocalFallbackYou,
  buildLocalFallbackReportData,
  getGlobalHintForDemoQuestion,
  type DemoGhostReportRow,
} from '@/lib/flow/demoGhostFallback';
import { resolveGuestDemoResultCopy } from '@/lib/flow/demoResultCopy';
import { signupHrefFromDemoResult } from '@/lib/auth/demoResultHandoff';
import { FlowFirstQuestionHint } from '@/components/flow/FlowFirstQuestionHint';
import { FLOW_CONTENT_KEYS } from '@/lib/content/flowContent';
import { resolveContent } from '@/lib/content/resolveContent';
import { FlowArchetypeBadge } from '@/components/flow/FlowArchetypeBadge';
import { FlowShareCard } from '@/components/flow/FlowShareCard';
import { getAgeGroup, type FlowAgeGroup } from '@/lib/flow/getAgeGroup';
import { FlowTemptationCard, type FlowTemptationData } from '@/components/flow/FlowTemptationCard';
import {
  getCheckpointAmbientSignal,
  getEntryAmbientSignal,
  getTemptationAmbientSignal,
} from '@/lib/ambientSocial';

interface FlowCategory {
  id: string;
  name: string;
  questionCount: number;
  slug?: string;
  isStarter?: boolean;
  /** Client-only demo (no `/api/flow/start` or `/api/flow/answer`); e.g. ghost / guest `/flow-demo`. */
  isFallback?: boolean;
}

type FlowHookPreview = Record<string, string>;
type ShareAction = 'share' | 'copyText' | 'publicLink';

const ADULT_CATEGORY_HINT_RE = /(adult|spicy|nsfw|18\+|late[-\s]?night)/i;
// TODO: Future: replace heuristic adult/spicy gating with explicit content metadata.

function fallbackHookQuestionForCategory(cat: FlowCategory): string {
  const key = `${cat.name} ${cat.slug ?? ''}`.toLowerCase();
  if (key.includes('relationship') || key.includes('family')) {
    return 'Would you rather know every lie or hear every thought?';
  }
  if (key.includes('work') || key.includes('career')) {
    return 'Would you rather be underpaid and calm, or overpaid and always stressed?';
  }
  if (key.includes('fun') || key.includes('weird') || key.includes('chaos')) {
    return 'Would you rather swap lives with your last ex or your last boss?';
  }
  if (key.includes('wildcard')) {
    return 'Would you rather lose all social media forever or never travel again?';
  }
  if (key.includes('habit') || key.includes('lifestyle')) {
    return 'Would you rather wake up at 5AM every day or never sleep before midnight?';
  }
  return 'Would you rather be understood by everyone or surprise everyone?';
}

function rewardPreviewFromQuestionCount(questionCount: number): string {
  const raw = 140 + Math.max(0, questionCount) * 12;
  const rounded = Math.round(raw / 10) * 10;
  return `+${Math.min(rounded, 320)} coins`;
}

function resolveCheckpointCopyByMood(mood: FlowMoodKey | string | undefined) {
  if (mood === 'deep' || mood === 'reflective') {
    return {
      body: 'Your answers are starting to show a pattern.',
      curiosity: 'The next prompts may go even deeper.',
    };
  }
  if (mood === 'funny' || mood === 'light' || mood === 'chaotic') {
    return {
      body: 'Okay, this is getting suspiciously revealing.',
      curiosity: 'The next prompts get bolder.',
    };
  }
  if (mood === 'spicy' || mood === 'late-night') {
    return {
      body: 'This topic is getting sharper.',
      curiosity: 'The next prompts turn up the heat.',
    };
  }
  if (mood === 'comfort' || mood === 'social') {
    return {
      body: "You're building a softer picture of yourself.",
      curiosity: 'The next prompts stay personal.',
    };
  }
  return {
    body: resolveContent(
      FLOW_CONTENT_KEYS.checkpointBody,
      'Your answers are starting to form a pattern.'
    ),
    curiosity: resolveContent(FLOW_CONTENT_KEYS.checkpointCuriosity, 'Next questions get more personal.'),
  };
}

/** API payload from GET /api/flow/question (features flow shape) */
type DemoQuestion = FlowQuestion & { difficulty?: string };

const DEMO_FALLBACK_CATEGORY: FlowCategory = {
  id: DEMO_GHOST_FLOW_CATEGORY_ID,
  name: 'Quick questions',
  questionCount: getDemoGhostQuestions().length,
  isStarter: true,
  isFallback: true,
};

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickBySeed<T>(items: T[], seedSource: string): T {
  return items[stableHash(seedSource) % items.length];
}

function archetypeFromSimilarity(similarityAvg: number | null): string {
  if (similarityAvg == null) {
    return resolveContent(FLOW_CONTENT_KEYS.archetypeFallback, 'The Explorer');
  }
  if (similarityAvg > 65) {
    return resolveContent(FLOW_CONTENT_KEYS.archetypeAligned, 'The Aligned Thinker');
  }
  if (similarityAvg < 40) {
    return resolveContent(FLOW_CONTENT_KEYS.archetypeOutlier, 'The Outlier');
  }
  return resolveContent(FLOW_CONTENT_KEYS.archetypeBalanced, 'The Balanced One');
}

function insightCopyFromSimilarity(
  similarityAvg: number | null,
  seedSource: string,
  ageGroup: FlowAgeGroup
): { title: string; subtitle: string } {
  if (similarityAvg == null) {
    return {
      title: resolveContent(FLOW_CONTENT_KEYS.insightFallback, "You've completed your first comparison."),
      subtitle: resolveContent(
        FLOW_CONTENT_KEYS.insightFallbackSubtitle,
        'Keep going to see how your patterns compare with more people.'
      ),
    };
  }
  if (similarityAvg > 60) {
    const titleKey = pickBySeed(
      [FLOW_CONTENT_KEYS.insightHigh1, FLOW_CONTENT_KEYS.insightHigh2],
      `insight-high-${ageGroup}-${seedSource}`
    );
    return {
      title: resolveContent(
        titleKey,
        resolveContent(FLOW_CONTENT_KEYS.insightHigh, 'You think more like others than you expect.')
      ),
      subtitle: `${resolveContent(FLOW_CONTENT_KEYS.insightAvgSubtitle, 'Average match right now:')} ${similarityAvg}%.`,
    };
  }
  if (similarityAvg < 40) {
    const titleKey = pickBySeed(
      [FLOW_CONTENT_KEYS.insightLow1, FLOW_CONTENT_KEYS.insightLow2],
      `insight-low-${ageGroup}-${seedSource}`
    );
    return {
      title: resolveContent(
        titleKey,
        resolveContent(FLOW_CONTENT_KEYS.insightLow, 'You see things differently than most people.')
      ),
      subtitle: `${resolveContent(FLOW_CONTENT_KEYS.insightAvgSubtitle, 'Average match right now:')} ${similarityAvg}%.`,
    };
  }
  const titleKey = pickBySeed(
    [FLOW_CONTENT_KEYS.insightMid1, FLOW_CONTENT_KEYS.insightMid2],
    `insight-mid-${ageGroup}-${seedSource}`
  );
  return {
    title: resolveContent(
      titleKey,
      resolveContent(FLOW_CONTENT_KEYS.insightNeutral, "You're somewhere between the average and the outliers.")
    ),
    subtitle: `${resolveContent(FLOW_CONTENT_KEYS.insightAvgSubtitle, 'Average match right now:')} ${similarityAvg}%.`,
  };
}

function formatRewardText(flowReward: FlowReward, seedSource: string): string {
  const amountText =
    flowReward.type === 'coins'
      ? `+${flowReward.amount} coins`
      : flowReward.type === 'xp'
        ? `+${flowReward.amount} XP`
        : `+${flowReward.amount} diamonds`;
  const templateKey = pickBySeed(
    [FLOW_CONTENT_KEYS.rewardVariant1, FLOW_CONTENT_KEYS.rewardVariant2, FLOW_CONTENT_KEYS.rewardVariant3],
    `reward-${seedSource}`
  );
  const template = resolveContent(templateKey, `You earned ${amountText}`);
  return template.replace('{amount}', amountText);
}

function getShareInsight(
  similarityAvg: number | null,
  seedSource: string,
  ageGroup: FlowAgeGroup
): { hookLine: string; insightLine: string } {
  const hookPoolsByAge: Record<FlowAgeGroup, { fallback: string[]; high: string[]; low: string[]; mid: string[] }> = {
    young: {
      fallback: ['That got interesting fast.', 'Quick self-check complete.', 'I answered honestly.'],
      high: ['I expected to be an outlier.', 'I thought I was different.', 'Plot twist: I blend in more than expected.'],
      low: ['Turns out I go against the grain.', 'I knew I had a different take.', 'I expected some disagreement.'],
      mid: ['Balanced, with a few strong takes.', 'I agree with most people.', 'Not fully average, not fully outlier.'],
    },
    mid: {
      fallback: ['Quick self-check complete.', 'I answered honestly.', 'That got interesting fast.'],
      high: ['I thought I was different.', 'Plot twist: I blend in more than expected.', 'I expected to be an outlier.'],
      low: ['I knew I had a different take.', 'I expected some disagreement.', 'Turns out I go against the grain.'],
      mid: ['I agree with most people.', 'Not fully average, not fully outlier.', 'Balanced, with a few strong takes.'],
    },
    mature: {
      fallback: ['Interesting perspective check.', 'Quick self-check complete.', 'I answered honestly.'],
      high: ['I thought I was different.', 'Interesting: I align more than expected.', 'Plot twist: I blend in more than expected.'],
      low: ['I knew I had a different take.', 'I expected some disagreement.', 'Looks like I take a different lane.'],
      mid: ['Not fully average, not fully outlier.', 'Balanced, with a few strong takes.', 'I agree with most people.'],
    },
    unknown: {
      fallback: ['I answered honestly.', 'Quick self-check complete.', 'That got interesting fast.'],
      high: ['I thought I was different.', 'Plot twist: I blend in more than expected.', 'I expected to be an outlier.'],
      low: ['I knew I had a different take.', 'I expected some disagreement.', 'Turns out I go against the grain.'],
      mid: ['I agree with most people.', 'Not fully average, not fully outlier.', 'Balanced, with a few strong takes.'],
    },
  };
  const pool = hookPoolsByAge[ageGroup];

  if (similarityAvg == null) {
    return {
      hookLine: pickBySeed(
        pool.fallback,
        `share-fallback-hook-${ageGroup}-${seedSource}`
      ),
      insightLine: "I'm somewhere between average and outlier.",
    };
  }

  if (similarityAvg > 65) {
    return {
      hookLine: pickBySeed(
        pool.high,
        `share-high-hook-${ageGroup}-${seedSource}`
      ),
      insightLine: "I'm more like others than I expected.",
    };
  }

  if (similarityAvg < 40) {
    return {
      hookLine: pickBySeed(
        pool.low,
        `share-low-hook-${ageGroup}-${seedSource}`
      ),
      insightLine: 'I see things differently than most people.',
    };
  }

  return {
    hookLine: pickBySeed(
      pool.mid,
      `share-mid-hook-${ageGroup}-${seedSource}`
    ),
    insightLine: "I'm somewhere between average and outlier.",
  };
}

export default function FlowDemoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { status: authStatus } = useSession();
  
  // State
  const [step, setStep] = useState<'category' | 'question' | 'checkpoint' | 'result'>('category');
  const [categories, setCategories] = useState<FlowCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<DemoQuestion | null>(null);
  const [answerValue, setAnswerValue] = useState<AnswerValue>({ kind: 'text', text: '' });
  const [loading, setLoading] = useState(false);
  /** API flow: guard against double submit without showing a between-question spinner. */
  const [questionSyncing, setQuestionSyncing] = useState(false);
  const flowQuestionBusyRef = useRef(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [reportData, setReportData] = useState<{
    headline: string;
    subheader: string;
    rows: Array<{ question: string; you: string; global: string; questionId?: string }>;
    worldContextRows?: Array<{ label: string; formatted: string }>;
    identityHint: string;
    unlockNote: string;
  } | null>(null);
  const [isStarterCategory, setIsStarterCategory] = useState(false);
  const [showSkipSuggestionModal, setShowSkipSuggestionModal] = useState(false);
  const [skipSuggestionShown, setSkipSuggestionShown] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [checkpointData, setCheckpointData] = useState<{
    topicName: string;
    answeredCount: number;
    progressPct: number;
    insightText: string;
  } | null>(null);
  const [flowReward, setFlowReward] = useState<FlowReward | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [similarityAvg, setSimilarityAvg] = useState<number | null>(null);
  const [shareFeedback, setShareFeedback] = useState<{
    action: ShareAction | null;
    status: 'idle' | 'copied' | 'shared' | 'error';
  }>({ action: null, status: 'idle' });
  const shareFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userAgeGroup, setUserAgeGroup] = useState<FlowAgeGroup>('unknown');
  const [nextFlowTemptation, setNextFlowTemptation] = useState<FlowTemptationData | null>(null);
  const [nextFlowTemptationLoading, setNextFlowTemptationLoading] = useState(false);
  const [categoryHookPreview, setCategoryHookPreview] = useState<FlowHookPreview>({});
  const [flowResultTotalAnswers, setFlowResultTotalAnswers] = useState<number | null>(null);
  const [publicShareUrl, setPublicShareUrl] = useState<string | null>(null);
  const [publicShareBusy, setPublicShareBusy] = useState(false);
  const [flowUnlockStopper, setFlowUnlockStopper] = useState<{
    categoryId: string;
    title: string;
    moodLabel: string;
    reason?: 'guest-lock' | 'start-failed';
  } | null>(null);
  const ghostRowsRef = useRef<DemoGhostReportRow[]>([]);
  const resultVariantSeed = `${selectedCategory}|${answeredCount}|${skippedCount}|${totalXp}|${reportData?.rows.length ?? 0}|${userAgeGroup}`;
  const shareInsight = getShareInsight(similarityAvg, resultVariantSeed, userAgeGroup);
  const archetypeLabel = authStatus === 'authenticated' ? archetypeFromSimilarity(similarityAvg) : null;
  const shareText = [
    shareInsight.hookLine,
    shareInsight.insightLine,
    archetypeLabel ? `Archetype: ${archetypeLabel}` : null,
    '',
    'Try yours on PareL.',
  ]
    .filter(Boolean)
    .join('\n');
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  function flowDemoFallbackUrl() {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/flow-demo`;
    }
    return '/flow-demo';
  }

  function setShareActionFeedback(
    action: ShareAction,
    status: 'copied' | 'shared' | 'error',
    timeoutMs: number
  ) {
    if (shareFeedbackTimerRef.current) {
      clearTimeout(shareFeedbackTimerRef.current);
    }
    setShareFeedback({ action, status });
    shareFeedbackTimerRef.current = setTimeout(() => {
      setShareFeedback({ action: null, status: 'idle' });
      shareFeedbackTimerRef.current = null;
    }, timeoutMs);
  }

  async function copyToClipboard(value: string) {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  async function resolveShareUrl() {
    if (authStatus === 'authenticated') {
      try {
        return await ensurePublicShareUrl();
      } catch {
        return flowDemoFallbackUrl();
      }
    }
    return flowDemoFallbackUrl();
  }

  const sharePreviewUrl = authStatus === 'authenticated'
    ? (publicShareUrl ?? flowDemoFallbackUrl())
    : flowDemoFallbackUrl();
  const sharePreviewPayload = `${shareText}\n${sharePreviewUrl}`;

  async function handleSharePrimary() {
    const shareUrl = await resolveShareUrl();
    const payload = `${shareText}\n${shareUrl}`;

    if (canNativeShare) {
      try {
        await navigator.share({
          title: 'My PareL result',
          text: shareText,
          url: shareUrl,
        });
        setShareActionFeedback('share', 'shared', 1400);
        return;
      } catch {
        // If native share is canceled/fails, fallback to copy for resilience.
      }
    }
    const copied = await copyToClipboard(payload);
    if (copied) setShareActionFeedback('share', 'copied', 1400);
    else setShareActionFeedback('share', 'error', 1600);
  }

  async function handleCopyTextOnly() {
    const copied = await copyToClipboard(shareText);
    if (copied) setShareActionFeedback('copyText', 'copied', 1400);
    else setShareActionFeedback('copyText', 'error', 1600);
  }

  async function ensurePublicShareUrl() {
    if (publicShareUrl) return publicShareUrl;
    const insight = insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup);
    const archetype = archetypeFromSimilarity(similarityAvg);
    const mood = getFlowMoodProfile(
      categories.find((c) => c.id === selectedCategory)?.name ?? 'Flow',
      categories.find((c) => c.id === selectedCategory)?.slug
    );
    const ambient = getTemptationAmbientSignal({
      totalAnswers: flowResultTotalAnswers,
      prefersLighterNext: false,
    });

    setPublicShareBusy(true);
    try {
      const res = await fetch('/api/flow/share-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hookLine: shareInsight.hookLine,
          insightTitle: insight.title,
          insightSubtitle: insight.subtitle,
          archetypeLabel: archetype,
          moodLabel: mood.label,
          ambientLine: ambient.text,
        }),
      });
      const json = await res.json().catch(() => ({}));
      const path = typeof json?.data?.shareUrl === 'string' ? json.data.shareUrl : null;
      if (!res.ok || !path) throw new Error('Failed to create share link');
      const full = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
      setPublicShareUrl(full);
      return full;
    } finally {
      setPublicShareBusy(false);
    }
  }

  async function handleCopyPublicLink() {
    const link = await resolveShareUrl();
    const copied = await copyToClipboard(link);
    if (copied) setShareActionFeedback('publicLink', 'copied', 1400);
    else setShareActionFeedback('publicLink', 'error', 1600);
  }

  function categoryIsClientOnly(catId: string): boolean {
    if (isClientOnlyDemoCategory(catId)) return true;
    return categories.some((c) => c.id === catId && c.isFallback === true);
  }

  const moveGhostAfterQuestion = useCallback((fromQuestionId: string | undefined) => {
    const qs = getDemoGhostQuestions();
    const idx = qs.findIndex((q) => q.id === fromQuestionId);
    if (idx < 0) return;
    if (idx < qs.length - 1) {
      setCurrentQuestion(qs[idx + 1] ?? null);
    } else {
      setReportData(buildLocalFallbackReportData(ghostRowsRef.current));
      setIsStarterCategory(true);
      setCurrentQuestion(null);
      setStep('result');
    }
  }, []);

  function beginFlowQuestionOp(): boolean {
    if (flowQuestionBusyRef.current) return false;
    flowQuestionBusyRef.current = true;
    setQuestionSyncing(true);
    return true;
  }

  function endFlowQuestionOp() {
    flowQuestionBusyRef.current = false;
    setQuestionSyncing(false);
  }

  // Load flow choices when auth is known (guests use client-only ghost; signed-in users hit API).
  useEffect(() => {
    if (authStatus === 'loading') return;
    loadChoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload topics when login state changes
  }, [authStatus]);

  useEffect(() => {
    if (step !== 'result' || authStatus !== 'authenticated') return;
    void ensurePublicShareUrl().catch(() => {
      // Fallback link is handled by share actions/preview.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- share snapshot prefetch only on result entry
  }, [step, authStatus, selectedCategory, similarityAvg, resultVariantSeed, userAgeGroup, flowResultTotalAnswers]);

  useEffect(() => {
    return () => {
      if (shareFeedbackTimerRef.current) {
        clearTimeout(shareFeedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step !== 'category' || categories.length === 0) return;

    let cancelled = false;
    async function loadCategoryHookPreviews() {
      const nextMap: FlowHookPreview = {};
      for (const cat of categories) {
        const fallback = fallbackHookQuestionForCategory(cat);

        if (categoryIsClientOnly(cat.id)) {
          nextMap[cat.id] = getDemoGhostQuestions()[0]?.text ?? fallback;
          continue;
        }

        if (authStatus !== 'authenticated') {
          nextMap[cat.id] = fallback;
          continue;
        }

        try {
          const res = await fetch(`/api/flow/${encodeURIComponent(cat.id)}/next`);
          if (res.status === 204) {
            nextMap[cat.id] = fallback;
            continue;
          }
          const data = (await res.json().catch(() => ({}))) as { question?: string };
          nextMap[cat.id] = data.question?.trim() || fallback;
        } catch {
          nextMap[cat.id] = fallback;
        }
      }
      if (!cancelled) {
        setCategoryHookPreview(nextMap);
      }
    }

    void loadCategoryHookPreviews();
    return () => {
      cancelled = true;
    };
  }, [authStatus, categories, step]);

  useEffect(() => {
    if (step !== 'result') {
      setNextFlowTemptation(null);
      setNextFlowTemptationLoading(false);
      return;
    }

    let cancelled = false;
    async function loadNextFlowTemptation() {
      setNextFlowTemptationLoading(true);

      const isAdultAllowed = userAgeGroup === 'mature';
      const currentMood = getFlowMoodProfile(
        categories.find((c) => c.id === selectedCategory)?.name ?? '',
        categories.find((c) => c.id === selectedCategory)?.slug
      );
      const targetMoods = getContrastingMood(currentMood.key);

      let pool = categories.filter((c) => c.id !== selectedCategory);
      if (authStatus === 'authenticated') {
        try {
          const choicesRes = await fetch(`/api/flow/choices?exclude=${encodeURIComponent(selectedCategory)}`);
          const choicesJson = await choicesRes.json().catch(() => ({}));
          if (choicesRes.ok && Array.isArray(choicesJson?.data) && choicesJson.data.length > 0) {
            pool = choicesJson.data as FlowCategory[];
          }
        } catch {
          // keep local pool fallback
        }
      }

      const uniqueById = new Map<string, FlowCategory>();
      for (const c of pool) {
        if (!uniqueById.has(c.id)) uniqueById.set(c.id, c);
      }
      const deduped = [...uniqueById.values()].filter((c) => {
        if (isAdultAllowed) return true;
        const profile = getFlowMoodProfile(c.name, c.slug);
        if (!profile.safeForGeneralAudience) return false;
        return !ADULT_CATEGORY_HINT_RE.test(`${c.name} ${c.slug ?? ''}`);
      });

      const wildcardFirst = [
        ...deduped.filter((c) => `${c.name} ${c.slug ?? ''}`.toLowerCase().includes('wildcard')),
        ...deduped.filter((c) => !`${c.name} ${c.slug ?? ''}`.toLowerCase().includes('wildcard')),
      ];

      let picked: FlowCategory | null = null;
      for (const targetMood of targetMoods) {
        picked =
          wildcardFirst.find((c) => getFlowMoodProfile(c.name, c.slug).key === targetMood) ?? null;
        if (picked) break;
      }
      if (!picked && wildcardFirst.length > 0) picked = wildcardFirst[0];

      const fallbackQuestion = 'Would you rather lose all social media forever or never travel again?';
      if (!picked) {
        const fallbackMood = getFlowTopicMood('Wildcard');
        const ambientSignal = getTemptationAmbientSignal({
          totalAnswers: flowResultTotalAnswers,
          prefersLighterNext: true,
        });
        if (!cancelled) {
          setNextFlowTemptation({
            categoryId: DEMO_GHOST_FLOW_CATEGORY_ID,
            title: 'Wildcard Challenge',
            moodLabel: 'Wildcard',
            moodClass: fallbackMood.moodClass,
            rewardPreview: '+240 coins',
            firstQuestionPreview: fallbackQuestion,
            ambientLine: ambientSignal.text,
          });
          setNextFlowTemptationLoading(false);
        }
        return;
      }

      let firstQuestionPreview = fallbackQuestion;
      if (isClientOnlyDemoCategory(picked.id)) {
        firstQuestionPreview = getDemoGhostQuestions()[0]?.text ?? fallbackQuestion;
      } else if (authStatus === 'authenticated') {
        try {
          const qRes = await fetch(`/api/flow/question?categoryId=${encodeURIComponent(picked.id)}`);
          const qJson = await qRes.json().catch(() => ({}));
          const candidateText = typeof qJson?.data?.text === 'string' ? qJson.data.text : null;
          firstQuestionPreview = candidateText ?? fallbackQuestion;
        } catch {
          // keep fallback question
        }
      }

      const mood = getFlowTopicMood(picked.name, picked.slug);
      const moodProfile = getFlowMoodProfile(picked.name, picked.slug);
      const ambientSignal = getTemptationAmbientSignal({
        totalAnswers: flowResultTotalAnswers,
        prefersLighterNext: targetMoods[0] === 'light',
      });
      if (!cancelled) {
        setNextFlowTemptation({
          categoryId: picked.id,
          title: picked.name,
          moodLabel: moodProfile.label,
          moodClass: mood.moodClass,
          rewardPreview: '+240 coins',
          firstQuestionPreview,
          ambientLine: ambientSignal.text,
        });
        setNextFlowTemptationLoading(false);
      }
    }

    void loadNextFlowTemptation();
    return () => {
      cancelled = true;
    };
  }, [authStatus, categories, flowResultTotalAnswers, selectedCategory, step, userAgeGroup]);

  useEffect(() => {
    if (!currentQuestion) return;
    setAnswerValue(getInitialValue(currentQuestion));
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setUserAgeGroup('unknown');
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/onboarding/start', { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setUserAgeGroup(
          getAgeGroup({
            ageGroupId: data?.data?.ageGroup ?? null,
          })
        );
      } catch {
        if (!cancelled) setUserAgeGroup('unknown');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function loadChoices(excludeIds?: string[]) {
    const guest = authStatus !== 'authenticated';
    if (!guest) setLoading(true);
    try {
      if (guest) {
        const choices = [DEMO_FALLBACK_CATEGORY];
        setCategories(choices);
        setSelectedCategory('');
        if (choices.length === 1 && choices[0].isStarter) {
          setSelectedCategory(choices[0].id);
          setIsStarterCategory(true);
          setStep('category');
          await startFlowForCategory(choices[0].id);
        }
        return;
      }

      const url = excludeIds?.length
        ? `/api/flow/choices?exclude=${excludeIds.join(',')}`
        : '/api/flow/choices';
      const res = await fetch(url);
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: unknown;
      };

      let choices: FlowCategory[] = [];
      if (data.success && Array.isArray(data.data)) {
        choices = (data.data as Array<{ id: string; name: string; questionCount: number; slug?: string; isStarter?: boolean }>).map(
          (c) => ({
            id: c.id,
            name: c.name,
            questionCount: c.questionCount,
            slug: c.slug,
            isStarter: c.isStarter,
            isFallback: false,
          })
        );
      }
      if (excludeIds?.length) {
        choices = choices.filter((c) => !excludeIds.includes(c.id));
      }
      if (choices.length === 0) {
        choices = [DEMO_FALLBACK_CATEGORY];
      }

      setCategories(choices);
      setSelectedCategory('');
      if (choices.length === 1 && choices[0].isStarter) {
        setSelectedCategory(choices[0].id);
        setIsStarterCategory(true);
        setStep('category');
        await startFlowForCategory(choices[0].id);
      }
    } catch (error) {
      console.error('Error loading flow choices:', error);
      setCategories([DEMO_FALLBACK_CATEGORY]);
      setSelectedCategory(DEMO_FALLBACK_CATEGORY.id);
      setIsStarterCategory(true);
      setStep('category');
      await startFlowForCategory(DEMO_FALLBACK_CATEGORY.id);
    } finally {
      setLoading(false);
    }
  }

  function handleRefreshChoices() {
    const ids = categories.map(c => c.id);
    loadChoices(ids);
  }

  const CHECKPOINT_INTERVAL = 8;

  async function startFlowForCategory(catId: string): Promise<boolean> {
    setSkipSuggestionShown(false);
    setFlowReward(null);

    if (categoryIsClientOnly(catId)) {
      ghostRowsRef.current = [];
      setReportData(null);
      setAnsweredCount(0);
      setSkippedCount(0);
      setTotalXp(0);
      setTotalQuestions(getDemoGhostQuestions().length);
      setIsStarterCategory(true);
      const qs = getDemoGhostQuestions();
      setCurrentQuestion(qs[0] ?? null);
      setStep('question');
      return true;
    }

    ghostRowsRef.current = [];
    setLoading(true);
    try {
      const startRes = await fetch('/api/flow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: catId })
      });
      
      if (!startRes.ok) {
        throw new Error('Failed to start flow');
      }
      
      const startJson = await startRes.json();
      if (startJson?.data?.totalQuestions != null) {
        setTotalQuestions(startJson.data.totalQuestions);
      }
      
      // Load first question (pass catId - state may not be updated yet)
      await loadNextQuestion(catId);
      setStep('question');
      return true;
    } catch (error) {
      console.error('Error starting flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to start flow',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleTemptationStart(categoryId: string) {
    const temptationTitle = nextFlowTemptation?.title ?? categories.find((c) => c.id === categoryId)?.name ?? 'This flow';
    const temptationMood = nextFlowTemptation?.moodLabel ?? getFlowMoodProfile(temptationTitle).label;

    if (authStatus !== 'authenticated') {
      setFlowUnlockStopper({
        categoryId,
        title: temptationTitle,
        moodLabel: temptationMood,
        reason: 'guest-lock',
      });
      return;
    }

    const started = await startFlowForCategory(categoryId);
    if (!started) {
      setFlowUnlockStopper({
        categoryId,
        title: temptationTitle,
        moodLabel: temptationMood,
        reason: 'start-failed',
      });
    }
  }

  async function startFlow() {
    if (!selectedCategory) return;
    const cat = categories.find(c => c.id === selectedCategory);
    if (cat && (cat as { isStarter?: boolean }).isStarter) setIsStarterCategory(true);
    await startFlowForCategory(selectedCategory);
  }

  async function loadNextQuestion(
    overrideCategoryId?: string,
    options?: { afterAnsweredCount?: number }
  ): Promise<{ completed?: boolean; checkpoint?: boolean }> {
    const catId = overrideCategoryId ?? selectedCategory;
    if (!catId) return {};

    if (categoryIsClientOnly(catId)) {
      moveGhostAfterQuestion(currentQuestion?.id);
      return {};
    }

    try {
      const res = await fetch(`/api/flow/question?categoryId=${catId}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (data.data.completed) {
          setStep('result');
          await loadResults(catId);
          return { completed: true };
        }
        const afterCount = options?.afterAnsweredCount;
        if (afterCount != null && afterCount > 0 && afterCount % CHECKPOINT_INTERVAL === 0) {
          const cpRes = await fetch(`/api/flow/checkpoint?categoryId=${catId}&answeredCount=${afterCount}`);
          const cpData = await cpRes.json();
          if (cpData?.success && cpData?.data) {
            setCheckpointData({
              topicName: cpData.data.topicName ?? '',
              answeredCount: cpData.data.answeredCount ?? afterCount,
              progressPct: cpData.data.progressPct ?? 0,
              insightText: cpData.data.insightText ?? '',
            });
            setStep('checkpoint');
            return { checkpoint: true };
          }
        }
        setCurrentQuestion(data.data as DemoQuestion);
      }
      return {};
    } catch (error) {
      console.error('Error loading question:', error);
      toast({
        title: 'Error',
        description: 'Failed to load question',
        variant: 'destructive'
      });
      return {};
    }
  }

  async function submitAnswer(overrideValue?: AnswerValue) {
    const value = overrideValue ?? answerValue;
    if (!currentQuestion) return;
    if (!isValidAnswer(currentQuestion, value)) return;

    if (categoryIsClientOnly(selectedCategory)) {
      const you = formatLocalFallbackYou(currentQuestion, value);
      const global = getGlobalHintForDemoQuestion(currentQuestion.id);
      ghostRowsRef.current = [
        ...ghostRowsRef.current,
        { question: currentQuestion.text, you, global, questionId: currentQuestion.id },
      ];
      setAnsweredCount((c) => c + 1);
      setTotalXp((p) => p + 10);
      moveGhostAfterQuestion(currentQuestion.id);
      return;
    }

    if (!beginFlowQuestionOp()) return;
    try {
      const payload = toApiPayload(currentQuestion, value);
      const res = await fetch('/api/flow/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const newCount = answeredCount + 1;
        setAnsweredCount(newCount);
        setTotalXp(prev => prev + 10);
        toast({
          title: 'Answer recorded!',
          description: '+10 XP',
        });
        await loadNextQuestion(undefined, { afterAnsweredCount: newCount });
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        toast({
          title: 'Error',
          description: j?.error ?? j?.message ?? 'Failed to submit answer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive'
      });
    } finally {
      endFlowQuestionOp();
    }
  }

  function trackSkipSuggestion(action: 'triggered' | 'accepted') {
    fetch('/api/flow/skip-suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {}); // Fire-and-forget
  }

  async function skipCurrentQuestion() {
    if (!currentQuestion) return;

    if (categoryIsClientOnly(selectedCategory)) {
      const newSkipCount = skippedCount + 1;
      setSkippedCount(newSkipCount);

      if (newSkipCount >= 2 && !skipSuggestionShown) {
        setSkipSuggestionShown(true);
        setShowSkipSuggestionModal(true);
        trackSkipSuggestion('triggered');
      } else {
        moveGhostAfterQuestion(currentQuestion.id);
      }
      return;
    }

    if (!beginFlowQuestionOp()) return;
    try {
      const res = await fetch('/api/flow/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionId: currentQuestion.id,
          skipped: true
        })
      });
      
      if (res.ok) {
        const newSkipCount = skippedCount + 1;
        setSkippedCount(newSkipCount);
        toast({ title: 'Question skipped' });

        if (newSkipCount >= 2 && !skipSuggestionShown) {
          setSkipSuggestionShown(true);
          setShowSkipSuggestionModal(true);
          trackSkipSuggestion('triggered');
        } else {
          await loadNextQuestion();
        }
      }
    } catch (error) {
      console.error('Error skipping question:', error);
    } finally {
      endFlowQuestionOp();
    }
  }

  function handleSkipSuggestionContinue() {
    setShowSkipSuggestionModal(false);
    if (categoryIsClientOnly(selectedCategory)) {
      moveGhostAfterQuestion(currentQuestion?.id);
    } else {
      void (async () => {
        if (!beginFlowQuestionOp()) return;
        try {
          await loadNextQuestion();
        } finally {
          endFlowQuestionOp();
        }
      })();
    }
  }

  function handleSkipSuggestionChooseAnother() {
    setShowSkipSuggestionModal(false);
    trackSkipSuggestion('accepted');
    ghostRowsRef.current = [];
    setStep('category');
    setSelectedCategory('');
    setCurrentQuestion(null);
    setAnsweredCount(0);
    setSkippedCount(0);
    setTotalXp(0);
    setReportData(null);
    setCheckpointData(null);
    setFlowReward(null);
    loadChoices();
  }

  function resetToCategorySelection() {
    setShowFeedbackPrompt(false);
    setFlowUnlockStopper(null);
    ghostRowsRef.current = [];
    setStep('category');
    setSelectedCategory('');
    setCurrentQuestion(null);
    setAnsweredCount(0);
    setSkippedCount(0);
    setTotalXp(0);
    setReportData(null);
    setIsStarterCategory(false);
    setFlowReward(null);
    setFlowResultTotalAnswers(null);
    setPublicShareUrl(null);
    setSimilarityAvg(null);
    setTotalQuestions(null);
    setSkipSuggestionShown(false);
    loadChoices();
  }

  async function handleCheckpointContinue() {
    setCheckpointData(null);
    if (!beginFlowQuestionOp()) return;
    try {
      const result = await loadNextQuestion();
      if (!result.completed) setStep('question');
    } finally {
      endFlowQuestionOp();
    }
  }

  function handleCheckpointChangeTopic() {
    setCheckpointData(null);
    setFlowUnlockStopper(null);
    ghostRowsRef.current = [];
    setStep('category');
    setSelectedCategory('');
    setCurrentQuestion(null);
    setAnsweredCount(0);
    setSkippedCount(0);
    setTotalXp(0);
    setTotalQuestions(null);
    setSkipSuggestionShown(false);
    setFlowReward(null);
    setFlowResultTotalAnswers(null);
    setPublicShareUrl(null);
    loadChoices();
  }

  async function loadResults(catIdOverride?: string) {
    const catId = catIdOverride ?? selectedCategory;
    if (!catId) return;
    if (categoryIsClientOnly(catId)) return;
    setFlowReward(null);
    try {
      const res = await fetch(`/api/flow/result?categoryId=${catId}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setAnsweredCount(data.data.questionsAnswered);
        setSkippedCount(data.data.questionsSkipped);
        setTotalXp(data.data.xpGained);
        setFlowResultTotalAnswers(
          typeof data.data.totalAnswers === 'number' ? data.data.totalAnswers : null
        );
      }

      const rewardRes = await fetch('/api/flow/reward', { method: 'POST' });
      const rewardJson = await rewardRes.json().catch(() => ({}));
      if (rewardRes.ok && rewardJson?.success && rewardJson?.reward) {
        setFlowReward(rewardJson.reward as FlowReward);
      }
      const cat = categories.find(c => c.id === catId) as { isStarter?: boolean } | undefined;
      if (cat?.isStarter) {
        const reportRes = await fetch(`/api/flow/report?categoryId=${catId}&region=CZ`);
        const reportJson = await reportRes.json();
        if (reportJson.success && reportJson.data) {
          setReportData(reportJson.data);
          await fetch('/api/flow/starter-complete', { method: 'POST' });
          const eligRes = await fetch('/api/flow/feedback-eligibility');
          const elig = await eligRes.json();
          if (elig.success && elig.eligible && !wasFeedbackDismissedThisSession()) {
            setShowFeedbackPrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  }

  // Render category selection (skip UI when single starter - show launch state)
  if (step === 'category') {
    const singleStarter = categories.length === 1 && (categories[0] as { isStarter?: boolean }).isStarter;
    if (singleStarter && (loading || selectedCategory)) {
      return (
        <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
          <div className="text-center">
            <Icon name="spinner" className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
            <p className="text-subtle">Starting your flow...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text">Pick your next question</h1>
              <p className="text-subtle mt-1">Choose what makes you curious first</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(authStatus === 'authenticated' ? '/main' : '/landing')}
              className="text-subtle"
            >
              Back
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Icon name="spinner" className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <p className="text-subtle">Something went wrong loading topics.</p>
                <Button type="button" onClick={() => loadChoices()} variant="outline">
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => {
                const mood = getFlowTopicMood(cat.name, cat.slug);
                const hookQuestion = categoryHookPreview[cat.id] ?? fallbackHookQuestionForCategory(cat);
                const rewardPreview = rewardPreviewFromQuestionCount(cat.questionCount);
                const moodProfile = getFlowMoodProfile(cat.name, cat.slug);
                const ambientEntrySignal = getEntryAmbientSignal({ questionCount: cat.questionCount });
                return (
                  <Card
                    key={cat.id}
                    className={`transition-colors border-2 ${selectedCategory === cat.id ? 'border-accent bg-accent/5' : `${mood.moodClass} hover:opacity-90`}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.14em] text-subtle">Flow Hook</p>
                        <CardTitle className="text-xl sm:text-2xl leading-snug">{hookQuestion}</CardTitle>
                        <p className="text-xs text-subtle">
                          {cat.name} · {moodProfile.label} · {rewardPreview}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-subtle">
                          {mood.subtitle}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-accent text-white hover:bg-accent/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(cat.id);
                            void startFlowForCategory(cat.id);
                          }}
                        >
                          Start flow
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-subtle/90">{ambientEntrySignal.text}</p>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                onClick={startFlow}
                disabled={!selectedCategory || loading}
                className="w-full"
                variant="outline"
              >
                Start selected flow <Icon name="arrow-right" className="ml-2 h-4 w-4" />
              </Button>

              {categories.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-subtle"
                  onClick={handleRefreshChoices}
                  disabled={loading}
                >
                  Show new topics
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render question
  if (step === 'question' && currentQuestion) {
    const canSubmit = isValidAnswer(currentQuestion, answerValue);
    const showFirstQuestionHint = answeredCount === 0 && skippedCount === 0;

    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-subtle">
              Answered: {answeredCount}
              {totalQuestions != null ? ` of ~${totalQuestions}` : ''}
              {' | '}Skipped: {skippedCount} | XP: {totalXp}
            </span>
            <span className="text-sm text-subtle">{currentQuestion.categoryName}</span>
          </div>
          <div className="mb-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-subtle"
              onClick={() => {
                setStep('category');
                setSelectedCategory('');
                setCurrentQuestion(null);
                setTotalQuestions(null);
                setSkipSuggestionShown(false);
              }}
            >
              Change topic
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-subtle"
              onClick={() => {
                setStep('category');
                setSelectedCategory('');
                setCurrentQuestion(null);
                setTotalQuestions(null);
                setSkipSuggestionShown(false);
              }}
            >
              End flow
            </Button>
          </div>
          <SkipTopicSuggestionModal
            open={showSkipSuggestionModal}
            onContinue={handleSkipSuggestionContinue}
            onChooseAnother={handleSkipSuggestionChooseAnother}
          />
          
          <Card>
            <CardHeader>
              <div className="space-y-2">
                {showFirstQuestionHint ? (
                  <FlowFirstQuestionHint className="text-center sm:text-left max-w-2xl mx-auto sm:mx-0" />
                ) : null}
                <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
                {normalizeFlowQuestionType(currentQuestion.type) === 'MULTI_CHOICE' && (
                  <p className="text-sm text-subtle">Select all that apply</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuestionInput
                question={currentQuestion}
                value={answerValue}
                onChange={setAnswerValue}
                onSelectForSubmit={(v) => {
                  void submitAnswer(v);
                }}
                disabled={loading || questionSyncing}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    void submitAnswer();
                  }}
                  disabled={!canSubmit || loading || questionSyncing}
                  className="flex-1 bg-accent text-white hover:bg-accent/90 active:scale-[0.98] transition-transform duration-75"
                >
                  <Icon name="check-circle" className="h-4 w-4 mr-2" />
                  Submit Answer
                </Button>
                <Button
                  onClick={() => {
                    void skipCurrentQuestion();
                  }}
                  disabled={loading || questionSyncing}
                  variant="outline"
                  className="flex-1 active:scale-[0.98] transition-transform duration-75"
                >
                  <Icon name="skip" className="h-4 w-4 mr-2" size="md" />
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render checkpoint (C21 - Arc insight checkpoint every 8 questions)
  if (step === 'checkpoint' && checkpointData) {
    const checkpointMood = getFlowMoodProfile(
      categories.find((c) => c.id === selectedCategory)?.name ?? checkpointData.topicName,
      categories.find((c) => c.id === selectedCategory)?.slug
    );
    const checkpointCopy = resolveCheckpointCopyByMood(checkpointMood.key);
    const checkpointAmbient = getCheckpointAmbientSignal(checkpointMood.key);
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-accent/30">
            <CardHeader>
              <CardTitle className="text-2xl">
                {resolveContent(FLOW_CONTENT_KEYS.checkpointTitle, 'This is getting interesting.')}
              </CardTitle>
              <p className="text-subtle mt-1">
                {checkpointCopy.body}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="text-sm text-subtle">
                {resolveContent(FLOW_CONTENT_KEYS.checkpointProgressPrefix, 'About halfway through this topic')} · +{totalXp} XP
              </div>
              <p className="text-sm text-text/90">
                {checkpointCopy.curiosity}
              </p>
              <p className="text-xs text-subtle">{checkpointAmbient.text}</p>
              <div className="flex gap-3">
                <Button
                  onClick={handleCheckpointContinue}
                  className="flex-1 bg-accent text-white hover:opacity-90"
                >
                  {resolveContent(FLOW_CONTENT_KEYS.checkpointKeepGoing, 'Keep going')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCheckpointChangeTopic}
                  className="flex-1"
                >
                  {resolveContent(FLOW_CONTENT_KEYS.checkpointSwitchTopic, 'Switch topic')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render result
  if (step === 'result') {
    const flowUnlockStopperOverlay = flowUnlockStopper ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
        <Card className="w-full max-w-md border-accent/40 shadow-xl">
          <CardHeader className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-accent">
              {flowUnlockStopper.moodLabel} flow
            </p>
            <CardTitle className="text-xl">
              {flowUnlockStopper.reason === 'start-failed'
                ? 'Could not open this flow right now'
                : 'Create account to unlock this flow'}
            </CardTitle>
            <CardDescription>
              {flowUnlockStopper.reason === 'start-failed'
                ? `We couldn't start ${flowUnlockStopper.title} at the moment. Please try again from your result screen.`
                : 'Wildcard flows and deeper comparisons are saved to your profile, so you can continue where you left off.'}
            </CardDescription>
            <p className="text-sm text-text/90 font-medium">
              Unlock {flowUnlockStopper.title}
            </p>
            {/* TODO: Future: preserve selected flow id through signup and resume after onboarding. */}
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {flowUnlockStopper.reason === 'start-failed' ? (
              <Button type="button" className="w-full" onClick={() => {
                setFlowUnlockStopper(null);
                void handleTemptationStart(flowUnlockStopper.categoryId);
              }}>
                Try again
              </Button>
            ) : (
              <Button type="button" className="w-full" onClick={() => router.push(signupHrefFromDemoResult())}>
                Create account
              </Button>
            )}
            <Button type="button" variant="outline" className="w-full" onClick={() => setFlowUnlockStopper(null)}>
              Back to result
            </Button>
          </CardContent>
        </Card>
      </div>
    ) : null;

    if (isStarterCategory && reportData) {
      if (categoryIsClientOnly(selectedCategory)) {
        const demoCopy = resolveGuestDemoResultCopy(reportData.rows);
        const insight = insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup);
        const archetypeLabel = archetypeFromSimilarity(similarityAvg);

        return (
          <div className="min-h-screen bg-bg p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              <div className="space-y-5">
                <Card className="border-accent/30 bg-card shadow-sm">
                  <CardHeader className="py-5">
                    <CardTitle className="text-2xl sm:text-3xl">{insight.title}</CardTitle>
                    <CardDescription className="text-sm">{insight.subtitle}</CardDescription>
                  </CardHeader>
                </Card>
                {authStatus === 'authenticated' ? <FlowArchetypeBadge label={archetypeLabel} /> : null}
                <FlowShareCard hookLine={shareInsight.hookLine} insightLine={shareInsight.insightLine} />
              {nextFlowTemptation ? (
                <div className="mb-1">
                  <FlowTemptationCard
                    data={nextFlowTemptation}
                    loading={nextFlowTemptationLoading}
                    onStart={(categoryId) => {
                      setSelectedCategory(categoryId);
                      void handleTemptationStart(categoryId);
                    }}
                  />
                </div>
              ) : null}
                <Card className="border-border/70 bg-card/60 shadow-sm">
                  <CardContent className="pt-4 space-y-3">
                    <div className="rounded-md border border-border/70 bg-bg/60 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-subtle">Share preview</p>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-text/90 font-sans">{sharePreviewPayload}</pre>
                    </div>
                    <details>
                      <summary className="cursor-pointer text-sm text-subtle">Share and save options</summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleSharePrimary}>
                          {shareFeedback.action === 'share' && shareFeedback.status === 'shared'
                            ? 'Shared'
                            : shareFeedback.action === 'share' && shareFeedback.status === 'copied'
                              ? 'Copied'
                              : shareFeedback.action === 'share' && shareFeedback.status === 'error'
                                ? 'Share failed'
                                : 'Share result'}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleCopyTextOnly}>
                          {shareFeedback.action === 'copyText' && shareFeedback.status === 'copied'
                            ? 'Copied'
                            : shareFeedback.action === 'copyText' && shareFeedback.status === 'error'
                              ? 'Copy failed'
                              : 'Copy text'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={handleCopyPublicLink}
                          disabled={publicShareBusy && authStatus === 'authenticated'}
                        >
                          {publicShareBusy && authStatus === 'authenticated'
                            ? 'Preparing link...'
                            : shareFeedback.action === 'publicLink' && shareFeedback.status === 'copied'
                              ? 'Copied'
                              : shareFeedback.action === 'publicLink' && shareFeedback.status === 'error'
                                ? 'Copy failed'
                                : 'Copy link'}
                        </Button>
                      </div>
                    </details>
                    {authStatus !== 'authenticated' ? (
                      <p className="text-xs text-subtle">
                        Create account to save a personal public result link.
                      </p>
                    ) : null}
                    <p className="text-xs text-subtle">Utility only. Your main next step is to continue with the highlighted flow.</p>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/70">
                  <CardContent className="pt-5 space-y-3">
                    <Button type="button" className="w-full" onClick={resetToCategorySelection}>
                      {resolveContent(FLOW_CONTENT_KEYS.ctaTryAnotherFlow, 'Try another flow')}
                    </Button>
                    {authStatus === 'authenticated' ? (
                      <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/main')}>
                        {resolveContent(FLOW_CONTENT_KEYS.ctaGoToDashboard, 'Go to dashboard')}
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" className="w-full" onClick={() => router.push(signupHrefFromDemoResult())}>
                        {resolveContent(FLOW_CONTENT_KEYS.ctaCreateAccount, 'Create account to save your results')}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {flowReward ? (
                  <p className="text-sm text-subtle">
                    {formatRewardText(flowReward, resultVariantSeed)}
                  </p>
                ) : null}

                <p className="text-xs text-subtle/90">
                  {answeredCount} answered · {skippedCount} skipped · {totalXp} XP
                </p>

                <Card className="border-border/70 shadow-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-text">{demoCopy.statTitle}</CardTitle>
                    <CardDescription className="text-subtle text-sm leading-relaxed mt-2">{demoCopy.statDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-5">
                    <p className="text-sm text-text/80 leading-snug border-t border-border/40 pt-3 mt-0.5">{demoCopy.personalityLine}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-text">{demoCopy.quickReadSectionTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 list-none m-0 p-0">
                      {demoCopy.breakdownLines.map((line, i) => (
                        <li key={`${line}-${i}`} className="flex gap-3 text-sm sm:text-[15px] text-text leading-snug">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:mt-2">
                <ParallelsSection onSimilarityAvgChange={setSimilarityAvg} maxVisible={3} />
              </div>
            </div>
            {flowUnlockStopperOverlay}

            <div className="max-w-6xl mx-auto mt-5">
              <p className="text-center text-xs text-subtle/80 mb-2 px-2">
                {resolveContent(
                  FLOW_CONTENT_KEYS.trustNote,
                  'Based on your answers in this flow. Early Alpha data may be limited.'
                )}
              </p>
              <p className="text-center text-xs text-subtle px-2 leading-relaxed">
                {demoCopy.disclaimer}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-bg p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div className="space-y-5">
              <Card className="border-accent/30 bg-card shadow-sm">
                <CardHeader className="py-5">
                  <CardTitle className="text-2xl sm:text-3xl">{insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup).title}</CardTitle>
                  <CardDescription className="text-sm">{insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup).subtitle}</CardDescription>
                </CardHeader>
              </Card>
              {authStatus === 'authenticated' ? <FlowArchetypeBadge label={archetypeFromSimilarity(similarityAvg)} /> : null}
              <FlowShareCard hookLine={shareInsight.hookLine} insightLine={shareInsight.insightLine} />
              {nextFlowTemptation ? (
                <div className="mb-1">
                  <FlowTemptationCard
                    data={nextFlowTemptation}
                    loading={nextFlowTemptationLoading}
                    onStart={(categoryId) => {
                      setSelectedCategory(categoryId);
                      void handleTemptationStart(categoryId);
                    }}
                  />
                </div>
              ) : null}
              <Card className="border-border/70 bg-card/60 shadow-sm">
                <CardContent className="pt-4 space-y-3">
                  <div className="rounded-md border border-border/70 bg-bg/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-subtle">Share preview</p>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-text/90 font-sans">{sharePreviewPayload}</pre>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-subtle">Share and save options</summary>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleSharePrimary}>
                        {shareFeedback.action === 'share' && shareFeedback.status === 'shared'
                          ? 'Shared'
                          : shareFeedback.action === 'share' && shareFeedback.status === 'copied'
                            ? 'Copied'
                            : shareFeedback.action === 'share' && shareFeedback.status === 'error'
                              ? 'Share failed'
                              : 'Share result'}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleCopyTextOnly}>
                        {shareFeedback.action === 'copyText' && shareFeedback.status === 'copied'
                          ? 'Copied'
                          : shareFeedback.action === 'copyText' && shareFeedback.status === 'error'
                            ? 'Copy failed'
                            : 'Copy text'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleCopyPublicLink}
                        disabled={publicShareBusy && authStatus === 'authenticated'}
                      >
                        {publicShareBusy && authStatus === 'authenticated'
                          ? 'Preparing link...'
                          : shareFeedback.action === 'publicLink' && shareFeedback.status === 'copied'
                            ? 'Copied'
                            : shareFeedback.action === 'publicLink' && shareFeedback.status === 'error'
                              ? 'Copy failed'
                              : 'Copy link'}
                      </Button>
                    </div>
                  </details>
                  {authStatus !== 'authenticated' ? (
                    <p className="text-xs text-subtle">
                      Create account to save a personal public result link.
                    </p>
                  ) : null}
                  <p className="text-xs text-subtle">Utility only. Your main next step is to continue with the highlighted flow.</p>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/70">
                <CardContent className="pt-5 space-y-3">
                  <Button type="button" className="w-full" onClick={resetToCategorySelection}>
                    {resolveContent(FLOW_CONTENT_KEYS.ctaTryAnotherFlow, 'Try another flow')}
                  </Button>
                  {authStatus === 'authenticated' ? (
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/main')}>
                      {resolveContent(FLOW_CONTENT_KEYS.ctaGoToDashboard, 'Go to dashboard')}
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.push(signupHrefFromDemoResult())}>
                      {resolveContent(FLOW_CONTENT_KEYS.ctaCreateAccount, 'Create account to save your results')}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {flowReward ? (
                <p className="text-sm text-subtle">
                  {formatRewardText(flowReward, resultVariantSeed)}
                </p>
              ) : null}

              <p className="text-xs text-subtle/90">
                {answeredCount} answered · {skippedCount} skipped · {totalXp} XP
              </p>

              <Card className="border-border/70 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">{reportData.headline}</CardTitle>
                  <CardDescription>{reportData.subheader}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reportData.rows.map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-sm text-subtle">{r.question}</span>
                      <span className="text-sm">You: {r.you} | Global: {r.global}</span>
                    </div>
                  ))}
                  {reportData.worldContextRows?.map((w, i) => (
                    <div key={`wc-${i}`} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-sm text-subtle">{w.label}</span>
                      <span className="text-sm">{w.formatted}</span>
                    </div>
                  ))}
                  <p className="text-sm text-subtle">{reportData.identityHint}</p>
                  <p className="text-xs text-subtle">{reportData.unlockNote}</p>
                </CardContent>
              </Card>
            </div>
            <div className="lg:mt-2">
              <ParallelsSection onSimilarityAvgChange={setSimilarityAvg} maxVisible={3} />
            </div>
            <FeedbackPromptModal
              open={showFeedbackPrompt}
              onClose={() => setShowFeedbackPrompt(false)}
              onGiveFeedback={() => router.push('/feedback/alpha')}
              onMaybeLater={() => {}}
            />
          </div>
          {flowUnlockStopperOverlay}
          <p className="max-w-6xl mx-auto mt-4 text-center text-xs text-subtle/80 px-2">
            {resolveContent(
              FLOW_CONTENT_KEYS.trustNote,
              'Based on your answers in this flow. Early Alpha data may be limited.'
            )}
          </p>
        </div>
      );
    }
    if (isStarterCategory && !reportData) {
      return (
        <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
          <Icon name="spinner" className="h-10 w-10 animate-spin text-accent" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="space-y-5">
            <Card className="border-accent/30 bg-card shadow-sm">
              <CardHeader className="py-5">
                <CardTitle className="text-2xl sm:text-3xl">{insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup).title}</CardTitle>
                <CardDescription className="text-sm">{insightCopyFromSimilarity(similarityAvg, resultVariantSeed, userAgeGroup).subtitle}</CardDescription>
              </CardHeader>
            </Card>
            {authStatus === 'authenticated' ? <FlowArchetypeBadge label={archetypeFromSimilarity(similarityAvg)} /> : null}
            <FlowShareCard hookLine={shareInsight.hookLine} insightLine={shareInsight.insightLine} />
            {nextFlowTemptation ? (
              <div className="mb-1">
                <FlowTemptationCard
                  data={nextFlowTemptation}
                  loading={nextFlowTemptationLoading}
                  onStart={(categoryId) => {
                    setSelectedCategory(categoryId);
                    void handleTemptationStart(categoryId);
                  }}
                />
              </div>
            ) : null}
            <Card className="border-border/70 bg-card/60 shadow-sm">
              <CardContent className="pt-4 space-y-3">
                <div className="rounded-md border border-border/70 bg-bg/60 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-subtle">Share preview</p>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-text/90 font-sans">{sharePreviewPayload}</pre>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm text-subtle">Share and save options</summary>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleSharePrimary}>
                      {shareFeedback.action === 'share' && shareFeedback.status === 'shared'
                        ? 'Shared'
                        : shareFeedback.action === 'share' && shareFeedback.status === 'copied'
                          ? 'Copied'
                          : shareFeedback.action === 'share' && shareFeedback.status === 'error'
                            ? 'Share failed'
                            : 'Share result'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1 min-w-0" onClick={handleCopyTextOnly}>
                      {shareFeedback.action === 'copyText' && shareFeedback.status === 'copied'
                        ? 'Copied'
                        : shareFeedback.action === 'copyText' && shareFeedback.status === 'error'
                          ? 'Copy failed'
                          : 'Copy text'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={handleCopyPublicLink}
                      disabled={publicShareBusy && authStatus === 'authenticated'}
                    >
                      {publicShareBusy && authStatus === 'authenticated'
                        ? 'Preparing link...'
                        : shareFeedback.action === 'publicLink' && shareFeedback.status === 'copied'
                          ? 'Copied'
                          : shareFeedback.action === 'publicLink' && shareFeedback.status === 'error'
                            ? 'Copy failed'
                            : 'Copy link'}
                    </Button>
                  </div>
                </details>
                {authStatus !== 'authenticated' ? (
                  <p className="text-xs text-subtle">
                    Create account to save a personal public result link.
                  </p>
                ) : null}
                <p className="text-xs text-subtle">Utility only. Your main next step is to continue with the highlighted flow.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70">
              <CardContent className="pt-5 space-y-3">
                <Button type="button" className="w-full" onClick={resetToCategorySelection}>
                  {resolveContent(FLOW_CONTENT_KEYS.ctaTryAnotherFlow, 'Try another flow')}
                </Button>
                {authStatus === 'authenticated' ? (
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/main')}>
                    {resolveContent(FLOW_CONTENT_KEYS.ctaGoToDashboard, 'Go to dashboard')}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push(signupHrefFromDemoResult())}>
                    {resolveContent(FLOW_CONTENT_KEYS.ctaCreateAccount, 'Create account to save your results')}
                  </Button>
                )}
              </CardContent>
            </Card>

            {flowReward ? (
              <p className="text-sm text-subtle">
                {formatRewardText(flowReward, resultVariantSeed)}
              </p>
            ) : null}

            <p className="text-xs text-subtle/90">
              {answeredCount} answered · {skippedCount} skipped · {totalXp} XP
            </p>
          </div>
          <div className="lg:mt-2">
            <ParallelsSection onSimilarityAvgChange={setSimilarityAvg} maxVisible={3} />
          </div>
        </div>
        {flowUnlockStopperOverlay}
        <p className="max-w-6xl mx-auto mt-4 text-center text-xs text-subtle/80 px-2">
          {resolveContent(
            FLOW_CONTENT_KEYS.trustNote,
            'Based on your answers in this flow. Early Alpha data may be limited.'
          )}
        </p>
      </div>
    );
  }

  return null;
}
