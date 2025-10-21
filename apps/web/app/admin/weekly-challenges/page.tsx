'use client';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Zap } from "lucide-react";

export default function WeeklyChallengesPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">🎯 Weekly Challenge Generator</h1>
          <p className="text-subtle">AI-powered community challenges</p>
        </div>

        <Card className="bg-warning/10 border-2 border-warning text-text">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Feature Placeholder (v0.8.2)</h3>
                <p className="text-subtle mb-4">
                  Automated challenge generation based on community activity trends.
                  System designed but awaiting implementation.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-accent">Planned Flow:</div>
                  <ul className="list-disc list-inside space-y-1 text-subtle">
                    <li>Analyze EventLog for popular topics (last 7 days)</li>
                    <li>Generate challenge prompt using AI</li>
                    <li>Create dare and truth variants</li>
                    <li>Auto-publish every Monday with global notification</li>
                    <li>Track participant count and responses</li>
                    <li>Award XP and karma on completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border text-text opacity-50">
            <CardHeader><CardTitle>Draft Challenges</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-subtle">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted" />
                <p>Generated challenges awaiting review will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text opacity-50">
            <CardHeader><CardTitle>Active Challenge</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-subtle">
                <p>This week's published challenge</p>
                <p className="text-xs mt-2">Participation count and responses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-accent text-text">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-subtle">
              Database models and worker stubs ready. AI integration pending.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}











