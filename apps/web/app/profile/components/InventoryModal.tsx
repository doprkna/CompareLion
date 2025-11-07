'use client';

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import ItemCard from "@/components/ItemCard";

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  quantity: number;
  equipped: boolean;
  item: {
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
  };
}

export default function InventoryModal({ open, onClose }: InventoryModalProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadInventory();
    }
  }, [open]);

  // Listen for inventory refresh events (from purchases, crafts, etc.)
  useEffect(() => {
    const handleRefresh = () => {
      if (open) {
        loadInventory();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('inventory:refresh', handleRefresh);
      return () => {
        window.removeEventListener('inventory:refresh', handleRefresh);
      };
    }
  }, [open]);

  async function loadInventory() {
    setLoading(true);
    const res = await apiFetch("/api/inventory");
    if ((res as any).ok && (res as any).data?.items) {
      setItems((res as any).data.items);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-text max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6 text-accent" />
            Inventory
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12 text-subtle">Loading inventory...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {items.map((invItem) => (
              <ItemCard
                key={invItem.id}
                item={invItem.item}
                quantity={invItem.quantity}
                equipped={invItem.equipped}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-subtle mx-auto mb-4 opacity-50" />
            <p className="text-subtle text-lg">Your inventory is empty</p>
            <p className="text-subtle text-sm mt-2">
              Complete flows and quests to earn items!
            </p>
          </div>
        )}

        <div className="text-center text-subtle text-sm mt-4 p-4 bg-bg/50 rounded-lg border border-border">
          💡 Items can be equipped for stat bonuses. Click an item to view details.
        </div>
      </DialogContent>
    </Dialog>
  );
}
