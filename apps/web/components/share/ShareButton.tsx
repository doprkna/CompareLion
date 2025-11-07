'use client';

import { Button } from '@/components/ui/button';
import { Share2, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonProps {
  shareCard?: {
    id: string;
    shareUrl: string;
    imageUrl?: string | null;
  };
  onShare?: () => void;
  className?: string;
}

export function ShareButton({ shareCard, onShare, className }: ShareButtonProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyLink = async () => {
    if (!shareCard) return;

    try {
      const fullUrl = `${window.location.origin}${shareCard.shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopying(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopying(false), 2000);
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    if (!shareCard?.imageUrl) {
      toast.error('No image to download');
      return;
    }

    // Open image in new tab for download
    window.open(shareCard.imageUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (!shareCard) return;

    if (navigator.share) {
      try {
        const fullUrl = `${window.location.origin}${shareCard.shareUrl}`;
        await navigator.share({
          title: 'My PareL Share Card',
          text: 'Check out my PareL stats!',
          url: fullUrl,
        });
      } catch (e) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={copying}
      >
        <Copy className="w-4 h-4" />
        {copying ? 'Copied!' : 'Copy Link'}
      </Button>

      {shareCard?.imageUrl && (
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      )}

      {onShare && (
        <Button
          onClick={onShare}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          Generate New
        </Button>
      )}
    </div>
  );
}

