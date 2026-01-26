'use client';

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function UIPreviewPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text mb-2">🎨 UI Design System</h1>
          <p className="text-subtle">Component preview and documentation</p>
        </div>

        {/* Colors */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Color Palette</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-bg border border-border"></div>
                <div className="text-xs"><code>bg</code></div>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-card border border-border"></div>
                <div className="text-xs"><code>card</code></div>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-accent"></div>
                <div className="text-xs"><code>accent</code></div>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-destructive"></div>
                <div className="text-xs"><code>destructive</code></div>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-success"></div>
                <div className="text-xs"><code>success</code></div>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-warning"></div>
                <div className="text-xs"><code>warning</code></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Form Elements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-subtle mb-2 block">Standard Input</label>
              <Input placeholder="Enter text..." className="bg-bg border-border text-text" />
            </div>
            <div>
              <label className="text-sm text-subtle mb-2 block">Number Input</label>
              <Input type="number" placeholder="100" className="bg-bg border-border text-text" />
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Progress Bars</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="text-accent">75%</span>
              </div>
              <Progress value={75} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Almost there</span>
                <span className="text-accent">90%</span>
              </div>
              <Progress value={90} />
            </div>
          </CardContent>
        </Card>

        {/* Spacing */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Spacing Scale</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl'].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <code className="text-xs w-12">{size}</code>
                <div className={`h-4 bg-accent rounded`} style={{ width: `${size === 'xs' ? 8 : size === 'sm' ? 12 : size === 'base' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : size === 'xl' ? 48 : 64}px` }}></div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Border Radius */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Border Radius</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {['sm', 'base', 'md', 'lg', 'xl', '2xl', 'full'].map((radius) => (
                <div key={radius} className="text-center">
                  <div className={`h-16 bg-accent mx-auto mb-2 ${radius === 'full' ? 'w-16' : 'w-full'}`} style={{ borderRadius: radius === 'sm' ? '0.25rem' : radius === 'base' ? '0.5rem' : radius === 'md' ? '0.75rem' : radius === 'lg' ? '1rem' : radius === 'xl' ? '1.5rem' : radius === '2xl' ? '2rem' : '9999px' }}></div>
                  <code className="text-xs">{radius}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shadows */}
        <Card className="bg-card border-border text-text">
          <CardHeader><CardTitle>Box Shadows</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['sm', 'base', 'md', 'lg', 'xl', '2xl'].map((shadow) => (
                <div key={shadow} className={`h-24 bg-card border border-border rounded-lg flex items-center justify-center shadow-${shadow}`}>
                  <code className="text-xs">{shadow}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}













