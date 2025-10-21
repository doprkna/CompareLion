'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Tag, List, Coins } from "lucide-react";
import { toast } from "sonner";

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [listForm, setListForm] = useState({ itemId: "", price: 100, currency: "gold" });

  useEffect(() => {
    loadMarket();
    loadMyListings();
    loadInventory();
  }, []);

  async function loadMarket() {
    const res = await apiFetch("/api/market");
    if ((res as any).ok && (res as any).data) {
      setListings((res as any).data.listings || []);
    }
    setLoading(false);
  }

  async function loadMyListings() {
    const res = await apiFetch("/api/market");
    if ((res as any).ok && (res as any).data) {
      const all = (res as any).data.listings || [];
      // Filter to show only user's listings
      setMyListings(all.filter((l: any) => l.seller.id === session?.user?.id));
    }
  }

  async function loadInventory() {
    const res = await apiFetch("/api/inventory");
    if ((res as any).ok && (res as any).data) {
      setInventory((res as any).data.items || []);
    }
  }

  async function listItem() {
    if (!listForm.itemId || listForm.price <= 0) {
      toast.error("Select item and set valid price");
      return;
    }

    const res = await apiFetch("/api/market/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listForm),
    });

    if ((res as any).ok) {
      toast.success("Item listed! 🏷️");
      setShowListForm(false);
      setListForm({ itemId: "", price: 100, currency: "gold" });
      loadMarket();
      loadMyListings();
      loadInventory();
    } else {
      toast.error((res as any).error || "Failed to list item");
    }
  }

  async function buyItem(listingId: string, price: number, currency: string) {
    if (!confirm(`Buy this item for ${price} ${currency}?`)) return;

    const res = await apiFetch(`/api/market/buy/${listingId}`, {
      method: "PATCH",
    });

    if ((res as any).ok) {
      toast.success("Purchase successful! 🎉");
      loadMarket();
      loadInventory();
    } else {
      toast.error((res as any).error || "Failed to purchase");
    }
  }

  async function cancelListing(listingId: string) {
    if (!confirm("Cancel this listing?")) return;

    const res = await apiFetch(`/api/market/buy/${listingId}`, {
      method: "DELETE",
    });

    if ((res as any).ok) {
      toast.success("Listing cancelled");
      loadMyListings();
      loadInventory();
    } else {
      toast.error("Failed to cancel");
    }
  }

  const rarityColors: Record<string, string> = {
    common: "border-zinc-500",
    uncommon: "border-green-500",
    rare: "border-blue-500",
    epic: "border-purple-500",
    legendary: "border-yellow-500",
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text mb-2">🏪 Marketplace</h1>
          <p className="text-subtle">Trade items with other players</p>
        </div>

        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell">
              <Tag className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
            <TabsTrigger value="my-listings">
              <List className="h-4 w-4 mr-2" />
              My Listings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-subtle">Loading marketplace...</div>
            ) : listings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <Card key={listing.id} className={`bg-card border-2 ${rarityColors[listing.item?.rarity || "common"]}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {listing.item?.type === "weapon" ? "⚔️" : listing.item?.type === "armor" ? "🛡️" : "💎"}
                        </div>
                        <h3 className="font-bold">{listing.item?.name}</h3>
                        <p className="text-xs text-subtle uppercase">{listing.item?.rarity}</p>
                      </div>
                      <div className="text-center text-2xl font-bold text-accent">
                        {listing.currency === "gold" ? "💰" : "💎"} {listing.price}
                      </div>
                      <div className="text-xs text-muted text-center">
                        Seller: {listing.seller.name} (Lvl {listing.seller.level})
                      </div>
                      <Button
                        onClick={() => buyItem(listing.id, listing.price, listing.currency)}
                        className="w-full"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-subtle">
                <div className="text-6xl mb-4">🏪</div>
                No items listed yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            {!showListForm ? (
              <div>
                <Button onClick={() => setShowListForm(true)} className="mb-4">List Item for Sale</Button>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map((inv) => (
                    <Card key={inv.id} className="bg-card border-border">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">
                          {inv.item?.type === "weapon" ? "⚔️" : inv.item?.type === "armor" ? "🛡️" : "💎"}
                        </div>
                        <div className="font-semibold">{inv.item?.name}</div>
                        <div className="text-xs text-subtle">Qty: {inv.quantity}</div>
                        <Button
                          onClick={() => {
                            setListForm({ ...listForm, itemId: inv.itemId });
                            setShowListForm(true);
                          }}
                          size="sm"
                          className="mt-2 w-full"
                        >
                          List
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="max-w-md mx-auto bg-card border-accent">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg">List Item</h3>
                  <div>
                    <label className="text-sm text-subtle">Item</label>
                    <select
                      value={listForm.itemId}
                      onChange={(e) => setListForm({ ...listForm, itemId: e.target.value })}
                      className="w-full bg-bg border border-border rounded px-3 py-2"
                    >
                      <option value="">Select item</option>
                      {inventory.map((inv) => (
                        <option key={inv.itemId} value={inv.itemId}>
                          {inv.item?.name} (x{inv.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-subtle">Price</label>
                    <Input
                      type="number"
                      value={listForm.price}
                      onChange={(e) => setListForm({ ...listForm, price: parseInt(e.target.value) })}
                      className="bg-bg border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-subtle">Currency</label>
                    <select
                      value={listForm.currency}
                      onChange={(e) => setListForm({ ...listForm, currency: e.target.value })}
                      className="w-full bg-bg border border-border rounded px-3 py-2"
                    >
                      <option value="gold">💰 Gold</option>
                      <option value="diamonds">💎 Diamonds</option>
                    </select>
                  </div>
                  <div className="text-xs text-muted">5% tax will be deducted on sale</div>
                  <div className="flex gap-2">
                    <Button onClick={listItem} className="flex-1">List Item</Button>
                    <Button variant="outline" onClick={() => setShowListForm(false)} className="flex-1">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-listings" className="space-y-4">
            {myListings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="bg-card border-accent">
                    <CardContent className="p-4 space-y-3">
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {listing.item?.type === "weapon" ? "⚔️" : listing.item?.type === "armor" ? "🛡️" : "💎"}
                        </div>
                        <h3 className="font-semibold">{listing.item?.name}</h3>
                      </div>
                      <div className="text-center text-xl font-bold text-accent">
                        {listing.currency === "gold" ? "💰" : "💎"} {listing.price}
                      </div>
                      <Button
                        onClick={() => cancelListing(listing.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Cancel Listing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-subtle">
                <div className="text-6xl mb-4">📦</div>
                No active listings
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}










