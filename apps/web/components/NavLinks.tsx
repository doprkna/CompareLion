'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Lock, Settings } from "lucide-react";
import { isAdminView } from '@parel/core/utils/isAdminView';
import { FeatureGate } from '@/components/FeatureGate';
import { useFeatureGate } from '@/lib/hooks';

export default function NavLinks() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const inviteGate = useFeatureGate('INVITE');

  const coreLinks = [
    { href: "/landing", label: "Landing" },
    { href: "/main", label: "Home" },
    { href: "/flow-demo", label: "Play" },
    { href: "/friends", label: "Social" },
    { href: "/profile", label: "Profile" },
  ];

  const communityLinks = [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/challenges", label: "Challenges" },
    { href: "/invite", label: "Invite Friends" },
  ];

  // Play (RPG Arena) - visible to all logged-in users; page gates by rpgEnabled+hasCharacter
  const playLink = { href: "/play", label: "Arena" };

  const lockedFeatures = [];

  const infoLinks = [
    { href: "/changelog", label: "Changelog" },
    { href: "/info/faq", label: "FAQ" },
    { href: "/info/contact", label: "Contact" },
    { href: "/info/terms", label: "Terms" },
    { href: "/info/privacy", label: "Privacy" },
  ];

  const adminLinks = [
    { href: "/reports", label: "Reports" },
    { href: "/admin", label: "Admin Panel" },
    { href: "/admin/metrics", label: "Growth Metrics" },
    { href: "/admin/categories", label: "Category Health" },
    { href: "/admin/users", label: "User Management" },
    { href: "/admin/logs", label: "System Logs" },
  ];

  // Admin-only extras (v0.35.12 - hidden modules)
  const adminExtras = [
    { href: "/lore", label: "Lore Engine" },
    { href: "/narrative", label: "AI Narrative" },
    { href: "/chronicle", label: "World Chronicle" },
    { href: "/regional-events", label: "Regional Events" },
    { href: "/timezone", label: "Timezone System" },
    { href: "/karma", label: "Karma / Prestige" },
    { href: "/admin/api", label: "Admin API Map" },
    { href: "/admin/presets", label: "Admin Presets" },
    { href: "/admin/system", label: "Admin System" },
    { href: "/inventory", label: "Inventory" },
    { href: "/shop", label: "Shop" },
    { href: "/market", label: "Market" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/guilds", label: "Guilds" },
    { href: "/factions", label: "Factions" },
    { href: "/quests", label: "Quests" },
    { href: "/duels", label: "Duels" },
    { href: "/feed", label: "Feed" },
    { href: "/activity", label: "Activity" },
    { href: "/events", label: "Events" },
    { href: "/prestige", label: "Prestige" },
    { href: "/progression", label: "Progression" },
    { href: "/mirror", label: "Mirror" },
    { href: "/postcards", label: "Postcards" },
    { href: "/polls", label: "Polls" },
    { href: "/packs", label: "Packs" },
    { href: "/firesides", label: "Firesides" },
    { href: "/rewards", label: "Rewards" },
    { href: "/tasks", label: "Tasks" },
    { href: "/questions", label: "Questions" },
    { href: "/quiz", label: "Quiz" },
    { href: "/achievements", label: "Achievements" },
    { href: "/create", label: "Create" },
    { href: "/groups", label: "Groups" },
    { href: "/social", label: "Social Hub" },
    { href: "/community", label: "Community" },
    { href: "/admin/inventory", label: "[Dev] Item Viewer" },
  ];

  const showAdminExtras = isAdminView() || userRole === 'ADMIN';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {coreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-text hover:text-accent font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <FeatureGate feature="RPG" mode="placeholder" label="Arena">
          <Link
            href={playLink.href}
            className="text-text hover:text-accent font-medium transition-colors"
          >
            {playLink.label}
          </Link>
        </FeatureGate>

      <DropdownMenu>
        <DropdownMenuTrigger className="text-text hover:text-accent font-medium transition-colors flex items-center gap-1">
          Community
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border">
          {communityLinks.map((link) => {
            const isInvite = link.href === '/invite';
            if (isInvite && !inviteGate.allowed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="opacity-70 cursor-default">
                      <span className="flex items-center gap-1.5">
                        {link.label}
                        <Lock className="h-3 w-3" />
                      </span>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">{inviteGate.message}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            if (isInvite) {
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="text-text hover:text-accent cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href} className="text-text hover:text-accent cursor-pointer">
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="text-text hover:text-accent font-medium transition-colors flex items-center gap-1">
          Info
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border">
          {infoLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="text-text hover:text-accent cursor-pointer">
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

        {userRole === "ADMIN" && (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-destructive hover:text-destructive/80 font-bold transition-colors flex items-center gap-1">
              Admin
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border">
              {adminLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="text-text hover:text-accent cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Admin Only Section - v0.35.12 */}
        {showAdminExtras && (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-accent hover:text-accent/80 font-bold transition-colors flex items-center gap-1.5 border border-accent px-2 py-1 rounded">
              <Settings className="h-3.5 w-3.5" />
              Admin Only
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-accent max-h-[400px] overflow-y-auto">
              <div className="px-2 py-1 text-xs font-bold text-accent uppercase tracking-wide border-b border-border">
                Hidden Modules (Dev/Admin)
              </div>
              {adminExtras.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="text-text hover:text-accent cursor-pointer text-sm">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
}
