/**
 * Photo Entry Card Component
 * Display photo challenge entries with voting
 * v0.37.12 - Photo Challenge
 */

'use client';

import { useState, useEffect } from 'react';
import { Heart, Sparkles, MessageSquare, UtensilsCrossed, AlertTriangle, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiFetch } from '@/lib/apiBase';

interface PhotoEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  appealScore?: number;
  creativityScore?: number;
  userVotes?: {
    appeal: boolean;
    creativity: boolean;
  };
}

interface PhotoEntryCardProps {
  entry: PhotoEntry;
  onVoteChange?: () => void;
  className?: string;
}

export function PhotoEntryCard({ entry, onVoteChange, className = '' }: PhotoEntryCardProps) {
  const [appealScore, setAppealScore] = useState(entry.appealScore || 0);
  const [creativityScore, setCreativityScore] = useState(entry.creativityScore || 0);
  const [userVotes, setUserVotes] = useState(entry.userVotes || { appeal: false, creativity: false });
  const [isVoting, setIsVoting] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [pairing, setPairing] = useState<{ pairing: string[]; healthierAlternative: string | null } | null>(null);
  const [isLoadingPairing, setIsLoadingPairing] = useState(false);
  const [scamMessage, setScamMessage] = useState<string | null>(null);
  const [isFlagging, setIsFlagging] = useState(false);
  const [integrityData, setIntegrityData] = useState<{
    analysis: {
      watermarkDetected: boolean;
      stockPhotoLikelihood: number;
      aiGeneratedLikelihood: number;
      screenshotLikelihood: number;
      notes: string;
    } | null;
    flagCount: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleVote = async (voteType: 'appeal' | 'creativity') => {
    if (isVoting) return;

    setIsVoting(true);

    // Optimistic update
    const wasVoted = userVotes[voteType];
    const newVotes = { ...userVotes, [voteType]: !wasVoted };
    setUserVotes(newVotes);

    if (voteType === 'appeal') {
      setAppealScore(wasVoted ? appealScore - 1 : appealScore + 1);
    } else {
      setCreativityScore(wasVoted ? creativityScore - 1 : creativityScore + 1);
    }

    try {
      const response = await apiFetch('/api/challenge/photo/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: entry.id,
          voteType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Revert optimistic update
        setUserVotes(userVotes);
        if (voteType === 'appeal') {
          setAppealScore(appealScore);
        } else {
          setCreativityScore(creativityScore);
        }
        return;
      }

      // Update with server response
      setAppealScore(data.appealScore);
      setCreativityScore(data.creativityScore);
      setUserVotes(data.userVotes);

      onVoteChange?.();
    } catch (error) {
      // Revert optimistic update
      setUserVotes(userVotes);
      if (voteType === 'appeal') {
        setAppealScore(appealScore);
      } else {
        setCreativityScore(creativityScore);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const loadAIComment = async () => {
    if (aiComment || isLoadingComment) return;

    setIsLoadingComment(true);
    try {
      const response = await apiFetch(`/api/challenge/photo/ai-comment?entryId=${entry.id}`);
      const data = await response.json();

      if (data.success && data.comment) {
        setAiComment(data.comment);
      }
    } catch (error) {
      // Silently fail - AI comment is optional
    } finally {
      setIsLoadingComment(false);
    }
  };

  const loadPairing = async () => {
    if (pairing || isLoadingPairing) return;

    setIsLoadingPairing(true);
    try {
      const response = await apiFetch(`/api/challenge/photo/pairing?entryId=${entry.id}`);
      const data = await response.json();

      if (data.success && data.pairing) {
        setPairing({
          pairing: data.pairing,
          healthierAlternative: data.healthierAlternative,
        });
      }
    } catch (error) {
      // Silently fail - pairing is optional
    } finally {
      setIsLoadingPairing(false);
    }
  };

  const handleScamFlag = async (reason: 'watermark' | 'stock' | 'ai' | 'meme' | 'other') => {
    if (isFlagging) return;

    setIsFlagging(true);
    setScamMessage(null);

    try {
      const response = await apiFetch('/api/challenge/photo/scam-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: entry.id,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setScamMessage(data.message);
        // Update integrity data if available
        if (integrityData) {
          setIntegrityData({
            ...integrityData,
            flagCount: data.flagCount,
          });
        }
      }
    } catch (error) {
      setScamMessage('Failed to flag entry. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleScanImage = async () => {
    if (integrityData || isScanning) return;

    setIsScanning(true);
    try {
      const response = await apiFetch(`/api/challenge/photo/integrity?entryId=${entry.id}`);
      const data = await response.json();

      if (data.success) {
        setIntegrityData({
          analysis: data.analysis,
          flagCount: data.flagCount,
        });
      }
    } catch (error) {
      // Silently fail - scan is optional
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {entry.user?.image && (
              <img
                src={entry.user.image}
                alt={entry.user.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">
              {entry.user?.name || 'Anonymous'}
            </span>
          </div>
          <span className="text-xs text-gray-500 capitalize">{entry.category}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={entry.imageUrl}
            alt={`Photo entry by ${entry.user?.name || 'user'}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vote Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant={userVotes.appeal ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('appeal')}
            disabled={isVoting}
            className="flex items-center gap-2"
          >
            <Heart className={`w-4 h-4 ${userVotes.appeal ? 'fill-current' : ''}`} />
            <span>{appealScore}</span>
          </Button>

          <Button
            variant={userVotes.creativity ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('creativity')}
            disabled={isVoting}
            className="flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${userVotes.creativity ? 'fill-current' : ''}`} />
            <span>{creativityScore}</span>
          </Button>

          {/* AI Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadAIComment}
            disabled={isLoadingComment}
            className="ml-auto"
            title="Get AI comment"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          {/* Pairing Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPairing}
            disabled={isLoadingPairing}
            title="Get pairing suggestions"
          >
            <UtensilsCrossed className="w-4 h-4" />
          </Button>

          {/* Scan Image Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScanImage}
            disabled={isScanning}
            title="Scan image integrity"
          >
            <Scan className="w-4 h-4" />
          </Button>

          {/* Scam Alert Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScamFlag('other')}
            disabled={isFlagging}
            title="Report scam"
            className="text-orange-600 hover:text-orange-700"
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Comment */}
        {aiComment && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {aiComment}
          </div>
        )}

        {/* Pairing Suggestions */}
        {pairing && (
          <div className="text-sm bg-blue-50 p-3 rounded space-y-2">
            <div className="font-medium text-blue-900 mb-2">Pairing Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              {pairing.pairing.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            {pairing.healthierAlternative && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="font-medium text-blue-900">Healthier Alternative:</div>
                <div className="text-blue-800">{pairing.healthierAlternative}</div>
              </div>
            )}
          </div>
        )}

        {/* Scam Alert Message */}
        {scamMessage && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            {scamMessage}
          </div>
        )}

        {/* Integrity Analysis */}
        {integrityData && integrityData.analysis && (
          <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
            <div className="font-medium text-gray-700">Image Scan Results:</div>
            {integrityData.analysis.watermarkDetected && (
              <div className="text-red-600">⚠️ Watermark detected</div>
            )}
            {integrityData.analysis.stockPhotoLikelihood > 50 && (
              <div>Stock photo likelihood: {integrityData.analysis.stockPhotoLikelihood}%</div>
            )}
            {integrityData.analysis.aiGeneratedLikelihood > 50 && (
              <div>AI-generated likelihood: {integrityData.analysis.aiGeneratedLikelihood}%</div>
            )}
            {integrityData.analysis.screenshotLikelihood > 50 && (
              <div>Screenshot likelihood: {integrityData.analysis.screenshotLikelihood}%</div>
            )}
            {integrityData.analysis.notes && (
              <div className="text-gray-600 italic">{integrityData.analysis.notes}</div>
            )}
            {integrityData.flagCount > 0 && (
              <div className="text-orange-600 font-medium">
                {integrityData.flagCount} flag{integrityData.flagCount !== 1 ? 's' : ''} reported
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

