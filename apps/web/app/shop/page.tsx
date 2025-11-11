'use client';

/**
 * Shop Page
 * v0.35.15 - Real database items
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Coins, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FeatureGuard } from '@/components/FeatureGuard';
import PlaceholderPage from '@/components/PlaceholderPage';
import { isAdminView } from '@/lib/utils/isAdminView';

interface ShopItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string | null;
  emoji: string;
  icon: string;
  goldPrice: number;
  power: number | null;
  defense: number | null;
}

export default function ShopPage() {
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

  useEffect(() => {
    loadShop();
    loadUserFunds();
  }, []);

  async function loadShop() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/items');
      if ((res as any).ok && (res as any).data?.items) {
        setItems((res as any).data.items);
      }
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserFunds() {
    try {
      const res = await apiFetch('/api/user/summary');
      if ((res as any).ok && (res as any).data?.user) {
        setUserFunds((res as any).data.user.funds || 0);
      }
    } catch (error) {
      console.error('Error loading user funds:', error);
    }
  }

  async function handlePurchase(item: ShopItem) {
    if (userFunds < item.goldPrice) {
      toast({
        title: 'Insufficient Funds',
        description: `You need  gold but only have  gold.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiFetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });

      if ((res as any).ok && (res as any).data) {
        const { newBalance } = (res as any).data;
        setUserFunds(newBalance);
        
        toast({
          title: 'Purchase Successful!',
          description: `Bought   for  gold`,
        });
        
        // Reload shop to update inventory
        loadShop();
      } else {
        toast({
          title: 'Purchase Failed',
          description: (res as any).error || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  }

  // Admin fallback for empty shop
  if (!loading && items.length === 0 && isAdminView()) {
    return <PlaceholderPage name="Shop Empty - Run reseed DB from admin panel" />;
  }

  const rarityColors: Record<string, string> = {
    common: 'border-gray-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

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
                  <Card 
                    key={item.id} 
                    className={`p-4 flex flex-col items-center justify-between space-y-3 border-2  hover:scale-105 transition-transform`}
                  >
                    <div className="text-5xl">{item.emoji || item.icon || 'ðŸ“¦'}</div>
                    <div className="text-center space-y-1">
                      <div className="font-bold text-text">{item.name}</div>
                      <div className="text-xs text-subtle capitalize">{item.rarity}</div>
                      {item.description && (
                        <div className="text-xs text-subtle line-clamp-2">{item.description}</div>
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-1">
                          {item.goldPrice} <Coins className="h-4 w-4" />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-accent text-white hover:opacity-90"
                        onClick={() => handlePurchase(item)}
                        disabled={userFunds < item.goldPrice}
                      >
                        {userFunds < item.goldPrice ? "Can't Afford" : 'Buy'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-subtle opacity-50 mb-4" />
                <p className="text-subtle text-lg">No items available in shop</p>
                <p className="text-subtle text-sm mt-2">Check back later or run reseed from admin panel</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shop Info */}
        <Card className="bg-card border border-border text-text">
          <CardContent className="p-4 text-center text-subtle text-sm">
            ðŸ’¡ Items are permanent and can be equipped in your Profile. Earn gold by completing flows and achievements!
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
