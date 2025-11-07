"use client";
import { useState } from 'react';

interface QuestionCardProps {
  question: any;
  questionIndex: number;
  answers: any[];
  onAnswer: (index: number, answer: any) => void;
}

export function SynchQuestionCard({ question, questionIndex, answers, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState(answers[questionIndex] || null);

  const handleAnswer = (answer: any) => {
    setSelected(answer);
    onAnswer(questionIndex, answer);
  };

  if (!question) return null;

  const options = Array.isArray(question.options) ? question.options : [];
  const questionText = question.text || question.question || '';

  return (
    <div className="rounded border p-4 mb-4">
      <h3 className="font-semibold mb-3">{questionText}</h3>
      <div className="space-y-2">
        {options.map((opt: any, idx: number) => {
          const optionText = typeof opt === 'string' ? opt : (opt.label || opt.text || opt);
          const optionValue = typeof opt === 'string' ? opt : (opt.value || opt.id || opt);
          const isSelected = JSON.stringify(selected) === JSON.stringify(optionValue);
          
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(optionValue)}
              className={`w-full text-left p-3 rounded border transition ${
                isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              {optionText}
            </button>
          );
        })}
      </div>
    </div>
  );
}

