'use client';

/**
 * Flow Demo Page
 * Question step uses shared QuestionInput (RANGE slider, MULTI_CHOICE, NUMERIC alias, etc.)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface FlowCategory {
  id: string;
  name: string;
  questionCount: number;
  slug?: string;
  isStarter?: boolean;
}

/** API payload from GET /api/flow/question (features flow shape) */
type DemoQuestion = FlowQuestion & { difficulty?: string };

export default function FlowDemoPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [step, setStep] = useState<'category' | 'question' | 'checkpoint' | 'result'>('category');
  const [categories, setCategories] = useState<FlowCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<DemoQuestion | null>(null);
  const [answerValue, setAnswerValue] = useState<AnswerValue>({ kind: 'text', text: '' });
  const [loading, setLoading] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [reportData, setReportData] = useState<{
    headline: string;
    subheader: string;
    rows: Array<{ question: string; you: string; global: string }>;
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

  // Load flow choices on mount (C18)
  useEffect(() => {
    loadChoices();
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;
    setAnswerValue(getInitialValue(currentQuestion));
  }, [currentQuestion?.id]);

  async function loadChoices(excludeIds?: string[]) {
    setLoading(true);
    try {
      const url = excludeIds?.length
        ? `/api/flow/choices?exclude=${excludeIds.join(',')}`
        : '/api/flow/choices';
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const choices = data.data as Array<{ id: string; name: string; questionCount: number; slug?: string; isStarter?: boolean }>;
        setCategories(choices);
        setSelectedCategory('');
        if (choices.length === 1 && choices[0].isStarter) {
          setSelectedCategory(choices[0].id);
          setIsStarterCategory(true);
          setStep('category');
          startFlowForCategory(choices[0].id);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load flow choices',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading flow choices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load flow choices',
        variant: 'destructive'
      });
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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!currentQuestion) return;
    if (!isValidAnswer(currentQuestion, answerValue)) return;

    setLoading(true);
    try {
      const payload = toApiPayload(currentQuestion, answerValue);
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
      setLoading(false);
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
    
    setLoading(true);
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
      setLoading(false);
    }
  }

  function handleSkipSuggestionContinue() {
    setShowSkipSuggestionModal(false);
    loadNextQuestion();
  }

  function handleSkipSuggestionChooseAnother() {
    setShowSkipSuggestionModal(false);
    trackSkipSuggestion('accepted');
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
    const result = await loadNextQuestion();
    if (!result.completed) setStep('question');
  }

  function handleCheckpointChangeTopic() {
    setCheckpointData(null);
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
              <CardContent className="p-12 text-center">
                <p className="text-subtle">No flows available. Please seed the database first.</p>
                <Button onClick={() => router.push('/admin/seeds')} className="mt-4">
                  Go to Admin Seeds
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
                disabled={loading}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={submitAnswer}
                  disabled={!canSubmit || loading}
                  className="flex-1 bg-accent text-white hover:bg-accent/90"
                >
                  {loading ? <Icon name="spinner" className="h-4 w-4 animate-spin" /> : <Icon name="check-circle" className="h-4 w-4 mr-2" />}
                  Submit Answer
                </Button>
                <Button
                  onClick={skipCurrentQuestion}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
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
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => {
                    setShowFeedbackPrompt(false);
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
