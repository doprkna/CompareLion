"use client";
import Link from 'next/link';
import { ProgressBar } from '@/components/flow/ProgressBar';

export default function QuestionsPage() {
  // Mock categories for demo
  const categories = [
    { id: '1', name: 'Lifestyle', icon: '🏠', questionCount: 15, completed: 5 },
    { id: '2', name: 'Work & Career', icon: '💼', questionCount: 12, completed: 8 },
    { id: '3', name: 'Health & Fitness', icon: '💪', questionCount: 10, completed: 3 },
    { id: '4', name: 'Learning', icon: '📚', questionCount: 8, completed: 8 },
    { id: '5', name: 'Entertainment', icon: '🎮', questionCount: 14, completed: 0 },
    { id: '6', name: 'Social', icon: '👥', questionCount: 11, completed: 2 },
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">Question Hub</h1>
          <p className="text-subtle">
            Explore categories and start answering questions to unlock insights
          </p>
        </div>

        {/* Quick Start Flow */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text mb-2">Quick Flow</h2>
              <p className="text-subtle">
                Answer 5 random questions in a row
              </p>
            </div>
            <Link
              href="/flow-demo"
              className="bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition shadow-lg"
            >
              Start Now →
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-text mb-4">Browse by Category</h2>
          <p className="text-subtle text-sm mb-6">
            💡 Demo data - categories and questions from seed script
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const progress = category.questionCount > 0 
              ? (category.completed / category.questionCount) * 100 
              : 0;

            return (
              <div
                key={category.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text group-hover:text-accent transition">
                      {category.name}
                    </h3>
                    <p className="text-sm text-subtle">
                      {category.questionCount} questions
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-subtle">Completed</span>
                    <span className="text-text font-medium">
                      {category.completed}/{category.questionCount}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo note */}
        <div className="mt-8 bg-card border border-border rounded-lg p-4">
          <p className="text-subtle text-sm text-center">
            📊 Categories are placeholders. Click "Start Now" to try the flow runner with real DB questions.
          </p>
        </div>
      </div>
    </div>
  );
}
