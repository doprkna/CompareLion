# PareL v0.5.19 — Dual Reward Modal System

## ✅ Implementation Complete

Successfully built a comprehensive reward modal system with two distinct screens (Flow Complete & Out of Energy), shared animations, drop system, and theme-aware design.

---

## 🎉 Features

### **Two Modal Types**

#### **1. FlowRewardScreen** 🎉
Shown when user completes a question flow
- Displays earned rewards (XP, Gold, Diamonds, Hearts, Food)
- Shows completion stats (questions answered, accuracy, time)
- Presents exclusive drop items for purchase
- Actions: Next Flow, Review Answers, Back to Main

#### **2. LifeRewardScreen** 💔
Shown when player runs out of energy/health/food
- Shows current state (Hearts: 0, Food: 0)
- Displays losses (XP Lost, Gold Lost)
- Presents recovery items for purchase
- Actions: Buy Hearts, Buy Food, Return Home

### **Shared Features**
- ✅ Animated reward counters (count-up effect)
- ✅ 20-particle confetti burst on open
- ✅ Staggered entry animations
- ✅ Theme-aware colors
- ✅ Responsive grid layout
- ✅ Drop rarity system (common, rare, epic, legendary)
- ✅ Portal rendering (no layout shift)

---

## 📁 Architecture

### **File Structure**
```
apps/web/
├── components/
│   ├── RewardModal.tsx           # Base modal component
│   ├── FlowRewardScreen.tsx      # Flow completion wrapper
│   ├── LifeRewardScreen.tsx      # Out-of-energy wrapper
│   ├── RewardDemo.tsx            # Demo UI (dev only)
│   └── ui/
│       └── dialog.tsx            # Radix UI Dialog wrapper
├── hooks/
│   ├── useFlowRewardScreen.ts    # Hook for flow rewards
│   └── useLifeRewardScreen.ts    # Hook for life rewards
└── app/
    └── main/page.tsx             # Demo integration
```

### **Component Hierarchy**
```
RewardModal (Base)
    ├── DialogContent
    ├── DialogHeader (Title + Subtitle)
    ├── Confetti (20 particles)
    ├── Rewards Grid (XP, Gold, Diamonds, etc.)
    ├── Drops Section (3 purchasable items)
    ├── Stats Summary (questions, accuracy, time)
    └── Action Buttons (dynamic)

FlowRewardScreen → RewardModal
LifeRewardScreen → RewardModal
```

---

## 🎯 Usage

### **Flow Completion Reward**
```typescript
import { useFlowRewardScreen } from '@/hooks/useFlowRewardScreen';

function QuestionFlow() {
  const { triggerFlowReward, FlowRewardScreen } = useFlowRewardScreen();
  
  const handleFlowComplete = () => {
    triggerFlowReward({
      xp: 12,
      gold: 45,
      diamonds: 3,
      hearts: 2,
      food: 1,
      questionsAnswered: 5,
      accuracy: 80,
      time: 38,
      drops: [
        {
          id: '1',
          name: 'Rare Scroll',
          price: 15,
          currency: 'diamond',
          icon: '📜',
          rarity: 'rare',
        },
        // ... more drops
      ],
      onNextFlow: () => router.push('/flow/next'),
      onReviewAnswers: () => router.push('/review'),
      onBackToMain: () => router.push('/main'),
    });
  };
  
  return (
    <>
      <button onClick={handleFlowComplete}>Complete Flow</button>
      <FlowRewardScreen />
    </>
  );
}
```

### **Out of Energy**
```typescript
import { useLifeRewardScreen } from '@/hooks/useLifeRewardScreen';

function GamePlay() {
  const { triggerLifeReward, LifeRewardScreen } = useLifeRewardScreen();
  
  const handleOutOfEnergy = () => {
    triggerLifeReward({
      hearts: 0,
      food: 0,
      xpLost: 5,
      goldLost: 10,
      questionsAttempted: 8,
      timeSpent: 120,
      drops: [
        {
          id: '1',
          name: 'Food Pack',
          price: 20,
          currency: 'gold',
          icon: '🍖',
          rarity: 'common',
        },
        {
          id: '2',
          name: 'Heart Potion',
          price: 2,
          currency: 'diamond',
          icon: '❤️',
          rarity: 'rare',
        },
      ],
      onBuyHearts: () => router.push('/shop?item=hearts'),
      onBuyFood: () => router.push('/shop?item=food'),
      onReturnHome: () => router.push('/main'),
    });
  };
  
  return (
    <>
      {/* Game logic */}
      <LifeRewardScreen />
    </>
  );
}
```

---

