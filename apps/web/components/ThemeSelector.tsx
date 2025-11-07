'use client';

/**
 * ThemeSelector Component
 * 
 * Profile theme selector with animated gradient previews.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, Sparkles, ShoppingCart } from "lucide-react";
import { PROFILE_THEMES, ProfileTheme, getThemeById } from "@/lib/profileThemes";
import { toast } from "sonner";

interface ThemeSelectorProps {
  currentThemeId?: string;
  ownedThemeIds?: string[];
  userLevel?: number;
  onThemeChange?: (themeId: string) => void;
}

export default function ThemeSelector({
  currentThemeId = "default",
  ownedThemeIds = ["default"],
  userLevel = 1,
  onThemeChange,
}: ThemeSelectorProps) {
  const [activeTheme, setActiveTheme] = useState(currentThemeId);
  const [ownedThemes, setOwnedThemes] = useState(ownedThemeIds);
  const [loading, setLoading] = useState<string | null>(null);

  const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
  const sortedThemes = [...PROFILE_THEMES].sort(
    (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]
  );

  async function activateTheme(themeId: string) {
    if (!ownedThemes.includes(themeId)) {
      toast.error("Theme not unlocked");
      return;
    }

    setLoading(themeId);
    // TODO: API call to activate theme
    // const res = await apiFetch("/api/profile/theme", {
    //   method: "POST",
    //   body: JSON.stringify({ themeId }),
    // });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setActiveTheme(themeId);
    if (onThemeChange) onThemeChange(themeId);
    toast.success(`Theme activated: ${getThemeById(themeId)?.name}`);
    setLoading(null);
  }

  async function purchaseTheme(theme: ProfileTheme) {
    if (!theme.price) return;

    setLoading(theme.id);
    // TODO: API call to purchase theme
    // const res = await apiFetch("/api/shop/purchase", {
    //   method: "POST",
    //   body: JSON.stringify({ itemType: "theme", itemId: theme.id }),
    // });

    // Simulate purchase
    await new Promise((resolve) => setTimeout(resolve, 800));

    setOwnedThemes([...ownedThemes, theme.id]);
    toast.success(`Theme purchased: ${theme.name} 🎉`);
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-text mb-1">Profile Themes</h2>
        <p className="text-subtle text-xs">
          Customize your profile with dynamic gradients and effects
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sortedThemes.map((theme) => {
          const isOwned = ownedThemes.includes(theme.id);
          const isActive = activeTheme === theme.id;
          const isLoading = loading === theme.id;

          return (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`overflow-hidden border transition-all ${
                  isActive
                    ? "border-accent shadow-md shadow-accent/30"
                    : "border-border hover:border-accent/50"
                }`}
              >
                {/* Animated Gradient Preview */}
                <div
                  className="relative h-20 transition-all duration-300"
                  style={{
                    background: theme.gradient.via
                      ? `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.via}, ${theme.gradient.to})`
                      : `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`,
                  }}
                >
                  {/* Animated Overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{
                      background: [
                        `radial-gradient(circle at 0% 0%, ${theme.particleColor}, transparent)`,
                        `radial-gradient(circle at 100% 100%, ${theme.particleColor}, transparent)`,
                        `radial-gradient(circle at 0% 0%, ${theme.particleColor}, transparent)`,
                      ],
                    }}
                    transition={{
                      duration: parseInt(theme.animationDuration || "5s"),
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Theme Emoji */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl drop-shadow-2xl">{theme.emoji}</span>
                  </div>

                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-1 right-1 bg-accent text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                      <Check className="h-2 w-2" />
                      Active
                    </div>
                  )}

                  {/* Rarity Badge */}
                  <div className="absolute bottom-1 left-1">
                    <div
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        theme.rarity === "legendary"
                          ? "bg-yellow-500 text-black"
                          : theme.rarity === "epic"
                          ? "bg-purple-500 text-white"
                          : theme.rarity === "rare"
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-500 text-white"
                      }`}
                    >
                      {theme.rarity}
                    </div>
                  </div>
                </div>

                {/* Theme Info */}
                <CardContent className="p-2 space-y-1.5">
                  <div>
                    <h3 className="font-bold text-text text-sm">{theme.name}</h3>
                    <p className="text-[10px] text-subtle mt-0.5 line-clamp-2">{theme.description}</p>
                  </div>

                  {/* Unlock Method */}
                  <div className="text-[10px] text-muted">
                    {theme.price && <span className="text-yellow-500">💰 {theme.price}g</span>}
                    {!theme.price && <span className="line-clamp-1">{theme.unlockMethod}</span>}
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {isOwned ? (
                      <Button
                        onClick={() => activateTheme(theme.id)}
                        disabled={isActive || isLoading}
                        className="w-full h-7 text-[11px] px-2"
                      >
                        {isLoading ? (
                          "..."
                        ) : isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    ) : theme.price ? (
                      <Button
                        onClick={() => purchaseTheme(theme)}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-7 text-[11px] px-2"
                      >
                        {isLoading ? (
                          "..."
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {theme.price}g
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className="w-full h-7 text-[11px] px-2">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
