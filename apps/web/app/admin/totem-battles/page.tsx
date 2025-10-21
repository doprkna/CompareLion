'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function TotemBattlesPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">⚔️ Totem Battles</h1>
          <p className="text-subtle">Group-vs-group competitive events</p>
        </div>

        <Card className="bg-warning/10 border-2 border-warning text-text">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Feature Placeholder (v0.8.3)</h3>
                <p className="text-subtle mb-4">
                  Asynchronous group battles with weekly matchmaking and rewards.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-accent">Planned System:</div>
                  <ul className="list-disc list-inside space-y-1 text-subtle">
                    <li>Matchmaking by average member level</li>
                    <li>Battle phases: Preparation → Clash → Results</li>
                    <li>Score = member XP + challenges completed</li>
                    <li>Victory rewards: emblems, bonus XP, loot chest</li>
                    <li>Automated start/end via cron job</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










