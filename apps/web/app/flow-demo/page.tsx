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
import { getFlowTopicMood } from '@/lib/flowTopics';
import type { FlowReward } from '@parel/core';
import { FlowRewardCard } from '@/components/reward/FlowRewardCard';
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

interface FlowCategory {
  id: string;
  name: string;
  questionCount: number;
  slug?: string;
  isStarter?: boolean;
  /** Client-only demo (no `/api/flow/start` or `/api/flow/answer`); e.g. ghost / guest `/flow-demo`. */
  isFallback?: boolean;
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
  const ghostRowsRef = useRef<DemoGhostReportRow[]>([]);

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
    if (!currentQuestion) return;
    setAnswerValue(getInitialValue(currentQuestion));
  }, [currentQuestion?.id]);

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

  async function startFlowForCategory(catId: string) {
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
      return;
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
    } catch (error) {
      console.error('Error starting flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to start flow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-text">Choose a Flow</h1>
              <p className="text-subtle mt-1">Pick a theme for your next questions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/main')} className="text-subtle">
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
                return (
                  <Card
                    key={cat.id}
                    className={`cursor-pointer transition-colors border-2 ${selectedCategory === cat.id ? 'border-accent bg-accent/5' : `${mood.moodClass} hover:opacity-90`}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{cat.name}</CardTitle>
                          <p className="text-sm text-subtle font-normal mt-0.5">{mood.subtitle}</p>
                          <span className="text-xs text-subtle mt-1">{cat.questionCount} questions</span>
                        </div>
                        {mood.tag && (
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-bg/50 text-subtle capitalize">
                            {mood.tag}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}

              <Button
                onClick={startFlow}
                disabled={!selectedCategory || loading}
                className="w-full bg-accent text-white hover:bg-accent/90"
              >
                Start Flow <Icon name="arrow-right" className="ml-2 h-4 w-4" />
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
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-accent/30">
            <CardHeader>
              <CardTitle className="text-xl">Checkpoint</CardTitle>
              <p className="text-subtle mt-1">
                {checkpointData.insightText}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-subtle">
                  {checkpointData.answeredCount} answered
                  {totalQuestions != null ? ` of ~${totalQuestions}` : ''}
                  {checkpointData.progressPct > 0 ? ` · ${checkpointData.progressPct}%` : ''}
                </span>
                <span className="text-accent">{totalXp} XP</span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCheckpointContinue}
                  className="flex-1 bg-accent text-white hover:opacity-90"
                >
                  Continue flow
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCheckpointChangeTopic}
                  className="flex-1"
                >
                  Choose another topic
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
    if (isStarterCategory && reportData) {
      if (categoryIsClientOnly(selectedCategory)) {
        const demoCopy = resolveGuestDemoResultCopy(reportData.rows);

        const handleGuestContinueDemo = () => {
          setShowFeedbackPrompt(false);
          ghostRowsRef.current = [];
          setStep('category');
          setSelectedCategory('');
          setAnsweredCount(0);
          setSkippedCount(0);
          setTotalXp(0);
          setReportData(null);
          setIsStarterCategory(false);
          setFlowReward(null);
          loadChoices();
        };

        return (
          <div className="min-h-screen bg-gradient-to-b from-bg via-card/30 to-bg p-6">
            <div className="max-w-lg mx-auto space-y-5">
              <div className="space-y-5">
                <Card className="overflow-hidden border-2 border-accent/25 bg-gradient-to-br from-card to-accent/10 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                      {demoCopy.verdictTitle}
                    </CardTitle>
                    <CardDescription className="text-base text-subtle mt-3 leading-relaxed">
                      {demoCopy.verdictSubtitle}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-text">
                      {demoCopy.statTitle}
                    </CardTitle>
                    <CardDescription className="text-subtle text-sm leading-relaxed mt-2">
                      {demoCopy.statDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-5">
                    <p className="text-sm text-text/80 leading-snug border-t border-border/40 pt-3 mt-0.5">
                      {demoCopy.personalityLine}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-text">
                      {demoCopy.quickReadSectionTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 list-none m-0 p-0">
                      {demoCopy.breakdownLines.map((line, i) => (
                        <li
                          key={`${line}-${i}`}
                          className="flex gap-3 text-sm sm:text-[15px] text-text leading-snug"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4 pb-2 w-full max-w-md mx-auto">
                {authStatus === 'authenticated' ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => router.push('/main')}
                      className="w-full bg-gradient-to-r from-accent to-blue-600 text-white font-semibold py-6 text-base shadow-md hover:opacity-95"
                    >
                      Continue to app
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-5 text-base border-border text-subtle hover:text-text hover:bg-card"
                      onClick={handleGuestContinueDemo}
                    >
                      Try another question
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => router.push(signupHrefFromDemoResult())}
                      className="w-full bg-gradient-to-r from-accent to-blue-600 text-white font-semibold py-6 text-base shadow-md hover:opacity-95"
                    >
                      Create account to save your results
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-5 text-base border-border text-subtle hover:text-text hover:bg-card"
                      onClick={handleGuestContinueDemo}
                    >
                      Try another question
                    </Button>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-subtle px-2 leading-relaxed max-w-md mx-auto">
                {demoCopy.disclaimer}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-bg p-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{reportData.headline}</CardTitle>
                <p className="text-sm text-subtle mt-1">{reportData.subheader}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {flowReward && (
                  <div className="pt-2">
                    <FlowRewardCard reward={flowReward} />
                  </div>
                )}
                <div className="space-y-3">
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
                </div>
                <p className="text-sm text-subtle">{reportData.identityHint}</p>
                <p className="text-xs text-subtle">{reportData.unlockNote}</p>
                <ParallelsSection />
                <FeedbackPromptModal
                  open={showFeedbackPrompt}
                  onClose={() => setShowFeedbackPrompt(false)}
                  onGiveFeedback={() => router.push('/feedback/alpha')}
                  onMaybeLater={() => {}}
                />
                {categoryIsClientOnly(selectedCategory) ? (
                  <Button
                    type="button"
                    onClick={() => router.push(signupHrefFromDemoResult())}
                    className="w-full bg-gradient-to-r from-accent to-blue-600 text-white font-semibold py-6"
                  >
                    Create account to save your results
                  </Button>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={() => {
                    setShowFeedbackPrompt(false);
                    ghostRowsRef.current = [];
                    setStep('category');
                    setSelectedCategory('');
                    setAnsweredCount(0);
                    setSkippedCount(0);
                    setTotalXp(0);
                    setReportData(null);
                    setIsStarterCategory(false);
                    setFlowReward(null);
                    loadChoices();
                  }} className="flex-1 bg-accent text-white hover:bg-accent/90">
                    Continue
                  </Button>
                  <Button onClick={() => router.push('/main')} variant="outline" className="flex-1">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Flow Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flowReward && (
                <div className="pb-2">
                  <FlowRewardCard reward={flowReward} />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-accent">{answeredCount}</div>
                  <div className="text-sm text-subtle">Answered</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-destructive">{skippedCount}</div>
                  <div className="text-sm text-subtle">Skipped</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-accent">{totalXp}</div>
                  <div className="text-sm text-subtle">XP Gained</div>
                </div>
              </div>
              <ParallelsSection />
              <div className="flex gap-3">
                <Button onClick={() => {
                  setStep('category');
                  setSelectedCategory('');
                  setAnsweredCount(0);
                  setSkippedCount(0);
                  setTotalXp(0);
                  setFlowReward(null);
                }} className="flex-1">
                  Start New Flow
                </Button>
                <Button onClick={() => router.push('/main')} variant="outline" className="flex-1">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
