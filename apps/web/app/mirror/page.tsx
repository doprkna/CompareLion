'use client';

import { useState } from 'react';
import { useMirrorEvent } from '@/hooks/useMirrorEvent';
import { useSubmitMirrorReflection } from '@/hooks/useSubmitMirrorReflection';
import { MirrorEventCard } from '@/components/mirror/MirrorEventCard';
import { MirrorRewardModal } from '@/components/mirror/MirrorRewardModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Calendar } from 'lucide-react';

export default function MirrorPage() {
  const { event, loading: eventLoading, error: eventError, reload } = useMirrorEvent();
  const { submit, loading: submitLoading, error: submitError } = useSubmitMirrorReflection();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; badgeGranted?: boolean; badgeName?: string } | null>(null);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!event) return;

    // Validate all questions answered
    if (!event.questionSet.every((_, index) => answers[index]?.trim())) {
      alert('Please answer all questions');
      return;
    }

    try {
      const answerArray = event.questionSet.map((_, index) => ({
        questionIndex: index,
        content: answers[index] || '',
      }));

      const result = await submit(event.id, answerArray);
      
      setRewards({
        xp: result.rewards?.xp || event.rewardXP,
        badgeGranted: result.rewards?.badgeGranted || false,
      });
      setShowRewardModal(true);
      
      // Clear answers
      setAnswers({});
      // Reload event to update status
      reload();
    } catch (e) {
      console.error('Submission failed:', e);
    }
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mirror Events</h1>
        <p className="text-muted-foreground">
          Global synchronous reflection weeks — everyone reflects on the same questions.
        </p>
      </div>

      {eventError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error: {eventError}
        </div>
      )}

      {submitError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Submission error: {submitError}
        </div>
      )}

      {!event ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Active Mirror Event</h2>
            <p className="text-muted-foreground">
              There's no active mirror event at the moment. Check back soon for the next global reflection week!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <MirrorEventCard event={event} />

          {/* Submission Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Your Reflection</CardTitle>
              <CardDescription>
                Answer all questions to participate in this global reflection event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.questionSet.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-semibold">
                    Question {index + 1}: {question}
                  </label>
                  <Textarea
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Your reflection on: ${question}`}
                    className="min-h-[100px] bg-bg border-border text-text"
                    maxLength={5000}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {(answers[index]?.length || 0)} / 5000
                  </div>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={submitLoading || !event.questionSet.every((_, index) => answers[index]?.trim())}
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitLoading ? 'Submitting...' : 'Submit Reflection'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <MirrorRewardModal
        open={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewards={rewards || { xp: 0 }}
        message={rewards?.badgeGranted ? '🎉 Reflection submitted! Earned XP and a badge!' : '✅ Reflection submitted! Earned XP!'}
      />
    </div>
  );
}

