/**
 * Admin Inventory Viewer
 * v0.35.11 - Shows all items in system with ownership counts
 */

import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/authGuard';
import Link from 'next/link';

interface ItemWithStats {
  id: string;
  name: string;
  description: string | null;
  rarity: string | null;
  itemType: string;
  icon: string | null;
  price: number;
  currency: string;
  inShop: boolean;
  ownerCount: number;
  totalQuantity: number;
}

async function getItemsWithStats(): Promise<ItemWithStats[]> {
  const items = await prisma.item.findMany({
    include: {
      _count: {
        select: {
          UserItem: true,
        },
      },
      UserItem: {
        select: {
          quantity: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    rarity: item.rarity,
    itemType: item.itemType,
    icon: item.icon,
    price: item.price,
    currency: item.currency,
    inShop: item.inShop,
    ownerCount: item._count.UserItem,
    totalQuantity: item.UserItem.reduce((sum, ui) => sum + ui.quantity, 0),
  }));
}

export default async function AdminInventoryPage() {
  await requireAdmin();
  const items = await getItemsWithStats();

  const stats = {
    totalItems: items.length,
    inShop: items.filter((i) => i.inShop).length,
    totalOwners: items.reduce((sum, i) => sum + i.ownerCount, 0),
    totalQuantity: items.reduce((sum, i) => sum + i.totalQuantity, 0),
  };

  const rarityColors: Record<string, string> = {
    COMMON: 'bg-gray-500',
    UNCOMMON: 'bg-green-500',
    RARE: 'bg-blue-500',
    EPIC: 'bg-purple-500',
    LEGENDARY: 'bg-orange-500',
    MYTHIC: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Item Viewer</h1>
            <p className="text-subtle mt-1">All items in system with ownership data</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition"
          >
            Back to Admin
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text">{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-green-500" />
                In Shop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text">{stats.inShop}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total Owners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text">{stats.totalOwners}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                Total Quantity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text">{stats.totalQuantity}</div>
            </CardContent>
          </Card>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Package className="h-16 w-16 mx-auto text-subtle opacity-50 mb-4" />
              <p className="text-subtle text-lg">No items found in database</p>
              <p className="text-subtle text-sm mt-2">Run seed script to populate items</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{item.icon || 'ðŸ“¦'}</div>
                    <div className="flex flex-col gap-1">
                      {item.rarity && (
                        <Badge
                          className={'${rarityColors[item.rarity] || g-gray-500} text-white text-xs'}
                        >
                          {item.rarity}
                        </Badge>
                      )}
                      {item.inShop && (
                        <Badge className="bg-green-500 text-white text-xs">SHOP</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{item.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {item.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Type:</span>
                    <span className="text-text font-medium">{item.itemType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Price:</span>
                    <span className="text-text font-medium">
                      {item.price} {item.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                    <span className="text-subtle">Owners:</span>
                    <span className="text-accent font-bold">{item.ownerCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Total Qty:</span>
                    <span className="text-accent font-bold">{item.totalQuantity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
