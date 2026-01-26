'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChronicleCard } from '@/components/chronicle/ChronicleCard';
import { useChronicle, useGenerateChronicle } from '@parel/core/hooks/useChronicle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollText, Loader2, Sparkles } from 'lucide-react';
// Using browser notification or simple alert for MVP
// import { toast } from 'sonner'; // Future: use sonner when available

export default function ChroniclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chronicleType, setChronicleType] = useState<'weekly' | 'seasonal'>('weekly');
  
  const { chronicle, loading, error, reload } = useChronicle(chronicleType);
  const { generateChronicle, loading: generating, error: genError } = useGenerateChronicle();

  const handleGenerate = async () => {
    try {
      const newChronicle = await generateChronicle(chronicleType);
      // Show success message
      alert('📜 New Chronicle generated for this week.');
      reload();
    } catch (err) {
      alert('Failed to generate chronicle');
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <ScrollText className="w-8 h-8" />
          Chronicle
        </h1>
        <p className="text-subtle">Your weekly and seasonal summaries</p>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={chronicleType === 'weekly' ? 'default' : 'outline'}
          onClick={() => setChronicleType('weekly')}
        >
          Weekly
        </Button>
        <Button
          variant={chronicleType === 'seasonal' ? 'default' : 'outline'}
          onClick={() => setChronicleType('seasonal')}
        >
          Seasonal
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-card border-red-500/20">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Generate Button (if no chronicle) */}
      {!chronicle && !loading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-subtle" />
            <h3 className="text-xl font-semibold text-text mb-2">No Chronicle Yet</h3>
            <p className="text-subtle mb-4">
              Generate your {chronicleType} chronicle to see your reflection summary.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Chronicle'
              )}
            </Button>
            {genError && <p className="text-red-500 mt-2 text-sm">{genError}</p>}
          </CardContent>
        </Card>
      )}

      {/* Chronicle Display */}
      {chronicle && <ChronicleCard chronicle={chronicle} />}

      {/* Generate New Button (if chronicle exists) */}
      {chronicle && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate New Chronicle'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

