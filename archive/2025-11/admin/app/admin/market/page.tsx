/**
 * Admin Marketplace Page
 * v0.36.29 - Marketplace 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Loader2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { useToast } from '@/components/ui/use-toast';

interface AdminListing {
  id: string;
  sellerId: string;
  itemId: string;
  price: number;
  quantity: number;
  status: string;
  createdAt: string;
  seller?: {
    id: string;
    email: string;
    username?: string;
  };
  item?: {
    id: string;
    name: string;
    emoji: string;
  };
}

export default function AdminMarketPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchFightId, setSearchFightId] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      loadListings();
    }
  }, [status]);

  async function loadListings() {
    setLoading(true);
    try {
      // For admin, we'll need to create an admin endpoint or use direct DB access
      // For now, using a placeholder - admin should have direct DB access
      const res = await apiFetch('/api/market?limit=100');
      if ((res as any).ok) {
        setListings((res as any).data.listings || []);
      }
    } catch (error) {
      console.error('Failed to load listings', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanup() {
    if (!confirm('Cleanup expired listings (30+ days old)? Items will be returned to sellers.')) {
      return;
    }

    setCleaning(true);
    try {
      const res = await apiFetch('/api/admin/market/cleanup', {
        method: 'POST',
      });

      if ((res as any).ok) {
        toast({
          title: 'Success',
          description: `Cleaned up ${(res as any).data.restoredCount} expired listings`,
        });
        await loadListings();
      } else {
        throw new Error((res as any).error || 'Cleanup failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cleanup listings',
        variant: 'destructive',
      });
    } finally {
      setCleaning(false);
    }
  }

  async function handleDeactivate(listingId: string) {
    if (!confirm('Force deactivate this listing? Items will be returned to seller.')) {
      return;
    }

    try {
      // Admin can deactivate any listing - would need admin endpoint
      toast({
        title: 'Info',
        description: 'Admin deactivation endpoint needed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate',
        variant: 'destructive',
      });
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          Admin Marketplace
        </h1>
        <p className="text-gray-400">Manage marketplace listings and cleanup expired items</p>
      </div>

      {/* Actions */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Button
              onClick={handleCleanup}
              disabled={cleaning}
              variant="destructive"
            >
              {cleaning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cleanup Expired Listings
                </>
              )}
            </Button>
            <Button
              onClick={loadListings}
              disabled={loading}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Filters */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by User ID..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
            <Input
              placeholder="Search by Listing ID..."
              value={searchFightId}
              onChange={(e) => setSearchFightId(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No listings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-gray-400">ID</th>
                    <th className="p-2 text-gray-400">Item</th>
                    <th className="p-2 text-gray-400">Seller</th>
                    <th className="p-2 text-gray-400">Price</th>
                    <th className="p-2 text-gray-400">Quantity</th>
                    <th className="p-2 text-gray-400">Status</th>
                    <th className="p-2 text-gray-400">Created</th>
                    <th className="p-2 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings
                    .filter(listing => {
                      if (searchUserId && !listing.sellerId.includes(searchUserId)) return false;
                      if (searchFightId && !listing.id.includes(searchFightId)) return false;
                      return true;
                    })
                    .map((listing) => (
                      <tr key={listing.id} className="border-b border-gray-700">
                        <td className="p-2 text-gray-300 text-sm font-mono">
                          {listing.id.slice(0, 8)}...
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{listing.item?.emoji || '📦'}</span>
                            <span className="text-white">{listing.item?.name || listing.itemId}</span>
                          </div>
                        </td>
                        <td className="p-2 text-gray-300 text-sm">
                          {listing.seller?.email || listing.sellerId.slice(0, 8)}...
                        </td>
                        <td className="p-2 text-yellow-400 font-bold">
                          {listing.price.toLocaleString()} 🪙
                        </td>
                        <td className="p-2 text-gray-300">{listing.quantity}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'active'
                                ? 'bg-green-900 text-green-300'
                                : listing.status === 'sold'
                                ? 'bg-blue-900 text-blue-300'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td className="p-2 text-gray-400 text-sm">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          {listing.status === 'active' && (
                            <Button
                              onClick={() => handleDeactivate(listing.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mt-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4 text-sm text-gray-400">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Admin tools: Cleanup expired listings (30+ days), force deactivate listings, view all marketplace activity.
        </CardContent>
      </Card>
    </div>
  );
}

