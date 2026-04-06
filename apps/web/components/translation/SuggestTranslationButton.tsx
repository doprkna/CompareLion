'use client';

/**
 * Community translation suggestion — minimal modal (v0.48.06)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export type SuggestTranslationButtonProps = {
  entityType: 'question' | 'poll';
  entityId: string;
  originalText: string;
};

export function SuggestTranslationButton({
  entityType,
  entityId,
  originalText,
}: SuggestTranslationButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('cs');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const lang = language.trim().toLowerCase();
    const sug = suggestion.trim();
    if (!lang || !sug) {
      toast({ title: 'Missing fields', description: 'Language and suggestion are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/translation/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entityType,
          entityId,
          language: lang,
          original: originalText,
          suggestion: sug,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
      }
      toast({ title: 'Thanks!', description: 'Your suggestion was submitted for review.' });
      setOpen(false);
      setSuggestion('');
    } catch (e) {
      toast({
        title: 'Could not submit',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="text-subtle" onClick={() => setOpen(true)}>
        🌍 Suggest translation
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suggest a translation</DialogTitle>
            <p className="text-xs text-subtle">
              Help others by proposing text in another language. Submissions are reviewed by admins.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-subtle">Original (English)</Label>
              <Textarea readOnly value={originalText} className="mt-1 min-h-[80px] bg-bg-muted/50" />
            </div>
            <div>
              <Label htmlFor="tr-lang">Language</Label>
              <Input
                id="tr-lang"
                className="mt-1 max-w-xs"
                placeholder="cs, sk, de…"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tr-sug">Your translation</Label>
              <Textarea
                id="tr-sug"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Translated text…"
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
