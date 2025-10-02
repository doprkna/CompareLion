"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import ShopHeader from './ShopHeader';
import { ShopTabs } from './ShopTabs';
import CurrencyGrid from './currency/CurrencyGrid';
import CosmeticGrid from './cosmetics/CosmeticGrid';
import OwnedGrid from './owned/OwnedGrid';
import SubscriptionPanel from './subscription/SubscriptionPanel';

export default function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get('tab') ?? 'currency';

  const setTab = (t: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set('tab', t);
    router.replace(`?${sp.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ShopHeader />
      <ShopTabs />
      {tab === 'currency' && <CurrencyGrid />}
      {tab === 'cosmetics' && <CosmeticGrid />}
      {tab === 'owned' && <OwnedGrid />}
      {tab === 'subscription' && <SubscriptionPanel />}
    </div>
  );
}
