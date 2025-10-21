'use client';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, AlertCircle } from "lucide-react";

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">🤖 AI Question Generator</h1>
          <p className="text-subtle">Automated content creation system</p>
        </div>

        {/* Placeholder Notice */}
        <Card className="bg-warning/10 border-2 border-warning text-text">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Feature Placeholder (v0.8.0)</h3>
                <p className="text-subtle mb-4">
                  This AI-based question generation system is designed but not yet implemented.
                  It will provide automated content creation with quality scoring and moderation.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-accent">Planned Features:</div>
                  <ul className="list-disc list-inside space-y-1 text-subtle">
                    <li>Weighted category selection based on player participation</li>
                    <li>Real-time quality scoring (0.0-1.0 scale)</li>
                    <li>Automatic retries for outputs &lt; 0.75 quality</li>
                    <li>Moderator approval workflow</li>
                    <li>Feedback loop for AI improvements</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock UI */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border text-text opacity-50">
            <CardHeader><CardTitle>Generation Queue</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-subtle">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted" />
                <p>Placeholder: Job queue will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text opacity-50">
            <CardHeader><CardTitle>Pending Moderation</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-subtle">
                <p>Placeholder: Questions awaiting review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border text-text opacity-50">
          <CardHeader><CardTitle>Quality Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-bg rounded">
                <div className="text-2xl font-bold text-muted">--</div>
                <div className="text-xs text-subtle mt-1">Avg Quality</div>
              </div>
              <div className="text-center p-4 bg-bg rounded">
                <div className="text-2xl font-bold text-muted">--</div>
                <div className="text-xs text-subtle mt-1">Approval Rate</div>
              </div>
              <div className="text-center p-4 bg-bg rounded">
                <div className="text-2xl font-bold text-muted">--</div>
                <div className="text-xs text-subtle mt-1">Retries</div>
              </div>
              <div className="text-center p-4 bg-bg rounded">
                <div className="text-2xl font-bold text-muted">--</div>
                <div className="text-xs text-subtle mt-1">Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent text-text">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-subtle">
              Implementation planned for future release. Database models and utilities are ready.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










