'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CraftingPanel } from '@/components/crafting/CraftingPanel';
import { DiscoveryList } from '@/components/crafting/DiscoveryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Sparkles } from 'lucide-react';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'crafting' | 'discoveries'>('crafting');

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Craft items and track your discoveries.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'crafting' | 'discoveries')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="crafting" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Crafting
          </TabsTrigger>
          <TabsTrigger value="discoveries" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Discovery Index
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crafting" className="mt-6">
          <CraftingPanel />
        </TabsContent>

        <TabsContent value="discoveries" className="mt-6">
          <DiscoveryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

