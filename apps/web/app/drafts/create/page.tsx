/**
 * Create Draft Page
 * Minimal UI for creating drafts
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CreateDraftPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  async function handleCreate() {
    if (!content.trim()) {
      toast.error('Please enter draft content');
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch('/api/drafts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!(res as any).ok) {
        throw new Error((res as any).error || 'Failed to create draft');
      }

      const draftId = (res as any).data?.draftId;
      setCurrentDraftId(draftId);
      toast.success('Draft created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create draft');
    } finally {
      setCreating(false);
    }
  }

  async function handleRequestReview() {
    if (!currentDraftId) {
      toast.error('Please create a draft first');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/drafts/request-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: currentDraftId }),
      });

      if (!(res as any).ok) {
        throw new Error((res as any).error || 'Failed to request review');
      }

      toast.success('Review requested');
      router.push('/drafts/my');
    } catch (error: any) {
      toast.error(error.message || 'Failed to request review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Create Draft</h1>

      <Card>
        <CardHeader>
          <CardTitle>Draft Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your draft content here..."
            rows={10}
            className="w-full"
          />

          <div className="flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={creating || !content.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Draft'
              )}
            </Button>

            {currentDraftId && (
              <Button
                onClick={handleRequestReview}
                disabled={submitting}
                variant="default"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

