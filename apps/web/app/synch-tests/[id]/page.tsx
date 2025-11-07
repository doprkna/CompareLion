"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSynchResult, useStartSynchTest } from '@/hooks/useSynchTests';
import { SynchQuestionCard } from '@/components/synch-tests/SynchQuestionCard';
import { SynchResultCard } from '@/components/synch-tests/SynchResultCard';

export default function SynchTestDetailPage() {
  const params = useParams<{ id: string }>();
  const testId = params?.id as string;
  const { result, loading, error, reload } = useSynchResult(testId);
  const { start } = useStartSynchTest();
  const [answers, setAnswers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (result?.status === 'pending' && result?.test?.questions) {
      const questions = Array.isArray(result.test.questions) ? result.test.questions : [];
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [result]);

  const handleAnswer = (index: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswers = async () => {
    if (answers.some((a) => a === null)) {
      alert('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/synch-tests/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, answers }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to submit answers');
      reload();
    } catch (e: any) {
      alert(e?.message || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch('/api/synch-tests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to complete test');
      reload();
    } catch (e: any) {
      alert(e?.message || 'Failed to complete test');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-4">Loading…</div>;
  if (error) return <div className="max-w-2xl mx-auto p-4 text-red-600">{error}</div>;

  if (result?.status === 'completed' && result?.score !== null && result?.score !== undefined) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <SynchResultCard
          result={{
            id: result.id,
            score: result.score,
            resultText: result.resultText || '',
            userA: result.userA,
            userB: result.userB,
            test: result.test,
            createdAt: result.createdAt,
            shared: result.shared,
          }}
        />
      </div>
    );
  }

  if (result?.status === 'pending') {
    const questions = Array.isArray(result.test?.questions) ? result.test.questions : [];
    const allAnswered = answers.length === questions.length && !answers.some((a) => a === null);

    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="rounded border p-4">
          <h2 className="text-xl font-bold mb-2">{result.test?.title || 'Compatibility Test'}</h2>
          {result.test?.description && <p className="text-sm text-gray-700 mb-4">{result.test.description}</p>}
        </div>

        {questions.map((q: any, idx: number) => (
          <SynchQuestionCard
            key={idx}
            question={q}
            questionIndex={idx}
            answers={answers}
            onAnswer={handleAnswer}
          />
        ))}

        <div className="flex gap-2">
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting || !allAnswered}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
          {allAnswered && answers.length > 0 && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {completing ? 'Completing...' : 'Complete Test'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-gray-600">Test status: {result?.status || 'unknown'}</div>
    </div>
  );
}

