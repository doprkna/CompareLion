/**
 * CompareLingo Page 1.0
 * Rate jokes, slang, captions, pickup lines, memes, and messages
 * v0.40.4 - CompareLingo 1.0 (Slang, Joke, Caption Rating)
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

// MiniBar component stub
const MiniBar = ({ label, value }: { label: string; value: number }) => <div className='minibar'><span>{label}: {value}</span></div>;

type LingoMode = 'joke' | 'slang' | 'caption' | 'pickup' | 'meme' | 'msg';

interface LingoRating {
  scores: {
    humor: number;
    clarity: number;
    vibe: number;
  };
  vibeTag: string;
  lingoType: string;
  feedback: string;
  suggestion?: string;
}

const modeLabels: Record<LingoMode, string> = {
  joke: 'Joke',
  slang: 'Slang',
  caption: 'Caption',
  pickup: 'Pickup Line',
  meme: 'Meme Text',
  msg: 'Message',
};

export default function LingoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<LingoMode>('joke');
  const [text, setText] = useState('');
  const [rating, setRating] = useState<LingoRating | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingText, setRatingText] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  async function handleRate() {
    if (!text.trim()) {
      setRatingError('Please enter some text to rate');
      return;
    }

    if (text.length > 200) {
      setRatingError('Text must be 200 characters or less');
      return;
    }

    setRatingText(true);
    setRating(null);
    setRatingError(null);

    try {
      const res = await apiFetch('/api/lingo/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), mode }),
      });

      if ((res as any).ok && (res as any).data?.success) {
        setRating((res as any).data);
      } else {
        const error = (res as any).error || (res as any).data?.error || 'Failed to rate text';
        setRatingError(error);
      }
    } catch (error) {
      console.error('Failed to rate text', error);
      setRatingError('Failed to rate text. Please try again.');
    } finally {
      setRatingText(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          CompareLingo
        </h1>
        <p className="text-gray-600">Rate jokes, slang, captions, pickup lines, memes, and messages</p>
      </div>

      {/* Mode Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Mode:</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(modeLabels) as LingoMode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? 'default' : 'outline'}
                  onClick={() => {
                    setMode(m);
                    setRating(null);
                    setRatingError(null);
                  }}
                  size="sm"
                >
                  {modeLabels[m]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter {modeLabels[mode]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setRating(null);
                  setRatingError(null);
                }}
                placeholder={`Enter your ${modeLabels[mode].toLowerCase()} here...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white min-h-[120px] resize-y"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {text.length}/200 characters
              </div>
            </div>
            <Button
              onClick={handleRate}
              disabled={ratingText || !text.trim()}
              className="w-full"
              size="lg"
            >
              {ratingText ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Rating...
                </>
              ) : (
                'Rate It'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {ratingError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{ratingError}</p>
          </CardContent>
        </Card>
      )}

      {/* Rating Output */}
      {rating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rating Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Vibe Tag */}
              <div>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg font-medium">
                  {rating.vibeTag}
                </span>
              </div>

              {/* Lingo Type */}
              {rating.lingoType && (
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {rating.lingoType}
                  </p>
                </div>
              )}

              {/* Score Bars */}
              <div className="space-y-3">
                <MiniBar label="Humor" value={rating.scores.humor} />
                <MiniBar label="Clarity" value={rating.scores.clarity} />
                <MiniBar label="Vibe" value={rating.scores.vibe} />
              </div>

              {/* Feedback */}
              <div>
                <p className="text-base font-medium text-gray-900">{rating.feedback}</p>
              </div>

              {/* Suggestion */}
              {rating.suggestion && (
                <div>
                  <p className="text-sm text-gray-600 italic">{rating.suggestion}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!rating && !ratingError && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">
              Enter some text and click "Rate It" to get AI-powered feedback!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

