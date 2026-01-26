/**
 * Profile Market Page - User's listings and create listing form
 * v0.36.29 - Marketplace 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Loader2, X, Plus, Package } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { useToast } from '@/components/ui/use-toast';
import { getRarityColorClass } from '@/lib/rpg/rarity';

interface UserListing {
  id: string;
  itemId: string;
  price: number;
  quantity: number;
  status: string;
  createdAt: string;
  item: {
    id: string;
    name: string;
    emoji: string;
    icon: string;
    rarity: string;
    type: string;
  };
}

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  emoji: string;
  icon: string;
  rarity: string;
  type: string;
  quantity: number;
}

export default function ProfileMarketPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  async function loadData() {
    setLoading(true);
    try {
      const [listingsRes, inventoryRes] = await Promise.all([
        apiFetch('/api/market/user'),
        apiFetch('/api/inventory'),
      ]);

      if ((listingsRes as any).ok) {
        setListings((listingsRes as any).data.listings || []);
      }

      if ((inventoryRes as any).ok) {
        const items = (inventoryRes as any).data.inventory || [];
        // Filter out items that are already listed
        const listedItemIds = new Set(listings.map(l => l.itemId));
        setInventory(items.filter((item: InventoryItem) => !listedItemIds.has(item.itemId)));
      }
    } catch (error) {
      console.error('Failed to load data', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateListing() {
    if (!selectedItem || !price || !quantity) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const priceNum = parseInt(price);
    const quantityNum = parseInt(quantity);

    if (priceNum < 1 || priceNum > 99999) {
      toast({
        title: 'Error',
        description: 'Price must be between 1 and 99999',
        variant: 'destructive',
      });
      return;
    }

    if (quantityNum < 1 || quantityNum > selectedItem.quantity) {
      toast({
        title: 'Error',
        description: `Quantity must be between 1 and ${selectedItem.quantity}`,
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch('/api/market/list', {
        method: 'POST',
        body: JSON.stringify({
          itemId: selectedItem.itemId,
          quantity: quantityNum,
          price: priceNum,
        }),
      });

      if ((res as any).ok) {
        toast({
          title: 'Success',
          description: 'Listing created successfully!',
        });
        setShowCreateForm(false);
        setSelectedItem(null);
        setPrice('');
        setQuantity('1');
        await loadData();
      } else {
        throw new Error((res as any).error || 'Failed to create listing');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleCancelListing(listingId: string) {
    if (cancelling) return;
    setCancelling(listingId);
    try {
      const res = await apiFetch(`/api/market/list/${listingId}`, {
        method: 'DELETE',
      });

      if ((res as any).ok) {
        toast({
          title: 'Success',
          description: 'Listing cancelled. Items returned to inventory.',
        });
        await loadData();
      } else {
        throw new Error((res as any).error || 'Failed to cancel listing');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel listing',
        variant: 'destructive',
      });
    } finally {
      setCancelling(null);
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const activeListings = listings.filter(l => l.status === 'active');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          My Marketplace
        </h1>
        <p className="text-gray-400">Manage your listings and create new ones</p>
      </div>

      {/* Create Listing Button */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create Listing'}
          </Button>
        </CardContent>
      </Card>

      {/* Create Listing Form */}
      {showCreateForm && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Create New Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item Selection */}
            <div>
              <Label className="text-gray-300">Select Item</Label>
              <select
                value={selectedItem?.itemId || ''}
                onChange={(e) => {
                  const item = inventory.find(i => i.itemId === e.target.value);
                  setSelectedItem(item || null);
                  setQuantity('1');
                }}
                className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
              >
                <option value="">Choose an item...</option>
                {inventory.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.emoji || item.icon || '📦'} {item.name} (x{item.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {selectedItem && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedItem.emoji || selectedItem.icon || '📦'}</div>
                    <div>
                      <h3 className="font-bold text-white">{selectedItem.name}</h3>
                      <p className="text-sm text-gray-400">{selectedItem.rarity} • {selectedItem.type}</p>
                      <p className="text-sm text-gray-500">Available: {selectedItem.quantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-gray-300">Quantity</Label>
              <Input
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-2 bg-gray-900 border-gray-700 text-white"
                disabled={!selectedItem}
              />
            </div>

            {/* Price */}
            <div>
              <Label className="text-gray-300">Price (Gold)</Label>
              <Input
                type="number"
                min="1"
                max="99999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 bg-gray-900 border-gray-700 text-white"
                placeholder="Enter price..."
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreateListing}
              disabled={creating || !selectedItem || !price || !quantity}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Listings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Your Active Listings ({activeListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : activeListings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No active listings. Create one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeListings.map((listing) => {
                const rarityColor = getRarityColorClass(listing.item.rarity);
                return (
                  <Card key={listing.id} className={`bg-gray-900 border-2 ${rarityColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{listing.item.emoji || listing.item.icon || '📦'}</div>
                          <div>
                            <h3 className="font-bold text-white">{listing.item.name}</h3>
                            <p className="text-sm text-gray-400">
                              Quantity: {listing.quantity} • Price: {listing.price.toLocaleString()} 🪙
                            </p>
                            <p className="text-xs text-gray-500">
                              Listed {new Date(listing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={cancelling === listing.id}
                          variant="destructive"
                          size="sm"
                        >
                          {cancelling === listing.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
