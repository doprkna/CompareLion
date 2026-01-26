/**
 * Localization Selector Component
 * v0.23.0 - Phase G: Language and Region Picker
 * 
 * Usage:
 * <LocalizationSelector />
 */

'use client';

import { useLocalization } from '@parel/core/hooks/useLocalization';
import { Globe, MapPin } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
];

const REGIONS = [
  { code: 'GLOBAL', name: 'Global' },
  { code: 'EU-CZ', name: 'Czech Republic' },
  { code: 'EU-PL', name: 'Poland' },
  { code: 'EU-SK', name: 'Slovakia' },
  { code: 'EU-DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'EU-GB', name: 'United Kingdom' },
];

interface LocalizationSelectorProps {
  showRegion?: boolean; // Optional: hide region selector
  compact?: boolean; // Compact inline layout
}

export default function LocalizationSelector({ 
  showRegion = true, 
  compact = false 
}: LocalizationSelectorProps) {
  const { lang, region, setLang, setRegion, isClient } = useLocalization();
  
  // Avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>
        
        {showRegion && (
          <>
            <MapPin className="h-4 w-4 text-gray-500 ml-2" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    );
  }
  
  // Full card layout
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="space-y-4">
        {/* Language selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">
              Language
            </label>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Questions will be shown in your preferred language when available
          </p>
        </div>
        
        {/* Region selector */}
        {showRegion && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-semibold text-gray-700">
                Region
              </label>
            </div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Regional questions will be filtered based on your location
            </p>
          </div>
        )}
        
        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This is stored locally on your device. 
            Questions like "Is Brno nice?" will only appear for Czech users.
          </p>
        </div>
      </div>
    </div>
  );
}

