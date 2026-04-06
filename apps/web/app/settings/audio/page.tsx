'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioSettingsPanel } from '@/components/audio/AudioSettingsPanel';
import { Volume2 } from 'lucide-react';

export default function AudioSettingsPage() {
  return (
    <div className="min-h-screen bg-bg p-6 max-w-2xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AudioSettingsPanel />
        </CardContent>
      </Card>
    </div>
  );
}
