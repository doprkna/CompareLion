'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCombatLink } from '@parel/core/hooks/useCombatLink';

type Question = {
  id: string;
  text: string;
  difficulty?: string | null;
};

export default function FlowPage() {
  const { categoryId } = useParams() as { categoryId: string };
  const { attack: combatAttack, skip: combatSkip } = useCombatLink();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadNext() {
    setLoading(true);
    const res = await fetch(`/api/flow/${encodeURIComponent(categoryId)}/next`);
    if (res.status === 204) {
      setQuestion(null);
    } else {
      const data = await res.json();
      setQuestion(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadNext();
  }, [categoryId]);

  async function handleAnswer() {
    if (!question) return;
    setLoading(true);
    await fetch(`/api/flow/${question.id}/answer`, { method: 'POST' });
    combatAttack();
    loadNext();
  }

  async function handleSkip() {
    if (!question) return;
    setLoading(true);
    await fetch(`/api/flow/${question.id}/skip`, { method: 'POST' });
    combatSkip();
    loadNext();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Flow: {categoryId}</h1>
      <div className="relative min-h-[150px]">
        <AnimatePresence exitBeforeEnter>
          {question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="border rounded p-4"
            >
              <p className="mb-2">{question.text}</p>
              <p className="text-sm text-gray-500 mb-4">Difficulty: {question.difficulty || 'medium'}</p>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleAnswer}
                  disabled={loading}
                >Answer</button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={handleSkip}
                  disabled={loading}
                >Skip</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500"
            >
              No more questions.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
