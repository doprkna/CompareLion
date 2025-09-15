"use client";
import React from 'react';

const categories = [
  { name: 'Work', progress: 0.7 },
  { name: 'Health', progress: 0.3 },
  { name: 'Finance', progress: 0.5 },
  { name: 'Family', progress: 0.1 },
  { name: 'Hobbies', progress: 0.9 },
  { name: 'Travel', progress: 0.2 },
];

export default function QuestionCategoriesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Question Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow">
              <div className="text-lg font-semibold mb-2">{cat.name}</div>
              <div className="w-full bg-blue-100 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.round(cat.progress * 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-blue-700 font-medium">{Math.round(cat.progress * 100)}% complete</div>
            </div>
          ))}
        </div>
        <div className="text-center text-gray-500 text-sm mt-6">(Category progress is a placeholder. Real data coming soon!)</div>
      </div>
    </div>
  );
}
