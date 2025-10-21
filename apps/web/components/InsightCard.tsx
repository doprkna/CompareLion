'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface InsightCardProps {
  insight: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
    generatedAt: string;
  };
}

export default function InsightCard({ insight }: InsightCardProps) {
  const colorMap: Record<string, string> = {
    purple: "border-purple-500 bg-purple-500/10",
    green: "border-green-500 bg-green-500/10",
    blue: "border-blue-500 bg-blue-500/10",
    yellow: "border-yellow-500 bg-yellow-500/10",
    orange: "border-orange-500 bg-orange-500/10",
    red: "border-red-500 bg-red-500/10",
    gold: "border-yellow-400 bg-yellow-400/10",
    indigo: "border-indigo-500 bg-indigo-500/10",
    gray: "border-zinc-500 bg-zinc-500/10",
  };

  return (
    <Card className={`border-2 ${colorMap[insight.color] || colorMap.gray}`}>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{insight.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-text">{insight.title}</h3>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <p className="text-sm text-subtle mt-1">{insight.description}</p>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted text-right">
          Generated {new Date(insight.generatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}










