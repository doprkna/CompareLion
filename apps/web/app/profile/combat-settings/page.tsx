"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Swords, Home } from "lucide-react";
import { useCombatPreferences } from "@/hooks/useCombatPreferences";
import Link from "next/link";

export default function CombatSettingsPage() {
  const { preferences, toggleDamageNumbers, toggleScreenShake, toggleSoundEffects, toggleAnimations, toggleSound, toggleHaptics, toggleAmbient } = useCombatPreferences();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="text-accent hover:underline mb-2 inline-block">
          ← Back to Profile
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Swords className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold text-text">Combat & RPG Settings</h1>
        </div>
        <p className="text-subtle">Customize your battle experience</p>
      </div>

      {/* Visual Preferences Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚔️ Visual Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Damage Numbers Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  💥 Show Damage Numbers
                </h3>
                <p className="text-sm text-subtle">
                  Display floating damage numbers when dealing or taking damage in combat.
                </p>
              </div>
              <Switch
                checked={preferences.showDamageNumbers}
                onCheckedChange={toggleDamageNumbers}
                className="mt-1"
              />
            </div>

            {/* Screen Shake Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  📳 Screen Shake on Crit
                </h3>
                <p className="text-sm text-subtle">
                  Adds a little punch to your critical hits.
                </p>
              </div>
              <Switch
                checked={preferences.screenShakeOnCrit}
                onCheckedChange={toggleScreenShake}
                className="mt-1"
              />
            </div>

            {/* Battle Animations Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  ⚙️ Enable Battle Animations
                </h3>
                <p className="text-sm text-subtle">
                  Show animations for attacks, hits, crits, and boss events. Disable for better performance on slower devices.
                </p>
              </div>
              <Switch
                checked={preferences.showAnimations}
                onCheckedChange={toggleAnimations}
                className="mt-1"
              />
            </div>

            {/* Sound Enabled Toggle (v0.26.13) */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  🎧 Sound Effects
                </h3>
                <p className="text-sm text-subtle">
                  Play sound effects for attacks, crits, heals, level-ups, crafts, and purchases. Volume capped at 40% for comfort.
                </p>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={toggleSound}
                className="mt-1"
              />
            </div>

            {/* Haptic Feedback Toggle (v0.26.13) */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  📳 Haptic Feedback
                </h3>
                <p className="text-sm text-subtle">
                  Use device vibration for tactile feedback on crits, purchases, and level-ups. Only available on mobile devices.
                </p>
              </div>
              <Switch
                checked={preferences.hapticsEnabled}
                onCheckedChange={toggleHaptics}
                className="mt-1"
                disabled={typeof window === 'undefined' || !('vibrate' in navigator)}
              />
            </div>

            {/* Ambient Background Toggle (v0.26.14) */}
            <div className="flex items-start justify-between gap-4 p-4 bg-bg border border-border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-text mb-1">
                  🌌 Animated Background Ambience
                </h3>
                <p className="text-sm text-subtle">
                  Dynamic background gradients, particles, and ambient audio loops for combat, rest, shop, and profile screens.
                </p>
              </div>
              <Switch
                checked={preferences.ambientEnabled}
                onCheckedChange={toggleAmbient}
                className="mt-1"
              />
            </div>
            
            {/* Legacy Sound Effects Toggle (hidden/disabled) */}
            <div className="hidden">
              <Switch
                checked={preferences.soundEffects}
                onCheckedChange={toggleSoundEffects}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-card border border-border text-text">
        <CardContent className="p-4">
          <p className="text-sm text-subtle text-center">
            💡 More combat settings coming soon: difficulty levels, auto-combat, and custom battle themes!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


