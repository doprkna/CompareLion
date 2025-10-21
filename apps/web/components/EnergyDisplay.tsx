'use client';

/**
 * EnergyDisplay Component
 * 
 * Shows user's current hearts with regeneration timer.
 * Displays in navbar.
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Heart } from "lucide-react";
import { formatRegenTime } from "@/lib/energy";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnergyStatus {
  hearts: number;
  maxHearts: number;
  nextRegenAt: string | null;
  minutesUntilRegen: number;
}

export default function EnergyDisplay() {
  const [energy, setEnergy] = useState<EnergyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnergy();
    
    // Refresh every minute
    const interval = setInterval(loadEnergy, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadEnergy() {
    const res = await apiFetch("/api/quiz/today");
    if ((res as any).ok && (res as any).data?.energy) {
      setEnergy((res as any).data.energy);
    }
    setLoading(false);
  }

  if (loading || !energy) {
    return null;
  }

  const filledHearts = energy.hearts;
  const emptyHearts = energy.maxHearts - energy.hearts;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            {/* Filled Hearts */}
            {Array.from({ length: filledHearts }).map((_, i) => (
              <Heart
                key={`filled-${i}`}
                className="h-4 w-4 fill-red-500 text-red-500"
              />
            ))}
            
            {/* Empty Hearts */}
            {Array.from({ length: emptyHearts }).map((_, i) => (
              <Heart
                key={`empty-${i}`}
                className="h-4 w-4 text-zinc-600"
              />
            ))}
            
            {/* Count */}
            <span className="text-sm font-medium text-text ml-1">
              {energy.hearts}/{energy.maxHearts}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold mb-1">Energy Status</div>
            {energy.hearts < energy.maxHearts ? (
              <>
                <div className="text-muted">
                  Next heart in: {formatRegenTime(energy.minutesUntilRegen)}
                </div>
                <div className="text-xs text-subtle mt-1">
                  Hearts regenerate 1 per hour
                </div>
              </>
            ) : (
              <div className="text-green-500">Full energy!</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}











