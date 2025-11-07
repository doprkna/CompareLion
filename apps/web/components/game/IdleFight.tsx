"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DamageNumber } from "./DamageNumber";
import { useCombatPreferences } from "@/hooks/useCombatPreferences";
import { useRewardToast } from "@/hooks/useRewardToast";
import { RewardToastContainer } from "@/components/ui/RewardToast";
import { useSfx } from "@/hooks/useSfx"; // v0.26.13
import { AmbientManager } from "@/components/AmbientManager"; // v0.26.14

interface CombatSession {
  id: string;
  heroHp: number;
  heroMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyType: string;
  xpGained: number;
  goldGained: number;
  kills: number;
  currentStreak: number;
}

interface CombatLogEntry {
  type: string;
  message: string;
  damage?: number;
  isCrit?: boolean;
}

interface CombatResult {
  session: CombatSession;
  combatLog: CombatLogEntry[];
  rewards?: {
    xp: number;
    gold: number;
    multiplier?: number; // v0.26.1 - reward multiplier for display
  };
  levelUp?: {
    newLevel: number;
    oldLevel: number;
  };
  gameOver?: boolean;
  state?: 'resting' | 'active';
}

interface DamagePopup {
  id: number;
  damage: number;
  isCrit: boolean;
  x: number;
  y: number;
}

