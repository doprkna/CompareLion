'use client';

import { useState } from 'react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">
          Share your thoughts, report bugs, or suggest improvements. We value your input!
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setShowForm(true)} size="lg" className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Send Feedback
        </Button>
      </div>

      <FeedbackForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          // Optionally reload or show success message
        }}
      />
    </div>
  );
}
