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
import { ChevronDown, Lock } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";

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
    { href: "/main", label: "Home", locked: false },
    { href: "/flow-demo", label: "Play", locked: false },
    { href: "/friends", label: "Social", locked: false },
    { href: "/profile", label: "Profile", locked: false },
  ];

  const communityLinks = [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/challenges", label: "Challenges" },
    { href: "/invite", label: "Invite Friends" },
  ];

  // Experimental features - hidden for public beta v0.13.2p
  const lockedFeatures = [
    // { href: "/guilds", label: "Guilds", unlockLevel: 10, tooltip: "Join guilds to collaborate with others" },
    // { href: "/market", label: "Market", unlockLevel: 5, tooltip: "Trade items with other players" },
  ];

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
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/challenges", label: "Challenges" },
    { href: "/invite", label: "Invite System" },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {/* Core Navigation */}
        {coreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-text hover:text-accent font-medium transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {/* Locked Features */}
        {lockedFeatures.map((feature) => {
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
                  🔒 Unlock at Level {feature.unlockLevel}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}

      {/* Community Dropdown */}
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

      {/* Info Dropdown */}
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

        {/* Admin Links (if admin) */}
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
      </div>
    </TooltipProvider>
  );
}



