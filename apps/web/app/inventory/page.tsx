'use client';

/**
 * Inventory Page
 * v0.35.15 - Display real user items from database
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Sparkles, ShoppingBag } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import PlaceholderPage from '@/components/PlaceholderPage';
import { isAdminView } from '@/lib/utils/isAdminView';

interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  rarity: string;
  type: string;
  goldPrice: number;
  quantity?: number;
  equipped?: boolean;
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      loadInventory();
    }
  }, [status, router]);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/inventory');
      if ((res as any).ok && (res as any).data?.inventory) {
        setItems((res as any).data.inventory);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Admin fallback for empty inventory
  if (items.length === 0 && isAdminView()) {
    return <PlaceholderPage name="Inventory Empty - Items exist in DB but not assigned to user yet" />;
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
            <Package className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-4xl font-bold text-text">Inventory</h1>
              <p className="text-subtle">Your collected items and equipment</p>
            </div>
          </div>
          
          <Button onClick={() => router.push('/shop')} className="bg-accent text-white">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Visit Shop
          </Button>
        </div>

        {/* Inventory Items Grid */}
        <Card className="bg-card border-2 border-border text-text">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Your Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`p-4 flex flex-col items-center justify-between space-y-3 border-2  `}
                  >
                    <div className="text-5xl">{item.emoji || 'ðŸ“¦'}</div>
                    <div className="text-center space-y-1">
                      <div className="font-bold text-text">{item.name}</div>
                      <div className="text-xs text-subtle capitalize">{item.rarity}</div>
                      {item.description && (
                        <div className="text-xs text-subtle line-clamp-2">{item.description}</div>
                      )}
                      {item.quantity && item.quantity > 1 && (
                        <div className="text-xs text-accent font-bold">Qty: {item.quantity}</div>
                      )}
                      {item.equipped && (
                        <div className="text-xs text-accent font-bold">âœ“ Equipped</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-subtle opacity-50 mb-4" />
                <p className="text-subtle text-lg">Your inventory is empty</p>
                <p className="text-subtle text-sm mt-2">Visit the shop to purchase items!</p>
                <Button onClick={() => router.push('/shop')} className="mt-4 bg-accent text-white">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Shop
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Info */}
        <Card className="bg-card border border-border text-text">
          <CardContent className="p-4 text-center text-subtle text-sm">
            ðŸ’¡ Equip items from your inventory to boost your stats and customize your profile!
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
