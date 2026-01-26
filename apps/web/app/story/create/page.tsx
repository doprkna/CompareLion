/**
 * Parel Story Generator - Create Story Page 2.0
 * 1-3 panel and 4-8 panel story creator
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */

'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Icon component stub
const Icon = ({ name, className }: { name: string; className?: string; size?: string }) => <span className={'icon-' + name + ' ' + (className || '')} />;
import { apiFetch } from '@/lib/apiBase';

type StoryType = 'simple' | 'extended';
type StoryMode = '1panel' | '3panel';
type LayoutMode = 'vertical' | 'grid';

interface StoryPanel {
  imageUrl: string;
  text?: string;
  caption: string;
  vibeTag: string;
  microStory: string;
  category?: string;
  role?: 'intro' | 'build' | 'peak' | 'outro';
}

interface SimpleStory {
  panels: StoryPanel[];
  throughline?: string;
}

interface ExtendedStory {
  title: string;
  logline: string;
  panels: StoryPanel[];
}

export default function StoryCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [storyType, setStoryType] = useState<StoryType>('simple');
  const [mode, setMode] = useState<StoryMode>('1panel');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [numPanelsExtended, setNumPanelsExtended] = useState(4);
  const [panelImages, setPanelImages] = useState<string[]>(['']);
  const [panelTexts, setPanelTexts] = useState<(string | null)[]>(['']);
  const [uploading, setUploading] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [simpleStory, setSimpleStory] = useState<SimpleStory | null>(null);
  const [extendedStory, setExtendedStory] = useState<ExtendedStory | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [exportLayoutMode, setExportLayoutMode] = useState<LayoutMode>('grid');
  const [publishVisibility, setPublishVisibility] = useState<'public' | 'private' | 'friends'>('private');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [myTemplates, setMyTemplates] = useState<Array<{ id: string; name: string; panelCount: number; layoutMode: string; panelLabels: string[]; panelHelpTexts: string[] }>>([]);
  const [publicTemplates, setPublicTemplates] = useState<Array<{ id: string; name: string; panelCount: number; layoutMode: string; panelLabels: string[]; panelHelpTexts: string[] }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedAudioTag, setSelectedAudioTag] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioType, setAudioType] = useState<'none' | 'tag' | 'voice'>('none');
  const [savingAudio, setSavingAudio] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status]);

  async function loadTemplates() {
    setLoadingTemplates(true);
    try {
      // Load my templates
      const myRes = await apiFetch('/api/story/templates/mine');
      const myData = await myRes.json();
      if (myData.success) {
        setMyTemplates(myData.templates);
      }

      // Load public templates
      try {
        const publicRes = await apiFetch('/api/story/templates/public');
        const publicData = await publicRes.json();
        if (publicData.success) {
          setPublicTemplates(publicData.templates);
        }
      } catch (error) {
        // Public templates endpoint might not exist yet, ignore
        console.log('Public templates not available');
      }
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoadingTemplates(false);
    }
  }

  function handleTemplateSelect(templateId: string | null) {
    setSelectedTemplate(templateId);
    
    if (!templateId) {
      // Reset to defaults
      return;
    }

    // Find template
    const template = [...myTemplates, ...publicTemplates].find((t) => t.id === templateId);
    if (!template) return;

    // Apply template
    if (template.panelCount <= 3) {
      // Use simple story mode
      setStoryType('simple');
      setMode(template.panelCount === 1 ? '1panel' : '3panel');
    } else {
      // Use extended story mode
      setStoryType('extended');
      setNumPanelsExtended(template.panelCount);
    }
    setLayoutMode(template.layoutMode as LayoutMode);
    
    // Reset panels
    setPanelImages(Array(template.panelCount).fill(''));
    setPanelTexts(Array(template.panelCount).fill(''));
  }

  function getTemplateForPanel(index: number): { label: string; helpText: string } | null {
    if (!selectedTemplate) return null;
    const template = [...myTemplates, ...publicTemplates].find((t) => t.id === selectedTemplate);
    if (!template || index >= template.panelLabels.length) return null;
    return {
      label: template.panelLabels[index] || `Panel ${index + 1}`,
      helpText: template.panelHelpTexts[index] || '',
    };
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  function handleStoryTypeChange(newType: StoryType) {
    setStoryType(newType);
    if (newType === 'simple') {
      setMode('1panel');
      setPanelImages(['']);
      setPanelTexts(['']);
    } else {
      setNumPanelsExtended(4);
      setPanelImages(Array(4).fill(''));
      setPanelTexts(Array(4).fill(''));
    }
    setSimpleStory(null);
    setExtendedStory(null);
    setExportId(null);
  }

  function handleModeChange(newMode: StoryMode) {
    setMode(newMode);
    const numPanels = newMode === '1panel' ? 1 : 3;
    setPanelImages(Array(numPanels).fill(''));
    setPanelTexts(Array(numPanels).fill(''));
    setSimpleStory(null);
    setExtendedStory(null);
    setExportId(null);
  }

  function handleNumPanelsChange(count: number) {
    if (count < 4 || count > 8) return;
    setNumPanelsExtended(count);
    const currentCount = panelImages.length;
    if (count > currentCount) {
      // Add empty panels
      setPanelImages([...panelImages, ...Array(count - currentCount).fill('')]);
      setPanelTexts([...panelTexts, ...Array(count - currentCount).fill('')]);
    } else {
      // Remove panels
      setPanelImages(panelImages.slice(0, count));
      setPanelTexts(panelTexts.slice(0, count));
    }
    setExtendedStory(null);
    setExportId(null);
  }

  async function handleImageUpload(panelIndex: number, file: File) {
    setUploading(panelIndex);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/story/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const newImages = [...panelImages];
      newImages[panelIndex] = data.imageUrl;
      setPanelImages(newImages);
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
    }
  }

  function handleImageUrlChange(panelIndex: number, url: string) {
    const newImages = [...panelImages];
    newImages[panelIndex] = url;
    setPanelImages(newImages);
  }

  function handleTextChange(panelIndex: number, text: string) {
    const newTexts = [...panelTexts];
    newTexts[panelIndex] = text || null;
    setPanelTexts(newTexts);
  }

  function handleRemovePanel(panelIndex: number) {
    const newImages = [...panelImages];
    const newTexts = [...panelTexts];
    newImages[panelIndex] = '';
    newTexts[panelIndex] = null;
    setPanelImages(newImages);
    setPanelTexts(newTexts);
  }

  async function handleGenerate() {
    // Validate all panels have images
    const validPanels = panelImages.filter((url) => url.trim() !== '');
    if (validPanels.length === 0) {
      alert('Please provide at least one panel image');
      return;
    }

    if (storyType === 'simple') {
      if (mode === '1panel' && validPanels.length !== 1) {
        alert('1-panel mode requires exactly 1 image');
        return;
      }
      if (mode === '3panel' && validPanels.length !== 3) {
        alert('3-panel mode requires exactly 3 images');
        return;
      }
    } else {
      if (validPanels.length < 4 || validPanels.length > 8) {
        alert('Extended stories require 4-8 images');
        return;
      }
    }

    setGenerating(true);
    setSimpleStory(null);
    setExtendedStory(null);
    setExportId(null);

    try {
      if (storyType === 'simple') {
        const res = await apiFetch('/api/story/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            panelImages: validPanels,
            panelTexts: panelTexts.slice(0, validPanels.length),
            mode,
          }),
        });

        if ((res as any).ok && (res as any).data) {
          setSimpleStory((res as any).data.story);
          setExportId((res as any).data.exportId);
          setStoryId((res as any).data.storyId || null);
          setPublished(false);
        } else {
          throw new Error((res as any).error || 'Failed to generate story');
        }
      } else {
        const res = await apiFetch('/api/story/create-extended', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            panelImages: validPanels,
            panelTexts: panelTexts.slice(0, validPanels.length),
            layoutMode,
          }),
        });

        if ((res as any).ok && (res as any).data) {
          setExtendedStory((res as any).data.story);
          setExportId((res as any).data.exportId);
          setExportLayoutMode((res as any).data.layoutMode || 'grid');
          setStoryId((res as any).data.storyId || null);
          setPublished(false);
        } else {
          throw new Error((res as any).error || 'Failed to generate extended story');
        }
      }
    } catch (error) {
      console.error('Failed to generate story', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadStory() {
    if (simpleStory && exportId) {
      const panelsData = simpleStory.panels.map((panel) => ({
        imageUrl: panel.imageUrl,
        caption: panel.caption,
        vibeTag: panel.vibeTag,
        microStory: panel.microStory,
      }));
      const exportUrl = `/api/story/export?panels=${encodeURIComponent(JSON.stringify(panelsData))}`;
      window.open(exportUrl, '_blank');
    } else if (extendedStory && exportId) {
      const panelsData = extendedStory.panels.map((panel) => ({
        imageUrl: panel.imageUrl,
        caption: panel.caption,
        vibeTag: panel.vibeTag,
        microStory: panel.microStory,
        role: panel.role,
      }));
      const exportUrl = `/api/story/export?panels=${encodeURIComponent(JSON.stringify(panelsData))}&layoutMode=${exportLayoutMode}&title=${encodeURIComponent(extendedStory.title)}&logline=${encodeURIComponent(extendedStory.logline)}`;
      window.open(exportUrl, '_blank');
    }
  }

  async function handleSaveAudio() {
    if (!storyId) return;
    if (audioType === 'none') return;
    if (audioType === 'tag' && !selectedAudioTag) return;
    if (audioType === 'voice' && !audioFile) return;

    setSavingAudio(true);
    try {
      // For voice, upload file first (placeholder - would need upload endpoint)
      let audioUrl: string | null = null;
      if (audioType === 'voice' && audioFile) {
        // TODO: Upload audio file to storage
        // For now, use object URL (temporary)
        audioUrl = audioPreviewUrl || null;
        // In production, would upload to S3/CDN and get permanent URL
      }

      const res = await apiFetch('/api/story/audio/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          audioType: audioType === 'tag' ? 'tag' : 'voice',
          audioTagId: audioType === 'tag' ? selectedAudioTag : null,
          audioUrl: audioType === 'voice' ? audioUrl : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Audio saved successfully!');
      } else {
        alert(data.error || 'Failed to save audio');
      }
    } catch (error) {
      console.error('Failed to save audio', error);
      alert('Failed to save audio. Please try again.');
    } finally {
      setSavingAudio(false);
    }
  }

  async function handleClearAudio() {
    if (!storyId) return;

    setSavingAudio(true);
    try {
      const res = await apiFetch('/api/story/audio/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });

      const data = await res.json();
      if (data.success) {
        setAudioType('none');
        setSelectedAudioTag(null);
        setAudioFile(null);
        setAudioPreviewUrl(null);
        alert('Audio cleared');
      } else {
        alert(data.error || 'Failed to clear audio');
      }
    } catch (error) {
      console.error('Failed to clear audio', error);
      alert('Failed to clear audio. Please try again.');
    } finally {
      setSavingAudio(false);
    }
  }

  async function handlePublishStory() {
    if (!storyId) return;

    setPublishing(true);
    try {
      const res = await apiFetch('/api/story/drafts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          visibility: publishVisibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublished(true);
      } else {
        alert(data.error || 'Failed to publish story');
      }
    } catch (error) {
      console.error('Failed to publish story', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setPublishing(false);
    }
  }

  const numPanels = storyType === 'simple' 
    ? (mode === '1panel' ? 1 : 3)
    : numPanelsExtended;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Parel Story Generator</h1>
        <p className="text-gray-600">Create 1-3 panel or 4-8 panel stories with AI-generated captions</p>
      </div>

      {/* Template Selector */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-blue-900">
              <Icon name="file" className="w-4 h-4 inline mr-1" size="md" />
              Use Template (Optional):
            </label>
            <select
              value={selectedTemplate || ''}
              onChange={(e) => handleTemplateSelect(e.target.value || null)}
              className="w-full px-3 py-2 border rounded-md bg-bg text-text"
            >
              <option value="">None</option>
              {myTemplates.length > 0 && (
                <optgroup label="My Templates">
                  {myTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.panelCount} panels)
                    </option>
                  ))}
                </optgroup>
              )}
              {publicTemplates.length > 0 && (
                <optgroup label="Public Templates">
                  {publicTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.panelCount} panels)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {selectedTemplate && (
              <p className="text-xs text-blue-700 mt-2">
                Template applied: Panel count, layout, and labels will be set automatically
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story Type Toggle */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium mb-2">Story Type:</label>
            <div className="flex gap-2 mb-4">
              <Button
                variant={storyType === 'simple' ? 'default' : 'outline'}
                onClick={() => handleStoryTypeChange('simple')}
              >
                Simple Story (1-3 panels)
              </Button>
              <Button
                variant={storyType === 'extended' ? 'default' : 'outline'}
                onClick={() => handleStoryTypeChange('extended')}
              >
                Extended Story (4-8 panels)
              </Button>
            </div>

            {/* Simple Mode Selector */}
            {storyType === 'simple' && (
              <div>
                <label className="block text-sm font-medium mb-2">Story Mode:</label>
                <div className="flex gap-2">
                  <Button
                    variant={mode === '1panel' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('1panel')}
                  >
                    1 Panel
                  </Button>
                  <Button
                    variant={mode === '3panel' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('3panel')}
                  >
                    3 Panels
                  </Button>
                </div>
              </div>
            )}

            {/* Extended Mode Controls */}
            {storyType === 'extended' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Panels:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleNumPanelsChange(Math.max(4, numPanelsExtended - 1))}
                      disabled={numPanelsExtended <= 4}
                    >
                      -
                    </Button>
                    <span className="px-4 py-2 border rounded-md">{numPanelsExtended}</span>
                    <Button
                      variant="outline"
                      onClick={() => handleNumPanelsChange(Math.min(8, numPanelsExtended + 1))}
                      disabled={numPanelsExtended >= 8}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Layout Mode:</label>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Panel Inputs */}
      <div className="space-y-6 mb-6">
        {Array.from({ length: numPanels }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                {(() => {
                  const templateInfo = getTemplateForPanel(index);
                  return templateInfo ? templateInfo.label : `Panel ${index + 1}`;
                })()}
                {storyType === 'extended' && extendedStory?.panels[index]?.role && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({extendedStory.panels[index].role})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Template Help Text */}
                {(() => {
                  const templateInfo = getTemplateForPanel(index);
                  return templateInfo?.helpText ? (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      💡 {templateInfo.helpText}
                    </div>
                  ) : null;
                })()}
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image:</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Image URL"
                      value={panelImages[index] || ''}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <input
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={uploading === index}
                    >
                      {uploading === index ? (
                        <>
                          <Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icon name="image" className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    {panelImages[index] && (
                      <Button
                        variant="outline"
                        onClick={() => handleRemovePanel(index)}
                        size="sm"
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {panelImages[index] && (
                    <div className="mt-2">
                      <img
                        src={panelImages[index]}
                        alt={`Panel ${index + 1} preview`}
                        className="max-w-xs max-h-48 rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Optional Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Optional Text Context:</label>
                  <Input
                    type="text"
                    placeholder="Optional text description"
                    value={panelTexts[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
          {generating ? (
            <>
              <Icon name="spinner" className="w-5 h-5 mr-2 animate-spin" />
              Generating Story...
            </>
          ) : (
            'Generate Story'
          )}
        </Button>
      </div>

      {/* Simple Story Output */}
      {simpleStory && (
        <div className="space-y-6">
          {/* Throughline (for 3-panel) */}
          {simpleStory.throughline && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-purple-900">{simpleStory.throughline}</p>
              </CardContent>
            </Card>
          )}

          {/* Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simpleStory.panels.map((panel, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Image */}
                    <div>
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${index + 1}`}
                        className="w-full rounded-lg border"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <h3 className="font-semibold text-lg">{panel.caption}</h3>
                    </div>

                    {/* Vibe Tag */}
                    <div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {panel.vibeTag}
                      </span>
                    </div>

                    {/* Micro Story */}
                    <div>
                      <p className="text-sm text-gray-600">{panel.microStory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Download Button */}
          {exportId && (
            <div>
              <Button onClick={handleDownloadStory} variant="outline" className="w-full">
                <Icon name="download" className="w-4 h-4 mr-2" />
                Download Story Image
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Extended Story Output */}
      {extendedStory && (
        <div className="space-y-6">
          {/* Title and Logline */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2 text-purple-900">{extendedStory.title}</h2>
              <p className="text-lg text-purple-700">{extendedStory.logline}</p>
            </CardContent>
          </Card>

          {/* Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extendedStory.panels.map((panel, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Role Badge */}
                    {panel.role && (
                      <div>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium uppercase">
                          {panel.role}
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    <div>
                      <img
                        src={panel.imageUrl}
                        alt={`Panel ${index + 1}`}
                        className="w-full rounded-lg border"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <h3 className="font-semibold text-lg">{panel.caption}</h3>
                    </div>

                    {/* Vibe Tag */}
                    <div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {panel.vibeTag}
                      </span>
                    </div>

                    {/* Micro Story */}
                    <div>
                      <p className="text-sm text-gray-600">{panel.microStory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Download Button */}
          {exportId && (
            <div>
              <Button onClick={handleDownloadStory} variant="outline" className="w-full">
                <Icon name="download" className="w-4 h-4 mr-2" />
                Download Story Image
              </Button>
            </div>
          )}

          {/* Draft Banner */}
          {storyId && !published && (
            <Card className="bg-yellow-50 border-yellow-200 mb-4">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-900 mb-4">
                  <span className="font-medium">✓ Saved as draft</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePublishStory}
                    disabled={publishing}
                    className="flex-1"
                  >
                    {publishing ? (
                      <>
                        <Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Now'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/story/drafts')}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Panel */}
          {storyId && (
            <Card className="mb-4 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="volume" className="w-5 h-5" />
                  Add Audio (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green-900">
                    Audio Type:
                  </label>
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={audioType === 'tag' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAudioType('tag');
                        setAudioFile(null);
                        setAudioPreviewUrl(null);
                      }}
                    >
                      Sound Tag
                    </Button>
                    <Button
                      variant={audioType === 'voice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAudioType('voice');
                        setSelectedAudioTag(null);
                      }}
                    >
                      Voice Line
                    </Button>
                    <Button
                      variant={audioType === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAudioType('none');
                        setSelectedAudioTag(null);
                        setAudioFile(null);
                        setAudioPreviewUrl(null);
                      }}
                    >
                      None
                    </Button>
                  </div>
                </div>

                {audioType === 'tag' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-900">
                      Select Sound Tag:
                    </label>
                    <select
                      value={selectedAudioTag || ''}
                      onChange={(e) => setSelectedAudioTag(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md bg-bg text-text mb-2"
                    >
                      <option value="">Select a sound...</option>
                      {getAllAudioTags().map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.emoji} {tag.label}
                        </option>
                      ))}
                    </select>
                    {selectedAudioTag && (
                      <div className="flex items-center gap-2">
                        <audio
                          ref={audioPreviewRef}
                          src={getAudioTagById(selectedAudioTag)?.fileUrl}
                          controls
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                )}

                {audioType === 'voice' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-900">
                      Upload Voice (5-10 seconds):
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (max ~1MB for 10s audio)
                          if (file.size > 1024 * 1024) {
                            alert('Audio file too large. Max 1MB.');
                            return;
                          }
                          setAudioFile(file);
                          const url = URL.createObjectURL(file);
                          setAudioPreviewUrl(url);
                        }
                      }}
                      className="mb-2"
                    />
                    {audioPreviewUrl && (
                      <div className="flex items-center gap-2">
                        <audio src={audioPreviewUrl} controls className="h-8 flex-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioPreviewUrl(null);
                            if (audioPreviewRef.current) {
                              audioPreviewRef.current.pause();
                            }
                          }}
                        >
                          <Icon name="delete" className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveAudio}
                    disabled={savingAudio || audioType === 'none' || (audioType === 'tag' && !selectedAudioTag) || (audioType === 'voice' && !audioFile)}
                    size="sm"
                  >
                    {savingAudio ? (
                      <>
                        <Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Audio'
                    )}
                  </Button>
                  {storyId && (
                    <Button
                      variant="outline"
                      onClick={handleClearAudio}
                      disabled={savingAudio}
                      size="sm"
                    >
                      <Icon name="delete" className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publish Panel */}
          {storyId && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                {published ? (
                  <div className="flex items-center gap-2 text-blue-900">
                    <Icon name="check" className="w-5 h-5" />
                    <span className="font-medium">Published to Story Feed.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-blue-900">
                        Visibility:
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={publishVisibility === 'public' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('public')}
                        >
                          <Icon name="globe" className="w-4 h-4 mr-1" />
                          Public
                        </Button>
                        <Button
                          variant={publishVisibility === 'private' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('private')}
                        >
                          <Icon name="lock" className="w-4 h-4 mr-1" size="md" />
                          Private
                        </Button>
                        <Button
                          variant={publishVisibility === 'friends' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPublishVisibility('friends')}
                          disabled
                          title="Coming soon"
                        >
                          <Icon name="group" className="w-4 h-4 mr-1" />
                          Friends
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handlePublishStory}
                      disabled={publishing}
                      className="w-full"
                    >
                      {publishing ? (
                        <>
                          <Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish Story'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
