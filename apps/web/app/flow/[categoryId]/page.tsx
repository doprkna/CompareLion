'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCombatLink } from '@parel/core/hooks/useCombatLink';
import {
  QuestionInput,
  getInitialValue,
  isValidAnswer,
  toApiPayload,
  type FlowQuestion,
  type AnswerValue,
} from '@/components/flow/QuestionInput';
import { FlowFirstQuestionHint } from '@/components/flow/FlowFirstQuestionHint';

/** Matches `FlowQuestion` JSON from `GET /api/flow/[categoryId]/next` (`flowService`). */
type NextQuestion = {
  id: string;
  question: string;
  options?: Array<{ id: string; label: string; value: string }>;
  type: string;
  difficulty: string;
  category?: string;
};

function toInputQuestion(q: NextQuestion): FlowQuestion {
  return {
    id: q.id,
    text: q.question,
    type: q.type,
    options: q.options?.map((o) => ({ ...o })),
    categoryName: q.category,
  };
}

export default function FlowPage() {
  const { categoryId } = useParams() as { categoryId: string };
  const { attack: combatAttack, skip: combatSkip } = useCombatLink();
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerValue, setAnswerValue] = useState<AnswerValue>({ kind: 'text', text: '' });
  const [pastFirstQuestion, setPastFirstQuestion] = useState(false);

  const inputQuestion = useMemo(() => (question ? toInputQuestion(question) : null), [question]);

  useEffect(() => {
    if (!inputQuestion) return;
    setAnswerValue(getInitialValue(inputQuestion));
    setError(null);
  }, [inputQuestion]);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/flow/${encodeURIComponent(categoryId)}/next`);
      if (res.status === 204) {
        setQuestion(null);
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setQuestion(null);
        setError(j?.error ?? `Failed to load (${res.status})`);
        return;
      }
      const data = (await res.json()) as NextQuestion;
      setQuestion(data);
    } catch {
      setQuestion(null);
      setError('Network error loading question');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void loadNext();
  }, [loadNext]);

  async function handleAnswer() {
    if (!inputQuestion) return;
    if (!isValidAnswer(inputQuestion, answerValue)) return;

    const full = toApiPayload(inputQuestion, answerValue);
    const { questionId: _id, ...body } = full;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/flow/${encodeURIComponent(inputQuestion.id)}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(j?.error ?? 'Could not save answer');
        setLoading(false);
        return;
      }
      setPastFirstQuestion(true);
      combatAttack();
      await loadNext();
    } catch {
      setError('Network error saving answer');
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    if (!inputQuestion) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/flow/${encodeURIComponent(inputQuestion.id)}/skip`, {
        method: 'POST',
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j?.error ?? 'Could not skip');
        setLoading(false);
        return;
      }
      setPastFirstQuestion(true);
      combatSkip();
      await loadNext();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const q = question;
  const canSubmit = inputQuestion ? isValidAnswer(inputQuestion, answerValue) : false;

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl mb-4 font-semibold text-text">
        Flow{q?.category ? ` — ${q.category}` : ''}
      </h1>
      <p className="text-xs text-subtle mb-4 font-mono break-all">Category: {categoryId}</p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait">
          {q && inputQuestion ? (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border-2 border-border bg-card p-4 shadow-sm"
            >
              {!pastFirstQuestion ? (
                <div className="mb-3">
                  <FlowFirstQuestionHint />
                </div>
              ) : null}
              <p className="mb-3 text-text text-lg leading-snug">{q.question}</p>
              <p className="text-xs text-subtle mb-4">
                {q.type.replace(/_/g, ' ')} · {q.difficulty || 'medium'}
              </p>

              <div className="mb-4">
                <QuestionInput
                  question={inputQuestion}
                  value={answerValue}
                  onChange={setAnswerValue}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  onClick={() => void handleAnswer()}
                  disabled={loading || !canSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40"
                  onClick={() => void handleSkip()}
                  disabled={loading}
                >
                  Skip
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-border bg-card p-8 text-center text-subtle"
            >
              {loading ? 'Loading…' : 'No more questions in this category.'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
