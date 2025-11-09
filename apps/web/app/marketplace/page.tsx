'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MarketGrid } from '@/components/market/MarketGrid';
import { WalletDisplay } from '@/components/market/WalletDisplay';
import { PurchaseModal } from '@/components/market/PurchaseModal';
import { useMarket, useWallet, usePurchaseItem, MarketItem } from '@/hooks/useMarket';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Gift, Sparkles, Zap, Calendar } from 'lucide-react';

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<'item' | 'cosmetic' | 'booster' | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const { items, loading, error, reload } = useMarket(activeCategory === 'all' ? undefined : activeCategory);
  const { wallets, loading: walletLoading, reload: reloadWallet } = useWallet();
  const { purchase, loading: purchasing, error: purchaseError } = usePurchaseItem();

  // Filter items by category
  const filteredItems = activeCategory === 'all' 
    ? (items || []) // sanity-fix
    : (items || []).filter(item => item.category === activeCategory); // sanity-fix

  // Create wallet balance map
  const walletBalances = (wallets || []).reduce((acc, wallet) => { // sanity-fix
    acc[wallet.currencyKey] = wallet.balance;
    return acc;
  }, {} as Record<string, number>);

  const handlePurchaseClick = (item: MarketItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      const data = await purchase(selectedItem.id);
      setPurchaseSuccess(true);
      alert(`🛒 Purchase complete (+1 ${selectedItem.category === 'cosmetic' ? 'New Cosmetic' : 'Item'})`);
      
      // Reload data
      reload();
      reloadWallet();
      
      // Close modal after delay
      setTimeout(() => {
        setShowPurchaseModal(false);
        setSelectedItem(null);
        setPurchaseSuccess(false);
      }, 2000);
    } catch (err) {
      // Error handled by hook
      if (err instanceof Error && err.message.includes('Insufficient')) {
        alert('💸 Insufficient funds — earn more gold or diamonds.');
      }
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || (loading && activeCategory === 'all')) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          Marketplace
        </h1>
        <p className="text-subtle">Shop for items, cosmetics, and boosters</p>
      </div>

      {/* Wallet Display */}
      <div className="mb-6">
        <WalletDisplay wallets={wallets} loading={walletLoading} />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('all')}
        >
          All Items
        </Button>
        <Button
          variant={activeCategory === 'item' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('item')}
        >
          <Gift className="w-4 h-4 mr-2" />
          Items
        </Button>
        <Button
          variant={activeCategory === 'cosmetic' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('cosmetic')}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Cosmetics
        </Button>
        <Button
          variant={activeCategory === 'booster' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('booster')}
        >
          <Zap className="w-4 h-4 mr-2" />
          Boosters
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            reload();
            reloadWallet();
          }}
          disabled={loading || walletLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-card border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Market Grid */}
      <MarketGrid
        items={filteredItems}
        loading={loading}
        onPurchase={handlePurchaseClick}
        purchasingItemId={purchasing && selectedItem ? selectedItem.id : null}
        walletBalances={walletBalances}
      />

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <PurchaseModal
          item={selectedItem}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedItem(null);
            setPurchaseSuccess(false);
          }}
          onConfirm={handleConfirmPurchase}
          purchasing={purchasing}
          walletBalance={walletBalances[selectedItem.currencyKey] || 0}
          success={purchaseSuccess}
        />
      )}
    </div>
  );
}




