/**
 * Create Template Form Component
 * Form for creating user rating templates
 * v0.38.14 - Template Marketplace
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

interface Metric {
  id: string;
  label: string;
  description: string;
}

interface CreateTemplateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateTemplateForm({ onSuccess, onCancel }: CreateTemplateFormProps) {
  const [name, setName] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: 'metric1', label: '', description: '' },
  ]);
  const [promptTemplate, setPromptTemplate] = useState(
    'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.'
  );
  const [icon, setIcon] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMetric = () => {
    if (metrics.length >= 10) {
      setError('Maximum 10 metrics allowed');
      return;
    }
    setMetrics([...metrics, { id: `metric${metrics.length + 1}`, label: '', description: '' }]);
  };

  const removeMetric = (index: number) => {
    if (metrics.length <= 1) {
      setError('Must have at least 1 metric');
      return;
    }
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-generate ID from label if empty
    if (field === 'label' && !updated[index].id) {
      updated[index].id = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    
    setMetrics(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!name.trim() || !categoryLabel.trim()) {
      setError('Name and category label are required');
      return;
    }

    if (metrics.some(m => !m.id || !m.label)) {
      setError('All metrics must have an ID and label');
      return;
    }

    if (!promptTemplate.trim() || promptTemplate.length < 20) {
      setError('Prompt template must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch('/api/templates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          categoryLabel: categoryLabel.trim(),
          metrics: metrics.map(m => ({
            id: m.id.trim(),
            label: m.label.trim(),
            description: m.description.trim() || undefined,
          })),
          promptTemplate: promptTemplate.trim(),
          icon: icon.trim() || undefined,
          isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create template');
      }

      // Reset form
      setName('');
      setCategoryLabel('');
      setMetrics([{ id: 'metric1', label: '', description: '' }]);
      setPromptTemplate(
        'Evaluate this {category}. Rate {metrics} (0-100). Give a 1-2 sentence summary and a playful roast or compliment.'
      );
      setIcon('');
      setIsPublic(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Rating Template</CardTitle>
        <CardDescription>
          Create your own custom rating template with custom metrics and prompts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Slav Aesthetic"
              maxLength={50}
              required
            />
          </div>

          {/* Category Label */}
          <div>
            <Label htmlFor="categoryLabel">Category Label</Label>
            <Input
              id="categoryLabel"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="e.g., Slav Outfit Rating"
              maxLength={50}
              required
            />
          </div>

          {/* Icon (optional) */}
          <div>
            <Label htmlFor="icon">Icon (emoji or short text, optional)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🎨"
              maxLength={10}
            />
          </div>

          {/* Metrics */}
          <div>
            <Label>Metrics (1-10)</Label>
            <div className="space-y-2 mt-2">
              {metrics.map((metric, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Metric ID (e.g., chaosLevel)"
                      value={metric.id}
                      onChange={(e) => updateMetric(index, 'id', e.target.value)}
                      required
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Alphanumeric and underscores only"
                    />
                    <Input
                      placeholder="Metric Label (e.g., Chaos Level)"
                      value={metric.label}
                      onChange={(e) => updateMetric(index, 'label', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={metric.description}
                      onChange={(e) => updateMetric(index, 'description', e.target.value)}
                    />
                  </div>
                  {metrics.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMetric(index)}
                      className="mt-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {metrics.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetric}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Metric
                </Button>
              )}
            </div>
          </div>

          {/* Prompt Template */}
          <div>
            <Label htmlFor="promptTemplate">AI Prompt Template</Label>
            <Textarea
              id="promptTemplate"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Use {category} and {metrics} as placeholders"
              rows={4}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{category}'} for category name and {'{metrics}'} for metric list
            </p>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic">Make Public</Label>
              <p className="text-xs text-gray-500">Allow others to use this template</p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

