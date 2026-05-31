'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Lock } from "lucide-react";
import { isAdmin } from '@/lib/auth/isAdmin';
import { FeatureGate } from '@/components/FeatureGate';
import { useFeatureGate } from '@/lib/hooks';
import { AdminAttentionBadge, useAdminAttention } from '@/components/admin/AdminAttention';

export default function NavLinks() {
  const { data: session, status } = useSession();
  const inviteGate = useFeatureGate('INVITE');
  const adminUser = isAdmin(session?.user);
  const adminAttention = useAdminAttention();

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center gap-4 min-h-[40px]">
        <div className="h-6 w-20 animate-pulse rounded bg-border/60" aria-hidden />
        <div className="h-9 flex-1 max-w-md animate-pulse rounded bg-border/50" aria-hidden />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2 min-w-0">
        <Link
          href="/landing"
          className="text-xl font-bold text-text hover:text-accent transition-colors shrink-0"
        >
          {APP_NAME}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/info/faq"
            className="text-subtle hover:text-accent font-medium transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="text-subtle hover:text-accent font-medium transition-colors"
          >
            About
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <Link
            href="/login"
            className="text-text hover:text-accent font-medium transition-colors"
          >
            Log in
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-accent to-blue-500 text-white hover:opacity-95 font-semibold shadow-sm whitespace-normal sm:whitespace-nowrap h-auto py-2 px-4 text-left sm:text-center"
          >
            <Link href="/flow-demo">Find out if you&apos;re normal</Link>
          </Button>
        </div>
      </div>
    );
  }

  const coreLinks = [
    { href: "/landing", label: "Landing" },
    { href: "/main", label: "Dashboard" },
    { href: "/flow-demo", label: "Flow" },
    { href: "/friends", label: "Social" },
    { href: "/profile", label: "Profile" },
  ];

  const communityLinks = [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/challenges", label: "Challenges" },
    { href: "/invite", label: "Invite Friends" },
  ];

  const playLink = { href: "/play", label: "Arena" };

  const infoLinks = [
    { href: "/changelog", label: "Changelog" },
    { href: "/info/faq", label: "FAQ" },
    { href: "/info/contact", label: "Contact" },
    { href: "/info/terms", label: "Terms" },
    { href: "/info/privacy", label: "Privacy" },
  ];

  const adminPrimaryLinks = [
    { href: "/admin", label: "Admin dashboard" },
    { href: "/admin/question-pipeline", label: "Question pipeline" },
    { href: "/admin/question-reports", label: "Question reports" },
    { href: "/admin/metrics", label: "Growth metrics" },
    { href: "/admin/categories", label: "Category health" },
    { href: "/admin/users", label: "User management" },
    { href: "/admin/ops", label: "Ops runs" },
    { href: "/reports", label: "Reports (legacy)" },
    { href: "/admin/logs", label: "System logs" },
    { href: "/admin/translation", label: "Translation suggestions" },
    { href: "/admin/questions", label: "Manage tags" },
  ];

  const adminDevLinks = [
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

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 flex-wrap">
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

        {adminUser && (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-destructive hover:text-destructive/80 font-bold transition-colors flex items-center gap-1.5">
              Admin
              {adminAttention?.needsAttention ? (
                <AdminAttentionBadge count={adminAttention.totalAttentionCount} />
              ) : null}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border max-h-[min(70vh,480px)] overflow-y-auto w-56">
              <DropdownMenuLabel className="text-xs text-subtle">Operations</DropdownMenuLabel>
              {adminPrimaryLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-subtle">Dev / hidden modules</DropdownMenuLabel>
              {adminDevLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="cursor-pointer text-sm">
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