## 🎨 Visual Design

### **Flow Reward Screen**
```
┌────────────────────────────────────────┐
│     Flow Complete! 🎉                  │
│     Great job! Here are your rewards:  │
├────────────────────────────────────────┤
│  [✨ +12 XP]  [💰 +45 Gold]  [💎 +3]  │
│  [❤️ +2 Hearts]  [🍖 +1 Food]          │
├────────────────────────────────────────┤
│  ✨ Exclusive Drops                    │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ 📜   │  │ ⚡   │  │ 🃏   │         │
│  │Scroll│  │Drink │  │Card  │         │
│  │Buy💎 │  │Buy💰 │  │Buy💎 │         │
│  └──────┘  └──────┘  └──────┘         │
├────────────────────────────────────────┤
│  Summary                               │
│  Questions: 5        Accuracy: 80%    │
│  Time: 38s                             │
├────────────────────────────────────────┤
│  [Next Flow] [Review] [Back to Main]  │
└────────────────────────────────────────┘
     🎉 ✨ ⭐ 💫 🌟 (confetti)
```

### **Life Reward Screen**
```
┌────────────────────────────────────────┐
│     Out of Energy! ⚡                  │
│     You need to recharge...            │
├────────────────────────────────────────┤
│  [💔 0 Hearts]  [🍽️ 0 Food]           │
│  [💫 -5 XP Lost]  [💸 -10 Gold Lost]  │
├────────────────────────────────────────┤
│  ✨ Exclusive Drops                    │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ 🍖   │  │ ❤️   │  │ ⚡   │         │
│  │Food  │  │Potion│  │Bundle│         │
│  │Buy💰 │  │Buy💎 │  │Buy💎 │         │
│  └──────┘  └──────┘  └──────┘         │
├────────────────────────────────────────┤
│  Summary                               │
│  Questions Attempted: 8                │
│  Time Spent: 120s                      │
├────────────────────────────────────────┤
│  [Buy Hearts ❤️] [Buy Food 🍖] [Home] │
└────────────────────────────────────────┘
```

---

## 🎨 Animation Timeline

### **Modal Open (Staggered Entry)**
```
0.0s - Overlay fade in
0.0s - Modal scale + fade (zoom-in-95)
0.2s - Rewards grid appears
0.3s - First reward animates in
0.4s - Second reward animates in
0.5s - Drops section slides in
0.6s - First drop appears
0.7s - Stats section slides in
0.8s - Action buttons appear
```

### **Confetti Burst**
```
20 particles spawn at center
Random trajectories (x: ±400px, y: -100 to -300px)
Random rotation (0-720°)
Staggered delays (0.05s per particle)
Duration: 2s
```

### **Counter Animation**
```
Numbers count from 0 to final value
Duration: 800ms
16ms update interval (~60fps)
Smooth linear interpolation
```

---

## 🎨 Reward Colors

| Reward Type | Emoji | Color | Usage |
|-------------|-------|-------|-------|
| XP | ✨ | Theme accent | Experience/progression |
| Gold | 💰 | #fbbf24 (amber) | Currency |
| Diamonds | 💎 | #a855f7 (purple) | Premium currency |
| Hearts | ❤️ | #ef4444 (red) | Health/lives |
| Food | 🍖 | #f97316 (orange) | Energy |
| XP Lost | 💫 | #64748b (gray) | Penalty |
| Gold Lost | 💸 | #64748b (gray) | Penalty |

---

## 🎁 Drop Rarity System

