"use client";
import { useState, useEffect } from 'react';
import { RoastBadge } from './RoastBadge';

interface RoastPreviewProps {
  level: number;
}

export function RoastPreview({ level }: RoastPreviewProps) {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const res = await fetch('/api/roast-presets');
        const json = await res.json();
        if (json.success && json.presets) {
          setPresets(json.presets);
        }
      } catch (e) {
        // Fallback to default presets if API fails
        console.error('Failed to load presets', e);
      } finally {
        setLoading(false);
      }
    };
    loadPresets();
  }, []);

  const currentPreset = presets.find((p) => p.level === level);

  if (loading || !currentPreset) {
    return (
      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <div className="text-sm text-gray-500">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <RoastBadge level={level} compact={false} />
        <span className="text-sm text-gray-600">{currentPreset.description}</span>
      </div>

      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2">Preview Examples:</div>
        <div className="space-y-2">
          {currentPreset.examples.slice(0, 3).map((example: string, idx: number) => (
            <div key={idx} className="text-sm text-gray-700 italic">
              "{example}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

