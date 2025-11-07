'use client';

/**
 * Daily Quiz Page
 * 
 * 3-question daily quiz with energy mechanic.
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { formatRegenTime } from "@/lib/energy";

export default function DailyQuizPage() {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [energy, setEnergy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  async function loadQuiz() {
    setLoading(true);
    const res = await apiFetch("/api/quiz/today");

    if ((res as any).ok && (res as any).data) {
      setQuiz((res as any).data.quiz);
      setQuestions((res as any).data.questions);
      setEnergy((res as any).data.energy);
    }
    setLoading(false);
  }

  async function submitQuiz() {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);
    const res = await apiFetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        answers,
      }),
    });

    if ((res as any).ok && (res as any).data) {
      setResults((res as any).data.results);
      setEnergy((res as any).data.energy);
      toast.success("Quiz completed! 🎉");
    } else {
      toast.error((res as any).error || "Failed to submit quiz");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading daily quiz...</div>
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-text mb-2">
              No Quiz Available
            </h2>
            <p className="text-subtle">Check back later!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already completed
  if (quiz.hasCompleted && !results) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-accent text-text">
            <CardContent className="p-12 text-center space-y-4">
              <div className="text-7xl">✅</div>
              <h2 className="text-2xl font-bold">Quiz Already Completed!</h2>
              <p className="text-subtle">
                You scored {quiz.userScore}/{questions.length}
              </p>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Trophy className="h-5 w-5" />
                <span>Earned +{quiz.rewardXp} XP and +{quiz.rewardHearts} ❤️</span>
              </div>
              <p className="text-xs text-muted pt-4">
                Come back tomorrow for a new quiz!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show results after submission
  if (results) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-card border-accent text-text">
            <CardContent className="p-12 text-center space-y-6">
              <div className="text-7xl">🎉</div>
              <h2 className="text-3xl font-bold">Quiz Complete!</h2>
              
              <div className="bg-bg rounded-lg p-6 space-y-4">
                <div className="text-5xl font-bold text-accent">
                  {results.score}/{results.totalQuestions}
                </div>
                <div className="text-subtle">Correct Answers</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-bg rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-500">
                    +{results.xpAwarded}
                  </div>
                  <div className="text-xs text-subtle">XP Earned</div>
                </div>
                <div className="bg-bg rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-500">
                    +{results.heartsAwarded} ❤️
                  </div>
                  <div className="text-xs text-subtle">Hearts Gained</div>
                </div>
              </div>

              <Button onClick={() => window.location.href = "/feed"} className="w-full">
                View Community Feed
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-card border-border text-text">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">📝 Daily Quiz</h1>
                <p className="text-subtle">Answer 3 questions to earn rewards!</p>
              </div>
              
              <div className="flex gap-4">
                {/* Energy Status */}
                {energy && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-bg rounded-lg">
                    {Array.from({ length: energy.hearts }).map((_, i) => (
                      <Heart key={i} className="h-4 w-4 fill-red-500 text-red-500" />
                    ))}
                    {Array.from({ length: energy.maxHearts - energy.hearts }).map((_, i) => (
                      <Heart key={`e-${i}`} className="h-4 w-4 text-zinc-600" />
                    ))}
                    {energy.hearts < energy.maxHearts && (
                      <span className="text-xs text-subtle ml-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatRegenTime(energy.minutesUntilRegen)}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Completions */}
                <div className="flex items-center gap-2 px-4 py-2 bg-bg rounded-lg">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{quiz.completions}</span>
                  <span className="text-xs text-subtle">completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < currentQuestion
                  ? "bg-green-500"
                  : i === currentQuestion
                  ? "bg-accent"
                  : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <Card className="bg-card border-border text-text">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{currentQ.text}</p>

            <div className="space-y-3">
              {currentQ.options.map((option: any) => {
                const isSelected = answers[currentQ.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setAnswers({ ...answers, [currentQ.id]: option.id });
                    }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentQuestion > 0 && (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              variant="outline"
            >
              Previous
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ.id]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}













