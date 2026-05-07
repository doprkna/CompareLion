import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toPublicFlowSnapshot } from '@/lib/flow/publicResultShare';

type PageProps = { params: { shareId: string } };

async function loadSnapshot(shareId: string) {
  const share = await prisma.shareCard.findUnique({
    where: { id: shareId },
    select: {
      id: true,
      type: true,
      caption: true,
      expiresAt: true,
    },
  });
  if (!share || share.type !== 'flow_result' || !share.caption) return null;
  if (share.expiresAt < new Date()) return null;
  try {
    return toPublicFlowSnapshot(JSON.parse(share.caption));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const snapshot = await loadSnapshot(params.shareId);
  if (!snapshot) {
    return {
      title: 'Shared PareL result',
      description: 'Compare your perspective with others in PareL.',
    };
  }
  return {
    title: snapshot.insightTitle,
    description: `${snapshot.insightSubtitle} Compare your perspective with others in PareL.`,
    openGraph: {
      title: snapshot.insightTitle,
      description: `${snapshot.insightSubtitle} Compare your perspective with others in PareL.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: snapshot.insightTitle,
      description: `${snapshot.insightSubtitle} Compare your perspective with others in PareL.`,
    },
  };
}

export default async function PublicResultPage({ params }: PageProps) {
  const snapshot = await loadSnapshot(params.shareId);
  if (!snapshot) notFound();

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <Card className="border-accent/30 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{snapshot.insightTitle}</CardTitle>
            <CardDescription className="text-base">{snapshot.hookLine}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl">{snapshot.archetypeLabel}</CardTitle>
            <CardDescription>{snapshot.insightSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-subtle">{snapshot.ambientLine}</p>
            <p className="text-xs text-subtle uppercase tracking-wide">{snapshot.moodLabel}</p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="pt-5 space-y-3">
            <Button asChild className="w-full">
              <Link href="/flow-demo">Try your own result</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/flow-demo">Start a flow</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
