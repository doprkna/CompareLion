"use client";
import AchievementsGrid from "@/components/achievements/AchievementsGrid";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Achievement } from '@/types/achievement';

export const revalidate = 0;

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    apiFetch('/api/achievements')
      .then(data => {
        if (data.success) setAchievements(data.achievements);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-600 mb-6">Collect badges as you explore PareL. Hover a badge to see details.</p>
        <AchievementsGrid achievements={achievements} />
      </div>
    </div>
  );
}
