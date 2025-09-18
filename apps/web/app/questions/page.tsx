"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function QuestionsPage() {
  const router = useRouter();
  // Hardcoded for demo/testing
  const userId = "demo-user-1";
  const flowId = "demo-flow-1";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [history, setHistory] = useState<any[]>([]); // [{stepId, question, selected}]

  useEffect(() => {
    // Start a session on mount
    const startSession = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/sessions`, { cache: 'no-store',
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, flowId }),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
        setCurrentStepId(data.currentStepId);
        setQuestion(data.question);
        setCompleted(false);
        setSelected(null);
        setHistory([]);
      } catch (err) {
        setQuestion({ displayText: "Failed to load question." });
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, []);

  const handleConfirm = async () => {
    if (!sessionId || !selected) return;
    setLoading(true);
    setHistory((h) => [
      ...h,
      { stepId: currentStepId, question, selected },
    ]);
    try {
      const res = await fetch(`${base}/api/sessions/${sessionId}/answer`, { cache: 'no-store',
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selected }),
      });
      const data = await res.json();
      if (data.completed) {
        setCompleted(true);
        setQuestion(null);
        setCurrentStepId(null);
        setSelected(null);
      } else {
        setCurrentStepId(data.currentStepId);
        setQuestion(data.question);
        setSelected(null);
      }
    } catch (err) {
      setQuestion({ displayText: "Failed to load next question." });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!sessionId) return;
    setLoading(true);
    setHistory((h) => [
      ...h,
      { stepId: currentStepId, question, selected: "__SKIP__" },
    ]);
    try {
      const res = await fetch(`${base}/api/sessions/${sessionId}/answer`, { cache: 'no-store',
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: "__SKIP__" }),
      });
      const data = await res.json();
      if (data.completed) {
        setCompleted(true);
        setQuestion(null);
        setCurrentStepId(null);
        setSelected(null);
      } else {
        setCurrentStepId(data.currentStepId);
        setQuestion(data.question);
        setSelected(null);
      }
    } catch (err) {
      setQuestion({ displayText: "Failed to load next question." });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCurrentStepId(prev.stepId);
    setQuestion(prev.question);
    setSelected(prev.selected === "__SKIP__" ? null : prev.selected);
    setHistory(history.slice(0, -1));
    setCompleted(false);
  };

  // Placeholder progress values
  const totalQuestions = 5;
  const answered = 2;
  const progressPercent = Math.round((answered / totalQuestions) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white p-8 rounded shadow">
        {/* Browse Questions button */}
        <div className="mb-6 flex justify-end">
          <button
            className="bg-gray-100 text-blue-700 px-4 py-2 rounded hover:bg-gray-200 transition font-semibold border border-blue-200"
            onClick={() => router.push('/question-categories')}
          >
            Browse Questions
          </button>
        </div>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-700">Progress</span>
            <span className="text-sm font-medium text-blue-700">{answered}/{totalQuestions}</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Questions</h1>
        <div className="mb-8">
          {loading ? (
            <div className="text-gray-500">Loading question...</div>
          ) : completed ? (
            <div className="text-green-700 font-semibold text-lg">Flow complete! Thank you for your answers.</div>
          ) : (
            <div className="text-lg font-semibold mb-2">{question?.displayText}</div>
          )}
        </div>
        {!loading && !completed && (
          <>
            <div className="flex gap-4 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setSelected(val)}
                  className={
                    (selected === val
                      ? "bg-blue-800 text-white border-2 border-blue-900 "
                      : "bg-blue-600 text-white hover:bg-blue-700 ") +
                    "px-4 py-2 rounded transition font-semibold"
                  }
                  disabled={loading}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
                onClick={handleBack}
                disabled={history.length === 0 || loading}
              >
                ← Back
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold disabled:opacity-50"
                disabled={selected === null || loading}
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition font-semibold"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip
              </button>
            </div>
            {selected !== null && (
              <div className="mt-6 text-center text-blue-700 font-medium">
                Selected: {selected}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