| Rarity | Border Color | Example Items |
|--------|--------------|---------------|
| Common | Gray (#94a3b8) | Food Pack, Energy Drink |
| Rare | Blue (#3b82f6) | Rare Scroll, Heart Potion |
| Epic | Purple (#a855f7) | Wildcard, Energy Bundle |
| Legendary | Amber (#f59e0b) | Legendary Artifact |

---

## 📊 Data Structures

### **FlowRewardData**
```typescript
interface FlowRewardData {
  // Rewards
  xp: number;
  gold: number;
  diamonds: number;
  hearts?: number;
  food?: number;
  
  // Stats
  questionsAnswered: number;
  accuracy?: number;
  time?: number;
  
  // Drops
  drops?: DropItem[];
  
  // Actions
  onNextFlow?: () => void;
  onReviewAnswers?: () => void;
  onBackToMain?: () => void;
}
```

### **LifeRewardData**
```typescript
interface LifeRewardData {
  // Current state
  hearts: number;
  food: number;
  
  // Losses
  xpLost?: number;
  goldLost?: number;
  
  // Stats
  questionsAttempted?: number;
  timeSpent?: number;
  
  // Drops
  drops?: DropItem[];
  
  // Actions
  onBuyHearts?: () => void;
  onBuyFood?: () => void;
  onReturnHome?: () => void;
}
```

### **DropItem**
```typescript
interface DropItem {
  id: string;
  name: string;
  price: number;
  currency: 'gold' | 'diamond';
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}
```

---

## 🔗 Integration Examples

### **Question Flow Completion**
```typescript
// In your flow component
const handleFlowComplete = async (results: FlowResults) => {
  // Calculate rewards
  const xpGained = results.correctAnswers * 2;
  const goldGained = results.correctAnswers * 5;
  const bonusDiamonds = results.perfectScore ? 3 : 0;
  
  // Generate random drops
  const drops = await fetchRandomDrops(3);
  
  // Show reward screen
  triggerFlowReward({
    xp: xpGained,
    gold: goldGained,
    diamonds: bonusDiamonds,
    questionsAnswered: results.totalQuestions,
    accuracy: Math.round((results.correctAnswers / results.totalQuestions) * 100),
    time: results.timeElapsed,
    drops,
    onNextFlow: () => startNextFlow(),
    onReviewAnswers: () => router.push('/review'),
    onBackToMain: () => router.push('/main'),
  });
};
```

### **Energy Depletion**
```typescript
// In your game logic
const checkEnergy = () => {
  if (player.hearts <= 0 || player.food <= 0) {
    // Generate recovery items
    const drops = [
      {
        id: 'heart-pack',
        name: 'Heart Pack',
        price: 50,
        currency: 'gold',
        icon: '❤️',
        rarity: 'common',
      },
      {
        id: 'food-bundle',
        name: 'Food Bundle',
        price: 30,
        currency: 'gold',
        icon: '🍖',
        rarity: 'common',
      },
      {
        id: 'energy-potion',
        name: 'Energy Potion',
        price: 5,
        currency: 'diamond',
        icon: '⚡',
        rarity: 'rare',
      },
    ];
    
    triggerLifeReward({
      hearts: player.hearts,
      food: player.food,
      xpLost: 5,
      goldLost: 10,
      questionsAttempted: player.currentStreak,
      timeSpent: player.sessionTime,
      drops,
      onBuyHearts: () => router.push('/shop?category=hearts'),
      onBuyFood: () => router.push('/shop?category=food'),
      onReturnHome: () => router.push('/main'),
    });
  }
};
```

### **Achievement Unlock**
```typescript
const handleAchievementUnlock = (achievement: Achievement) => {
  triggerFlowReward({
    xp: achievement.xpReward,
    gold: achievement.goldReward,
    diamonds: achievement.diamondReward,
    questionsAnswered: 0,
    drops: achievement.exclusiveDrops,
    onNextFlow: () => continueGame(),
    onBackToMain: () => router.push('/main'),
  });
};
```

---

## 🎨 Component API

### **RewardModal Props**
```typescript
interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rewards: RewardItem[];
  drops?: DropItem[];
  stats?: Array<{ label: string; value: string | number }>;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    primary?: boolean;
  }>;
  type?: 'success' | 'neutral' | 'warning';
}
```

### **Hook Return Values**
```typescript
// useFlowRewardScreen()
{
  triggerFlowReward: (data: FlowRewardData) => void;
  FlowRewardScreen: React.ComponentType;
  isOpen: boolean;
  close: () => void;
}

// useLifeRewardScreen()
{
  triggerLifeReward: (data: LifeRewardData) => void;
  LifeRewardScreen: React.ComponentType;
  isOpen: boolean;
  close: () => void;
}
```

---

## 🎨 Customization

### **Add New Reward Type**
```typescript
// In FlowRewardScreen.tsx
if (data.stars && data.stars > 0) {
  rewards.push({
    type: 'stars' as any,
    amount: data.stars,
    label: 'Stars',
    emoji: '⭐',
    color: '#fbbf24',
  });
}
```

### **Change Counter Speed**
```typescript
// In RewardModal.tsx AnimatedCounter
<AnimatedCounter value={reward.amount} duration={1500} />
// Change from 800ms to 1500ms for slower count
```

### **More Confetti**
```typescript
// In RewardModal.tsx
{[...Array(50)].map((_, i) => ( // Change from 20 to 50
  <ConfettiParticle key={i} index={i} />
))}
```

### **Custom Action Colors**
```typescript
actions.push({
  label: 'Special Action',
  onClick: handleSpecial,
  variant: 'default',
  primary: true,  // This makes it use accent color
});
```

---

## 🧪 Testing

### **Demo Panel (Dev Mode)**

Visit `/main` to see the Reward Demo panel on the left side.

**Demo Buttons:**
- 🎉 Flow Complete - Shows flow reward modal
- 💔 Out of Energy - Shows life reward modal

### **Test Scenarios**

#### **Flow Complete**
- Rewards: +12 XP, +45 Gold, +3 Diamonds, +2 Hearts, +1 Food
- Stats: 5 questions, 80% accuracy, 38s
- Drops: 3 items (Rare Scroll, Energy Drink, Wildcard)
- Actions: Next Flow, Review Answers, Back to Main

#### **Out of Energy**
- State: 0 Hearts, 0 Food
- Losses: -5 XP, -10 Gold
- Stats: 8 questions attempted, 120s spent
- Drops: 3 recovery items (Food Pack, Heart Potion, Energy Bundle)
- Actions: Buy Hearts, Buy Food, Return Home

---

## 🎯 Animation Details

### **Entry Sequence**
```
Overlay:    0.0s fade in
Modal:      0.0s zoom + fade
Confetti:   0.0s → 2.0s (20 particles)
Rewards:    0.2s grid, 0.3s items stagger
Drops:      0.5s section, 0.6s items stagger
Stats:      0.7s slide up
Actions:    0.8s slide up
```

### **Counter Animation**
```javascript
// Counts from 0 to target value
let current = 0;
const increment = target / (duration / 16);

setInterval(() => {
  current += increment;
  if (current >= target) current = target;
  display(Math.floor(current));
}, 16);  // ~60fps
```

### **Confetti Physics**
```javascript
// Each particle
x: (random - 0.5) * 400    // ±200px spread
y: -100 to -300            // Upward trajectory
rotate: 0 to 720°          // Random spin
opacity: 0 → 1 → 1 → 0     // Fade lifecycle
scale: 0 → 1 → 1 → 0       // Size lifecycle
```

---

## 📊 Rarity Visual Indicators

### **Border Colors**
- **Common:** `border-subtle` (#94a3b8)
- **Rare:** `border-accent` (#3b82f6)
- **Epic:** `border-[#a855f7]` (purple)
- **Legendary:** `border-[#f59e0b]` (amber)

### **Hover Effects**
All drops have `hover:shadow-lg` for feedback.

---

## 🔍 Troubleshooting

### **Modal Not Appearing**
1. Check hook is called correctly
2. Verify Dialog component exists
3. Check open state is true
4. Verify z-index (should be 50)

### **Confetti Not Showing**
1. Check showConfetti state
2. Verify particle array length
3. Check z-index of confetti container
4. Try simpler animation

### **Counters Not Animating**
1. Verify useEffect dependencies
2. Check interval is cleared
3. Try longer duration
4. Test with simpler numbers

### **Actions Not Working**
1. Verify onClick callbacks are provided
2. Check onClose is called
3. Console.log to debug
4. Check router is available

---

## 🚀 Future Enhancements

### **Could Add:**
- [ ] Sound effects (fanfare, coin clink)
- [ ] More confetti variations (colors, shapes)
- [ ] Reward combo multipliers
- [ ] Animated progress bars
- [ ] 3D card flip for drops
- [ ] Drag-to-buy interaction
- [ ] Preview drop details on hover
- [ ] Comparison with previous runs

### **Advanced Features:**
- [ ] Leaderboard position change
- [ ] Friend comparisons
- [ ] Social sharing
- [ ] Screenshot/replay feature
- [ ] Custom reward animations per type
- [ ] Reward history log

---

## 📝 Best Practices

### **When to Show Flow Reward**
- ✅ After completing all questions in a flow
- ✅ After finishing a quiz/test
- ✅ After unlocking an achievement
- ✅ After winning a challenge

### **When to Show Life Reward**
- ✅ When hearts reach 0
- ✅ When food/energy depleted
- ✅ When player dies/fails
- ✅ When run ends prematurely

### **Reward Amounts**
- Small flow: 5-10 XP, 10-20 Gold
- Medium flow: 10-20 XP, 30-50 Gold, 1-2 Diamonds
- Large flow: 20-50 XP, 50-100 Gold, 3-5 Diamonds
- Perfect score: Bonus diamonds

### **Drop Selection**
- Show 3 items maximum (not overwhelming)
- Mix rarities (1 common, 1 rare, 1 epic)
- Price based on rarity
- Relevant to current context

---

**Version:** 0.5.19  
**Date:** 2025-10-11  
**Status:** ✅ Complete and ready for integration  
**Try it:** Visit `/main` in dev mode and click "🎉 Flow Complete" or "💔 Out of Energy"! 🎉













