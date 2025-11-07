'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeedback } from '@/hooks/useFeedback';
import { toast } from 'sonner';
import { MessageSquare, Upload, X } from 'lucide-react';

interface FeedbackFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FeedbackForm({ open, onClose, onSuccess }: FeedbackFormProps) {
  const { submitFeedback, loading } = useFeedback();
  const [message, setMessage] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [context, setContext] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await submitFeedback({
        message: message.trim(),
        screenshotUrl: screenshotUrl.trim() || undefined,
        context: context.trim() || undefined,
      });
      toast.success('Feedback submitted successfully! Thank you.');
      setMessage('');
      setScreenshotUrl('');
      setContext('');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit feedback');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, report bugs, or suggest improvements. All feedback is appreciated!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your feedback, bug report, or suggestion..."
              rows={5}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="screenshot"
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://example.com/screenshot.png"
                disabled={loading}
              />
              {screenshotUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setScreenshotUrl('')}
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context (optional)</Label>
            <Input
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Page, action, or additional context..."
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !message.trim()}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

