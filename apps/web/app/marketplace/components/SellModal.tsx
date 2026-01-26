/**
 * Sell Modal Component
 * Modal for creating marketplace listings
 * v0.36.39 - Marketplace 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import { CurrencyType } from '@/lib/marketplace/types';

interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    emoji?: string | null;
    icon?: string | null;
    rarity: string;
    type: string;
    isTradable: boolean;
  };
}

interface SellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SellModal({ open, onOpenChange, onSuccess }: SellModalProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyType>(CurrencyType.GOLD);

  useEffect(() => {
    if (open) {
      loadInventory();
    } else {
      // Reset form when closed
      setSelectedItemId('');
      setQuantity('1');
      setPrice('');
      setCurrency(CurrencyType.GOLD);
    }
  }, [open]);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/inventory');
      if ((res as any).ok && (res as any).data?.items) {
        // Filter to only tradable items with quantity > 0
        const items = (res as any).data.items.filter(
          (item: InventoryItem) => item.item.isTradable && item.quantity > 0
        );
        setInventory(items);
      }
    } catch (error) {
      console.error('Failed to load inventory', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  const selectedItem = inventory.find(item => item.itemId === selectedItemId);
  const maxQuantity = selectedItem?.quantity || 0;
  const quantityNum = parseInt(quantity) || 0;
  const priceNum = parseInt(price) || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }

    if (quantityNum <= 0 || quantityNum > maxQuantity) {
      toast.error(`Quantity must be between 1 and ${maxQuantity}`);
      return;
    }

    if (priceNum <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/market/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: quantityNum,
          price: priceNum,
          currency,
        }),
      });

      if ((res as any).ok) {
        toast.success('Listing created successfully!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error((res as any).error || 'Failed to create listing');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sell Item</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a marketplace listing for your item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selection */}
          <div>
            <Label htmlFor="item" className="text-sm font-medium mb-2 block">
              Select Item
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : inventory.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No tradable items in inventory
              </p>
            ) : (
              <select
                id="item"
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  const item = inventory.find(i => i.itemId === e.target.value);
                  if (item) {
                    setQuantity('1');
                  }
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="">Choose an item...</option>
                {inventory.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.item.emoji || item.item.icon || '📦'} {item.item.name} ({item.quantity}x)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity */}
          {selectedItem && (
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                Quantity (Max: {maxQuantity})
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          )}

          {/* Price */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium mb-2 block">
              Price
            </Label>
            <div className="flex gap-2">
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="bg-gray-800 border-gray-700 text-white flex-1"
                required
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value={CurrencyType.GOLD}>🪙 Gold</option>
                <option value={CurrencyType.DIAMONDS}>💎 Diamonds</option>
              </select>
            </div>
          </div>

          {/* Info */}
          {selectedItem && priceNum > 0 && (
            <div className="p-3 bg-gray-800 rounded-md text-sm text-gray-400">
              <div>Total: {priceNum * quantityNum} {currency === CurrencyType.GOLD ? 'Gold' : 'Diamonds'}</div>
              <div className="text-xs mt-1">
                Marketplace fee (5%): {Math.floor(priceNum * quantityNum * 0.05)} {currency === CurrencyType.GOLD ? 'Gold' : 'Diamonds'}
              </div>
              <div className="text-xs">
                You'll receive: {Math.floor(priceNum * quantityNum * 0.95)} {currency === CurrencyType.GOLD ? 'Gold' : 'Diamonds'}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedItemId || !priceNum || !quantityNum}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

