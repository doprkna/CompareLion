/**
 * Story Templates Page
 * Create and manage story templates
 * v0.40.9 - Story Templates Marketplace 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Globe, Lock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '@/lib/apiBase';

interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  panelCount: number;
  layoutMode: 'vertical' | 'grid';
  panelLabels: string[];
  panelHelpTexts: string[];
  isPublic: boolean;
  createdAt: string;
}

interface TemplatesResponse {
  success: boolean;
  templates: StoryTemplate[];
  error?: string;
}

export default function StoryTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [panelCount, setPanelCount] = useState(2);
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'grid'>('vertical');
  const [panelLabels, setPanelLabels] = useState<string[]>(['Before', 'After']);
  const [panelHelpTexts, setPanelHelpTexts] = useState<string[]>(['', '']);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status, router]);

  useEffect(() => {
    // Update panel labels and help texts when panel count changes
    const newLabels = Array.from({ length: panelCount }, (_, i) => 
      panelLabels[i] || `Panel ${i + 1}`
    );
    const newHelpTexts = Array.from({ length: panelCount }, (_, i) => 
      panelHelpTexts[i] || ''
    );
    setPanelLabels(newLabels);
    setPanelHelpTexts(newHelpTexts);
  }, [panelCount]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/story/templates/mine');
      const data = (await res.json()) as TemplatesResponse;

      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTemplate() {
    if (!name.trim() || !description.trim()) {
      alert('Please fill in name and description');
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch('/api/story/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          panelCount,
          layoutMode,
          panelLabels,
          panelHelpTexts,
          isPublic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Reset form
        setName('');
        setDescription('');
        setPanelCount(2);
        setLayoutMode('vertical');
        setPanelLabels(['Before', 'After']);
        setPanelHelpTexts(['', '']);
        setIsPublic(false);
        setShowForm(false);
        // Reload templates
        loadTemplates();
      } else {
        alert(data.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Failed to create template', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  function handlePanelLabelChange(index: number, value: string) {
    const newLabels = [...panelLabels];
    newLabels[index] = value;
    setPanelLabels(newLabels);
  }

  function handlePanelHelpTextChange(index: number, value: string) {
    const newHelpTexts = [...panelHelpTexts];
    newHelpTexts[index] = value;
    setPanelHelpTexts(newHelpTexts);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-subtle" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text mb-2">Story Templates</h1>
            <p className="text-subtle">Create reusable story presets with custom panel labels</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Create Template'}
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="mb-6 bg-card border-border">
            <CardHeader>
              <CardTitle>Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Desk Glow-Up"
                  className="bg-bg border-border text-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Before / after setup story"
                  className="bg-bg border-border text-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Panel Count: {panelCount}
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPanelCount(Math.max(1, panelCount - 1))}
                    disabled={panelCount <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4">{panelCount}</span>
                  <Button
                    variant="outline"
                    onClick={() => setPanelCount(Math.min(8, panelCount + 1))}
                    disabled={panelCount >= 8}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">Layout Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={layoutMode === 'vertical' ? 'default' : 'outline'}
                    onClick={() => setLayoutMode('vertical')}
                  >
                    Vertical
                  </Button>
                  <Button
                    variant={layoutMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setLayoutMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">Panel Labels</label>
                <div className="space-y-2">
                  {Array.from({ length: panelCount }).map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Input
                        value={panelLabels[index] || ''}
                        onChange={(e) => handlePanelLabelChange(index, e.target.value)}
                        placeholder={`Panel ${index + 1} label`}
                        className="bg-bg border-border text-text"
                      />
                      <Input
                        value={panelHelpTexts[index] || ''}
                        onChange={(e) => handlePanelHelpTextChange(index, e.target.value)}
                        placeholder={`Optional help text for panel ${index + 1}`}
                        className="bg-bg border-border text-text text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-sm text-text">
                  Make public (others can use this template)
                </label>
              </div>

              <Button
                onClick={handleCreateTemplate}
                disabled={creating || !name.trim() || !description.trim()}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Template'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* My Templates List */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-4">My Templates</h2>
          {templates.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-subtle">No templates yet. Create your first template!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-text">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {template.panelCount} panels
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.layoutMode}
                          </Badge>
                          {template.isPublic ? (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-subtle mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.panelLabels.map((label, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-subtle mt-2">
                          Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

