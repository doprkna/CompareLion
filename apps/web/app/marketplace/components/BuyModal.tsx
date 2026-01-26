/**
 * Buy Modal Component
 * Modal for confirming marketplace purchases
 * v0.36.39 - Marketplace 2.0
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import { CurrencyType } from '@/lib/marketplace/types';

interface Listing {
  id: string;
  price: number;
  quantity: number;
  currency: CurrencyType;
  item: {
    id: string;
    name: string;
    emoji?: string | null;
    icon?: string | null;
    rarity: string;
    type: string;
  };
  seller: {
    id: string;
    name: string;
    username?: string;
  };
}

interface BuyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
  userBalance: { gold: number; diamonds: number };
  onSuccess?: () => void;
}

export function BuyModal({ open, onOpenChange, listing, userBalance, onSuccess }: BuyModalProps) {
  const [quantity, setQuantity] = useState<string>('1');
  const [submitting, setSubmitting] = useState(false);

  if (!listing) return null;

  const quantityNum = parseInt(quantity) || 0;
  const maxQuantity = listing.quantity;
  const totalPrice = listing.price * quantityNum;
  const currency = listing.currency || CurrencyType.GOLD;
  const userBalanceAmount = currency === CurrencyType.GOLD ? userBalance.gold : userBalance.diamonds;
  const canAfford = userBalanceAmount >= totalPrice;
  const currencyName = currency === CurrencyType.GOLD ? 'Gold' : 'Diamonds';
  const currencyIcon = currency === CurrencyType.GOLD ? '🪙' : '💎';

  async function handlePurchase() {
    if (quantityNum <= 0 || quantityNum > maxQuantity) {
      toast.error(`Quantity must be between 1 and ${maxQuantity}`);
      return;
    }

    if (!canAfford) {
      toast.error(`Insufficient ${currencyName}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: quantityNum > 1 ? quantityNum : undefined,
        }),
      });

      if ((res as any).ok) {
        toast.success('Purchase successful!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error((res as any).error || 'Failed to purchase');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase item');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-gray-400">
            Review your purchase details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="p-4 bg-gray-800 rounded-md">
            <div className="text-center mb-3">
              <div className="text-5xl mb-2">
                {listing.item.emoji || listing.item.icon || '📦'}
              </div>
              <h3 className="font-bold text-lg">{listing.item.name}</h3>
              <p className="text-xs text-gray-400 uppercase mt-1">{listing.item.rarity}</p>
            </div>
            <div className="text-sm text-gray-400 text-center">
              Seller: {listing.seller.name || listing.seller.username}
            </div>
          </div>

          {/* Quantity */}
          {maxQuantity > 1 && (
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                Quantity (Available: {maxQuantity})
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          )}

          {/* Price Summary */}
          <div className="p-4 bg-gray-800 rounded-md space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per item:</span>
              <span className="font-medium">{listing.price.toLocaleString()} {currencyIcon}</span>
            </div>
            {quantityNum > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity:</span>
                <span className="font-medium">{quantityNum}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-2 flex justify-between">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-yellow-400">
                {totalPrice.toLocaleString()} {currencyIcon}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Your balance: {userBalanceAmount.toLocaleString()} {currencyIcon}
            </div>
          </div>

          {/* Warning if can't afford */}
          {!canAfford && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-md text-sm text-red-400">
              Insufficient {currencyName}. You need {totalPrice.toLocaleString()} {currencyIcon} but only have {userBalanceAmount.toLocaleString()} {currencyIcon}.
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
              onClick={handlePurchase}
              disabled={submitting || !canAfford || quantityNum <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                `Buy ${quantityNum > 1 ? `${quantityNum}x ` : ''}for ${totalPrice.toLocaleString()} ${currencyIcon}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

