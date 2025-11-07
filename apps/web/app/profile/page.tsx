'use client';

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsPanel from "./components/StatsPanel";
import InventoryModal from "./components/InventoryModal";
import SettingsAccordion from "./components/SettingsAccordion";
import HeroStats from "./components/HeroStats";
import { WalletBar } from '@/components/rpg/WalletBar';
import { User, Package, Trophy, ShoppingBag } from "lucide-react";
import { AmbientManager } from '@/components/AmbientManager';

export default function ProfileHub() {
  const { data: session } = useSession();
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Guest';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;

  return (
    <div>
      <AmbientManager mode="profile" />
      <div className="min-h-screen bg-bg p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Wallet Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {userImage && (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-24 h-24 rounded-full border-4 border-accent"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-text">{userName}</h1>
                <p className="text-subtle">{userEmail}</p>
                <div className="mt-2 text-accent font-semibold text-lg">
                  🧙 Archetype: <span className="text-text">The Adventurer</span>
                </div>
              </div>
              <WalletBar showDiamonds={false} compact={false} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link href="/groups" className="inline-flex">
              <Button variant="secondary">Compare with Group</Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="border-2 border-accent text-accent hover:bg-accent/10 h-16"
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              className="border-2 border-border text-text hover:bg-card/50 h-16"
              onClick={() => setInventoryOpen(true)}
            >
              <Package className="h-5 w-5 mr-2" />
              Inventory
            </Button>
            <Link href="/profile/achievements" className="contents">
              <Button
                variant="outline"
                className="border-2 border-border text-text hover:bg-card/50 h-16 w-full"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Achievements
              </Button>
            </Link>
            <Link href="/profile/shop" className="contents">
              <Button
                variant="outline"
                className="border-2 border-border text-text hover:bg-card/50 h-16 w-full"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop
              </Button>
            </Link>
          </div>
          {/* Additional Links */}
          <div className="mt-4">
            <Link href="/profile/market" className="text-accent hover:underline text-sm">
              🏪 Marketplace →
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Currency Stats */}
            <Card className="bg-card border-2 border-border text-text">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsPanel />
              </CardContent>
            </Card>

            {/* Hero Stats */}
            <HeroStats />
          </div>

          {/* Settings */}
          <SettingsAccordion />

          {/* Inventory Modal */}
          <InventoryModal open={inventoryOpen} onClose={() => setInventoryOpen(false)} />

          {/* Footer Note */}
          <Card className="bg-card border border-border text-text">
            <CardContent className="p-4 text-center text-subtle text-sm">
              📊 This is your unified profile hub - manage everything from one place!
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
