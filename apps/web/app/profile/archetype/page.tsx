"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ARCHETYPES } from '@/lib/config/archetypeConfig';
import { useRewardToast } from '@/hooks/useRewardToast';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useFusionOptions, useArchetypeFusion } from '@/hooks/useArchetypeFusion';
import { FusionPreviewCard } from '@/components/fusion/FusionPreviewCard';

export default function ArchetypeSelectionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { pushToast } = useRewardToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: fusionData, loading: fusionLoading, error: fusionError, reload: reloadFusion } = useFusionOptions();
  const { fuse, loading: fusing, error: fuseError } = useArchetypeFusion();
  const onFuse = async (a: string, b: string) => { const res = await fuse(a, b); if (res) reloadFusion(); };

  const handleSelect = async (archetypeKey: string) => {
    if (loading) return;
    
    setSelected(archetypeKey);
    setLoading(true);

    try {
      const res = await fetch('/api/progression/select-archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetypeKey }),
      });

      const data = await res.json();

      if (data.success) {
        pushToast({
          type: 'achievement',
          message: `🧠 ${ARCHETYPES[archetypeKey as keyof typeof ARCHETYPES]?.name || archetypeKey} archetype selected!`,
        });
        
        // Redirect to profile after selection
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        pushToast({
          type: 'achievement',
          message: `⛔ ${data.error || 'Selection failed'}`,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('[ArchetypeSelection] Error:', error);
      pushToast({
        type: 'achievement',
        message: '⛔ Network error - selection failed!',
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="text-accent hover:underline mb-2 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold text-text">Choose Your Archetype</h1>
        </div>
        <p className="text-subtle">Select your character class and define your playstyle</p>
      </div>

      {/* Archetype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(ARCHETYPES).map((archetype) => {
          const isSelected = selected === archetype.key;
          const isLoading = loading && isSelected;

          return (
            <Card
              key={archetype.key}
              className={`border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-accent bg-accent/10 ring-2 ring-accent'
                  : 'border-border bg-card hover:bg-bg hover:border-accent/50'
              } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
              onClick={() => !loading && handleSelect(archetype.key)}
            >
              <div className="p-6">
                {/* Emoji & Name */}
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{archetype.emoji}</div>
                  <h2 className="text-2xl font-bold text-text mb-2">{archetype.name}</h2>
                  <p className="text-sm text-subtle">{archetype.description}</p>
                </div>

                {/* Base Stats */}
                <div className="mb-4 p-3 bg-bg/50 rounded-lg">
                  <div className="text-xs font-semibold uppercase text-subtle mb-2">Base Stats</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-subtle">STR</span>
                      <span className="text-text font-bold">{archetype.baseStats.str}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle">INT</span>
                      <span className="text-text font-bold">{archetype.baseStats.int}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle">CHA</span>
                      <span className="text-text font-bold">{archetype.baseStats.cha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle">LUCK</span>
                      <span className="text-text font-bold">{archetype.baseStats.luck}</span>
                    </div>
                  </div>
                </div>

                {/* Bonuses */}
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase text-subtle mb-2">Bonuses</div>
                  <div className="space-y-1 text-xs">
                    {archetype.bonuses.combat?.damageMult && (
                      <div className="text-green-400">
                        ⚔️ {((archetype.bonuses.combat.damageMult - 1) * 100).toFixed(0)}% damage
                      </div>
                    )}
                    {archetype.bonuses.combat?.critChance && (
                      <div className="text-yellow-400">
                        💥 +{((archetype.bonuses.combat.critChance) * 100).toFixed(0)}% crit chance
                      </div>
                    )}
                    {archetype.bonuses.combat?.hpMult && (
                      <div className="text-red-400">
                        ❤️ {((archetype.bonuses.combat.hpMult - 1) * 100).toFixed(0)}% HP
                      </div>
                    )}
                    {archetype.bonuses.xp?.generalBonus && (
                      <div className="text-blue-400">
                        💫 +{((archetype.bonuses.xp.generalBonus) * 100).toFixed(0)}% XP
                      </div>
                    )}
                    {archetype.bonuses.social?.shopDiscount && (
                      <div className="text-purple-400">
                        💰 {((archetype.bonuses.social.shopDiscount) * 100).toFixed(0)}% shop discount
                      </div>
                    )}
                    {archetype.bonuses.passive?.regen && (
                      <div className="text-cyan-400">
                        🧘 +{archetype.bonuses.passive.regen} HP regen
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Button */}
                <Button
                  onClick={() => handleSelect(archetype.key)}
                  disabled={loading}
                  className={`w-full ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-card border border-border hover:bg-bg'
                  }`}
                >
                  {isLoading ? '⏳ Selecting...' : isSelected ? '✓ Selected' : 'Select Archetype'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="mt-6 bg-card border border-border">
        <div className="p-4 text-center text-sm text-subtle">
          💡 Your archetype defines your base stats and playstyle. You can reroll later for a small gold fee.
        </div>
      </Card>

      {/* Fusion Section */}
      <div className="mt-6 border rounded p-4">
        <h3 className="font-semibold mb-2">Archetype Fusion</h3>
        {fusionError && <div className="text-red-600 text-sm">{fusionError}</div>}
        {fusionLoading ? <div>Loading…</div> : (
          <div className="flex flex-col gap-2">
            {(fusionData?.options || []).map((opt: any) => (
              <FusionPreviewCard key={opt.key} base={fusionData?.base} option={opt} onFuse={onFuse} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

