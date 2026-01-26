/**
 * Icon Registry - Canonical Icon Names
 * v0.42.13 - C5 Step 8: Final Cleanup + Legacy Removal
 * 
 * This registry defines all canonical icon names organized by category.
 * All icons are lazy-loaded via dynamic imports from lucide-react.
 * 
 * Registry Structure:
 * - Flat namespace: icon-name (e.g., 'edit', 'delete', 'home')
 * - No prefixes: avoid 'icon-edit' or 'action-edit'
 * - Consistent naming: kebab-case, lowercase
 * - Semantic names: 'heart' not 'like-icon'
 * - Lazy-loading: each icon is a function that returns Promise<Component>
 * 
 * See C5 architecture doc: /docs/architecture/C5-icon-diet.md
 */

import React, { type ComponentType } from 'react';

// Icon SVG component props
export interface IconSvgProps {
  size?: number | string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

// Icon loader function type (lazy-load)
export type IconLoader = () => Promise<ComponentType<IconSvgProps> | null>;

// Registry type with lazy-load functions
export type IconRegistry = Record<string, IconLoader>;

/**
 * Create a wrapper component that adapts lucide-react icons to IconSvgProps
 */
function createIconWrapper(
  LucideIcon: ComponentType<any>
): ComponentType<IconSvgProps> {
  return ({ size, className, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, ...props }: IconSvgProps) => {
    // Convert size to number if it's a string
    const iconSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
    
    return (
      <LucideIcon
        size={iconSize}
        className={className}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        {...props}
      />
    );
  };
}

/**
 * Canonical Icon Registry
 * 
 * All icons are organized by category for management, but accessed via flat namespace.
 * Each icon is a lazy-load function that returns Promise<Component>.
 * All icons use dynamic imports from lucide-react library.
 */
export const ICONS: IconRegistry = {
  // ============================================
  // ACTION ICONS (13)
  // ============================================
  edit: async () => {
    const { Edit } = await import('lucide-react');
    return createIconWrapper(Edit);
  },
  delete: async () => {
    const { Trash2 } = await import('lucide-react');
    return createIconWrapper(Trash2);
  },
  add: async () => {
    const { Plus } = await import('lucide-react');
    return createIconWrapper(Plus);
  },
  remove: async () => {
    const { Minus } = await import('lucide-react');
    return createIconWrapper(Minus);
  },
  save: async () => {
    const { Save } = await import('lucide-react');
    return createIconWrapper(Save);
  },
  cancel: async () => {
    const { X } = await import('lucide-react');
    return createIconWrapper(X);
  },
  confirm: async () => {
    const { Check } = await import('lucide-react');
    return createIconWrapper(Check);
  },
  close: async () => {
    const { X } = await import('lucide-react');
    return createIconWrapper(X);
  },
  check: async () => {
    const { Check } = await import('lucide-react');
    return createIconWrapper(Check);
  },
  plus: async () => {
    const { Plus } = await import('lucide-react');
    return createIconWrapper(Plus);
  },
  minus: async () => {
    const { Minus } = await import('lucide-react');
    return createIconWrapper(Minus);
  },
  sword: async () => {
    const { Sword } = await import('lucide-react');
    return createIconWrapper(Sword);
  },
  hammer: async () => {
    const { Hammer } = await import('lucide-react');
    return createIconWrapper(Hammer);
  },
  shield: async () => {
    const { Shield } = await import('lucide-react');
    return createIconWrapper(Shield);
  },
  swords: async () => {
    const { Swords } = await import('lucide-react');
    return createIconWrapper(Swords);
  },

  // ============================================
  // NAVIGATION ICONS (13)
  // ============================================
  home: async () => {
    const { Home } = await import('lucide-react');
    return createIconWrapper(Home);
  },
  back: async () => {
    const { ArrowLeft } = await import('lucide-react');
    return createIconWrapper(ArrowLeft);
  },
  forward: async () => {
    const { ArrowRight } = await import('lucide-react');
    return createIconWrapper(ArrowRight);
  },
  menu: async () => {
    const { Menu } = await import('lucide-react');
    return createIconWrapper(Menu);
  },
  hamburger: async () => {
    const { Menu } = await import('lucide-react');
    return createIconWrapper(Menu);
  },
  'chevron-left': async () => {
    const { ChevronLeft } = await import('lucide-react');
    return createIconWrapper(ChevronLeft);
  },
  'chevron-right': async () => {
    const { ChevronRight } = await import('lucide-react');
    return createIconWrapper(ChevronRight);
  },
  'chevron-up': async () => {
    const { ChevronUp } = await import('lucide-react');
    return createIconWrapper(ChevronUp);
  },
  'chevron-down': async () => {
    const { ChevronDown } = await import('lucide-react');
    return createIconWrapper(ChevronDown);
  },
  'arrow-left': async () => {
    const { ArrowLeft } = await import('lucide-react');
    return createIconWrapper(ArrowLeft);
  },
  'arrow-right': async () => {
    const { ArrowRight } = await import('lucide-react');
    return createIconWrapper(ArrowRight);
  },
  'arrow-up': async () => {
    const { ArrowUp } = await import('lucide-react');
    return createIconWrapper(ArrowUp);
  },
  'arrow-down': async () => {
    const { ArrowDown } = await import('lucide-react');
    return createIconWrapper(ArrowDown);
  },

  // ============================================
  // STATUS ICONS (11)
  // ============================================
  success: async () => {
    const { CheckCircle } = await import('lucide-react');
    return createIconWrapper(CheckCircle);
  },
  warning: async () => {
    const { AlertTriangle } = await import('lucide-react');
    return createIconWrapper(AlertTriangle);
  },
  error: async () => {
    const { XCircle } = await import('lucide-react');
    return createIconWrapper(XCircle);
  },
  info: async () => {
    const { Info } = await import('lucide-react');
    return createIconWrapper(Info);
  },
  loading: async () => {
    const { Loader2 } = await import('lucide-react');
    return createIconWrapper(Loader2);
  },
  spinner: async () => {
    const { Loader2 } = await import('lucide-react');
    return createIconWrapper(Loader2);
  },
  'check-circle': async () => {
    const { CheckCircle } = await import('lucide-react');
    return createIconWrapper(CheckCircle);
  },
  'alert-circle': async () => {
    const { AlertCircle } = await import('lucide-react');
    return createIconWrapper(AlertCircle);
  },
  'x-circle': async () => {
    const { XCircle } = await import('lucide-react');
    return createIconWrapper(XCircle);
  },
  'info-circle': async () => {
    const { Info } = await import('lucide-react');
    return createIconWrapper(Info);
  },
  zap: async () => {
    const { Zap } = await import('lucide-react');
    return createIconWrapper(Zap);
  },
  lightbulb: async () => {
    const { Lightbulb } = await import('lucide-react');
    return createIconWrapper(Lightbulb);
  },

  // ============================================
  // MEDIA ICONS (16)
  // ============================================
  image: async () => {
    const { Image } = await import('lucide-react');
    return createIconWrapper(Image);
  },
  video: async () => {
    const { Video } = await import('lucide-react');
    return createIconWrapper(Video);
  },
  audio: async () => {
    const { Music } = await import('lucide-react');
    return createIconWrapper(Music);
  },
  play: async () => {
    const { Play } = await import('lucide-react');
    return createIconWrapper(Play);
  },
  pause: async () => {
    const { Pause } = await import('lucide-react');
    return createIconWrapper(Pause);
  },
  stop: async () => {
    const { Square } = await import('lucide-react');
    return createIconWrapper(Square);
  },
  volume: async () => {
    const { Volume2 } = await import('lucide-react');
    return createIconWrapper(Volume2);
  },
  mute: async () => {
    const { VolumeX } = await import('lucide-react');
    return createIconWrapper(VolumeX);
  },
  fullscreen: async () => {
    const { Maximize } = await import('lucide-react');
    return createIconWrapper(Maximize);
  },
  camera: async () => {
    const { Camera } = await import('lucide-react');
    return createIconWrapper(Camera);
  },
  microphone: async () => {
    const { Mic } = await import('lucide-react');
    return createIconWrapper(Mic);
  },
  film: async () => {
    const { Film } = await import('lucide-react');
    return createIconWrapper(Film);
  },
  gamepad: async () => {
    const { Gamepad2 } = await import('lucide-react');
    return createIconWrapper(Gamepad2);
  },
  palette: async () => {
    const { Palette } = await import('lucide-react');
    return createIconWrapper(Palette);
  },
  file: async () => {
    const { FileText } = await import('lucide-react');
    return createIconWrapper(FileText);
  },
  skip: async () => {
    const { SkipForward } = await import('lucide-react');
    return createIconWrapper(SkipForward);
  },

  // ============================================
  // SOCIAL ICONS (12)
  // ============================================
  like: async () => {
    const { ThumbsUp } = await import('lucide-react');
    return createIconWrapper(ThumbsUp);
  },
  heart: async () => {
    const { Heart } = await import('lucide-react');
    return createIconWrapper(Heart);
  },
  comment: async () => {
    const { MessageSquare } = await import('lucide-react');
    return createIconWrapper(MessageSquare);
  },
  share: async () => {
    const { Share2 } = await import('lucide-react');
    return createIconWrapper(Share2);
  },
  follow: async () => {
    const { UserPlus } = await import('lucide-react');
    return createIconWrapper(UserPlus);
  },
  unfollow: async () => {
    const { UserMinus } = await import('lucide-react');
    return createIconWrapper(UserMinus);
  },
  message: async () => {
    const { MessageCircle } = await import('lucide-react');
    return createIconWrapper(MessageCircle);
  },
  reply: async () => {
    const { CornerUpLeft } = await import('lucide-react');
    return createIconWrapper(CornerUpLeft);
  },
  retweet: async () => {
    const { Repeat } = await import('lucide-react');
    return createIconWrapper(Repeat);
  },
  bookmark: async () => {
    const { Bookmark } = await import('lucide-react');
    return createIconWrapper(Bookmark);
  },
  laugh: async () => {
    const { Laugh } = await import('lucide-react');
    return createIconWrapper(Laugh);
  },
  repeat: async () => {
    const { Repeat } = await import('lucide-react');
    return createIconWrapper(Repeat);
  },

  // ============================================
  // GAMIFICATION ICONS (16)
  // ============================================
  xp: async () => {
    const { Sparkles } = await import('lucide-react');
    return createIconWrapper(Sparkles);
  },
  streak: async () => {
    const { Flame } = await import('lucide-react');
    return createIconWrapper(Flame);
  },
  trophy: async () => {
    const { Trophy } = await import('lucide-react');
    return createIconWrapper(Trophy);
  },
  medal: async () => {
    const { Award } = await import('lucide-react');
    return createIconWrapper(Award);
  },
  star: async () => {
    const { Star } = await import('lucide-react');
    return createIconWrapper(Star);
  },
  'level-up': async () => {
    const { TrendingUp } = await import('lucide-react');
    return createIconWrapper(TrendingUp);
  },
  achievement: async () => {
    const { Trophy } = await import('lucide-react');
    return createIconWrapper(Trophy);
  },
  badge: async () => {
    const { Badge } = await import('lucide-react');
    return createIconWrapper(Badge);
  },
  crown: async () => {
    const { Crown } = await import('lucide-react');
    return createIconWrapper(Crown);
  },
  flame: async () => {
    const { Flame } = await import('lucide-react');
    return createIconWrapper(Flame);
  },
  gift: async () => {
    const { Gift } = await import('lucide-react');
    return createIconWrapper(Gift);
  },
  coin: async () => {
    const { Coins } = await import('lucide-react');
    return createIconWrapper(Coins);
  },
  gem: async () => {
    const { Gem } = await import('lucide-react');
    return createIconWrapper(Gem);
  },
  dice: async () => {
    const { Dice6 } = await import('lucide-react');
    return createIconWrapper(Dice6);
  },
  moon: async () => {
    const { Moon } = await import('lucide-react');
    return createIconWrapper(Moon);
  },
  coins: async () => {
    const { Coins } = await import('lucide-react');
    return createIconWrapper(Coins);
  },

  // ============================================
  // USER & PROFILE ICONS (14)
  // ============================================
  user: async () => {
    const { User } = await import('lucide-react');
    return createIconWrapper(User);
  },
  avatar: async () => {
    const { UserCircle } = await import('lucide-react');
    return createIconWrapper(UserCircle);
  },
  profile: async () => {
    const { User } = await import('lucide-react');
    return createIconWrapper(User);
  },
  settings: async () => {
    const { Settings } = await import('lucide-react');
    return createIconWrapper(Settings);
  },
  account: async () => {
    const { UserCircle } = await import('lucide-react');
    return createIconWrapper(UserCircle);
  },
  logout: async () => {
    const { LogOut } = await import('lucide-react');
    return createIconWrapper(LogOut);
  },
  login: async () => {
    const { LogIn } = await import('lucide-react');
    return createIconWrapper(LogIn);
  },
  team: async () => {
    const { Users } = await import('lucide-react');
    return createIconWrapper(Users);
  },
  group: async () => {
    const { Users } = await import('lucide-react');
    return createIconWrapper(Users);
  },
  person: async () => {
    const { User } = await import('lucide-react');
    return createIconWrapper(User);
  },
  brain: async () => {
    const { Brain } = await import('lucide-react');
    return createIconWrapper(Brain);
  },
  mask: async () => {
    const { Mask } = await import('lucide-react');
    return createIconWrapper(Mask);
  },
  lock: async () => {
    const { Lock } = await import('lucide-react');
    return createIconWrapper(Lock);
  },
  bot: async () => {
    const { Bot } = await import('lucide-react');
    return createIconWrapper(Bot);
  },

  // ============================================
  // CHALLENGE & ACTIVITY ICONS (10)
  // ============================================
  challenge: async () => {
    const { Target } = await import('lucide-react');
    return createIconWrapper(Target);
  },
  task: async () => {
    const { CheckSquare } = await import('lucide-react');
    return createIconWrapper(CheckSquare);
  },
  checklist: async () => {
    const { ListChecks } = await import('lucide-react');
    return createIconWrapper(ListChecks);
  },
  complete: async () => {
    const { CheckCircle } = await import('lucide-react');
    return createIconWrapper(CheckCircle);
  },
  incomplete: async () => {
    const { Circle } = await import('lucide-react');
    return createIconWrapper(Circle);
  },
  progress: async () => {
    const { BarChart3 } = await import('lucide-react');
    return createIconWrapper(BarChart3);
  },
  timer: async () => {
    const { Timer } = await import('lucide-react');
    return createIconWrapper(Timer);
  },
  clock: async () => {
    const { Clock } = await import('lucide-react');
    return createIconWrapper(Clock);
  },
  calendar: async () => {
    const { Calendar } = await import('lucide-react');
    return createIconWrapper(Calendar);
  },
  event: async () => {
    const { Calendar } = await import('lucide-react');
    return createIconWrapper(Calendar);
  },

  // ============================================
  // DISCOVERY & WORLD ICONS (10)
  // ============================================
  discovery: async () => {
    const { Compass } = await import('lucide-react');
    return createIconWrapper(Compass);
  },
  explore: async () => {
    const { Map } = await import('lucide-react');
    return createIconWrapper(Map);
  },
  map: async () => {
    const { Map } = await import('lucide-react');
    return createIconWrapper(Map);
  },
  location: async () => {
    const { MapPin } = await import('lucide-react');
    return createIconWrapper(MapPin);
  },
  world: async () => {
    const { Globe } = await import('lucide-react');
    return createIconWrapper(Globe);
  },
  globe: async () => {
    const { Globe } = await import('lucide-react');
    return createIconWrapper(Globe);
  },
  compass: async () => {
    const { Compass } = await import('lucide-react');
    return createIconWrapper(Compass);
  },
  treasure: async () => {
    const { Gem } = await import('lucide-react');
    return createIconWrapper(Gem);
  },
  lore: async () => {
    const { BookOpen } = await import('lucide-react');
    return createIconWrapper(BookOpen);
  },
  book: async () => {
    const { Book } = await import('lucide-react');
    return createIconWrapper(Book);
  },
  package: async () => {
    const { Package } = await import('lucide-react');
    return createIconWrapper(Package);
  },
  box: async () => {
    const { Box } = await import('lucide-react');
    return createIconWrapper(Box);
  },
  flask: async () => {
    const { FlaskConical } = await import('lucide-react');
    return createIconWrapper(FlaskConical);
  },
  shopping: async () => {
    const { ShoppingBag } = await import('lucide-react');
    return createIconWrapper(ShoppingBag);
  },

  // ============================================
  // SYSTEM & UTILITY ICONS (13)
  // ============================================
  search: async () => {
    const { Search } = await import('lucide-react');
    return createIconWrapper(Search);
  },
  filter: async () => {
    const { Filter } = await import('lucide-react');
    return createIconWrapper(Filter);
  },
  sort: async () => {
    const { ArrowUpDown } = await import('lucide-react');
    return createIconWrapper(ArrowUpDown);
  },
  'arrow-up-down': async () => {
    const { ArrowUpDown } = await import('lucide-react');
    return createIconWrapper(ArrowUpDown);
  },
  refresh: async () => {
    const { RefreshCw } = await import('lucide-react');
    return createIconWrapper(RefreshCw);
  },
  download: async () => {
    const { Download } = await import('lucide-react');
    return createIconWrapper(Download);
  },
  upload: async () => {
    const { Upload } = await import('lucide-react');
    return createIconWrapper(Upload);
  },
  copy: async () => {
    const { Copy } = await import('lucide-react');
    return createIconWrapper(Copy);
  },
  link: async () => {
    const { Link } = await import('lucide-react');
    return createIconWrapper(Link);
  },
  'external-link': async () => {
    const { ExternalLink } = await import('lucide-react');
    return createIconWrapper(ExternalLink);
  },
  more: async () => {
    const { MoreHorizontal } = await import('lucide-react');
    return createIconWrapper(MoreHorizontal);
  },
  ellipsis: async () => {
    const { MoreHorizontal } = await import('lucide-react');
    return createIconWrapper(MoreHorizontal);
  },
} as const;

/**
 * Check if an icon exists in the registry
 * Note: This checks registry existence, not whether icon is loaded
 */
export function hasIcon(name: string): boolean {
  return name in ICONS;
}

/**
 * Get all registered icon names
 */
export function getAllIconNames(): string[] {
  return Object.keys(ICONS);
}

/**
 * Get icon names by category (for organization/debugging)
 */
export function getIconsByCategory(): Record<string, string[]> {
  return {
    action: ['edit', 'delete', 'add', 'remove', 'save', 'cancel', 'confirm', 'close', 'check', 'plus', 'minus', 'sword', 'hammer', 'shield', 'swords'],
    navigation: ['home', 'back', 'forward', 'menu', 'hamburger', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'],
    status: ['success', 'warning', 'error', 'info', 'loading', 'spinner', 'check-circle', 'alert-circle', 'x-circle', 'info-circle', 'zap', 'lightbulb'],
    media: ['image', 'video', 'audio', 'play', 'pause', 'stop', 'volume', 'mute', 'fullscreen', 'camera', 'microphone', 'film', 'gamepad', 'palette', 'file', 'skip'],
    social: ['like', 'heart', 'comment', 'share', 'follow', 'unfollow', 'message', 'reply', 'retweet', 'bookmark', 'laugh', 'repeat'],
    gamification: ['xp', 'streak', 'trophy', 'medal', 'star', 'level-up', 'achievement', 'badge', 'crown', 'flame', 'gift', 'coin', 'gem', 'dice', 'moon', 'coins'],
    user: ['user', 'avatar', 'profile', 'settings', 'account', 'logout', 'login', 'team', 'group', 'person', 'brain', 'mask', 'lock', 'bot'],
    challenge: ['challenge', 'task', 'checklist', 'complete', 'incomplete', 'progress', 'timer', 'clock', 'calendar', 'event'],
    discovery: ['discovery', 'explore', 'map', 'location', 'world', 'globe', 'compass', 'treasure', 'lore', 'book', 'package', 'box', 'flask', 'shopping'],
    system: ['search', 'filter', 'sort', 'refresh', 'download', 'upload', 'copy', 'link', 'external-link', 'more', 'ellipsis', 'arrow-up-down'],
  };
}
