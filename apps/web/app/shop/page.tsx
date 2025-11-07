'use client';

/**
 * Shop Page
 * Economy and item purchasing (BETA - Feature disabled for public release)
 * v0.13.2p
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/ItemCard";
import { ShoppingBag, Coins, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/components/ThemeProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeatureGuard } from "@/components/FeatureGuard";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string | null;
  power: number | null;
  defense: number | null;
  effect: string | null;
  bonus: string | null;
  icon: string | null;
  price: number;
  currency: string;
}

export default function ShopPage() {
  // Feature guard for public beta
  return (
    <FeatureGuard feature="ECONOMY" redirectTo="/main">
      <ShopPageContent />
    </FeatureGuard>
  );
}

function ShopPageContent() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFunds, setUserFunds] = useState(0);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadShop();
    loadUserFunds();
  }, []);

  async function loadShop() {
    setLoading(true);
    const res = await apiFetch("/api/shop");
    if ((res as any).ok && (res as any).data?.items) {
      setItems((res as any).data.items);
    }
    setLoading(false);
  }

  async function loadUserFunds() {
    const res = await apiFetch("/api/user/summary");
    if ((res as any).ok && (res as any).data?.user) {
      setUserFunds((res as any).data.user.funds || 0);
    }
  }

  async function handlePurchase(item: ShopItem) {
    if (userFunds < item.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${item.price} gold but only have ${userFunds} gold.`,
        variant: "destructive",
      });
      return;
    }

    const res = await apiFetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });

    if ((res as any).ok && (res as any).data) {
      const { newBalance } = (res as any).data;
      setUserFunds(newBalance);
      
      toast({
        title: "Purchase Successful!",
        description: `Bought ${item.icon || "📦"} ${item.name} for ${item.price} gold`,
      });
    } else {
      toast({
        title: "Purchase Failed",
        description: (res as any).error || "An error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-4xl font-bold text-text">Item Shop</h1>
              <p className="text-subtle">Purchase items to enhance your character</p>
            </div>
          </div>
          
          {/* User Funds Display */}
          <div className="bg-card border-2 border-accent rounded-xl px-6 py-3">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <div>
                <div className="text-xs text-subtle">Your Gold</div>
                <div className="text-2xl font-bold text-accent">{userFunds}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Items Grid */}
        <Card className="bg-card border-2 border-border text-text">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-subtle">Loading shop...</div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <ItemCard item={item} />
                    <div className="bg-bg border border-border rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-accent mb-2">
                        {item.price} <Coins className="h-4 w-4 inline text-yellow-500" />
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-accent text-white hover:opacity-90"
                        onClick={() => handlePurchase(item)}
                        disabled={userFunds < item.price}
                      >
                        {userFunds < item.price ? "Can't Afford" : "Buy"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Shop is Empty"
                description="No items are currently available for purchase. Check back later for new gear, consumables, and cosmetics!"
              />
            )}
          </CardContent>
        </Card>

        {/* Shop Info */}
        <Card className="bg-card border border-border text-text">
          <CardContent className="p-4 text-center text-subtle text-sm">
            💡 Items are permanent and can be equipped in your Profile. Earn gold by completing flows and achievements!
          </CardContent>
        </Card>

        {/* Profile Themes Section */}
        <div className="mt-8">
          <ThemeSelector
            currentThemeId={theme}
            ownedThemeIds={['default']}
            userLevel={1}
            onThemeChange={setTheme}
          />
        </div>
      </div>
    </div>
  );
}
