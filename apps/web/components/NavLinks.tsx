'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
import { apiFetch } from "@/lib/apiBase";
import { isAdminView } from '@parel/core/utils/isAdminView';

export default function NavLinks() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const [userLevel, setUserLevel] = useState(1);
  const isDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_UNLOCK === 'true';

  useEffect(() => {
    // Fetch user level for locked features
    if (session?.user?.email) {
      apiFetch('/api/user/summary')
        .then((res: any) => {
          if (res.ok && res.data?.user) {
            setUserLevel(res.data.user.level || 1);
          }
        })
        .catch(() => {});
    }
  }, [session]);

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
    { href: "/play", label: "Play (Placeholder)" },
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

        {lockedFeatures.map((feature: any) => {
          const isUnlocked = isDev || userLevel >= feature.unlockLevel || userRole === "ADMIN";

          if (isUnlocked) {
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="text-text hover:text-accent font-medium transition-colors"
              >
                {feature.label}
              </Link>
            );
          }

          return (
            <Tooltip key={feature.href}>
              <TooltipTrigger asChild>
                <span className="text-subtle opacity-50 font-medium cursor-not-allowed flex items-center gap-1">
                  {feature.label}
                  <Lock className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-border">
                <p className="text-xs font-medium">{feature.tooltip}</p>
                <p className="text-[10px] text-subtle mt-1">
                  Unlock at Level {feature.unlockLevel}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

      <DropdownMenu>
        <DropdownMenuTrigger className="text-text hover:text-accent font-medium transition-colors flex items-center gap-1">
          Community
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border">
          {communityLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="text-text hover:text-accent cursor-pointer">
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
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
