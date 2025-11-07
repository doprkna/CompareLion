"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  Image as ImageIcon,
  Palette,
  FileText,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function PressPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      logger.error('Error copying', error);
    }
  };

  const brandColors = [
    { name: 'Primary Accent', hex: '#667eea', rgb: 'rgb(102, 126, 234)' },
    { name: 'Secondary Blue', hex: '#764ba2', rgb: 'rgb(118, 75, 162)' },
    { name: 'Success Green', hex: '#10b981', rgb: 'rgb(16, 185, 129)' },
    { name: 'Warning Yellow', hex: '#f59e0b', rgb: 'rgb(245, 158, 11)' },
    { name: 'Error Red', hex: '#ef4444', rgb: 'rgb(239, 68, 68)' }
  ];

  const assets = [
    { name: 'Logo (SVG)', type: 'logo', format: 'SVG' },
    { name: 'Logo (PNG)', type: 'logo', format: 'PNG' },
    { name: 'Icon Only', type: 'icon', format: 'PNG' },
    { name: 'Banner (1200x630)', type: 'banner', format: 'PNG' },
    { name: 'App Screenshots', type: 'screenshots', format: 'ZIP' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-card to-bg">
      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-text mb-4">Press Kit</h1>
          <p className="text-xl text-subtle">
            Brand assets, media resources, and company information
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* About Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                About PareL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-text mb-2">One-Liner</h3>
                  <p className="text-subtle bg-bg border border-border rounded-lg p-4">
                    PareL: Where you compare yourself, discover insights, and level up through 
                    gamified polling and self-discovery.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(
                      "PareL: Where you compare yourself, discover insights, and level up through gamified polling and self-discovery.",
                      'tagline'
                    )}
                    className="mt-2"
                  >
                    {copied === 'tagline' ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-2">Description</h3>
                  <p className="text-subtle">
                    PareL is a social gamification platform that transforms everyday questions into 
                    meaningful insights. Users answer questions ranging from silly to serious, compare 
                    their responses with others, and earn XP and badges as they discover more about 
                    themselves and their community.
                  </p>
                  <p className="text-subtle mt-3">
                    Think TikTok polls meets RPG progression meets self-discovery. PareL makes comparison 
                    fun, social, and rewarding while giving users perspective on how they stack up in 
                    everything from sleep habits to life goals.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-2">Key Stats</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-bg border border-border rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">Beta</div>
                      <div className="text-sm text-subtle">Launch Status</div>
                    </div>
                    <div className="bg-bg border border-border rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">v0.15.0</div>
                      <div className="text-sm text-subtle">Current Version</div>
                    </div>
                    <div className="bg-bg border border-border rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent">2025</div>
                      <div className="text-sm text-subtle">Founded</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Brand Colors */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandColors.map((color) => (
                  <div
                    key={color.name}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="h-24"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-4 bg-card">
                      <div className="font-semibold text-text mb-2">{color.name}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-subtle">HEX</span>
                          <button
                            onClick={() => copyToClipboard(color.hex, color.hex)}
                            className="text-sm font-mono text-text hover:text-accent"
                          >
                            {color.hex}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-subtle">RGB</span>
                          <span className="text-sm font-mono text-text">{color.rgb}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Logo & Assets */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logos & Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between p-4 bg-bg border border-border rounded-lg hover:border-accent transition-colors"
                  >
                    <div>
                      <div className="font-medium text-text">{asset.name}</div>
                      <div className="text-sm text-subtle">{asset.format}</div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-subtle mt-4">
                Note: High-resolution assets available on request. Contact press team for access.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Screenshots */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>App Screenshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {['Main Dashboard', 'Question Flow', 'Leaderboard', 'Profile'].map((screen) => (
                  <div
                    key={screen}
                    className="aspect-video bg-gradient-to-br from-accent/20 to-blue-500/20 border-2 border-border rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-subtle opacity-50" />
                      <p className="text-sm text-subtle">{screen}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-subtle mt-4">
                Screenshots showcase PareL's intuitive interface and engaging user experience.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Press Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-text mb-1">Media Inquiries</h4>
                  <a
                    href="mailto:press@parel.app"
                    className="text-accent hover:underline"
                  >
                    press@parel.app
                  </a>
                </div>
                
                <div>
                  <h4 className="font-medium text-text mb-1">General Contact</h4>
                  <a
                    href="mailto:hello@parel.app"
                    className="text-accent hover:underline"
                  >
                    hello@parel.app
                  </a>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-subtle">
                    For high-resolution assets, interview requests, or additional information, 
                    please reach out to our press team. We typically respond within 24-48 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