export default function IdleFight() {
  const { preferences } = useCombatPreferences();
  const { toasts, pushToast, dismissToast } = useRewardToast();
  const { play, vibrate } = useSfx(preferences.soundEnabled, preferences.hapticsEnabled); // v0.26.13
  const [session, setSession] = useState<CombatSession | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [popupIdCounter, setPopupIdCounter] = useState(0);
  const [critShakeKey, setCritShakeKey] = useState(0);
  const [critFlashKey, setCritFlashKey] = useState(0);
  const lastCritTimeRef = useRef<number>(0);
  const critTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation triggers (v0.26.12)
  const [attackTrigger, setAttackTrigger] = useState(0);
  const [enemyHitTrigger, setEnemyHitTrigger] = useState(0);
  const [enemyHitFlash, setEnemyHitFlash] = useState(false);
  const [bossSpawnKey, setBossSpawnKey] = useState(0);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [critGlowKey, setCritGlowKey] = useState(0);
  const lastHeroHpRef = useRef<number>(0);
  const lastEnemyHpRef = useRef<number>(0);

  const append = (msg: string) =>
    setLog((l) => [...l.slice(-20), `${new Date().toLocaleTimeString()}  ${msg}`]);

  const showDamageNumber = (damage: number, isCrit: boolean) => {
    if (!preferences.showDamageNumbers) return;
    
    const id = popupIdCounter;
    setPopupIdCounter(id + 1);
    
    // Random position near center of combat area
    const x = 150 + Math.random() * 100;
    const y = 80 + Math.random() * 40;
    
    setDamagePopups((prev) => [...prev, { id, damage, isCrit, x, y }]);
  };

  const removeDamagePopup = (id: number) => {
    setDamagePopups((prev) => prev.filter((p) => p.id !== id));
  };

  // Trigger crit VFX (shake + flash + glow) (v0.26.12)
  const triggerCritVFX = () => {
    if (!preferences.screenShakeOnCrit) return;
    
    // Cooldown: ignore repeated triggers within 100ms
    const now = Date.now();
    if (now - lastCritTimeRef.current < 100) return;
    lastCritTimeRef.current = now;
    
    // Clear any existing timeouts
    if (critTimeoutRef.current) {
      clearTimeout(critTimeoutRef.current);
    }
    
    // Trigger animations by updating keys (forces re-render for animation retrigger)
    setCritShakeKey((prev) => prev + 1);
    setCritFlashKey((prev) => prev + 1);
    setCritGlowKey((prev) => prev + 1);
    
    // Clear shake class and flash overlay after animations complete to allow retrigger
    critTimeoutRef.current = setTimeout(() => {
      setCritShakeKey(0);
      setCritFlashKey(0);
      setCritGlowKey(0);
      critTimeoutRef.current = null;
    }, 400); // Wait for longest animation to complete
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (critTimeoutRef.current) {
        clearTimeout(critTimeoutRef.current);
      }
    };
  }, []);

  // Load initial combat state
  useEffect(() => {
    loadCombatState();
  }, []);

  // Auto-poll for healing when resting
  useEffect(() => {
    if (!isResting || !session) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/arena/fight?action=getState');
        const data: CombatResult & { success: boolean; error?: string } = await res.json();
        
        if (data.success && data.session) {
          setSession(data.session);
          setIsResting(data.state === 'resting' || data.session.heroHp <= 0);
          
          if (data.combatLog && data.combatLog.length > 0) {
            data.combatLog.forEach((entry: CombatLogEntry) => {
              append(entry.message);
            });
          }
        }
      } catch (err) {
        console.error('[IdleFight] Rest poll error:', err);
      }
    }, 1000); // Poll every second for healing

    return () => clearInterval(pollInterval);
  }, [isResting, session]);

  // Play rest fire sound on first rest (v0.26.13)
  const restSoundPlayedRef = useRef(false);
  useEffect(() => {
    if ((isResting || (session && session.heroHp <= 0)) && !restSoundPlayedRef.current) {
      play('rest_fire', 0.2);
      vibrate([30]);
      restSoundPlayedRef.current = true;
    }
    if (!isResting && session && session.heroHp > 0) {
      restSoundPlayedRef.current = false; // Reset for next rest
    }
  }, [isResting, session?.heroHp, play, vibrate]);

  const loadCombatState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/arena/fight');
      const data = await res.json();

      if (data.success && data.session) {
        setSession(data.session);
        if (data.combatLog && data.combatLog.length > 0) {
          data.combatLog.forEach((entry: CombatLogEntry) => append(entry.message));
        }
      } else {
        setError(data.error || 'Failed to load combat state');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('[IdleFight] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: 'attack' | 'skip' | 'forfeit') => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/arena/fight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data: CombatResult & { success: boolean; error?: string } = await res.json();

      if (data.success && data.session) {
        setSession(data.session);
        setGameOver(data.gameOver || false);
        setIsResting(data.state === 'resting' || data.session.heroHp <= 0);

        // Append combat log and show damage numbers
        if (data.combatLog && data.combatLog.length > 0) {
          data.combatLog.forEach((entry: CombatLogEntry) => {
            append(entry.message);
            
            // Trigger animations based on entry type (v0.26.12)
            if (preferences.showAnimations) {
              if (entry.type === 'attack') {
                setAttackTrigger((prev) => prev + 1);
                // Attack sound (v0.26.13)
                play('attack', 0.3);
              } else if (entry.type === 'enemyHit') {
                setEnemyHitTrigger((prev) => prev + 1);
                // Red flash overlay on enemy hit
                setEnemyHitFlash(true);
                setTimeout(() => setEnemyHitFlash(false), 200);
              } else if (entry.type === 'respawn' && entry.message.includes('👑')) {
                // Boss spawn animation
                setBossSpawnKey((prev) => prev + 1);
                setBossDefeated(false);
                // Boss spawn sound (v0.26.13)
                play('boss_spawn', 0.5);
                vibrate([50, 30, 50]);
              } else if (entry.type === 'kill' && session?.enemyName?.startsWith('👑')) {
                // Boss defeat animation
                setBossDefeated(true);
              }
            }
            
            // Show damage number if attack entry has damage
            if (entry.damage && (entry.type === 'attack' || entry.type === 'enemyHit')) {
              const isCrit = entry.isCrit || false;
              showDamageNumber(entry.damage, isCrit);
              // Trigger crit VFX and sound for hero crits (attack type only)
              if (isCrit && entry.type === 'attack') {
                triggerCritVFX();
                // Crit sound and haptic (v0.26.13)
                play('crit', 0.5);
                vibrate([20, 30, 20]);
              }
            }
            
            // Heal sound feedback (v0.26.13)
            if (entry.type === 'heal') {
              play('heal', 0.3);
            }
            
            // Rest start sound (v0.26.13)
            if (entry.type === 'rest') {
              play('rest_fire', 0.2);
              vibrate([30]);
            }
          });
        }
        
        // Track HP changes for HP bar animations (v0.26.12)
        if (data.session) {
          lastHeroHpRef.current = session?.heroHp || data.session.heroHp;
          lastEnemyHpRef.current = session?.enemyHp || data.session.enemyHp;
        }

        // Show rewards toast
        if (data.rewards) {
          // Check if this was a boss kill (check previous session or combat log)
          const wasBossKill = 
            (session && (session.enemyName.startsWith('👑') || session.enemyType === 'boss')) ||
            (data.combatLog && data.combatLog.some(entry => entry.message.includes('BOSS KILL')));
          
          // Include multiplier text if > 1.0 (v0.26.1)
          const multiplier = data.rewards.multiplier || 1.0;
          const multiplierText = multiplier > 1.0 ? ` (x${multiplier.toFixed(2)})` : '';
          
          if (wasBossKill) {
            // Boss kill gets special toast
            pushToast({
              type: 'boss',
              xp: data.rewards.xp,
              gold: data.rewards.gold,
              message: `🏆 Boss defeated! +${data.rewards.xp} XP, +${data.rewards.gold} gold${multiplierText}`,
            });
          } else {
            // Regular rewards
            if (data.rewards.xp > 0) {
              pushToast({
                type: 'xp',
                amount: data.rewards.xp,
                message: `💫 +${data.rewards.xp} XP${multiplierText}`,
              });
            }
            if (data.rewards.gold > 0) {
              pushToast({
                type: 'gold',
                amount: data.rewards.gold,
                message: `🪙 +${data.rewards.gold} gold${multiplierText}`,
              });
            }
          }
          
          // Also append to log (backup)
          append(`💰 Rewards flushed: +${data.rewards.xp} XP, +${data.rewards.gold} gold total!`);
        }

        // Show level up
        if (data.levelUp) {
          append(`🔼 Level Up! You are now Level ${data.levelUp.newLevel}!`);
          pushToast({
            type: 'achievement',
            message: `🔼 Level Up! You are now Level ${data.levelUp.newLevel}!`,
          });
          // Level up sound and haptic (v0.26.13)
          play('level_up', 0.6);
          vibrate([30, 50, 30]);
        }
        
        // Show item drop toast (v0.26.9 - using 'item' type)
        if (data.rewards?.droppedItem) {
          const item = data.rewards.droppedItem;
          pushToast({
            type: 'item',
            message: `🎁 Found ${item.name} (+${item.power} Power)!`,
          });
        }
        
        // Show crit toast if crit occurred (v0.26.9)
        if (data.combatLog) {
          const critEntry = data.combatLog.find((entry: CombatLogEntry) => entry.isCrit);
          if (critEntry) {
            pushToast({
              type: 'crit',
              message: '💥 Critical hit!',
            });
          }
        }
      } else {
        setError(data.error || 'Action failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('[IdleFight] Action error:', err);
    } finally {
      setLoading(false);
    }
  };

  const attack = () => performAction('attack');
  const skip = () => performAction('skip');
  const forfeit = () => {
    if (confirm('Forfeit? You will lose current streak but heal to full HP.')) {
      performAction('forfeit');
      setGameOver(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-black/60 text-white rounded-2xl shadow-md w-full max-w-md mx-auto mt-4">
        <div className="text-center py-8">
          {loading ? '⏳ Loading combat...' : error || '❌ Failed to load'}
        </div>
      </div>
    );
  }

  // Rest UI - replaces game over (v0.26.12 - with campfire flicker)
  if (isResting || (session && session.heroHp <= 0)) {
    return (
      <>
        <AmbientManager mode="rest" /> {/* v0.26.14 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-br from-amber-900/70 to-orange-900/50 text-amber-100 rounded-2xl shadow-md w-full max-w-md mx-auto mt-4 relative overflow-hidden"
        >
        {/* Warm overlay gradient during rest (v0.26.12) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5 pointer-events-none"
          animate={preferences.showAnimations ? {
            opacity: [0.3, 0.5, 0.3]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="text-center py-6 relative z-10">
          {/* Campfire flicker animation (v0.26.12) */}
          <motion.div
            className="text-4xl mb-3"
            animate={preferences.showAnimations ? {
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🔥
          </motion.div>
          <h3 className="text-lg font-bold mb-2">Resting by the Fire</h3>
          <p className="text-sm opacity-80 mb-4">
            Your thoughts heal faster than your wounds.
          </p>
          <p className="text-xs opacity-70 italic">
            "You rest by the fire. Shadows fade, but tomorrow waits."
          </p>
          <div className="mt-4 text-sm opacity-90">
            Hero HP: {session.heroHp}/{session.heroMaxHp}
          </div>
          <div className="mt-2 text-xs opacity-70">
            Auto-healing... (+5 HP/sec)
          </div>
          
          {/* Show ready message when fully healed */}
          {session.heroHp >= session.heroMaxHp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-amber-300 font-semibold"
            >
              🪶 You feel ready again.
            </motion.div>
          )}
        </div>
      </motion.div>
      </>
    );
  }

  return (
    <>
      <AmbientManager mode="combat" /> {/* v0.26.14 */}
      <div 
        className={`p-4 bg-black/60 text-white rounded-2xl shadow-md w-full max-w-md mx-auto mt-4 relative combat-area ${critShakeKey > 0 ? 'animate-crit-shake' : ''}`}
      >
      {/* Crit Flash Overlay with Scale-Up and Glow (v0.26.12) */}
      {critFlashKey > 0 && preferences.showAnimations && (
        <motion.div
          key={`crit-flash-${critFlashKey}`}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 0.3, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
            boxShadow: '0 0 15px rgba(251, 146, 60, 0.6)',
          }}
        />
      )}

      {/* Damage Numbers */}
      {damagePopups.map((popup) => (
        <DamageNumber
          key={popup.id}
          damage={popup.damage}
          isCrit={popup.isCrit}
          x={popup.x}
          y={popup.y}
          onComplete={() => removeDamagePopup(popup.id)}
        />
      ))}

      {/* Red flash overlay on enemy hit (v0.26.12) */}
      <AnimatePresence>
        {enemyHitFlash && preferences.showAnimations && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-red-500/30 rounded-2xl pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Enemy Name Header with Boss Spawn Animation (v0.26.12) */}
      <motion.div
        key={bossSpawnKey}
        initial={preferences.showAnimations && bossSpawnKey > 0 ? { opacity: 0, y: -20 } : false}
        animate={preferences.showAnimations && bossSpawnKey > 0 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center text-sm font-bold mb-2 text-purple-300 relative"
      >
        {session.enemyName.startsWith('👑') && preferences.showAnimations && (
          <motion.span
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"
          >
            👑
          </motion.span>
        )}
        ⚔️ vs {session.enemyName}
      </motion.div>

      {/* HP Bars with Smooth Animations (v0.26.12) */}
      <div className="flex flex-col gap-2 mb-2">
        {/* Hero HP */}
        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span>🧍 Hero</span>
            <span>{session.heroHp}/{session.heroMaxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full ${
                session.heroHp < lastHeroHpRef.current 
                  ? 'bg-red-500 border-2 border-red-600' 
                  : session.heroHp > lastHeroHpRef.current 
                  ? 'bg-green-500 border-2 border-green-400' 
                  : 'bg-green-600'
              } rounded-full`}
              initial={false}
              animate={{
                width: `${(session.heroHp / session.heroMaxHp) * 100}%`
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Enemy HP */}
        <div className="text-xs">
          <div className="flex justify-between mb-1">
            <span>👤 Enemy</span>
            <span>{session.enemyHp}/{session.enemyMaxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-red-600 rounded-full"
              initial={false}
              animate={{
                width: `${(session.enemyHp / session.enemyMaxHp) * 100}%`
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            {/* Boss defeat animation (v0.26.12) */}
            {bossDefeated && preferences.showAnimations && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs mb-3 opacity-70">
        <div>💀 Kills: {session.kills}</div>
        <div>🔥 Streak: {session.currentStreak}</div>
      </div>

      {/* Combat Area with Attack/Enemy Hit Animations (v0.26.12) */}
      <div className="relative mb-3 min-h-[60px] flex items-center justify-center">
        {/* Hero Sprite (animated on attack, crit glow on crit) */}
        <motion.div
          key={attackTrigger}
          animate={preferences.showAnimations && attackTrigger > 0 ? {
            x: [0, -10, 10, 0],
          } : {}}
          transition={{ duration: 0.25 }}
          className={`text-3xl ${
            critGlowKey > 0 && preferences.showAnimations 
              ? 'drop-shadow-[0_0_15px_orange]' 
              : ''
          }`}
        >
          🧍
        </motion.div>

        <span className="mx-4 text-xl opacity-50">⚔️</span>

        {/* Enemy Sprite (animated on hit) */}
        <motion.div
          key={enemyHitTrigger}
          animate={preferences.showAnimations && enemyHitTrigger > 0 ? {
            x: [0, 10, -10, 0],
          } : {}}
          transition={{ duration: 0.25 }}
          className={`text-3xl ${session.enemyName.startsWith('👑') ? 'text-yellow-400' : ''}`}
        >
          {session.enemyName.startsWith('👑') ? '👑' : '👤'}
        </motion.div>
      </div>

      {/* Boss Defeated Message (v0.26.12) */}
      <AnimatePresence>
        {bossDefeated && preferences.showAnimations && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 font-bold text-lg"
          >
            🏆 BOSS DEFEATED!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={attack}
          disabled={loading || session.enemyHp === 0 || isResting}
          className="flex-1 px-3 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳' : '⚔️'} Attack
        </button>
        <button
          onClick={skip}
          disabled={loading || session.enemyHp === 0 || isResting}
          className="flex-1 px-3 py-2 bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳' : '💢'} Skip
        </button>
      </div>

      {/* Combat Log */}
      <div className="text-xs max-h-40 overflow-y-auto bg-black/40 p-2 rounded font-mono leading-tight">
        {log.length === 0 ? (
          <div className="text-center opacity-50">Start attacking!</div>
        ) : (
          log
            .slice()
            .reverse()
            .map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>

      {/* Session XP/Gold (pending flush) */}
      <div className="flex justify-between text-xs mt-2 opacity-80">
        <div>⭐ Pending XP: {session.xpGained}</div>
        <div>💰 Pending Gold: {session.goldGained}</div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 text-xs text-red-400 text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Reward Toasts */}
      <RewardToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
    </>
  );
}
