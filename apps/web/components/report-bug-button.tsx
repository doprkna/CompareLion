/**
 * Floating Report Bug Button (v0.14.0)
 * Allows users to quickly report bugs from any page
 */

'use client';

import { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ReportBugButtonProps {
  hideForAdmin?: boolean;
}

export function ReportBugButton({ hideForAdmin = true }: ReportBugButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Hide for admin users if specified
  const isAdmin = session?.user?.email?.includes('@admin') || session?.user?.email?.includes('@parel');
  if (hideForAdmin && isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.length < 5) {
      toast.error('Please provide more details about the bug');
      return;
    }

    setSubmitting(true);

    try {
      // Capture screenshot (if supported)
      let screenshot: string | undefined;
      if (typeof window !== 'undefined' && 'html2canvas' in window) {
        // Optional: implement screenshot capture if html2canvas is available
        // For now, we'll skip screenshot to keep dependencies minimal
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'bug',
          message,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          screenshot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      toast.success('Bug report submitted! Thank you for helping us improve.');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      logger.error('[ReportBug] Submission failed', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 group"
        title="Report a bug"
        aria-label="Report a bug"
      >
        <Bug className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Bug?
        </span>
      </button>

      {/* Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Report a Bug
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What's the issue?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what went wrong..."
                className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                maxLength={500}
                disabled={submitting}
              />
              <div className="text-xs text-text-secondary mt-1">
                {message.length}/500 characters
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Tips for reporting bugs:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1 ml-4 list-disc">
                <li>Describe what you were trying to do</li>
                <li>Explain what happened instead</li>
                <li>Include any error messages you saw</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={submitting || message.length < 5}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

